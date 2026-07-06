# IDE FINAL — Tarkam (detail)

> Konsep produk untuk **Tether Developers Cup** — Track **WDK**, Tim **Indonesia 🇮🇩**.
> Proyek mandiri di `/Users/mac/Desktop/Tarkam`. Rencana teknis: lihat `EXECUTION-PLAN.md`.
> Versi dokumen: 6 Juli 2026.

---

## 1. Identitas & Brand

| Elemen | Nilai | Alasan |
|---|---|---|
| **Nama produk** | **Tarkam** | Dari *"tarkam"* (antar-kampung). Setiap orang Indonesia langsung paham = sepak bola akar rumput. Nama = penjelasan produk. |
| **Asisten AI** | **Wasit** | Wasit = pengadil netral. Secara tema sempurna: AI yang mengatur bracket, hitung klasemen, siapkan pembagian hadiah imparsial. |
| **Tagline utama** | *"Hadiah turnamen yang tak bisa dibawa kabur."* | Menyerang langsung pain point #1 (kepercayaan). |
| **Tagline alternatif (juri internasional)** | *"On-chain prize escrow for grassroots football."* | Untuk README & video versi Inggris. |
| **Nada visual** | Merah-putih + aksen lapangan hijau, tipografi tebal ala jersey/scoreboard, sentuhan batik geometris tipis | Menguatkan identitas "Tim Indonesia" tanpa norak. |

---

## 2. Pitch

**Satu kalimat:**
> **Brankas hadiah self-custodial untuk turnamen sepak bola akar rumput: panitia buat dompet hadiah on-chain (key di device sendiri via WDK), tiap tim bayar pendaftaran USDT ke alamat publik yang saldonya bisa dicek siapa saja, dan hadiah juara dibayar on-chain di depan semua orang — resi = hash transaksi.**

**Elevator (30 detik):**
> Di Indonesia ada ribuan turnamen tarkam tiap tahun — semua cash, semua dipegang panitia. Uang pendaftaran & hadiah sering jadi sumber sengketa, bahkan hilang. Tarkam memindahkan pot hadiah ke dompet self-custodial USDT yang alamatnya publik: semua tim bisa memantau saldo pot secara real-time di blockchain, dan begitu final selesai, hadiah dikirim on-chain langsung ke dompet tim juara. Tak ada panitia yang bisa menyembunyikan aliran uang. Dibangun dengan Tether WDK.

---

## 3. Masalah (nyata, lokal, terukur)

Sepak bola tarkam / Liga Kemerdekaan / turnamen 17 Agustus & Ramadhan adalah budaya masif: ribuan turnamen per tahun di seluruh Indonesia, dari kampung sampai kompleks perumahan. Ekonominya nyata — uang pendaftaran tim (Rp 200rb–2jt/tim) dan hadiah juara (jutaan sampai puluhan juta). **Semuanya cash.**

Pain point berulang:

1. **Kustodi buram.** Uang pendaftaran & hadiah dipegang bendahara panitia. Tak ada yang tahu pasti total pot atau ke mana perginya.
2. **Sengketa & penggelapan.** Hadiah "menyusut", pencairan diulur, dalam kasus buruk panitia kabur bawa uang.
3. **Pencairan lambat & tidak utuh** ke tim juara — apalagi tim dari luar kota.
4. **Tidak ada bukti auditable.** Semua berbasis kepercayaan personal.

**Inti masalah = kepercayaan atas uang bersama.** Transparansi on-chain adalah keunggulan alami USDT. Ini bukan kripto yang dipaksakan — kripto memang solusi paling pas.

---

## 4. Persona

**A. Rangga — Panitia (primary).** 28 th, ketua karang taruna, urus turnamen 17-an antar-RT. Pegang uang pendaftaran 16 tim, deg-degan jaga uang tunai berhari-hari & sering ditanya soal transparansi. Butuh: pot yang aman + bisa dibuktikan ke semua peserta.

**B. Dimas — Kapten tim (secondary).** 22 th, kapten tim futsal kampung. Ingin memastikan hadiah real & benar dibayar kalau menang. Butuh: bukti pot itu real + dompet penerima hadiah.

**C. Penonton/tim lain — Verifier.** Ingin memastikan turnamen jujur. Butuh: cek saldo pot & payout tanpa akun (cukup buka alamat di explorer).

---

## 5. Solusi & Alur Emas (golden flow)

### 5.1 Alur panitia (Rangga)
1. **Buat turnamen** — nama, jumlah tim, biaya pendaftaran, format (gugur/round-robin), hadiah (juara 1/2/3).
2. **App generate dompet pool self-custodial** via WDK (seed BIP-39 di device). **Backup seed phrase** ditampilkan + dikonfirmasi (bukti self-custody).
3. **Bagikan alamat pool** (QR + link) ke semua tim. Alamat publik — siapa pun memantau.
4. **Kelola turnamen** — tambah tim, tandai pembayaran (verifikasi tx on-chain), susun bracket, input hasil, lihat klasemen.
5. **Final → payout** — pilih juara, tinjau kartu konfirmasi (jumlah, penerima, kurs), **approve**, WDK tanda tangani & broadcast → **hash + link explorer**.

