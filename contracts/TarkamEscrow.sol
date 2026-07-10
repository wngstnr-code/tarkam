// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/// @title TarkamEscrow — brankas hadiah trustless untuk turnamen tarkam.
/// @notice Satu kontrak menampung banyak turnamen. Properti inti:
///         dana HANYA bisa keluar sebagai (a) hadiah ke tim terdaftar sesuai
///         nominal yang diumumkan sejak awal, atau (b) refund ke penyetor bila
///         turnamen dibatalkan. Panitia memilih pemenang tapi TIDAK PERNAH bisa
///         menarik pot ke dirinya sendiri (kecuali sisa pot setelah semua hadiah
///         terbayar — surplus operasional yang transparan sejak awal).
///         Payout butuh persetujuan M tim penyetor (threshold ditentukan saat
///         turnamen dibuat; 0 = langsung, untuk demo).
contract TarkamEscrow {
    enum Status {
        Open, // pendaftaran & setoran berjalan
        Proposed, // panitia sudah mengusulkan pemenang, menunggu persetujuan tim
        Paid, // hadiah sudah dibayar, turnamen selesai
        Cancelled // dibatalkan, tiap tim bisa tarik refund
    }

    struct TournamentView {
        address organizer;
        address token;
        uint256 entryFee;
        uint256[] prizes;
        uint256 approvalThreshold;
        uint256 refundDeadline;
        Status status;
        uint256 pot;
        uint256 teamCount;
        address[] winners;
        uint256 approvals;
    }

    struct Tournament {
        address organizer;
        IERC20 token;
        uint256 entryFee;
        uint256[] prizes; // nominal hadiah rank 1..n (unit token)
        uint256 approvalThreshold; // jumlah tim yang harus menyetujui payout
        uint256 refundDeadline; // unix ts; setelah ini tim bisa refund sendiri bila belum dibayar (0 = tanpa deadline)
        Status status;
        uint256 pot;
        address[] teams; // alamat kapten (penerima hadiah/refund)
        address[] winners; // usulan pemenang, urut rank
        uint256 approvals;
    }

    uint256 public tournamentCount;
    mapping(uint256 => Tournament) private _tournaments;
    /// setoran per tim (juga penanda "terdaftar"; > 0 berarti sudah bayar)
    mapping(uint256 => mapping(address => uint256)) public depositOf;
    /// sudah/belum menyetujui usulan payout yang sedang berjalan
    mapping(uint256 => mapping(address => bool)) public hasApproved;

    event TournamentCreated(
        uint256 indexed id,
        address indexed organizer,
        address token,
        uint256 entryFee,
        uint256[] prizes,
        uint256 approvalThreshold,
        uint256 refundDeadline
    );
    event Deposited(uint256 indexed id, address indexed team, address indexed payer, uint256 amount);
    event PayoutProposed(uint256 indexed id, address[] winners);
    event PayoutApproved(uint256 indexed id, address indexed team, uint256 approvals);
    event PrizePaid(uint256 indexed id, address indexed team, uint256 rank, uint256 amount);
    event SurplusWithdrawn(uint256 indexed id, address indexed organizer, uint256 amount);
    event TournamentCancelled(uint256 indexed id);
    event Refunded(uint256 indexed id, address indexed team, uint256 amount);

    modifier onlyOrganizer(uint256 id) {
        require(msg.sender == _tournaments[id].organizer, "bukan panitia");
        _;
    }

    /// @notice Buat turnamen baru. Hadiah & biaya daftar terkunci sejak awal.
    /// @param refundDeadline Unix timestamp; bila lewat & hadiah belum dibayar,
    ///        tiap tim boleh menarik refund tanpa izin panitia (anti panitia
    ///        menghilang). 0 = tanpa deadline.
    function createTournament(
        address token,
        uint256 entryFee,
        uint256[] calldata prizes,
        uint256 approvalThreshold,
        uint256 refundDeadline
    ) external returns (uint256 id) {
        require(token != address(0), "token kosong");
        require(entryFee > 0, "biaya daftar 0");
        require(prizes.length > 0, "hadiah kosong");
        id = ++tournamentCount;
        Tournament storage t = _tournaments[id];
        t.organizer = msg.sender;
        t.token = IERC20(token);
        t.entryFee = entryFee;
        t.prizes = prizes;
        t.approvalThreshold = approvalThreshold;
        t.refundDeadline = refundDeadline;
        t.status = Status.Open;
        emit TournamentCreated(id, msg.sender, token, entryFee, prizes, approvalThreshold, refundDeadline);
    }

    /// @notice Setor biaya pendaftaran untuk sebuah tim. `team` = alamat kapten
    ///         (penerima hadiah/refund). Pembayar boleh siapa saja (payer =
    ///         msg.sender), tapi satu tim hanya bisa disetorkan sekali.
    ///         Wajib `approve` token untuk kontrak ini dulu.
    function deposit(uint256 id, address team) external {
        Tournament storage t = _tournaments[id];
        require(t.status == Status.Open, "bukan fase pendaftaran");
        require(team != address(0), "tim kosong");
        require(depositOf[id][team] == 0, "tim sudah bayar");
        depositOf[id][team] = t.entryFee;
        t.pot += t.entryFee;
        t.teams.push(team);
        require(t.token.transferFrom(msg.sender, address(this), t.entryFee), "transferFrom gagal");
        emit Deposited(id, team, msg.sender, t.entryFee);
    }

    /// @notice Panitia mengusulkan pemenang (urut rank 1..n, sepanjang daftar
    ///         hadiah). Tiap pemenang wajib tim terdaftar. Mengusulkan ulang
    ///         (koreksi) me-reset persetujuan.
    function proposePayout(uint256 id, address[] calldata winners) external onlyOrganizer(id) {
        Tournament storage t = _tournaments[id];
        require(t.status == Status.Open || t.status == Status.Proposed, "sudah final");
        require(winners.length == t.prizes.length, "jumlah pemenang != hadiah");
        uint256 total;
        for (uint256 i = 0; i < winners.length; i++) {
            require(depositOf[id][winners[i]] > 0, "pemenang bukan tim terdaftar");
            for (uint256 j = 0; j < i; j++) {
                require(winners[i] != winners[j], "pemenang duplikat");
            }
            total += t.prizes[i];
        }
        require(t.pot >= total, "pot kurang dari total hadiah");
        // reset persetujuan usulan sebelumnya (bila ada)
        for (uint256 i = 0; i < t.teams.length; i++) {
            hasApproved[id][t.teams[i]] = false;
        }
        t.winners = winners;
        t.approvals = 0;
        t.status = Status.Proposed;
        emit PayoutProposed(id, winners);
    }

    /// @notice Tim penyetor menyetujui usulan payout.
    function approvePayout(uint256 id) external {
        Tournament storage t = _tournaments[id];
        require(t.status == Status.Proposed, "tidak ada usulan");
        require(depositOf[id][msg.sender] > 0, "bukan tim penyetor");
        require(!hasApproved[id][msg.sender], "sudah menyetujui");
        hasApproved[id][msg.sender] = true;
        t.approvals += 1;
        emit PayoutApproved(id, msg.sender, t.approvals);
    }

    /// @notice Eksekusi payout: semua hadiah dibayar dalam SATU transaksi,
    ///         sisa pot (surplus operasional) ke panitia. Bisa dipanggil siapa
    ///         saja setelah persetujuan cukup.
    function executePayout(uint256 id) external {
        Tournament storage t = _tournaments[id];
        require(t.status == Status.Proposed, "tidak ada usulan");
        require(t.approvals >= t.approvalThreshold, "persetujuan kurang");
        t.status = Status.Paid;
        uint256 remaining = t.pot;
        t.pot = 0;
        for (uint256 i = 0; i < t.winners.length; i++) {
            // pemenang harus masih terdaftar (belum menarik refund deadline)
            require(depositOf[id][t.winners[i]] > 0, "pemenang sudah refund");
            uint256 amount = t.prizes[i];
            remaining -= amount;
            require(t.token.transfer(t.winners[i], amount), "transfer hadiah gagal");
            emit PrizePaid(id, t.winners[i], i + 1, amount);
        }
        if (remaining > 0) {
            require(t.token.transfer(t.organizer, remaining), "transfer surplus gagal");
            emit SurplusWithdrawn(id, t.organizer, remaining);
        }
    }

    /// @notice Batalkan turnamen — satu-satunya jalan keluar selain payout.
    ///         Setelah ini tiap tim menarik refund-nya sendiri (pull, bukan push).
    function cancel(uint256 id) external onlyOrganizer(id) {
        Tournament storage t = _tournaments[id];
        require(t.status == Status.Open || t.status == Status.Proposed, "sudah final");
        t.status = Status.Cancelled;
        emit TournamentCancelled(id);
    }

    /// @notice Tarik refund biaya pendaftaran. Boleh bila turnamen dibatalkan,
    ///         ATAU deadline refund lewat sementara hadiah belum dibayar
    ///         (perlindungan bila panitia menghilang). Refund dikirim ke alamat
    ///         tim, siapa pun pemanggilnya.
    function claimRefund(uint256 id, address team) external {
        Tournament storage t = _tournaments[id];
        bool deadlinePassed = t.refundDeadline != 0 &&
            block.timestamp >= t.refundDeadline &&
            t.status != Status.Paid;
        require(t.status == Status.Cancelled || deadlinePassed, "tidak dibatalkan");
        uint256 amount = depositOf[id][team];
        require(amount > 0, "tidak ada setoran");
        // nol-kan dulu: cegah refund ganda & cabut status "terdaftar"
        depositOf[id][team] = 0;
        t.pot -= amount;
        require(t.token.transfer(team, amount), "transfer refund gagal");
        emit Refunded(id, team, amount);
    }

    // ── Read helpers untuk UI ───────────────────────────────────────────

    function getTournament(uint256 id) external view returns (TournamentView memory v) {
        Tournament storage t = _tournaments[id];
        v = TournamentView({
            organizer: t.organizer,
            token: address(t.token),
            entryFee: t.entryFee,
            prizes: t.prizes,
            approvalThreshold: t.approvalThreshold,
            refundDeadline: t.refundDeadline,
            status: t.status,
            pot: t.pot,
            teamCount: t.teams.length,
            winners: t.winners,
            approvals: t.approvals
        });
    }

    function getTeams(uint256 id) external view returns (address[] memory) {
        return _tournaments[id].teams;
    }
}
