# EXECUTION PLAN — Tarkam (Submission I)

> Rencana teknis untuk submission I **Tether Developers Cup / Track WDK**.
> Target: web Next.js desktop-first, **WDK murni**, payout USDT real on-chain di Sepolia.
> Idе & konteks produk: lihat `IDE-FINAL-TARKAM.md`. Versi: 6 Juli 2026.
> Prinsip: **alur emas dulu** (buat turnamen → dompet pool → bayar → payout on-chain), fitur sekunder belakangan.

---

## 0. Ringkasan arsitektur

Tiga lapisan, batas tegas:

```
┌─────────────────────────────────────────────────────────────┐
│  UI  (Next.js App Router, React Server/Client, Tailwind)     │
│  - Pages & components. Semua yang sentuh WDK = Client only.  │
├─────────────────────────────────────────────────────────────┤
│  WALLET LAYER  (client-side, WDK)  ← yang dinilai track      │
│  - src/lib/wallet/*  : generate/restore seed, saldo, transfer│
│  - Key & dana TIDAK pernah keluar device.                    │
├─────────────────────────────────────────────────────────────┤
│  DATA LAYER  (local-first, IndexedDB via Dexie)              │
│  - Metadata turnamen/tim/match/skor. TIDAK menyimpan key.    │
│  - Repo jalan tanpa backend apa pun → mudah dijalankan juri. │
└─────────────────────────────────────────────────────────────┘
                     │ (baca/tulis chain)
                     ▼
        EVM Sepolia testnet  (RPC) + MockUSDT (ERC-20)
```

Keputusan kunci:
- **Tanpa backend server.** State turnamen di IndexedDB (local-first). Menghapus kelemahan "susah dijalankan juri" & memperjelas narasi self-custody.
- **WDK = satu-satunya jalur uang.** Baca saldo & broadcast transfer lewat WDK, bukan ethers/viem langsung.
- **Seed terenkripsi** dengan password user (Web Crypto AES-GCM) → disimpan di IndexedDB. Backup phrase ditampilkan sekali.

---

## 1. Stack & versi

| Item | Pilihan | Catatan |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | `output` default; desktop-first. |
| Styling | **Tailwind CSS + shadcn/ui** | Cepat, konsisten; ikuti skill `frontend-design-guidelines`. |
| Wallet | **`@tetherto/wdk-wallet-evm`** (pin versi persis, mis. `1.0.0-beta.15`) | Beta → pin. API tervalidasi di spike. |
| Polyfill | `buffer`, `sodium-javascript` | Wajib (lihat §7). |
| Local DB | **Dexie** (IndexedDB) | Store turnamen/tim/match. |
| State | **Zustand** | Wallet state + turnamen aktif. |
| QR | `qrcode.react` | Tampilkan alamat pool. |
| Chain | **Sepolia** | RPC `https://sepolia.drpc.org` (fallback dari spike). |
| Token | **MockUSDT** (deploy sendiri, ERC-20 6 desimal) | Bisa mint ke demo wallets. |
| Lisensi | **MIT** | Syarat hackathon. |

---

## 2. Struktur folder & file (file-by-file)