### 5.2 Alur kapten tim (Dimas)
1. **Terima link turnamen** → lihat detail, hadiah, dan **saldo pot live on-chain**.
2. **Buat/hubungkan dompet** (WDK) → alamat penerima hadiah.
3. **Bayar pendaftaran** USDT ke alamat pool → status "terverifikasi" saat tx confirmed.
4. **Pantau** progres & klasemen.
5. **Jika juara** → hadiah masuk dompet, lihat resi hash.

### 5.3 Alur verifier (publik)
- Buka alamat pool di Etherscan Sepolia → lihat semua pemasukan (pendaftaran) & pengeluaran (payout). Nol kepercayaan pada klaim panitia.

> **Momen demo terkuat (15 detik yang menang):** saldo pot naik saat tiap tim bayar (live), lalu payout ke juara muncul sebagai hash di explorer. **Uang benar-benar bergerak on-chain — tidak ada bagian mock.**

---

## 6. Model kustodi & escrow (JUJUR — titik paling kritis)

### 6.1 MVP — "Transparansi Radikal" (self-custody murni, submission I)
- Pot hadiah = **satu dompet self-custodial**, seed dibuat di device panitia via WDK.
- Alamat **publik** → tiap tim & penonton memantau saldo on-chain kapan saja.
- Payout ditandatangani panitia & broadcast on-chain; resi = hash.
- **Perpindahan kepercayaan:** dari *"percaya kejujuran panitia soal uang cash yang tak terlihat"* → *"semua orang menonton pot di rantai; tiap pemasukan & pengeluaran publik & permanen."*
- **Klaim jujur di UI & video:** *"Ini transparansi radikal, bukan trustless. Panitia masih pemegang key — tapi tak bisa lagi menyembunyikan aliran dana."* Kejujuran menambah kredibilitas di mata juri (alergi over-claim).

### 6.2 Stretch — Trustless (submission II / roadmap)
- **Multisig 2-of-3** (panitia + 2 kapten) atau **escrow smart-contract** yang melepas dana ke juara hanya setelah hasil ditandatangani M-of-N kapten.
- Menghapus kepercayaan pada panitia sepenuhnya.
- ⚠️ Perlu verifikasi dukungan multisig/kontrak di WDK — **jangan janjikan di submission I**.

### 6.3 Yang TIDAK kita klaim
- Bukan trustless di MVP.
- Bukan penyelesaian sengketa hasil pertandingan (itu urusan wasit lapangan).
- Off-ramp ke Rupiah tunai = di luar scope demo (roadmap: mitra e-wallet).

---

## 7. Aliran uang on-chain (diagram teks)

```
                       (publik, bisa dicek siapa saja)
   Tim A ──USDT──┐
   Tim B ──USDT──┤
   Tim C ──USDT──┼──►  DOMPET POOL (self-custodial, WDK, di device panitia)
   ...           │            │
   Tim P ──USDT──┘            │  panitia approve payout (human-in-the-loop)
                              ▼
                        DOMPET JUARA  ◄── hash tx (resi publik di explorer)
```
- Key & dana **tidak pernah** menyentuh server Tarkam. Server (kalau ada) hanya menyimpan metadata (nama tim, jadwal, skor).
- Memperkuat narasi WDK: *"backend kami cuma tahu jadwal & skor; uang hanya bisa digerakkan oleh key di device panitia."*

---

## 8. Fitur & Scope

### Submission I (8 Juli) — WDK murni, web Next.js
1. Onboarding + generate/restore dompet self-custodial (WDK) + backup seed.
2. Buat turnamen (nama, jumlah tim, biaya, format, struktur hadiah).
3. Dompet pool per turnamen + alamat/QR + **saldo pool live on-chain**.
4. Tambah tim + tandai pembayaran (verifikasi tx on-chain).
5. Bracket sederhana (gugur) + input hasil match + klasemen. **Wasit = berbasis aturan (tanpa LLM).**
6. Payout hadiah on-chain ke juara + kartu konfirmasi + approve + resi hash + link explorer.
7. Banner mode testnet (transparan).

### Submission II (12 Juli) — Champion push, Electron + QVAC
8. Bungkus Electron → **Wasit AI on-device (QVAC)**: parse perintah natural language ("bikin bracket 16 tim gugur", "juara tim Garuda, bayar hadiah"), draft payout.
9. Multisig 2-of-3 / escrow trustless.
10. Bagi hadiah berjenjang (juara 1/2/3) dalam satu approve.
11. QR verifikasi publik (halaman read-only untuk penonton).
12. Responsif mobile.

