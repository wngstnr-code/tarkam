# ⚽ Tarkam — On-chain Prize Escrow for Grassroots Football

> **"Hadiah turnamen yang tak bisa dibawa kabur."** — *Tournament prize money that can't run away.*

Built for the **Tether Developers Cup** (WDK track) by **Team Indonesia 🇮🇩**.

## The problem

Indonesia runs **thousands of grassroots football ("tarkam") tournaments every year** — village cups, independence-day tournaments, neighborhood leagues. Real money flows through them: entry fees of Rp 200K–2M per team and prize pools worth millions of rupiah. **All of it is cash, held personally by the organizing committee.**

The recurring failure mode is trust: nobody can verify the pot actually exists, prizes "shrink", payouts get delayed — and in the worst cases, organizers disappear with the money.

## The solution

Tarkam moves the prize pot into a **self-custodial USDT wallet with a public address**:

1. The organizer creates a tournament → the app **generates a pool wallet on their device** via Tether WDK (BIP-39 seed, shown once for backup, stored AES-GCM-encrypted).
2. Every team pays its entry fee in USDT to the **public pool address** — anyone can watch the pot grow on a block explorer, no account needed.
3. A team can only be marked "paid" when the **on-chain pool balance actually covers it** — the chain is the source of truth, not the organizer's word.
4. After the final, the organizer reviews a confirmation card and approves — **WDK signs and broadcasts the prize payout** straight to the champion's wallet. The receipt is a transaction hash.

**Honest claim:** this MVP is *radical transparency*, not trustlessness. The organizer still holds the pool key — but they can no longer hide a single cent of money flow. (Trustless multisig escrow is on the roadmap, below.)

## Demo

- **Live app:** _(deploy link here)_
- **Video:** _(YouTube link here)_
- **Real on-chain golden flow** (Sepolia, zero mocks):
  - WDK ERC-20 transfer validation: [`0x91739f…68af3`](https://sepolia.etherscan.io/tx/0x91739f89ff3001cee39a67f4f0c8603a0608540a6aedf31adbf8ef5249e68af3)
  - Prize payout executed from the UI: [`0xaaa9b8…ab6112`](https://sepolia.etherscan.io/tx/0xaaa9b802bf1e9d46aafec75be7468a0dfe89ea2140fc2ee404f717e7c4ab6112)

## Architecture

```
┌───────────────────────────────────────────────────────────────┐
│ UI — Next.js 15 App Router + Tailwind + shadcn/ui             │
├───────────────────────────────────────────────────────────────┤
│ WALLET LAYER — client-side, Tether WDK   ← the money path     │
│   keys & funds never leave the user's device                  │
├───────────────────────────────────────────────────────────────┤
│ DATA LAYER — local-first IndexedDB (Dexie)                    │
│   tournament/team/match metadata only; never stores keys      │
└───────────────────────────────────────────────────────────────┘
                        │ reads/writes chain
                        ▼
          EVM Sepolia testnet + MockUSDT (ERC-20, 6 decimals)
```

There is **no backend server**. Tournament metadata lives in the browser (IndexedDB); money can only move via keys on the organizer's device. If Tarkam's hosting vanished tomorrow, every pot would still be spendable from the seed backup.

## WDK usage (the part being judged)

All money paths go through `@tetherto/wdk-wallet-evm` — no direct ethers/viem in the app:

| Concern | WDK API | File |
|---|---|---|
| Wallet manager from seed | `WalletManagerEvm` + `SeedSignerEvm` | `src/lib/wallet/wdk.ts` |
| Create wallet (user + one pool per tournament) | `wallet.getAccount(0)` → `getAddress()` | `src/lib/wallet/createWallet.ts` |
| Restore from phrase | BIP-39 validation + derivation | `src/lib/wallet/restoreWallet.ts` |
| Live pool/user balances | `WalletAccountReadOnlyEvm.getTokenBalance()` | `src/lib/wallet/balance.ts` |
| Payment verification | on-chain balance threshold via WDK read-only account | `src/lib/wallet/verifyPayment.ts` |
| Prize payout | `account.transfer({ token, recipient, amount })` → tx hash | `src/lib/wallet/transfer.ts` |
| Memory hygiene | `wallet.dispose()` after every signing operation | throughout |

Seeds are encrypted with the user's password (PBKDF2 + AES-GCM via Web Crypto) in `src/lib/wallet/crypto.ts` and shown exactly once for paper backup with a 3-word confirmation quiz.

(`ethers` appears only in `scripts/` as dev tooling to deploy/mint the MockUSDT test token — never in the app.)

## Run it

```bash
npm install
npm run dev
```

That's it — no backend, no env vars required (sane Sepolia defaults are baked in; override via `.env.local`, see `.env.local.example`).

To try the full money flow you need:
1. **Sepolia ETH** for gas — [Google Cloud faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
2. **MockUSDT** — token at [`0x0304dda2A4F3B6Daa28ad87CacEeea4B634F5a28`](https://sepolia.etherscan.io/address/0x0304dda2A4F3B6Daa28ad87CacEeea4B634F5a28) with an **open `mint(address,uint256)`** so any judge can mint themselves test balance: `node scripts/mint-usdt.mjs <your-address> 1000`

## Testnet disclaimer

Everything runs on **Sepolia** with a demo ERC-20 (a permanent banner says so in the app). Nothing is mocked — every balance read and every transfer is a real chain interaction. Off-ramp to rupiah cash is out of demo scope (roadmap: e-wallet partners).

## Roadmap

- **Wasit AI on-device (QVAC + Electron)** — natural-language tournament control ("bikin bracket 16 tim", "bayar hadiah juara"), drafted payouts with human-in-the-loop approval; runs fully offline. QVAC has no browser target, so this ships as an Electron wrap of this exact UI.
- **Trustless escrow** — 2-of-3 multisig (organizer + two captains) or contract escrow releasing funds on M-of-N signed results.
- **Public verify page** — read-only pot timeline for spectators via QR.
- **Tiered payouts in one approval, refund flow for cancelled tournaments, mobile.**

## License

[MIT](LICENSE)