```
Tarkam/
├─ IDE-FINAL-TARKAM.md
├─ EXECUTION-PLAN.md              ← dokumen ini
├─ README.md                      ← ditulis di Fase 5 (untuk juri)
├─ LICENSE                        ← MIT
├─ package.json
├─ next.config.js                 ← polyfill Buffer + alias sodium (§7)
├─ tailwind.config.ts
├─ tsconfig.json
├─ .env.local.example             ← RPC, alamat MockUSDT, chainId, explorer base
│
├─ contracts/                     ← MockUSDT (opsional, kalau deploy sendiri)
│  ├─ MockUSDT.sol
│  └─ deploy-notes.md             ← alamat hasil deploy + cara mint
│
├─ public/
│  └─ (logo, favicon, aset batik/merah-putih)
│
└─ src/
   ├─ polyfill.ts                 ← import PERTAMA sebelum WDK (§7)
   │
   ├─ app/                        ← Next.js App Router
   │  ├─ layout.tsx               ← root layout, import polyfill, providers, TestnetBanner
   │  ├─ globals.css
   │  ├─ page.tsx                 ← landing / daftar turnamen (dashboard)
   │  ├─ onboarding/page.tsx      ← buat/restore wallet + backup seed
   │  ├─ tournament/
   │  │  ├─ new/page.tsx          ← form buat turnamen (+ generate dompet pool)
   │  │  └─ [id]/
   │  │     ├─ page.tsx           ← detail turnamen: pool, tim, bracket, payout
   │  │     └─ verify/page.tsx    ← (stretch) halaman publik read-only
   │  └─ wallet/page.tsx          ← detail dompet user, saldo, backup ulang
   │
   ├─ lib/
   │  ├─ wallet/                  ← ★ LAPISAN WDK (inti yang dinilai)
   │  │  ├─ wdk.ts                ← wrapper WalletManagerEvm + SeedSignerEvm
   │  │  ├─ createWallet.ts       ← generate mnemonic (BIP-39) → simpan terenkripsi
   │  │  ├─ restoreWallet.ts      ← restore dari phrase
   │  │  ├─ balance.ts            ← getTokenBalance (USDT) via WDK
   │  │  ├─ transfer.ts           ← account.transfer() ERC-20 → return tx hash
   │  │  ├─ verifyPayment.ts      ← cek pemasukan ke alamat pool via WDK/chain
   │  │  └─ crypto.ts             ← AES-GCM encrypt/decrypt seed (Web Crypto)
   │  │
   │  ├─ db/
   │  │  ├─ dexie.ts              ← definisi DB & tabel
   │  │  └─ repo.ts               ← CRUD turnamen/tim/match/payout
   │  │
   │  ├─ bracket/
   │  │  └─ engine.ts             ← Wasit berbasis aturan: generate bracket gugur, klasemen, tentukan juara
   │  │
   │  ├─ chain/
   │  │  └─ config.ts             ← chainId, RPC, alamat MockUSDT, explorer base URL, decimals
   │  │
   │  └─ format.ts                ← formatUSDT, formatIDR (opsional), shortenAddress, txUrl()
   │
   ├─ store/
   │  ├─ useWalletStore.ts        ← state: alamat user, status unlock, saldo
   │  └─ useTournamentStore.ts    ← turnamen aktif + aksi
   │
   ├─ hooks/
   │  ├─ useWdkWallet.ts          ← hook fasad: unlock, address, balance, transfer
   │  └─ usePoolBalance.ts        ← polling saldo pool on-chain (live)
   │
   ├─ components/
   │  ├─ wallet/
   │  │  ├─ CreateWalletFlow.tsx  ← generate + tampil seed + konfirmasi backup
   │  │  ├─ RestoreWalletForm.tsx
   │  │  ├─ SeedPhraseReveal.tsx  ← tampilkan 12/24 kata + salin
   │  │  └─ UnlockDialog.tsx      ← input password → decrypt seed
   │  ├─ tournament/
   │  │  ├─ TournamentForm.tsx    ← buat turnamen
   │  │  ├─ TournamentCard.tsx    ← ringkasan di dashboard
   │  │  ├─ PoolPanel.tsx         ← alamat pool + QR + saldo live + link explorer
   │  │  ├─ TeamList.tsx          ← daftar tim + status bayar
   │  │  ├─ AddTeamDialog.tsx
   │  │  ├─ BracketView.tsx       ← bracket gugur + input skor
   │  │  ├─ Standings.tsx         ← klasemen (kalau round-robin)
   │  │  └─ PayoutDialog.tsx      ← kartu konfirmasi payout → approve → hash
   │  ├─ common/
   │  │  ├─ TestnetBanner.tsx     ← banner "MODE TESTNET"
   │  │  ├─ TxReceipt.tsx         ← tampil hash + link explorer + status
   │  │  ├─ AddressChip.tsx       ← alamat singkat + salin + link
   │  │  └─ EmptyState.tsx
   │  └─ ui/                      ← shadcn/ui generated
   │
   └─ types/
      └─ index.ts                ← Tournament, Team, Match, Payout, WalletMeta
```

