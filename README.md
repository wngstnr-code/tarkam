# ⚽ Tarkam — On-chain Prize Escrow for Grassroots Football

> **"Hadiah turnamen yang tak bisa dibawa kabur."** — *Tournament prize money that can't run away.*

A self-custodial USDT prize pot for grassroots football tournaments, built entirely on **Tether WDK**. Every entry fee and every payout is a real on-chain transaction anyone can audit — no backend, no custodian, no trust required in the app itself.

**Tether Developers Cup — WDK track.** Built by **Team Indonesia 🇮🇩**.
Bilingual UI (English 🇬🇧 / Indonesian 🇮🇩, toggle in the navbar, English by default).

---

## The problem

Indonesia runs **thousands of grassroots football ("tarkam") tournaments every year** — village cups, independence-day tournaments, neighborhood leagues. Real money flows through them: entry fees of Rp 200K–2M per team and prize pools worth millions of rupiah. **All of it is cash, held personally by the organizing committee.**

The recurring failure mode is trust: nobody can verify the pot actually exists, prizes "shrink", payouts get delayed — and in the worst cases, organizers disappear with the money. This is not hypothetical; it is the default experience of amateur football across the country.

## The solution

Tarkam moves the prize pot into a **self-custodial USDT wallet with a public address**:

1. The organizer creates a tournament → the app **generates a pool wallet on their device** via Tether WDK (BIP-39 seed, shown once for backup, stored AES-GCM-encrypted).
2. Every team pays its entry fee in USDT to the **public pool address** — anyone can watch the pot grow on a block explorer, no account needed.
3. A team can only be marked "paid" when the **on-chain pool balance actually covers it** — the chain is the source of truth, not the organizer's word.
4. After the final, the organizer reviews a confirmation card and approves — **WDK signs and broadcasts the prize payout** straight to the champion's wallet. The receipt is a transaction hash.

**Two vault modes, chosen at creation:**

- **Smart-contract escrow (default, trustless)** — the pot lives in the [`TarkamEscrow`](contracts/TarkamEscrow.sol) contract. The organizer **never holds the funds**: money can only leave as the pre-announced prizes to registered teams (after M-of-N team approvals) or as refunds back to depositors. If the organizer disappears, a refund deadline lets every team pull its entry fee back — no permission needed.
- **Simple pool wallet (radical transparency)** — the original MVP mode: a self-custodial WDK pool wallet with a public address. The organizer holds the key, but every cent of money flow is public.

## Key features

- 🔐 **Self-custodial wallets via WDK** — user wallet + one pool wallet per tournament, generated on-device from a BIP-39 seed. Keys never touch a server.
- 💸 **On-chain entry fees** — teams pay their fee in USDT to the tournament's public pool address; the transfer is signed by WDK and confirmed on-chain before a team counts as registered.
- 👀 **Live public pot** — a QR + explorer link on every tournament shows the pool balance updating live; spectators verify the pot themselves with zero accounts.
- ✅ **Chain-gated "paid" status** — the organizer cannot mark a team paid until the on-chain balance proves the money arrived.
- 🏆 **Bracket + human-in-the-loop payouts** — single-elimination bracket, score entry, then a review-and-approve card that WDK signs to transfer each prize to the winner's wallet.
- 🛡️ **Trustless escrow mode (new)** — funds locked in the `TarkamEscrow` contract: prizes and refunds are the *only* exits, winners must be registered depositor teams, and payout needs M-of-N team approvals. The organizer decides who won — but can never take the money.
- 🥇 **Tiered payout in one transaction (new)** — champion, runner-up and third place are all paid by a single `executePayout` transaction, surplus transparently returned to the organizer.
- ↩️ **Refunds + dead-organizer protection (new)** — cancelling on-chain opens per-team refunds; a refund deadline lets teams pull their money back even if the organizer vanishes.
- 🔎 **Public verify page (new)** — `/verify/<address>` renders the full on-chain money timeline (entry fees in, prizes/refunds out) for spectators: no wallet, no account, no local data.
- 🧾 **Receipts, not promises** — every entry and payout surfaces its transaction hash, linked to Etherscan.
- ⛽ **Judge-friendly onboarding** — built-in testnet USDT faucet (open `mint`) and clear gas warnings with faucet links, so a judge can run the full money flow in minutes.
- 🌐 **Bilingual (EN/ID)** — full English/Indonesian localization with a persistent navbar toggle, English by default.

