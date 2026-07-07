/**
 * Kamus terjemahan Tarkam. Setiap entri punya string Inggris (en, default) dan
 * Indonesia (id). Placeholder {name}, {fee}, dst. diisi via t(key, params).
 */
type Entry = { en: string; id: string };

export const dict = {
  // ── Navbar ──────────────────────────────────────────────────────────────
  "nav.home_aria": { en: "Tarkam — home", id: "Tarkam — beranda" },
  "nav.wallet": { en: "Wallet", id: "Dompet" },
  "nav.lang_aria": { en: "Language", id: "Bahasa" },

  // ── Testnet banner ──────────────────────────────────────────────────────
  "banner.testnet": {
    en: "Testnet Mode — Sepolia. All USDT here is test tokens, not real money.",
    id: "Mode Testnet — Sepolia. Semua USDT di sini token uji, bukan uang sungguhan.",
  },

  // ── Dashboard ───────────────────────────────────────────────────────────
  "dash.hero_title_1": { en: "Tournament prizes that", id: "Hadiah turnamen yang" },
  "dash.hero_title_2": { en: "can't run off", id: "tak bisa dibawa kabur" },
  "dash.hero_subtitle": {
    en: "An on-chain prize vault for grassroots tournaments — everyone can watch the pot, champion payouts are recorded permanently.",
    id: "Brankas hadiah on-chain untuk turnamen tarkam — semua orang bisa mengawasi potnya, payout juara tercatat permanen.",
  },
  "dash.hero_cta": { en: "+ New Tournament", id: "+ Turnamen Baru" },
  "dash.your_tournaments": { en: "Your tournaments", id: "Turnamenmu" },
  "dash.count": { en: "{n} tournaments", id: "{n} turnamen" },
  "dash.empty_title": { en: "No tournaments yet", id: "Belum ada turnamen" },
  "dash.empty_body": {
    en: "It's quiet here. Create the first one — the on-chain prize vault is generated automatically.",
    id: "Area ini masih sepi. Buat yang pertama — brankas hadiah on-chain dibuat otomatis.",
  },
  "dash.empty_cta": { en: "Create the first", id: "Buat yang pertama" },

  // ── Onboarding ──────────────────────────────────────────────────────────
  "ob.title": { en: "Your wallet, your keys", id: "Dompet kamu, kunci kamu" },
  "ob.subtitle": {
    en: "Your seed phrase is generated and stored encrypted on this device — it never touches any server.",
    id: "Seed phrase dibuat dan tersimpan terenkripsi di device ini — tidak pernah menyentuh server mana pun.",
  },
  "ob.tablist_aria": { en: "Wallet mode", id: "Mode dompet" },
  "ob.create": { en: "Create new", id: "Buat baru" },
  "ob.restore": { en: "Restore", id: "Pulihkan" },
  "ob.create_title": { en: "Create a new wallet", id: "Buat dompet baru" },
  "ob.restore_title": { en: "Restore from seed phrase", id: "Pulihkan dari seed phrase" },
  "ob.create_desc": {
    en: "Self-custodial wallet via Tether WDK.",
    id: "Dompet self-custodial via Tether WDK.",
  },
  "ob.restore_desc": {
    en: "Enter your wallet's 12-word seed phrase.",
    id: "Masukkan 12 kata seed phrase dompetmu.",
  },

  // ── Wallet page ─────────────────────────────────────────────────────────
  "w.title": { en: "Wallet", id: "Dompet" },
  "w.badge": { en: "Self-custodial · WDK", id: "Self-custodial · WDK" },
  "w.usdt_balance": { en: "USDT Balance", id: "Saldo USDT" },
  "w.gas": { en: "⛽ Gas", id: "⛽ Gas" },
  "w.refresh": { en: "Refresh balance", id: "Muat ulang saldo" },
  "w.faucet_btn": { en: "+ Add {amt} test USDT", id: "+ Isi {amt} USDT uji" },
  "w.faucet_note": {
    en: "Testnet faucet — mint MockUSDT to your wallet. Needs a little Sepolia ETH for gas.",
    id: "Faucet testnet — mint MockUSDT ke dompetmu. Butuh sedikit Sepolia ETH untuk gas.",
  },
  "w.faucet_receipt": { en: "+{amt} test USDT ✓", id: "+{amt} USDT uji ✓" },
  "w.backup": { en: "Backup", id: "Backup" },
  "w.backup_desc": {
    en: "View your seed phrase again (password required).",
    id: "Lihat lagi seed phrase-mu (butuh password).",
  },
  "w.hide": { en: "Hide", id: "Sembunyikan" },
  "w.show_seed": { en: "Show seed phrase", id: "Tampilkan seed phrase" },
  "w.switch_wallet": { en: "Switch wallet", id: "Ganti dompet" },
  "w.switch_desc": {
    en: "Remove this wallet from the device, then create or restore another during onboarding.",
    id: "Keluarkan dompet ini dari device, lalu buat atau pulihkan dompet lain saat onboarding.",
  },
  "w.logout_btn": { en: "Log out / switch account", id: "Keluar / ganti akun" },
  "w.logout_title": {
    en: "Remove wallet from this device?",
    id: "Keluarkan dompet dari device?",
  },
  "w.logout_desc_1": {
    en: "This wallet's encrypted seed will be deleted from the device. Without a copy of the seed phrase, the wallet and its balance",
    id: "Seed terenkripsi dompet ini akan dihapus dari device. Tanpa catatan seed phrase, dompet dan saldonya",
  },
  "w.logout_desc_strong": { en: "cannot be recovered", id: "tidak bisa dipulihkan" },
  "w.logout_desc_2": {
    en: ". Local tournament data stays intact.",
    id: ". Data turnamen lokal tetap ada.",
  },
  "w.logout_ack": {
    en: "I have written down my seed phrase and understand this wallet will be gone from the device.",
    id: "Saya sudah mencatat seed phrase dan paham dompet ini akan hilang dari device.",
  },
  "w.cancel": { en: "Cancel", id: "Batal" },
  "w.logout_confirm": { en: "Remove wallet", id: "Keluarkan dompet" },
  "w.unlock_seed_title": { en: "Show seed phrase", id: "Tampilkan seed phrase" },
  "w.unlock_seed_desc": {
    en: "Make sure no one else can see your screen.",
    id: "Pastikan tidak ada orang lain yang melihat layarmu.",
  },
  "w.faucet_title": { en: "Add {amt} test USDT", id: "Isi {amt} USDT uji" },
  "w.faucet_unlock_desc": {
    en: "Enter your password to sign the MockUSDT mint to your wallet.",
    id: "Masukkan password untuk menandatangani mint MockUSDT ke dompetmu.",
  },
  "w.faucet_confirm": { en: "Mint test USDT", id: "Mint USDT uji" },

  // ── New tournament page ─────────────────────────────────────────────────
  "nt.title": { en: "New Tournament", id: "Turnamen Baru" },
  "nt.desc": {
    en: "One tournament = one on-chain prize vault. Its address is public — every team can monitor the balance.",
    id: "Satu turnamen = satu brankas hadiah on-chain. Alamatnya publik — semua tim bisa memantau saldonya.",
  },

  // ── Tournament detail ───────────────────────────────────────────────────
  "td.not_found": { en: "Tournament not found.", id: "Turnamen tidak ditemukan." },
  "td.back": { en: "Back", id: "Kembali" },
  "td.all_tournaments": { en: "← All tournaments", id: "← Semua turnamen" },
  "td.meta": {
    en: "{count} teams · {fee} USDT/team · single elimination",
    id: "{count} tim · {fee} USDT/tim · sistem gugur",
  },
  "td.status_finished": { en: "🏆 Finished", id: "🏆 Selesai" },
  "td.status_running": { en: "Running", id: "Berjalan" },
  "td.status_registration": { en: "Registration", id: "Pendaftaran" },
  "td.teams": { en: "Teams", id: "Tim" },
  "td.teams_count": {
    en: "({paid} paid / {total} registered)",
    id: "({paid} lunas / {total} terdaftar)",
  },
  "td.teams_desc": {
    en: "“Paid” can only be marked once the on-chain pool balance covers the fee.",
    id: "“Lunas” hanya bisa ditandai bila saldo pool on-chain sudah menutup biayanya.",
  },
  "td.start_btn": {
    en: "Start tournament ({n} paid teams) — build bracket",
    id: "Mulai turnamen ({n} tim lunas) — susun bracket",
  },
  "td.bracket": { en: "Bracket", id: "Bracket" },
  "td.champion": { en: "🏆 Champion: {name}", id: "🏆 Juara: {name}" },
  "td.payout_desc": {
    en: "Pay prizes on-chain — the receipt is a transaction hash anyone can audit.",
    id: "Bayar hadiah on-chain — resi = hash transaksi, bisa diaudit siapa pun.",
  },
  "td.rank": { en: "Rank {n}", id: "Juara {n}" },
  "td.paid_receipt": { en: "Paid ✓", id: "Dibayar ✓" },
  "td.pay_prize": { en: "Pay prize", id: "Bayar hadiah" },

  // ── Tournament card ─────────────────────────────────────────────────────
  "card.status_setup": { en: "Registration", id: "Pendaftaran" },
  "card.status_running": { en: "Running", id: "Berjalan" },
  "card.status_finished": { en: "Finished", id: "Selesai" },
  "card.teams": { en: "Teams", id: "Tim" },
  "card.team_unit": { en: "{n} teams", id: "{n} tim" },
  "card.entry_fee": { en: "Entry fee", id: "Biaya daftar" },
  "card.fee_unit": { en: "{fee} USDT/team", id: "{fee} USDT/tim" },
  "card.prize_pot": { en: "Prize pot", id: "Pot hadiah" },
  "card.full_target": { en: "full target", id: "target penuh" },

  // ── Pool panel ──────────────────────────────────────────────────────────
  "pp.aria": { en: "Prize vault", id: "Brankas hadiah" },
  "pp.label": {
    en: "Prize Vault — live on-chain pot balance",
    id: "Brankas Hadiah — saldo pot live on-chain",
  },
  "pp.audit": { en: "Audit it yourself on Etherscan →", id: "Audit sendiri di Etherscan →" },
  "pp.note": {
    en: "Public address — anyone can monitor it without an account. Refreshes every 15 seconds.",
    id: "Alamat publik — siapa pun bisa memantau tanpa akun. Refresh tiap 15 detik.",
  },
  "pp.rpc_error": { en: "RPC error: {error}", id: "RPC error: {error}" },

  // ── Team list ───────────────────────────────────────────────────────────
  "tl.notice_insufficient": {
    en: "Pool balance {balance} USDT — needs ≥ {required} USDT before {name} can be marked paid. The chain hasn't seen the payment yet.",
    id: "Saldo pool {balance} USDT — butuh ≥ {required} USDT sebelum {name} bisa ditandai lunas. Chain belum melihat pembayarannya.",
  },
  "tl.invalid_addr": {
    en: "Invalid wallet address (0x…40 hex).",
    id: "Alamat dompet tidak valid (0x…40 hex).",
  },
  "tl.team": { en: "Team", id: "Tim" },
  "tl.captain_wallet": { en: "Captain wallet", id: "Dompet kapten" },
  "tl.pay_status": { en: "Payment status", id: "Status bayar" },
  "tl.not_set": { en: "not set", id: "belum diisi" },
  "tl.paid_badge": { en: "Paid ✓ on-chain", id: "Lunas ✓ on-chain" },
  "tl.unpaid_badge": { en: "Not paid", id: "Belum bayar" },
  "tl.wallet_title_attr": {
    en: "Set captain wallet address (prize destination)",
    id: "Atur alamat dompet kapten (tujuan hadiah)",
  },
  "tl.wallet_edit": { en: "✎ Wallet", id: "✎ Dompet" },
  "tl.wallet_add": { en: "+ Wallet", id: "+ Dompet" },
  "tl.checking": { en: "Checking chain…", id: "Cek chain…" },
  "tl.mark_paid": { en: "Mark paid", id: "Tandai lunas" },
  "tl.remove": { en: "Remove", id: "Hapus" },
  "tl.no_teams": { en: "No teams registered yet.", id: "Belum ada tim terdaftar." },
  "tl.dialog_title": { en: "Captain wallet — {name}", id: "Dompet kapten — {name}" },
  "tl.dialog_desc": {
    en: "This address receives the prize transfer if this team wins. It can be changed any time before the payout is sent.",
    id: "Alamat ini jadi tujuan transfer hadiah bila tim ini juara. Bisa diubah kapan saja sebelum payout dikirim.",
  },
  "tl.addr_label": { en: "Wallet address (0x…)", id: "Alamat dompet (0x…)" },
  "tl.cancel": { en: "Cancel", id: "Batal" },
  "tl.save": { en: "Save", id: "Simpan" },

  // ── Add team dialog ─────────────────────────────────────────────────────
  "at.add_team": { en: "+ Add team", id: "+ Tambah tim" },
  "at.done_title": { en: "Team registered & paid", id: "Tim terdaftar & lunas" },
  "at.done_desc": {
    en: "{name} has paid {fee} USDT to the vault. The transfer proof is stored permanently on-chain.",
    id: "{name} sudah membayar {fee} USDT ke brankas. Bukti transfer tersimpan permanen di chain.",
  },
  "at.default_team": { en: "Team", id: "Tim" },
  "at.receipt": { en: "Entry fee sent ✓", id: "Biaya daftar terkirim ✓" },
  "at.done": { en: "Done", id: "Selesai" },
  "at.dialog_title": { en: "Add team", id: "Tambah tim" },
  "at.dialog_desc_1": { en: "Entry fee", id: "Biaya daftar" },
  "at.dialog_desc_2": {
    en: "is sent from your wallet to the vault. The team is added once the transfer succeeds.",
    id: "dikirim dari dompetmu ke brankas. Tim baru masuk setelah transfer sukses.",
  },
  "at.team_name": { en: "Team name", id: "Nama tim" },
  "at.captain_opt": {
    en: "Captain wallet (optional, prize destination)",
    id: "Dompet kapten (opsional, tujuan hadiah)",
  },
  "at.pw_label": { en: "Wallet password (to pay)", id: "Password dompet (untuk membayar)" },
  "at.pw_placeholder": { en: "Organizer wallet password", id: "Password dompet panitia" },
  "at.sending": { en: "Sending to vault…", id: "Mengirim ke brankas…" },
  "at.pay_btn": { en: "Pay {fee} USDT & register", id: "Bayar {fee} USDT & daftar" },
  "at.err_name": { en: "Team name is required", id: "Nama tim wajib diisi" },
  "at.err_addr": {
    en: "Invalid captain wallet address (0x…40 hex)",
    id: "Alamat dompet kapten tidak valid (0x…40 hex)",
  },
  "at.err_pw": {
    en: "Wallet password is required to pay",
    id: "Password dompet wajib untuk membayar",
  },

  // ── Bracket ─────────────────────────────────────────────────────────────
  "bv.final": { en: "Final", id: "Final" },
  "bv.semifinal": { en: "Semifinal", id: "Semifinal" },
  "bv.quarterfinal": { en: "Quarter Final", id: "Perempat Final" },
  "bv.round": { en: "Round {n}", id: "Ronde {n}" },
  "bv.top_match": { en: "Top match", id: "Partai puncak" },
  "bv.bye": { en: "Bye — auto advance", id: "Bye — lolos otomatis" },
  "bv.input_score": { en: "Input score", id: "Input skor" },
  "bv.save": { en: "Save", id: "Simpan" },
  "bv.cancel": { en: "Cancel", id: "Batal" },

  // ── Payout dialog ───────────────────────────────────────────────────────
  "pd.title": { en: "Pay rank {n} prize", id: "Bayar hadiah juara {n}" },
  "pd.desc": {
    en: "On-chain USDT transfer from the pool vault — permanent and public. Check it carefully.",
    id: "Transfer USDT on-chain dari brankas pool — permanen dan publik. Periksa baik-baik.",
  },
  "pd.recipient": { en: "Recipient", id: "Penerima" },
  "pd.wallet": { en: "Wallet", id: "Dompet" },
  "pd.total": { en: "Total payout", id: "Total payout" },
  "pd.no_addr": {
    en: "This team has no captain wallet address yet — add one in the team list first.",
    id: "Tim ini belum punya alamat dompet kapten — tambahkan dulu di daftar tim.",
  },
  "pd.pw_label": { en: "Pool vault password", id: "Password brankas pool" },
  "pd.cancel": { en: "Cancel", id: "Batal" },
  "pd.signing": { en: "Signing & broadcasting…", id: "Menandatangani & broadcast…" },
  "pd.approve": { en: "Approve & send", id: "Approve & kirim" },

  // ── Tournament form ─────────────────────────────────────────────────────
  "tf.err_name": { en: "Tournament name is required", id: "Nama turnamen wajib diisi" },
  "tf.err_count": { en: "Team count 2–64", id: "Jumlah tim 2–64" },
  "tf.err_pw": {
    en: "Vault password must be at least 8 characters",
    id: "Password brankas minimal 8 karakter",
  },
  "tf.backup_warn_title": {
    en: "⚠️ Back up the pool vault seed — shown only once",
    id: "⚠️ Backup seed brankas pool — sekali ini saja",
  },
  "tf.backup_warn_body": {
    en: "This tournament's prize vault is a self-custodial wallet. Write down the 12 words below; without them the prizes can't be withdrawn if the device is lost.",
    id: "Brankas hadiah turnamen ini adalah dompet self-custodial. Catat 12 kata di bawah; tanpa ini hadiah tidak bisa dicairkan bila device hilang.",
  },
  "tf.noted_open": { en: "I've noted it — open tournament", id: "Sudah kucatat — buka turnamen" },
  "tf.name_label": { en: "Tournament name", id: "Nama turnamen" },
  "tf.name_placeholder": { en: "Independence Cup RT 05", id: "Piala Kemerdekaan RT 05" },
  "tf.count_label": { en: "Team count", id: "Jumlah tim" },
  "tf.fee_label": { en: "Entry fee (USDT/team)", id: "Biaya daftar (USDT/tim)" },
  "tf.rank1": { en: "Rank 1", id: "Juara 1" },
  "tf.rank2": { en: "Rank 2", id: "Juara 2" },
  "tf.rank3": { en: "Rank 3", id: "Juara 3" },
  "tf.prize_unit": { en: "(USDT)", id: "(USDT)" },
  "tf.pw_label": { en: "Pool vault password", id: "Password brankas pool" },
  "tf.pw_placeholder": {
    en: "At least 8 characters — asked on payout",
    id: "Minimal 8 karakter — diminta saat payout",
  },
  "tf.pw_note": {
    en: "Encrypts the pool wallet seed on this device. Only the password holder can withdraw prizes.",
    id: "Mengenkripsi seed dompet pool di device ini. Hanya pemegang password yang bisa mencairkan hadiah.",
  },
  "tf.creating": { en: "Creating pool vault…", id: "Membuat brankas pool…" },
  "tf.create_btn": {
    en: "Create tournament + pool vault",
    id: "Buat turnamen + brankas pool",
  },

  // ── Create wallet flow ──────────────────────────────────────────────────
  "cw.err_pw_len": { en: "Password must be at least 8 characters", id: "Password minimal 8 karakter" },
  "cw.err_pw_match": { en: "Passwords don't match", id: "Password tidak sama" },
  "cw.err_wrong_word": {
    en: "Some words are wrong — check your backup notes.",
    id: "Ada kata yang salah — cek lagi catatan backup-mu.",
  },
  "cw.pw_label": { en: "Wallet password", id: "Password dompet" },
  "cw.pw_placeholder": { en: "At least 8 characters", id: "Minimal 8 karakter" },
  "cw.pw2_label": { en: "Repeat password", id: "Ulangi password" },
  "cw.pw_note": {
    en: "This password encrypts your seed phrase on your device. It's asked every time you send money.",
    id: "Password ini mengenkripsi seed phrase di device-mu. Diminta setiap kali kamu akan mengirim uang.",
  },
  "cw.creating": { en: "Creating wallet…", id: "Membuat dompet…" },
  "cw.create_btn": { en: "Create wallet", id: "Buat dompet" },
  "cw.noted_next": {
    en: "I've noted it — continue to confirm",
    id: "Sudah kucatat — lanjut konfirmasi",
  },
  "cw.confirm_prompt": {
    en: "Enter word {positions} to prove your backup is correct:",
    id: "Isi kata ke-{positions} untuk membuktikan backup-mu benar:",
  },
  "cw.word_n": { en: "Word {n}", id: "Kata ke-{n}" },
  "cw.view_again": { en: "View again", id: "Lihat lagi" },
  "cw.confirm_backup": { en: "Confirm backup", id: "Konfirmasi backup" },
  "cw.status_safe": { en: "Status: safe", id: "Status: aman" },
  "cw.wallet_ready": { en: "Wallet ready!", id: "Dompet siap!" },
  "cw.ready_body": {
    en: "Your access key is stored encrypted in this browser. Never share your seed phrase with anyone.",
    id: "Kunci aksesmu tersimpan terenkripsi di browser ini. Jangan pernah bagikan seed phrase kepada siapa pun.",
  },
  "cw.go_dashboard": { en: "Go to dashboard →", id: "Masuk ke dashboard →" },
  "cw.grassroots": { en: "Grassroots football", id: "Sepak bola akar rumput" },

  // ── Restore wallet form ─────────────────────────────────────────────────
  "rw.err_pw": { en: "Password must be at least 8 characters", id: "Password minimal 8 karakter" },
  "rw.phrase_label": { en: "Seed phrase (12 words)", id: "Seed phrase (12 kata)" },
  "rw.phrase_placeholder": { en: "word1 word2 word3 …", id: "kata1 kata2 kata3 …" },
  "rw.pw_label": { en: "New wallet password", id: "Password dompet baru" },
  "rw.pw_placeholder": { en: "At least 8 characters", id: "Minimal 8 karakter" },
  "rw.restoring": { en: "Restoring…", id: "Memulihkan…" },
  "rw.restore_btn": { en: "Restore wallet", id: "Pulihkan dompet" },

  // ── Unlock dialog ───────────────────────────────────────────────────────
  "ud.title": { en: "Unlock wallet", id: "Buka dompet" },
  "ud.desc": {
    en: "Enter your wallet password to continue.",
    id: "Masukkan password dompet untuk melanjutkan.",
  },
  "ud.pw": { en: "Password", id: "Password" },
  "ud.cancel": { en: "Cancel", id: "Batal" },
  "ud.unlocking": { en: "Unlocking…", id: "Membuka…" },
  "ud.confirm": { en: "Unlock", id: "Buka" },

  // ── Seed phrase reveal ──────────────────────────────────────────────────
  "sp.copied": { en: "Copied ✓", id: "Tersalin ✓" },
  "sp.copy": { en: "⧉ Copy seed phrase", id: "⧉ Salin seed phrase" },
  "sp.warn_strong": { en: "Write it on paper.", id: "Catat di kertas." },
  "sp.warn_body": {
    en: "Whoever holds these words holds the money. Tarkam keeps no copy — lost means lost.",
    id: "Siapa pun yang memegang kata-kata ini memegang uangnya. Tarkam tidak menyimpan salinan — hilang berarti hilang.",
  },

  // ── Gas warning ─────────────────────────────────────────────────────────
  "gw.no_eth": { en: "No ETH for gas yet", id: "Belum ada ETH untuk gas" },
  "gw.low_eth": { en: "ETH for gas running low", id: "ETH untuk gas menipis" },
  "gw.body_1": {
    en: "Gas balance {balance} ETH. Every transaction (mint, pay, payout) needs a little Sepolia ETH. Faucet with no mainnet balance requirement:",
    id: "Saldo gas {balance} ETH. Setiap transaksi (mint, bayar, payout) butuh sedikit Sepolia ETH. Faucet tanpa syarat saldo mainnet:",
  },
  "gw.body_gcloud": { en: "Google Cloud faucet", id: "Google Cloud faucet" },
  "gw.body_2": { en: "(just log in with Google) or", id: "(cukup login Google) atau" },
  "gw.body_pow": { en: "PoW faucet", id: "PoW faucet" },
  "gw.body_3": {
    en: "(mines in the browser). Then refresh your balance.",
    id: "(menambang di browser). Lalu muat ulang saldo.",
  },

  // ── Tx receipt ──────────────────────────────────────────────────────────
  "tr.default": { en: "Sent on-chain ✓", id: "Terkirim on-chain ✓" },

  // ── Address chip ────────────────────────────────────────────────────────
  "ac.view_explorer": { en: "View in explorer", id: "Lihat di explorer" },
  "ac.copy_addr": { en: "Copy address", id: "Salin alamat" },
} satisfies Record<string, Entry>;