---

## 3. Model data (TypeScript)

`src/types/index.ts`:
```ts
export type Format = "single_elim" | "round_robin";

export interface WalletMeta {          // 1 per device (dompet user/panitia)
  address: string;
  encryptedSeed: string;               // AES-GCM (base64)
  createdAt: number;
}

export interface Tournament {
  id: string;                          // uuid
  name: string;
  format: Format;
  teamCount: number;
  entryFee: string;                    // USDT (string, unit token)
  prizes: { rank: number; amount: string }[];  // juara 1/2/3
  poolAddress: string;                 // alamat dompet pool (WDK)
  poolEncryptedSeed: string;           // seed pool terenkripsi (panitia pemegang)
  status: "setup" | "running" | "finished";
  createdAt: number;
}

export interface Team {
  id: string;
  tournamentId: string;
  name: string;
  captainAddress?: string;             // dompet penerima hadiah
  paid: boolean;
  paymentTxHash?: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  round: number;
  slot: number;
  teamAId?: string;
  teamBId?: string;
  scoreA?: number;
  scoreB?: number;
  winnerTeamId?: string;
}

export interface Payout {
  id: string;
  tournamentId: string;
  teamId: string;
  rank: number;
  amount: string;
  txHash?: string;
  status: "pending" | "sent" | "confirmed";
}
```

Persistence: Dexie tables `tournaments, teams, matches, payouts, wallet`. Seed pool disimpan **terenkripsi** di record Tournament (panitia unlock dengan password saat payout).

---

## 4. Lapisan WDK (inti — API yang dipakai)

Dari spike tervalidasi (`src/lib/wallet/wdk.ts`):
```ts
import "@/polyfill";                    // WAJIB sebelum import WDK
import WalletManagerEvm from "@tetherto/wdk-wallet-evm";
import { SeedSignerEvm } from "@tetherto/wdk-wallet-evm/signers";
import { RPC_URL } from "@/lib/chain/config";

export function walletFromSeed(seed: string) {
  return new WalletManagerEvm(new SeedSignerEvm(seed), { provider: RPC_URL });
}
```

Fungsi inti:
- `createWallet.ts` → generate mnemonic BIP-39 (via util WDK/bip39), derive `account = wallet.getAccount(0)`, `address = await account.getAddress()`, enkripsi seed → simpan.
- `balance.ts` → `await account.getTokenBalance(USDT_ADDRESS)` (saldo USDT). Native `getBalance()` untuk cek gas.
- `transfer.ts` → `await account.transfer({ token: USDT_ADDRESS, recipient, amount })` → **return tx hash**. (⚠️ API `transfer()` belum diuji di spike — **uji ini paling pertama di Fase 2**.)
- `verifyPayment.ts` → cek apakah alamat pool menerima ≥ entryFee dari (atau untuk) tim; sederhananya poll `getTokenBalance` delta, atau baca tx history via WDK bila tersedia.
- `crypto.ts` → `encryptSeed(seed, password)` / `decryptSeed(blob, password)` pakai Web Crypto AES-GCM + PBKDF2.

Checklist kedalaman (dari ide §12) semua dipenuhi di sini.

---

## 5. Urutan build (fase + acceptance criteria)

> Kerjakan berurutan. Jangan lanjut sebelum acceptance criteria fase terpenuhi.

