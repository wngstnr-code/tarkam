# ⚽ Tarkam — On-chain Prize Escrow for Grassroots Football

![tests](https://img.shields.io/badge/tests-51_passing-brightgreen) ![network](https://img.shields.io/badge/network-Sepolia-blue) ![wallet](https://img.shields.io/badge/money_path-100%25_Tether_WDK-1ba27a)

> **"Hadiah turnamen yang tak bisa dibawa kabur."** — *Tournament prize money that can't run away.*

A self-custodial USDT prize pot for grassroots football tournaments, built entirely on **Tether WDK**. Every entry fee and every payout is a real on-chain transaction anyone can audit — no backend, no custodian, no trust required in the app itself.

🏆 **Overall Winner ($5,000) & WDK Track Winner ($1,000)** at the **Tether Developers Cup** (Total Prize: $6,000). Built by **Team Indonesia 🇮🇩**.
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
- 📱 **Captain join page (new)** — every escrow tournament gets a QR/`/join` link; team captains open it on **their own phone**, see the tournament straight from the contract (no organizer data needed), pay the entry fee from their own WDK wallet, and later approve the payout from their own wallet. M-of-N approval happens across real devices, not simulated from the organizer's screen.
- ⛽🚫 **Gasless captains (new, env-gated)** — with a bundler configured, captains on `/join` need **zero ETH**: deposit, payout approval and refunds ride WDK's EIP-7702 account-abstraction module as sponsored UserOperations — approve + deposit batched into a single UserOp. The organizer path stays classic EVM.
- 🤖 **Wasit AI assistant (new, rule-based)** — natural-language tournament control on the organizer page ("bikin bracket", "siapkan payout", "batalkan turnamen"): commands become **draft action cards** that only execute after explicit human approval (plus password for on-chain actions). The intent parser is a pure function designed to be swapped for an on-device QVAC model.
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
  - **gasless** `approve`+`deposit` in one sponsored UserOp (EIP-7702, 0 ETH from the captain): [`0xf10917…50ffb0`](https://sepolia.etherscan.io/tx/0xf1091791e03dccf66bd79ad6d53bc05df9fdacccc506a35486e71bbb9650ffb0)

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
| Gasless captain actions (opt-in) | `@tetherto/wdk-wallet-evm-7702-gasless` — EIP-7702 + ERC-4337 sponsored UserOps; approve + deposit batched in one UserOp | `src/lib/wallet/wdkGasless.ts`, `src/lib/escrow/write.ts` |
| Memory hygiene | `wallet.dispose()` after every signing operation | throughout |

**Why the second WDK module, and the trade-off we accepted:** the single worst UX friction for a village team captain is needing Sepolia ETH before they can pay an entry fee in USDT. WDK's 7702 module removes it: the captain's EOA is delegated as a smart account (same address — so the escrow contract's `depositOf`/`msg.sender` checks keep working unchanged), gas is sponsored by a paymaster policy, and the approve+deposit pair becomes **one atomic UserOperation**. The trade-off: the module is beta and adds a runtime dependency on a bundler service — so it's strictly env-gated (`NEXT_PUBLIC_BUNDLER_URL`; without it the app behaves exactly as before), and it's scoped to captain actions only while the organizer path stays classic.

## Judge's tour — start here

The parts of the codebase we're proud of, so you don't have to go spelunking:

| What | Where | Why it matters |
|---|---|---|
| Every escrow tx is WDK-signed | [`src/lib/escrow/write.ts#L56-L69`](https://github.com/wngstnr-code/tarkam/blob/main/src/lib/escrow/write.ts#L56-L69) | One choke point: `account.sendTransaction` via WDK; ethers only encodes calldata, never signs |
| Gasless captain path (EIP-7702) | [`write.ts#L103-L117`](https://github.com/wngstnr-code/tarkam/blob/main/src/lib/escrow/write.ts#L103-L117) + [`#L168-L174`](https://github.com/wngstnr-code/tarkam/blob/main/src/lib/escrow/write.ts#L168-L174) | approve+deposit as one sponsored UserOp; UI gets the real on-chain tx hash, not the userOpHash |
| One-transaction tiered payout | [`contracts/TarkamEscrow.sol#L165-L184`](https://github.com/wngstnr-code/tarkam/blob/main/contracts/TarkamEscrow.sol#L165-L184) | All prizes + transparent surplus in a single `executePayout`; no partial-payout states |
| Dead-organizer protection | [`TarkamEscrow.sol#L199-L212`](https://github.com/wngstnr-code/tarkam/blob/main/contracts/TarkamEscrow.sol#L199-L212) | After the refund deadline, teams pull refunds with **no** organizer involvement |
| Proof there's no withdraw path | [`test/escrow.test.mjs#L182`](https://github.com/wngstnr-code/tarkam/blob/main/test/escrow.test.mjs#L182) | ABI-surface test: the only fund-moving functions are `{deposit, executePayout, claimRefund}` — plus 27 more properties, local anvil, ~2s |
| Real M-of-N across devices | [`src/app/join/[escrowId]/page.tsx#L78-L95`](https://github.com/wngstnr-code/tarkam/blob/main/src/app/join/%5BescrowId%5D/page.tsx#L78-L95) | Captains deposit & approve payouts from their own phones, straight against the contract |
| Seed encryption | [`src/lib/wallet/crypto.ts#L15-L48`](https://github.com/wngstnr-code/tarkam/blob/main/src/lib/wallet/crypto.ts#L15-L48) | PBKDF2 (310k iters) → AES-GCM via Web Crypto; plaintext seed is never persisted |
| QVAC seam, ready to swap | [`src/lib/assistant/intents.ts#L1-L10`](https://github.com/wngstnr-code/tarkam/blob/main/src/lib/assistant/intents.ts#L1-L10) | The assistant's intent parser is a pure function typed to be replaced by an on-device QVAC model |

<!-- SEBELUM SUBMIT: setelah push, buka tiap link di GitHub lalu tekan "y" untuk mengunci URL ke commit (permintaan eksplisit juri semifinal). -->

To try the gasless captain flow: create a free [Pimlico](https://dashboard.pimlico.io) API key + Sepolia sponsorship policy, fill `NEXT_PUBLIC_BUNDLER_URL` and `NEXT_PUBLIC_SPONSORSHIP_POLICY_ID` in `.env.local` (see `.env.local.example`), then validate end-to-end with `node scripts/spike-gasless-wdk.mjs`.

Seeds are encrypted with the user's password (PBKDF2 + AES-GCM via Web Crypto) in `src/lib/wallet/crypto.ts` and shown exactly once for paper backup with a 3-word confirmation quiz.

**Where `ethers` is and isn't:** signing and broadcasting are 100% WDK. The app imports `ethers`' `Interface` **only** to encode/decode contract calldata (`src/lib/escrow/abi.ts`, `src/lib/wallet/mint.ts`); chain reads on the verify page are raw JSON-RPC `fetch` calls (`src/lib/chain/logs.ts`). Full `ethers` (provider + signer) appears only in `scripts/` as dev tooling to deploy the test token and escrow contract.

### The escrow contract

[`contracts/TarkamEscrow.sol`](contracts/TarkamEscrow.sol) — deployed at [`0xd572cffB8d01f1FFD129A88F301209dA346E2d5f`](https://sepolia.etherscan.io/address/0xd572cffB8d01f1FFD129A88F301209dA346E2d5f) (Sepolia). Core guarantees, enforced by code instead of trust:

- Funds can **only** exit as (a) the pre-announced prizes to registered depositor teams, or (b) refunds back to depositors. There is no organizer-withdraw function.
- Winners are proposed by the organizer but must be **registered teams**, and the payout executes only after **M team approvals** (threshold fixed at creation; 0 = instant for demos).
- All prize tiers + the transparent organizer surplus are paid in **one transaction**.
- `cancel` opens per-team refunds; after the **refund deadline**, teams can pull refunds *without* the organizer — protection against a vanished committee.

**Property test suite — 28 tests passing.** Every guarantee above is enforced by tests in [`test/escrow.test.mjs`](test/escrow.test.mjs), run against a local [anvil](https://getfoundry.sh) EVM (no network, deterministic, ~2s): no organizer-withdraw path exists in the ABI, winners must be depositor teams, double deposits/approvals/refunds revert, payouts pay the exact pre-announced amounts in one transaction, and the dead-organizer deadline works — but stops applying once prizes are paid.

On top of the contract suite, the Wasit AI intent parser has **23 unit tests** ([`test/intents.test.mts`](test/intents.test.mts)) covering id/en phrase variants, every guard reason, and the safety property that free-form money requests ("send all funds to my account") can never map to an executable action — **51 tests total**.

```bash
npm test   # requires Foundry's anvil on PATH
```

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

Shipped since the round of 16: ✅ trustless contract escrow with M-of-N approvals, ✅ public verify page, ✅ tiered one-transaction payouts, ✅ refunds + dead-organizer deadline, ✅ captain-side `/join` flows (deposit & approve from the captain's own phone), ✅ Wasit AI assistant (rule-based, draft actions + human approval), ✅ 51-test suite (28 contract properties + 23 assistant-parser units), ✅ gasless captain flow (EIP-7702 sponsored UserOps), ✅ verified contract source on Etherscan. Next:

- **Wasit AI on-device (QVAC + Electron)** — swap the assistant's rule-based intent parser (`src/lib/assistant/intents.ts`, a pure function built as the seam) for a fully offline QVAC model. QVAC has no browser target, so this ships as an Electron wrap of this exact UI.
- **Off-ramp to rupiah** — e-wallet partners for cashing out prizes.

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Dexie (IndexedDB) · `@tetherto/wdk-wallet-evm` · Sepolia + MockUSDT.

## License

[MIT](LICENSE) — open source, public for the duration of the event and after.
