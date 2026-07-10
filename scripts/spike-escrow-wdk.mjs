// Spike validasi: alur escrow LEWAT WDK MURNI (persis jalur yang dipakai UI):
// createTournament → deposit (approve+deposit) → proposePayout → executePayout.
// Semua tanda tangan & broadcast via account.sendTransaction (WDK); ethers
// hanya untuk encode/decode calldata — sama seperti src/lib/escrow/*.
//
// Pakai: node scripts/spike-escrow-wdk.mjs

import fs from "node:fs";
import WalletManagerEvm from "@tetherto/wdk-wallet-evm";
import { SeedSignerEvm } from "@tetherto/wdk-wallet-evm/signers";
import { Interface } from "ethers";

const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
const USDT = process.env.NEXT_PUBLIC_USDT_ADDRESS ?? "0x0304dda2A4F3B6Daa28ad87CacEeea4B634F5a28";
const envLocal = fs.existsSync(".env.local") ? fs.readFileSync(".env.local", "utf8") : "";
const ESCROW = envLocal.match(/^NEXT_PUBLIC_ESCROW_ADDRESS=(.*)$/m)?.[1];
if (!ESCROW) throw new Error("NEXT_PUBLIC_ESCROW_ADDRESS tidak ada di .env.local — deploy dulu");

const IFACE = new Interface([
  "function createTournament(address,uint256,uint256[],uint256,uint256) returns (uint256)",
  "function deposit(uint256,address)",
  "function proposePayout(uint256,address[])",
  "function executePayout(uint256)",
  "function getTournament(uint256) view returns (tuple(address organizer, address token, uint256 entryFee, uint256[] prizes, uint256 approvalThreshold, uint256 refundDeadline, uint8 status, uint256 pot, uint256 teamCount, address[] winners, uint256 approvals))",
  "function approve(address,uint256) returns (bool)",
  "event TournamentCreated(uint256 indexed id, address indexed organizer, address token, uint256 entryFee, uint256[] prizes, uint256 approvalThreshold, uint256 refundDeadline)",
]);

const rpc = async (method, params) => {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
};

const waitReceipt = async (hash) => {
  for (let i = 0; i < 40; i++) {
    const r = await rpc("eth_getTransactionReceipt", [hash]);
    if (r) {
      if (r.status !== "0x1") throw new Error(`revert: ${hash}`);
      return r;
    }
    await new Promise((s) => setTimeout(s, 4000));
  }
  throw new Error(`timeout: ${hash}`);
};

const { mnemonic } = JSON.parse(fs.readFileSync(".demo-secrets/deployer.json", "utf8"));
const wallet = new WalletManagerEvm(new SeedSignerEvm(mnemonic), { provider: RPC_URL });
const account = await wallet.getAccount(0);
const me = await account.getAddress();
console.log("Akun WDK:", me);

const send = async (to, data, label) => {
  const { hash } = await account.sendTransaction({ to, data, value: 0n });
  const receipt = await waitReceipt(hash);
  console.log(`${label}: ${hash}`);
  return receipt;
};

// 1. createTournament (fee 1 USDT, hadiah [1], threshold 0, tanpa deadline)
const U = (n) => BigInt(n) * 10n ** 6n;
const receipt = await send(
  ESCROW,
  IFACE.encodeFunctionData("createTournament", [USDT, U(1), [U(1)], 0, 0]),
  "createTournament (WDK)"
);
const createdTopic = IFACE.getEvent("TournamentCreated").topicHash;
const log = receipt.logs.find(
  (l) => l.address.toLowerCase() === ESCROW.toLowerCase() && l.topics[0] === createdTopic
);
const id = Number(BigInt(log.topics[1]));
console.log("escrowId dari receipt:", id);

// 2. approve + deposit (jalur depositEscrow di app)
await send(USDT, IFACE.encodeFunctionData("approve", [ESCROW, U(1)]), "approve (WDK)");
await send(ESCROW, IFACE.encodeFunctionData("deposit", [id, me]), "deposit (WDK)");

// 3. propose + execute
await send(ESCROW, IFACE.encodeFunctionData("proposePayout", [id, [me]]), "proposePayout (WDK)");
await send(ESCROW, IFACE.encodeFunctionData("executePayout", [id]), "executePayout (WDK)");

// 4. verifikasi status akhir via eth_call (jalur read di app)
const raw = await rpc("eth_call", [
  { to: ESCROW, data: IFACE.encodeFunctionData("getTournament", [id]) },
  "latest",
]);
const [v] = IFACE.decodeFunctionResult("getTournament", raw);
console.log("Status akhir:", Number(v.status) === 2 ? "Paid ✓" : `bukan Paid (${v.status})`);
console.log("Pot akhir  :", v.pot.toString());
if (Number(v.status) !== 2 || v.pot !== 0n) throw new Error("assert gagal");

wallet.dispose();
console.log("\n✅ SPIKE WDK lulus — jalur UI (WDK sendTransaction + eth_call) terbukti end-to-end.");
