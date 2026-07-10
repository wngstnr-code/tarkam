// Dev tooling (bukan jalur uang app): compile + deploy TarkamEscrow ke Sepolia.
// Jalur uang di aplikasi tetap 100% via WDK (sendTransaction).
//
// Pakai:  node scripts/deploy-escrow.mjs           → deploy saja
//         node scripts/deploy-escrow.mjs --spike   → deploy + uji alur lengkap
//                                                    (create→deposit→propose→
//                                                     approve→execute + cancel→refund)

import fs from "node:fs";
import path from "node:path";
import solc from "solc";
import { ethers } from "ethers";

const RPC_URL = process.env.RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com";
const USDT = process.env.NEXT_PUBLIC_USDT_ADDRESS ?? "0x0304dda2A4F3B6Daa28ad87CacEeea4B634F5a28";
const DEPLOYER_FILE = path.join(".demo-secrets", "deployer.json");
const SPIKE = process.argv.includes("--spike");

const { mnemonic } = JSON.parse(fs.readFileSync(DEPLOYER_FILE, "utf8"));
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic).connect(provider);

console.log("Deployer:", wallet.address);
const balance = await provider.getBalance(wallet.address);
console.log("Saldo   :", ethers.formatEther(balance), "ETH (Sepolia)");
if (balance === 0n) {
  console.error("⛽ Deployer belum punya gas — isi dari faucet Sepolia dulu.");
  process.exit(1);
}

// ── Compile ─────────────────────────────────────────────────────────────
const source = fs.readFileSync("contracts/TarkamEscrow.sol", "utf8");
const input = {
  language: "Solidity",
  sources: { "TarkamEscrow.sol": { content: source } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
  },
};
const output = JSON.parse(solc.compile(JSON.stringify(input)));
const errs = (output.errors ?? []).filter((e) => e.severity === "error");
if (errs.length) {
  console.error(errs.map((e) => e.formattedMessage).join("\n"));
  process.exit(1);
}
const artifact = output.contracts["TarkamEscrow.sol"].TarkamEscrow;
console.log("Compile OK, bytecode", artifact.evm.bytecode.object.length / 2, "bytes");

// Simpan ABI untuk referensi (app pakai ABI human-readable sendiri).
fs.writeFileSync(
  "contracts/TarkamEscrow.abi.json",
  JSON.stringify(artifact.abi, null, 2)
);

// ── Deploy ──────────────────────────────────────────────────────────────
const factory = new ethers.ContractFactory(
  artifact.abi,
  artifact.evm.bytecode.object,
  wallet
);
const escrow = await factory.deploy();
console.log("Deploy tx:", escrow.deploymentTransaction().hash);
await escrow.waitForDeployment();
const address = await escrow.getAddress();
console.log("TarkamEscrow:", address);

// ── Catat hasil ─────────────────────────────────────────────────────────
fs.appendFileSync(
  "contracts/deploy-notes.md",
  `
# TarkamEscrow — catatan deploy

- **Network:** Sepolia (chainId 11155111)
- **Alamat kontrak:** \`${address}\`
- **Deploy tx:** https://sepolia.etherscan.io/tx/${escrow.deploymentTransaction().hash}
- **Deployer:** \`${wallet.address}\`
- ABI: \`contracts/TarkamEscrow.abi.json\`
`
);
const envPath = ".env.local";
const env = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
const line = `NEXT_PUBLIC_ESCROW_ADDRESS=${address}`;
fs.writeFileSync(
  envPath,
  env.match(/^NEXT_PUBLIC_ESCROW_ADDRESS=.*$/m)
    ? env.replace(/^NEXT_PUBLIC_ESCROW_ADDRESS=.*$/m, line)
    : env + (env.endsWith("\n") || env === "" ? "" : "\n") + line + "\n"
);
console.log("✅ Deploy selesai — alamat tercatat di deploy-notes.md & .env.local");

if (!SPIKE) process.exit(0);

// ── SPIKE: uji alur lengkap on-chain ────────────────────────────────────
console.log("\n── SPIKE alur lengkap ──");
const usdt = new ethers.Contract(
  USDT,
  [
    "function mint(address,uint256)",
    "function approve(address,uint256) returns (bool)",
    "function balanceOf(address) view returns (uint256)",
  ],
  wallet
);
const teamB = ethers.HDNodeWallet.fromPhrase(mnemonic, undefined, "m/44'/60'/0'/0/1").address;
const U = (n) => BigInt(n) * 10n ** 6n;
const wait = async (p, label) => {
  const tx = await p;
  await tx.wait();
  console.log(`${label}: ${tx.hash}`);
  return tx;
};

// Pastikan saldo USDT cukup (mint terbuka di MockUSDT).
if ((await usdt.balanceOf(wallet.address)) < U(100)) {
  await wait(usdt.mint(wallet.address, U(1000)), "mint USDT");
}
await wait(usdt.approve(address, U(1000)), "approve escrow");

// Turnamen A: fee 10, hadiah [15, 5], butuh 1 persetujuan tim.
let id = await escrow.createTournament.staticCall(USDT, U(10), [U(15), U(5)], 1, 0);
await wait(escrow.createTournament(USDT, U(10), [U(15), U(5)], 1, 0), `createTournament #${id}`);
await wait(escrow.deposit(id, teamB), "deposit tim B");
await wait(escrow.deposit(id, wallet.address), "deposit tim C (deployer)");
await wait(escrow.proposePayout(id, [teamB, wallet.address]), "proposePayout");
await wait(escrow.approvePayout(id), "approvePayout (tim C)");
const balBefore = await usdt.balanceOf(teamB);
await wait(escrow.executePayout(id), "executePayout");
const balAfter = await usdt.balanceOf(teamB);
console.assert(balAfter - balBefore === U(15), "hadiah juara 1 harus 15 USDT");
console.log(`Hadiah juara 1 diterima tim B: ${ethers.formatUnits(balAfter - balBefore, 6)} USDT ✓`);
const tA = await escrow.getTournament(id);
console.assert(tA.status === 2n && tA.pot === 0n, "status Paid & pot 0");

// Turnamen B: cancel + refund.
id = await escrow.createTournament.staticCall(USDT, U(5), [U(5)], 0, 0);
await wait(escrow.createTournament(USDT, U(5), [U(5)], 0, 0), `createTournament #${id}`);
await wait(escrow.deposit(id, wallet.address), "deposit");
await wait(escrow.cancel(id), "cancel");
const balBeforeRefund = await usdt.balanceOf(wallet.address);
await wait(escrow.claimRefund(id, wallet.address), "claimRefund");
const balAfterRefund = await usdt.balanceOf(wallet.address);
console.assert(balAfterRefund - balBeforeRefund === U(5), "refund harus 5 USDT");
console.log(`Refund diterima: ${ethers.formatUnits(balAfterRefund - balBeforeRefund, 6)} USDT ✓`);

console.log("\n✅ SPIKE lulus — semua alur escrow jalan on-chain.");