### Fase 0 — Scaffold & config (≈1 jam)
- [ ] `create-next-app` (TS, App Router, Tailwind), init shadcn/ui, install deps (§1).
- [ ] `src/polyfill.ts` + import di `layout.tsx`.
- [ ] `next.config.js` polyfill/alias (§7).
- [ ] `.env.local.example` + `src/lib/chain/config.ts`.
- ✅ **AC:** `npm run dev` jalan, import WDK di client component **tidak** error build/runtime.

### Fase 1 — Wallet layer (paling berisiko → dulukan) (≈3–4 jam)
- [ ] `wdk.ts`, `createWallet.ts`, `restoreWallet.ts`, `crypto.ts`, `balance.ts`.
- [ ] `useWdkWallet.ts` + `useWalletStore.ts`.
- [ ] `CreateWalletFlow` + `SeedPhraseReveal` + `RestoreWalletForm` + `UnlockDialog`.
- [ ] Halaman `/onboarding` & `/wallet`.
- ✅ **AC:** bisa generate wallet, tampil address benar, backup+restore phrase bekerja, baca saldo USDT live dari Sepolia identik dengan Etherscan.

### Fase 2 — Transfer on-chain (momen demo) (≈2–3 jam)
- [ ] **Uji `account.transfer()`** MockUSDT di Sepolia dari script kecil dulu → pastikan hash valid & confirmed. (Satu-satunya API inti yang belum divalidasi.)
- [ ] `transfer.ts` + `TxReceipt.tsx` (hash + link explorer + status).
- ✅ **AC:** kirim USDT dari wallet A ke B, hash muncul, tx terlihat confirmed di Etherscan Sepolia.

### Fase 3 — Data & turnamen (≈3–4 jam)
- [ ] `dexie.ts` + `repo.ts` + types.
- [ ] `bracket/engine.ts` (generate bracket gugur, tentukan juara).
- [ ] `TournamentForm` (+ generate dompet pool via WDK saat submit), `/tournament/new`.
- [ ] Dashboard `/` (daftar turnamen), `TournamentCard`.
- [ ] `/tournament/[id]`: `PoolPanel` (alamat+QR+saldo live via `usePoolBalance`), `TeamList`, `AddTeamDialog`.
- ✅ **AC:** buat turnamen → dompet pool tergenerate & tersimpan, tambah tim, saldo pool live tampil & update saat ada pembayaran.

### Fase 4 — Pembayaran + bracket + payout (≈3–4 jam)
- [ ] Verifikasi pembayaran tim (`verifyPayment.ts`) → tandai `paid`.
- [ ] `BracketView` input skor → update match → `engine` tentukan pemenang & juara.
- [ ] `PayoutDialog`: kartu konfirmasi → unlock seed pool → `transfer` hadiah ke dompet juara → `TxReceipt`.
- ✅ **AC:** **alur emas end-to-end** jalan: buat turnamen → tim bayar (saldo naik) → isi hasil sampai final → payout on-chain ke juara → hash di explorer.

### Fase 5 — Poles submission (≈2–3 jam)
- [ ] `TestnetBanner`, empty states, styling pass (skill `frontend-design-guidelines`).
- [ ] `README.md` (§8) + diagram arsitektur + demo account/seed uji.
- [ ] `LICENSE` (MIT), rapikan repo, commit history bersih (juri melihat progres commit).
- [ ] Rekam **video demo ≤3 menit** (skrip di ide §11), YouTube unlisted.
- [ ] Deploy (Vercel) + isi form submission DoraHacks sebelum **8 Juli**.
- ✅ **AC:** repo publik jalan dengan `npm i && npm run dev`, video + link siap, banner testnet jelas.

---

## 6. Rute & halaman (App Router)