---

## 9. Lapisan QVAC (submission II, via Electron)

⚠️ **Fakta runtime (docs resmi qvac.tether.io):** QVAC **tidak punya target browser** (no WASM). Hanya jalan di **Node.js ≥22.17, Bare, atau Expo**. Website hosted (browser) **tidak bisa** menjalankan QVAC di device pengguna.

→ Submission II **membungkus app dengan Electron** — proses Node Electron = device pengguna, UI Next.js dipakai utuh. Wasit versi QVAC (on-device LLM completion): parse intent dari bahasa natural, tanpa cloud, tanpa biaya API, tahan koneksi mati. Narasi Champion: *"WDK + QVAC dalam satu produk koheren."* Tepat waktu karena finalis & pitch dinilai **setelah 12 Juli**.

---

## 10. Kenapa kuat untuk hackathon (ringkas)

| Sumbu | Kekuatan |
|---|---|
| Tema football | Kena 4 kategori resmi: tournaments, players, clubs, communities. Sepak bola **asli** dimainkan. |
| Track WDK | Self-custody **adalah produk**, bukan aksesori. Resi = hash on-chain. |
| Real-world utility | Menyelesaikan masalah kepercayaan nyata. Adopsi USDT emerging-market = narasi favorit Tether. |
| Differensiasi | Tim lain ramai di remittance/fantasy/prediction. Escrow tarkam otentik, lokal, langka. |
| Optik bersih | Bukan judi/spekulasi. Pencairan hadiah transparan. |
| Jalur Champion | WDK (sub I) + QVAC via Electron (sub II) = dua stack Tether dalam satu produk. |
| Kejujuran | Payout real on-chain (nol mock) + klaim kustodi jujur (bukan over-claim trustless). |

---

## 11. Skrip video demo (±3 menit)

1. **0:00–0:30 — Masalah.** Mock turnamen tarkam + teks: "Ribuan turnamen tarkam tiap tahun. Semua cash. Semua dipegang panitia." Sebut pain: hadiah hilang, sengketa.
2. **0:30–2:15 — Alur emas.** Panitia buat turnamen → generate dompet + backup seed → bagikan alamat pool → 3 tim bayar (saldo pot naik live) → input hasil → final → approve payout → **hash muncul, buka explorer, tunjukkan tx real**.
3. **2:15–2:45 — Kenapa penting.** Diagram: key/dana di device (WDK) vs metadata di server. "Panitia tak bisa menyembunyikan sepeser pun."
4. **2:45–3:00 — Roadmap + Tim Indonesia.** QVAC/Wasit offline & multisig sebagai next. Tutup merah-putih.

> Wajib: tunjukkan **hash transaksi asli di Etherscan Sepolia**.

---

## 12. Checklist kedalaman WDK (anti-"tempelan")

- [ ] Seed phrase pool digenerate & disimpan terenkripsi via WDK + flow backup/restore di UI.
- [ ] Saldo pool USDT dibaca via WDK (bukan API pihak ketiga).
- [ ] Payout ditandatangani & di-broadcast via WDK (bukan ethers/viem langsung) — resi = hash.
- [ ] Verifikasi pembayaran tim membaca state chain via WDK.
- [ ] README menyebut modul WDK apa yang dipakai & di file mana.

---

## 13. Risiko & keputusan riset

- [x] ~~QVAC jalan di browser?~~ → **TIDAK** (no WASM target; hanya Node/Bare/Expo) → QVAC ke submission II via Electron.
- [ ] Uji `account.transfer()` ERC-20 di Sepolia via WDK — **langkah pertama Fase 2 eksekusi**.
- [ ] Token ERC-20 "USDT demo" di Sepolia: **rekomendasi deploy MockUSDT sendiri** (bisa mint untuk demo wallets) vs testnet USDT existing.
- [ ] Dukungan multisig / smart-contract escrow di WDK (stretch, submission II).
- [ ] Kurs USDT→IDR untuk tampilan nominal setara Rupiah (opsional, cosmetic).

---

## 14. Keputusan final

- ✅ Track **WDK**, Tim **Indonesia**.
- ✅ Konsep: **escrow/brankas hadiah turnamen tarkam** — transparansi radikal, payout on-chain.
- ✅ Rail: **USDT** (testnet Sepolia) di EVM via `@tetherto/wdk-wallet-evm`.
- ✅ Asisten: **Wasit** (sub I berbasis aturan, sub II QVAC on-device).
- ✅ Frontend: **Next.js web, desktop-first** (mobile menyusul).
- ✅ Submission I: **WDK murni di web**. Submission II: **Electron + QVAC**.
- ✅ Model kustodi MVP: **transparansi radikal (self-custody jujur)**; trustless multisig = stretch.
- ✅ Penyimpanan: **local-first** (metadata turnamen di device), tanpa backend wajib.