## Demo

- **Live app:** [https://tarkam.vercel.app](https://tarkam.vercel.app)
- **Video (≤3 min, unlisted YouTube):** [https://youtu.be/CUrzHlDYxN0](https://youtu.be/CUrzHlDYxN0)
- **Real on-chain golden flow** (Sepolia, zero mocks):
  - WDK ERC-20 transfer validation: [`0x91739f…68af3`](https://sepolia.etherscan.io/tx/0x91739f89ff3001cee39a67f4f0c8603a0608540a6aedf31adbf8ef5249e68af3)
  - Prize payout executed from the UI: [`0xaaa9b8…ab6112`](https://sepolia.etherscan.io/tx/0xaaa9b802bf1e9d46aafec75be7468a0dfe89ea2140fc2ee404f717e7c4ab6112)
- **Escrow golden flow, signed & broadcast purely via WDK** (`scripts/spike-escrow-wdk.mjs`):
  - `createTournament`: [`0x7de421…abff9`](https://sepolia.etherscan.io/tx/0x7de42187f0c43f3e6e9a6c7fc68e444fa0fdbcc7b5927ebb7e564743b2cabff9)
  - `deposit` (entry fee locked): [`0x1c4978…eccd3a`](https://sepolia.etherscan.io/tx/0x1c4978fad2ee125f7d2f35ee1d1cc0a3624c33345cbb450fbd693cbfa2eccd3a)
  - `executePayout` (prizes in one tx): [`0xd4a0b1…30f576`](https://sepolia.etherscan.io/tx/0xd4a0b152237d64cfe7ff898cdf4bc0ef1334cde6efc88d1d5f56d8550230f576)
  - cancel → `claimRefund` path: [`0x4892a3…6400e5`](https://sepolia.etherscan.io/tx/0x4892a38eabb6ef2fe1088a00fd358a5cc6a4c89401fb7da14b6adc0b836400e5)

## Architecture

```
┌───────────────────────────────────────────────────────────────┐
│ UI — Next.js 15 App Router + Tailwind + shadcn/ui             │
│   bilingual (EN/ID), mobile-first, no external state server   │
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
                 + TarkamEscrow (trustless prize vault)
```

There is **no backend server.** Tournament metadata lives in the browser (IndexedDB); money can only move via keys on the organizer's device. If Tarkam's hosting vanished tomorrow, every pot would still be spendable from the seed backup — the app is a convenience layer over self-custody, never a custodian.

## WDK usage (the part being judged)

All money paths go through `@tetherto/wdk-wallet-evm` — **every signature and broadcast is WDK, never a raw ethers/viem signer**:

| Concern | WDK API | File |
|---|---|---|
| Wallet manager from seed | `WalletManagerEvm` + `SeedSignerEvm` | `src/lib/wallet/wdk.ts` |
| Create wallet (user + one pool per tournament) | `wallet.getAccount(0)` → `getAddress()` | `src/lib/wallet/createWallet.ts` |
| Restore from phrase | BIP-39 validation + derivation | `src/lib/wallet/restoreWallet.ts` |
| Live pool/user balances | `WalletAccountReadOnlyEvm.getTokenBalance()` | `src/lib/wallet/balance.ts` |
| Payment verification | on-chain balance threshold via WDK read-only account | `src/lib/wallet/verifyPayment.ts` |
| Prize payout (simple mode) | `account.transfer({ token, recipient, amount })` → tx hash | `src/lib/wallet/transfer.ts` |
| Escrow contract calls (create / deposit / propose / approve / execute / cancel / refund) | `account.sendTransaction({ to, data })` — WDK signs & broadcasts every escrow transaction | `src/lib/escrow/write.ts` |
| Memory hygiene | `wallet.dispose()` after every signing operation | throughout |

Seeds are encrypted with the user's password (PBKDF2 + AES-GCM via Web Crypto) in `src/lib/wallet/crypto.ts` and shown exactly once for paper backup with a 3-word confirmation quiz.

**Where `ethers` is and isn't:** signing and broadcasting are 100% WDK. The app imports `ethers`' `Interface` **only** to encode/decode contract calldata (`src/lib/escrow/abi.ts`, `src/lib/wallet/mint.ts`); chain reads on the verify page are raw JSON-RPC `fetch` calls (`src/lib/chain/logs.ts`). Full `ethers` (provider + signer) appears only in `scripts/` as dev tooling to deploy the test token and escrow contract.

### The escrow contract

[`contracts/TarkamEscrow.sol`](contracts/TarkamEscrow.sol) — deployed at [`0xd572cffB8d01f1FFD129A88F301209dA346E2d5f`](https://sepolia.etherscan.io/address/0xd572cffB8d01f1FFD129A88F301209dA346E2d5f) (Sepolia). Core guarantees, enforced by code instead of trust:

- Funds can **only** exit as (a) the pre-announced prizes to registered depositor teams, or (b) refunds back to depositors. There is no organizer-withdraw function.
- Winners are proposed by the organizer but must be **registered teams**, and the payout executes only after **M team approvals** (threshold fixed at creation; 0 = instant for demos).
- All prize tiers + the transparent organizer surplus are paid in **one transaction**.
- `cancel` opens per-team refunds; after the **refund deadline**, teams can pull refunds *without* the organizer — protection against a vanished committee.

## How it maps to the judging criteria

- **Innovation** — brings self-custodial USDT to a massive, genuinely underserved cash economy (grassroots sport in Indonesia), not another DeFi dashboard. In escrow mode the *contract* is the committee treasurer: the organizer runs the tournament but physically cannot take the money.
- **Technical execution** — 100% of signatures/broadcasts flow through WDK (including all escrow contract calls via `sendTransaction`); an audited-by-anyone Solidity escrow with M-of-N approvals and deadline refunds; local-first with no backend; encrypted seeds, memory hygiene (`dispose()`), on-chain payment gating, graceful RPC failover.
- **User experience** — one-tap wallet creation with a real backup quiz, live pot QR + public verify page for spectators, human-in-the-loop payout confirmation, built-in faucet + gas guidance, and full EN/ID localization.
- **Completeness** — both vault modes run end-to-end on Sepolia with zero mocks: create wallet → create tournament (escrow contract or pool wallet) → teams deposit on-chain → chain-gated "paid" → bracket → propose winners → team approvals → one-transaction tiered payout; plus the cancel → refund path. Golden-flow transactions linked above.

## Run it

```bash
npm install
npm run dev
```

That's it — no backend, no env vars required (sane Sepolia defaults are baked in; override via `.env.local`, see `.env.local.example`).

To try the full money flow you need:
1. **Sepolia ETH** for gas — [Google Cloud faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
2. **MockUSDT** — token at [`0x0304dda2A4F3B6Daa28ad87CacEeea4B634F5a28`](https://sepolia.etherscan.io/address/0x0304dda2A4F3B6Daa28ad87CacEeea4B634F5a28) with an **open `mint(address,uint256)`** so any judge can mint themselves test balance: `node scripts/mint-usdt.mjs <your-address> 1000`

You can also mint USDT to yourself directly from the in-app faucet on the wallet page.

## Testnet disclaimer

Everything runs on **Sepolia** with a demo ERC-20 (a permanent banner says so in the app). Nothing is mocked — every balance read and every transfer is a real chain interaction. Off-ramp to rupiah cash is out of demo scope (roadmap: e-wallet partners).

## Roadmap

Shipped since the round of 16: ✅ trustless contract escrow with M-of-N approvals, ✅ public verify page, ✅ tiered one-transaction payouts, ✅ refunds + dead-organizer deadline. Next:

- **Wasit AI on-device (QVAC + Electron)** — natural-language tournament control ("bikin bracket 16 tim", "bayar hadiah juara"), drafted payouts with human-in-the-loop approval; runs fully offline. QVAC has no browser target, so this ships as an Electron wrap of this exact UI.
- **Captain-side app flows** — teams deposit/approve payouts from their own devices (the contract already supports it; the UI today centres the organizer/judge device).
- **Off-ramp to rupiah** — e-wallet partners for cashing out prizes.

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Dexie (IndexedDB) · `@tetherto/wdk-wallet-evm` · Sepolia + MockUSDT.

## License

[MIT](LICENSE) — open source, public for the duration of the event and after.
