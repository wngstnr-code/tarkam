# Brand — Tarkam

_Status: active (didefinisikan dari IDE-FINAL-TARKAM.md §1; UI direferensikan via Google Stitch)_

## Identitas
- **Produk:** Tarkam — brankas hadiah on-chain untuk sepak bola akar rumput.
- **Asisten:** Wasit (pengadil netral).
- **Tagline:** "Hadiah turnamen yang tak bisa dibawa kabur."
- **Nada:** tegas, jujur, membumi (bahasa kampung yang rapi — bukan korporat, bukan crypto-bro).

## Warna (token)
| Peran | Hex | Pakai untuk |
|---|---|---|
| Merah Indonesia (primary) | `#CE1126` | CTA utama, aksen header, badge status aktif |
| Putih (background terang) | `#FAFAF8` | latar utama light mode |
| Hijau lapangan (success/money) | `#1B7A3D` | saldo, status lunas, resi on-chain |
| Hijau gelap (pitch dark) | `#0E3D20` | panel scoreboard gelap, footer |
| Arang (foreground) | `#1A1A1A` | teks utama |
| Kuning peluit (warning) | `#F2B705` | banner testnet, peringatan |

Terapkan ke CSS variables shadcn (`--primary` = merah, `--secondary` = hijau lapangan, dst); dark mode = nuansa pitch dark, bukan abu-abu netral.

## Tipografi
- **Display/heading:** sans condensed tebal ala jersey/papan skor (mis. `Archivo Black` / `Anton` via next/font).
- **Body:** `Geist` / `Inter`.
- **Angka uang & alamat:** mono (`Geist Mono`), tabular-nums.

## Motif
- Aksen garis lapangan (garis putih tipis, lingkaran tengah) dan batik geometris sangat halus sebagai tekstur latar panel — tipis, tidak norak.
- Elemen skor/scoreboard untuk bracket & klasemen.

## Aturan
- Saldo & uang selalu hijau lapangan dengan mono tabular.
- Hash/resi selalu tampil sebagai chip mono yang bisa diklik ke explorer.
- Banner testnet kuning selalu terlihat.
