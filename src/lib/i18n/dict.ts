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
    en: "Scan the QR to open the public verify page — anyone can monitor the pot, no account needed. Refreshes every 15 seconds.",
    id: "Scan QR untuk membuka halaman verifikasi publik — siapa pun bisa memantau pot, tanpa akun. Refresh tiap 15 detik.",
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

  // ── Public verify page ──────────────────────────────────────────────────
  "vf.link_label": { en: "Public verify page", id: "Halaman verifikasi publik" },
  "vf.title_fallback": { en: "Pool", id: "Pool" },
  "vf.subtitle": {
    en: "On-chain money flow — auditable by anyone, no wallet needed.",
    id: "Aliran dana on-chain — bisa diaudit siapa saja, tanpa wallet.",
  },
  "vf.total_in": { en: "Total in", id: "Total masuk" },
  "vf.total_out": { en: "Total out", id: "Total keluar" },
  "vf.net": { en: "Net balance", id: "Saldo bersih" },
  "vf.timeline": { en: "Timeline", id: "Linimasa" },
  "vf.in": { en: "IN", id: "MASUK" },
  "vf.out": { en: "OUT", id: "KELUAR" },
  "vf.empty": { en: "No transactions yet.", id: "Belum ada transaksi." },
  "vf.loading": { en: "Loading on-chain data…", id: "Memuat data on-chain…" },
  "vf.error": { en: "Couldn't load data: {error}", id: "Gagal memuat data: {error}" },
  "vf.retry": { en: "Try again", id: "Coba lagi" },
  "vf.footer": {
    en: "Data straight from the Sepolia blockchain — this page stores nothing.",
    id: "Data langsung dari blockchain Sepolia — halaman ini tidak menyimpan apa pun.",
  },
  "vf.open_explorer": { en: "Open in explorer", id: "Buka di explorer" },
  "vf.k_deposit": { en: "Entry fee", id: "Biaya daftar" },
  "vf.k_prize": { en: "Prize", id: "Hadiah" },
  "vf.k_refund": { en: "Refund", id: "Refund" },
  "vf.k_surplus": { en: "Organizer surplus", id: "Surplus panitia" },
  "vf.gov_title": {
    en: "Approval timeline (M-of-N)",
    id: "Linimasa persetujuan (M-of-N)",
  },
  "vf.gov_empty": { en: "No governance events yet.", id: "Belum ada event tata kelola." },
  "vf.g_created": { en: "Tournament created", id: "Turnamen dibuat" },
  "vf.g_proposed": { en: "Winners proposed ({n})", id: "Pemenang diusulkan ({n})" },
  "vf.g_approved": {
    en: "Approved — {n} approval(s) in",
    id: "Disetujui — {n} persetujuan masuk",
  },
  "vf.g_cancelled": {
    en: "Tournament cancelled — refunds open",
    id: "Turnamen dibatalkan — refund dibuka",
  },

  // ── Tournament form: mode brankas (simple vs escrow) ────────────────────
  "tf.mode_label": { en: "Prize vault mode", id: "Mode brankas hadiah" },
  "tf.mode_escrow": {
    en: "Smart-contract escrow (trustless)",
    id: "Escrow smart contract (trustless)",
  },
  "tf.mode_escrow_desc": {
    en: "Funds are locked in the TarkamEscrow contract. The organizer never holds the pot — prizes and refunds are enforced on-chain.",
    id: "Dana terkunci di kontrak TarkamEscrow. Panitia tidak pernah memegang pot — hadiah & refund ditegakkan on-chain.",
  },
  "tf.mode_simple": { en: "Simple pool wallet", id: "Dompet pool sederhana" },
  "tf.mode_simple_desc": {
    en: "A self-custodial WDK pool wallet with a public address. Radically transparent; the organizer holds the key.",
    id: "Dompet pool self-custodial WDK dengan alamat publik. Transparan radikal; key dipegang panitia.",
  },
  "tf.threshold_label": { en: "Team approvals (M)", id: "Persetujuan tim (M)" },
  "tf.threshold_note": {
    en: "How many depositor teams must approve the payout before it can execute. 0 = instant.",
    id: "Berapa tim penyetor yang harus menyetujui payout sebelum bisa dieksekusi. 0 = langsung.",
  },
  "tf.refund_label": { en: "Refund deadline (days)", id: "Deadline refund (hari)" },
  "tf.refund_note": {
    en: "If prizes haven't been paid by then, any team can pull its refund — even if the organizer disappears. 0 = none.",
    id: "Bila hadiah belum dibayar sampai tenggat itu, tiap tim bisa menarik refund-nya — bahkan bila panitia menghilang. 0 = tanpa tenggat.",
  },
  "tf.pw_label_unlock": { en: "Your wallet password", id: "Password dompetmu" },
  "tf.pw_placeholder_unlock": {
    en: "Password of the wallet on this device",
    id: "Password dompet di device ini",
  },
  "tf.pw_note_unlock": {
    en: "Creating the tournament is an on-chain transaction, signed by your wallet via WDK. No pool wallet or seed backup needed — the contract holds the funds.",
    id: "Membuat turnamen adalah transaksi on-chain, ditandatangani dompetmu via WDK. Tanpa dompet pool atau backup seed — dananya dipegang kontrak.",
  },
  "tf.err_pw_unlock": {
    en: "Enter your wallet password.",
    id: "Masukkan password dompetmu.",
  },
  "tf.err_threshold": {
    en: "Approvals must be between 0 and the number of teams.",
    id: "Persetujuan harus antara 0 dan jumlah tim.",
  },
  "tf.creating_escrow": {
    en: "Creating on-chain (WDK signing)…",
    id: "Membuat on-chain (WDK tanda tangan)…",
  },

  // ── Add team: mode escrow ───────────────────────────────────────────────
  "at.captain_required": {
    en: "Captain wallet (required — receives prize/refund)",
    id: "Dompet kapten (wajib — penerima hadiah/refund)",
  },
  "at.err_addr_required": {
    en: "Escrow mode requires the captain's wallet address — it is the team's on-chain identity and the enforced prize/refund recipient.",
    id: "Mode escrow mewajibkan alamat dompet kapten — jadi identitas on-chain tim sekaligus penerima hadiah/refund yang ditegakkan kontrak.",
  },
  "at.dialog_desc_2_escrow": {
    en: "will be locked in the escrow contract (approve + deposit, signed by WDK). Only prizes or refunds can ever take it out.",
    id: "akan dikunci di kontrak escrow (approve + deposit, ditandatangani WDK). Dana hanya bisa keluar sebagai hadiah atau refund.",
  },

  // ── Team list: verifikasi escrow ────────────────────────────────────────
  "tl.notice_escrow_no_addr": {
    en: "{name} has no captain wallet yet — set it first, then verify the on-chain deposit.",
    id: "{name} belum punya dompet kapten — isi dulu, lalu verifikasi setoran on-chain-nya.",
  },
  "tl.notice_escrow_unpaid": {
    en: "No deposit recorded in the escrow contract for {name} yet.",
    id: "Belum ada setoran tercatat di kontrak escrow untuk {name}.",
  },

  // ── Pool panel: mode escrow ─────────────────────────────────────────────
  "pp.label_escrow": { en: "Escrow pot (on-chain)", id: "Pot escrow (on-chain)" },
  "pp.escrow_badge": { en: "TRUSTLESS", id: "TRUSTLESS" },
  "pp.note_escrow": {
    en: "Funds are locked in the TarkamEscrow smart contract — the organizer cannot take them. They can only leave as prizes to registered teams or refunds.",
    id: "Dana terkunci di smart contract TarkamEscrow — panitia tidak bisa mengambilnya. Dana hanya bisa keluar sebagai hadiah ke tim terdaftar atau refund.",
  },

  // ── Tournament detail: escrow ───────────────────────────────────────────
  "td.status_cancelled": { en: "Cancelled", id: "Dibatalkan" },
  "card.status_cancelled": { en: "Cancelled", id: "Dibatalkan" },
  "td.payout_desc_escrow": {
    en: "All prizes are paid by the escrow contract in a single transaction, after team approval.",
    id: "Semua hadiah dibayar kontrak escrow dalam satu transaksi, setelah persetujuan tim.",
  },

  // ── Escrow payout panel ─────────────────────────────────────────────────
  "ep.title": { en: "Prize payout", id: "Pembayaran hadiah" },
  "ep.desc": {
    en: "Propose the winners, let teams approve, then execute — the contract pays every prize in one transaction.",
    id: "Usulkan pemenang, tunggu persetujuan tim, lalu eksekusi — kontrak membayar semua hadiah dalam satu transaksi.",
  },
  "ep.total": { en: "Total prizes", id: "Total hadiah" },
  "ep.missing_addr": {
    en: "Every winning team needs a captain wallet before the payout can be proposed.",
    id: "Setiap tim pemenang butuh dompet kapten sebelum payout bisa diusulkan.",
  },
  "ep.dup_addr": {
    en: "Two winners share the same wallet address — each team needs its own.",
    id: "Dua pemenang memakai alamat dompet yang sama — tiap tim harus punya sendiri.",
  },
  "ep.pot_short": {
    en: "The on-chain pot doesn't cover the total prizes yet.",
    id: "Pot on-chain belum menutup total hadiah.",
  },
  "ep.done": { en: "Prizes paid by the contract ✓", id: "Hadiah dibayar kontrak ✓" },
  "ep.receipt": { en: "Payout transaction", id: "Transaksi payout" },
  "ep.approvals": { en: "Team approvals", id: "Persetujuan tim" },
  "ep.approve_hint": {
    en: "Approving is done from a depositor team's wallet. Once approvals reach the threshold, anyone can execute.",
    id: "Persetujuan dilakukan dari dompet tim penyetor. Begitu mencapai ambang, siapa pun bisa mengeksekusi.",
  },
  "ep.approve_btn": { en: "Approve (as team)", id: "Setujui (sebagai tim)" },
  "ep.execute_btn": { en: "Execute payout", id: "Eksekusi payout" },
  "ep.last_tx": { en: "Last transaction", id: "Transaksi terakhir" },
  "ep.propose_btn": { en: "Propose winners on-chain", id: "Usulkan pemenang on-chain" },
  "ep.unlock_propose": { en: "Propose winners", id: "Usulkan pemenang" },
  "ep.unlock_approve": { en: "Approve payout", id: "Setujui payout" },
  "ep.unlock_execute": { en: "Execute payout", id: "Eksekusi payout" },
  "ep.unlock_desc": {
    en: "Enter your wallet password — WDK signs and broadcasts the transaction.",
    id: "Masukkan password dompetmu — WDK menandatangani & mem-broadcast transaksinya.",
  },
  "ep.unlock_confirm": { en: "Sign & send", id: "Tanda tangan & kirim" },

  // ── Escrow cancel & refund ──────────────────────────────────────────────
  "er.cancel_title": {
    en: "Tournament fell through?",
    id: "Turnamen batal?",
  },
  "er.cancel_desc": {
    en: "Cancelling on-chain opens refunds: every team can get its entry fee back. Irreversible.",
    id: "Membatalkan on-chain membuka refund: tiap tim bisa mendapat biaya daftarnya kembali. Tidak bisa dibatalkan.",
  },
  "er.cancel_btn": { en: "Cancel & open refunds", id: "Batalkan & buka refund" },
  "er.cancel_unlock_title": { en: "Cancel tournament", id: "Batalkan turnamen" },
  "er.cancel_unlock_desc": {
    en: "This on-chain action permanently opens the refund path for all teams.",
    id: "Aksi on-chain ini membuka jalur refund untuk semua tim secara permanen.",
  },
  "er.cancel_confirm": { en: "Cancel on-chain", id: "Batalkan on-chain" },
  "er.refund_title": { en: "Refunds", id: "Refund" },
  "er.refund_desc": {
    en: "The tournament is cancelled. Each team's entry fee goes back to its own wallet — the contract enforces the recipient, whoever presses the button.",
    id: "Turnamen dibatalkan. Biaya daftar tiap tim kembali ke dompetnya sendiri — kontrak menegakkan penerimanya, siapa pun yang menekan tombol.",
  },
  "er.no_teams": {
    en: "No paid teams with a captain wallet.",
    id: "Belum ada tim lunas dengan dompet kapten.",
  },
  "er.refunded": { en: "Refunded ✓", id: "Refund terkirim ✓" },
  "er.refund_btn": { en: "Refund {fee} USDT", id: "Refund {fee} USDT" },
  "er.refund_unlock_title": { en: "Claim refund", id: "Tarik refund" },
  "er.refund_unlock_desc": {
    en: "WDK signs the claim; the funds always go to the team's wallet.",
    id: "WDK menandatangani klaimnya; dana selalu masuk ke dompet tim.",
  },
  "er.refund_confirm": { en: "Sign & send", id: "Tanda tangan & kirim" },

  // ── Join page (/join/[escrowId]) ────────────────────────────────────────
  "jn.title": { en: "Join tournament #{id}", id: "Gabung Turnamen #{id}" },
  "jn.escrow_badge": { en: "On-chain escrow", id: "Escrow on-chain" },
  "jn.contract_label": { en: "Escrow contract", id: "Kontrak escrow" },
  "jn.open_explorer": { en: "Open in explorer", id: "Buka di explorer" },
  "jn.verify_link": { en: "View public audit trail", id: "Lihat jejak audit publik" },
  "jn.invalid_id": {
    en: "Invalid escrow link — the tournament id must be a number.",
    id: "Link escrow tidak valid — id turnamen harus berupa angka.",
  },
  "jn.loading": { en: "Loading tournament data from the contract…", id: "Memuat data turnamen dari kontrak…" },
  "jn.load_error": {
    en: "Couldn't load tournament data: {error}",
    id: "Gagal memuat data turnamen: {error}",
  },
  "jn.retry": { en: "Retry", id: "Coba lagi" },
  "jn.summary_title": { en: "Tournament summary", id: "Ringkasan turnamen" },
  "jn.entry_fee": { en: "Entry fee", id: "Biaya daftar" },
  "jn.pot": { en: "Current pot", id: "Pot saat ini" },
  "jn.team_count": { en: "Teams joined", id: "Tim terdaftar" },
  "jn.prizes_title": { en: "Prizes", id: "Hadiah" },
  "jn.prize_rank": { en: "Rank {n}", id: "Peringkat {n}" },
  "jn.approvals": { en: "Approvals", id: "Persetujuan" },
  "jn.status_open": { en: "Open for registration", id: "Terbuka untuk pendaftaran" },
  "jn.status_proposed": { en: "Winners proposed — awaiting approval", id: "Pemenang diusulkan — menunggu persetujuan" },
  "jn.status_paid": { en: "Prizes paid", id: "Hadiah sudah dibayar" },
  "jn.status_cancelled": { en: "Cancelled — refunds open", id: "Dibatalkan — refund dibuka" },
  "jn.no_wallet_title": { en: "You need a wallet first", id: "Kamu butuh dompet dulu" },
  "jn.no_wallet_desc": {
    en: "Create or restore your own self-custodial wallet, then come back and open this link (or scan the QR) again to register your team.",
    id: "Buat atau pulihkan dompetmu sendiri dulu, lalu buka lagi link ini (atau scan ulang QR-nya) untuk mendaftarkan timmu.",
  },
  "jn.no_wallet_btn": { en: "Set up my wallet", id: "Siapkan dompetku" },
  "jn.your_wallet": { en: "Your wallet", id: "Dompetmu" },
  "jn.deposit_title": { en: "Register your team", id: "Daftarkan timmu" },
  "jn.deposit_desc": {
    en: "Paying the entry fee registers your wallet address as the team's captain — the deposit is locked in the escrow contract until payout or refund.",
    id: "Membayar biaya daftar mendaftarkan alamat dompetmu sebagai kapten tim — setoran terkunci di kontrak escrow sampai payout atau refund.",
  },
  "jn.balance_low": {
    en: "Your USDT balance ({balance}) is lower than the entry fee ({fee}). Top up your wallet first.",
    id: "Saldo USDT dompetmu ({balance}) lebih kecil dari biaya daftar ({fee}). Isi dulu dompetmu.",
  },
  "jn.go_wallet": { en: "Go to wallet", id: "Buka halaman dompet" },
  "jn.deposit_btn": { en: "Pay deposit & register", id: "Bayar deposit & daftar" },
  "jn.deposit_unlock_title": { en: "Pay deposit", id: "Bayar deposit" },
  "jn.deposit_unlock_desc": {
    en: "WDK signs the approval and deposit transactions from your wallet.",
    id: "WDK menandatangani transaksi approve & deposit dari dompetmu.",
  },
  "jn.registered_title": { en: "Registered ✓", id: "Terdaftar ✓" },
  "jn.registered_desc": {
    en: "Your deposit of {amount} USDT is locked in the escrow contract.",
    id: "Setoranmu sebesar {amount} USDT terkunci di kontrak escrow.",
  },
  "jn.proposed_title": { en: "Proposed winners", id: "Usulan pemenang" },
  "jn.you_are_winner": { en: "This is you! 🎉", id: "Ini kamu! 🎉" },
  "jn.approve_btn": { en: "Approve payout", id: "Setujui payout" },
  "jn.approve_unlock_title": { en: "Approve payout", id: "Setujui payout" },
  "jn.approve_unlock_desc": {
    en: "You're approving the proposed winners as a depositor team.",
    id: "Kamu menyetujui usulan pemenang sebagai tim penyetor.",
  },
  "jn.already_approved": {
    en: "You've already approved this payout.",
    id: "Kamu sudah menyetujui payout ini.",
  },
  "jn.not_depositor": {
    en: "Only teams that deposited can approve the payout.",
    id: "Hanya tim yang sudah setor yang bisa menyetujui payout.",
  },
  "jn.paid_title": { en: "Prizes paid by the contract", id: "Hadiah sudah dibayar kontrak" },
  "jn.paid_desc": {
    en: "The escrow contract has paid out every prize in a single transaction.",
    id: "Kontrak escrow sudah membayar semua hadiah dalam satu transaksi.",
  },
  "jn.refund_title": { en: "Refund available", id: "Refund tersedia" },
  "jn.refund_desc": {
    en: "This tournament won't proceed. You can claim your deposit back — it always goes straight to your own wallet.",
    id: "Turnamen ini tidak dilanjutkan. Kamu bisa menarik kembali setoranmu — dananya selalu langsung masuk ke dompetmu sendiri.",
  },
  "jn.refund_btn": { en: "Withdraw refund", id: "Tarik refund" },
  "jn.refund_unlock_title": { en: "Claim refund", id: "Tarik refund" },
  "jn.refund_unlock_desc": {
    en: "WDK signs the claim; the funds always go to your wallet.",
    id: "WDK menandatangani klaimnya; dana selalu masuk ke dompetmu.",
  },
  "jn.no_deposit_refund": {
    en: "You don't have a deposit to refund for this tournament.",
    id: "Kamu tidak punya setoran untuk direfund pada turnamen ini.",
  },
  "jn.unlock_confirm": { en: "Sign & send", id: "Tanda tangan & kirim" },
  "jn.receipt": { en: "Transaction", id: "Transaksi" },
  "jn.footer": {
    en: "This page reads directly from the smart contract on Sepolia — no data from the organizer's device is used.",
    id: "Halaman ini membaca langsung dari smart contract di Sepolia — tidak memakai data dari perangkat panitia.",
  },

  // ── Gasless (EIP-7702 + ERC-4337, WDK wdk-wallet-evm-7702-gasless) ────────
  "gl.badge": {
    en: "⛽ Gasless — sponsored gas via WDK (EIP-7702)",
    id: "⛽ Gasless — gas disponsori via WDK (EIP-7702)",
  },

  // ── ShareJoinLink ────────────────────────────────────────────────────────
  "sj.title": { en: "Invite captains", id: "Undang kapten" },
  "sj.desc": {
    en: "Share this link or QR with team captains so they can register and pay their own entry fee from their own wallet.",
    id: "Bagikan link atau QR ini ke kapten tim supaya mereka bisa mendaftar dan membayar biaya daftar dari dompetnya sendiri.",
  },
  "sj.copy": { en: "Copy link", id: "Salin link" },
  "sj.copied": { en: "Copied!", id: "Tersalin!" },

  // ── AssistantPanel (Wasit AI) ───────────────────────────────────────────
  "as.title": { en: "Wasit AI", id: "Wasit AI" },
  "as.badge": { en: "rule-based · QVAC-ready", id: "rule-based · siap QVAC" },
  "as.desc": {
    en: "A local rule-based assistant version, built to be swapped for the QVAC model later. No action ever runs without your approval.",
    id: "Versi asisten rule-based lokal, dibangun untuk ditukar model QVAC nanti. Tidak ada aksi yang berjalan tanpa persetujuanmu.",
  },
  "as.placeholder": {
    en: 'try: "make bracket", "propose payout", "status"',
    id: 'coba: "bikin bracket", "siapkan payout", "status"',
  },
  "as.send": { en: "Send", id: "Kirim" },
  "as.approve": { en: "Approve & run", id: "Setujui & jalankan" },
  "as.cancel_btn": { en: "Cancel", id: "Batal" },
  "as.empty": {
    en: "No messages yet. Try asking for the tournament status.",
    id: "Belum ada percakapan. Coba tanya status turnamen dulu.",
  },
  "as.draft.create_bracket.title": { en: "Create bracket", id: "Buat bracket" },
  "as.draft.create_bracket.detail": {
    en: "{n} paid teams will enter the bracket:",
    id: "{n} tim yang sudah bayar akan masuk bracket:",
  },
  "as.draft.propose_payout.title": { en: "Propose payout", id: "Usulkan payout" },
  "as.draft.propose_payout.note": {
    en: "Needs approval from {n} teams once proposed.",
    id: "Butuh persetujuan {n} tim setelah diusulkan.",
  },
  "as.draft.cancel_tournament.title": {
    en: "Cancel tournament",
    id: "Batalkan turnamen",
  },
  "as.draft.cancel_tournament.detail": {
    en: "All teams will be able to claim a refund. This cannot be undone.",
    id: "Semua tim bisa menarik refund. Tidak bisa dibatalkan.",
  },
  "as.guard.bracket_not_setup": {
    en: "Bracket can only be created while registration is still open (status: setup).",
    id: "Bracket hanya bisa dibuat saat masih tahap pendaftaran (status: setup).",
  },
  "as.guard.not_enough_teams": {
    en: "At least 2 paid teams are needed to create a bracket ({n} paid so far).",
    id: "Butuh minimal 2 tim yang sudah bayar untuk membuat bracket (baru {n} yang bayar).",
  },
  "as.guard.payout_not_escrow": {
    en: "Payout proposals are only available for escrow-mode tournaments.",
    id: "Usulan payout hanya tersedia untuk turnamen mode escrow.",
  },
  "as.guard.payout_not_finished": {
    en: "The bracket isn't finished yet — there's no champion to pay out.",
    id: "Bracket belum selesai — belum ada juara untuk dibayar.",
  },
  "as.guard.payout_missing_address": {
    en: "Some winning teams don't have a captain wallet address set yet.",
    id: "Beberapa tim pemenang belum mengatur alamat dompet kapten.",
  },
  "as.guard.payout_duplicate_address": {
    en: "Two winning teams share the same wallet address — fix this before proposing payout.",
    id: "Dua tim pemenang memakai alamat dompet yang sama — perbaiki dulu sebelum mengusulkan payout.",
  },
  "as.guard.payout_row_mismatch": {
    en: "The number of winners doesn't match the number of prizes yet.",
    id: "Jumlah pemenang belum sesuai dengan jumlah hadiah.",
  },
  "as.guard.cancel_not_escrow": {
    en: "Only escrow-mode tournaments can be cancelled from here.",
    id: "Hanya turnamen mode escrow yang bisa dibatalkan lewat sini.",
  },
  "as.guard.cancel_already_paid": {
    en: "This tournament has already been paid out on-chain — it can no longer be cancelled.",
    id: "Turnamen ini sudah dibayar on-chain — tidak bisa dibatalkan lagi.",
  },
  "as.guard.cancel_already_cancelled": {
    en: "This tournament is already cancelled — teams can claim their refunds now.",
    id: "Turnamen ini sudah dibatalkan — tim sudah bisa menarik refund.",
  },
  "as.unknown": {
    en: 'I didn\'t catch that. Try: "make bracket", "propose payout", "cancel tournament", or "status".',
    id: 'Aku belum paham. Coba: "bikin bracket", "siapkan payout", "batalkan turnamen", atau "status".',
  },
  "as.status.header": { en: "Tournament status: {status}", id: "Status turnamen: {status}" },
  "as.status.teams": { en: "Paid teams: {paid}/{total}", id: "Tim bayar: {paid}/{total}" },
  "as.status.bracket_none": { en: "Bracket: not created yet", id: "Bracket: belum dibuat" },
  "as.status.bracket_running": { en: "Bracket: in progress", id: "Bracket: sedang berjalan" },
  "as.status.bracket_finished": {
    en: "Bracket: finished — champion {name}",
    id: "Bracket: selesai — juara {name}",
  },
  "as.status.escrow_pot": { en: "On-chain pot: {pot} USDT", id: "Pot on-chain: {pot} USDT" },
  "as.status.escrow_approvals": {
    en: "Approvals: {approvals}/{threshold}",
    id: "Persetujuan: {approvals}/{threshold}",
  },
  "as.status.escrow_status": {
    en: "Escrow contract status: {status}",
    id: "Status kontrak escrow: {status}",
  },
  "as.result.create_bracket_done": {
    en: "Bracket created! The tournament is now running.",
    id: "Bracket berhasil dibuat! Turnamen sekarang berjalan.",
  },
  "as.result.propose_payout_done": {
    en: "Payout proposed on-chain.",
    id: "Payout berhasil diusulkan on-chain.",
  },
  "as.result.cancel_done": {
    en: "Tournament cancelled. Teams can now claim a refund.",
    id: "Turnamen dibatalkan. Tim sekarang bisa menarik refund.",
  },
  "as.result.error": { en: "Something went wrong: {message}", id: "Terjadi kesalahan: {message}" },
  "as.unlock.propose_title": {
    en: "Sign payout proposal",
    id: "Tanda tangani usulan payout",
  },
  "as.unlock.cancel_title": {
    en: "Sign tournament cancellation",
    id: "Tanda tangani pembatalan turnamen",
  },
  "as.unlock.desc": {
    en: "Enter your wallet password to sign this transaction.",
    id: "Masukkan password dompetmu untuk menandatangani transaksi ini.",
  },
  "as.unlock.confirm": { en: "Sign & send", id: "Tanda tangan & kirim" },
} satisfies Record<string, Entry>;