| Rute | Isi | Client? |
|---|---|---|
| `/` | Dashboard: daftar turnamen (dari Dexie) + tombol buat baru | client (baca IndexedDB) |
| `/onboarding` | Buat/restore wallet + backup seed | client |
| `/wallet` | Detail dompet user, saldo, backup ulang | client |
| `/tournament/new` | Form buat turnamen + generate dompet pool | client |
| `/tournament/[id]` | Pool + tim + bracket + payout | client |
| `/tournament/[id]/verify` | (stretch) read-only publik | client |

> Semua halaman yang menyentuh WDK/IndexedDB harus **Client Components** (`"use client"`), dan komponen WDK di-`dynamic(() => ..., { ssr: false })` bila perlu, karena WDK murni browser-runtime.

---

## 7. Config wajib (Next.js)

`src/polyfill.ts` (import paling pertama di `app/layout.tsx`):
```ts
import { Buffer } from "buffer";
if (typeof globalThis.Buffer === "undefined") globalThis.Buffer = Buffer;
```

`next.config.js`:
```js
/** @type {import('next').NextConfig} */
module.exports = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "sodium-native": "sodium-javascript", // cegah resolve native addon Node
    };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: require.resolve("buffer/"),
      crypto: false, fs: false, path: false,
    };
    return config;
  },
};
```
> Ini padanan resep Vite dari spike lama (alias sodium + polyfill Buffer), disesuaikan ke webpack Next.

---

## 8. Testnet & token

- **Chain:** Sepolia. `chainId 11155111`. RPC `https://sepolia.drpc.org` (siapkan 1–2 fallback).
- **Gas:** butuh ETH Sepolia untuk dompet pool & demo → ambil dari faucet, catat di `deploy-notes.md`.
- **MockUSDT:** deploy ERC-20 sederhana (6 desimal, fungsi `mint`) → alamat masuk `.env.local` & `chain/config.ts`. Mint saldo ke dompet demo tim untuk video.
- **Explorer base:** `https://sepolia.etherscan.io` → `txUrl(hash)` & `addressUrl(addr)` di `format.ts`.

`.env.local.example`:
```
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.drpc.org
NEXT_PUBLIC_USDT_ADDRESS=0x...        # MockUSDT hasil deploy
NEXT_PUBLIC_EXPLORER=https://sepolia.etherscan.io
```

---

## 9. Outline README (untuk juri)

1. **Problem** (fee/kepercayaan turnamen tarkam) + 1 kalimat solusi.
2. **Demo** — URL live + video + demo seed/account.
3. **Arsitektur** — diagram 3 lapis (§0), tegaskan *key/dana client-side (WDK) vs metadata local-first*.
4. **Modul WDK yang dipakai & di file mana** (`src/lib/wallet/*`) — permudah juri verifikasi kedalaman.
5. **Cara run** — `npm i && npm run dev`, env vars, testnet + faucet, cara dapat MockUSDT.
6. **Disclaimer testnet** + apa yang mock (tidak ada — payout real; sebut off-ramp IDR = roadmap).
7. **Roadmap** — QVAC/Wasit offline (Electron), multisig trustless, mobile.
8. **Lisensi** MIT.

---

## 10. Yang harus divalidasi lebih dulu (blocking)

1. **`account.transfer()` ERC-20 di Sepolia** — Fase 2, langkah pertama. Kalau API beda dari README paket, sesuaikan `transfer.ts`.
2. **WDK import di Next.js client** tanpa error (Fase 0 AC) — resep §7 harus terbukti di webpack, bukan cuma Vite.
3. **Bentuk API `getAccount`/`getTokenBalance`/`transfer`** sesuai versi beta yang di-pin — cek README paket saat install; pin versi persis.

> Kalau salah satu di atas mentok, hentikan & lapor sebelum lanjut fase berikutnya — jangan bangun UI di atas fondasi wallet yang belum terbukti.

---

## 11. Estimasi total

Fase 0–5 ≈ **14–19 jam kerja** → muat untuk submission I 8 Juli bila fokus alur emas dan menahan diri dari fitur sekunder (verify page, round-robin, multi-rank payout → dorong ke submission II).
