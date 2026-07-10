// Spike validasi mandiri: transfer USDT gasless via WDK
// `@tetherto/wdk-wallet-evm-7702-gasless` (EIP-7702 delegation + ERC-4337
// UserOperation, gas disponsori paymaster) di Sepolia.
//
// Pakai:  node scripts/spike-gasless-wdk.mjs
//
// Butuh env (lihat .env.local.example, blok "Gasless (opsional)"):
//   NEXT_PUBLIC_BUNDLER_URL              — Pimlico Sepolia + API key
//   NEXT_PUBLIC_SPONSORSHIP_POLICY_ID    — opsional, id sponsorship policy
//   NEXT_PUBLIC_DELEGATION_ADDRESS       — opsional, default SimpleAccount 7702

import fs from "node:fs";
import WalletManagerEvm7702Gasless from "@tetherto/wdk-wallet-evm-7702-gasless";

const RPC_URL = process.env.RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com";
const USDT = process.env.NEXT_PUBLIC_USDT_ADDRESS ?? "0x0304dda2A4F3B6Daa28ad87CacEeea4B634F5a28";
const BUNDLER_URL = process.env.NEXT_PUBLIC_BUNDLER_URL ?? "";
const SPONSORSHIP_POLICY_ID = process.env.NEXT_PUBLIC_SPONSORSHIP_POLICY_ID ?? "";
const DELEGATION_ADDRESS =
  process.env.NEXT_PUBLIC_DELEGATION_ADDRESS ?? "0xe6Cae83BdE06E4c305530e199D7217f42808555B";
const DEPLOYER_FILE = ".demo-secrets/deployer.json";

if (!BUNDLER_URL) {
  console.error(
    "❌ NEXT_PUBLIC_BUNDLER_URL belum di-set — butuh Pimlico API key.\n" +
      "   Buat akun gratis di https://dashboard.pimlico.io, ambil API key, lalu isi:\n" +
      "   NEXT_PUBLIC_BUNDLER_URL=https://api.pimlico.io/v2/11155111/rpc?apikey=YOUR_KEY\n" +
      "   (opsional) NEXT_PUBLIC_SPONSORSHIP_POLICY_ID=sp_... untuk sponsorship policy Sepolia."
  );
  process.exit(1);
}

const { mnemonic } = JSON.parse(fs.readFileSync(DEPLOYER_FILE, "utf8"));

const wallet = new WalletManagerEvm7702Gasless(mnemonic, {
  provider: RPC_URL,
  bundlerUrl: BUNDLER_URL,
  delegationAddress: DELEGATION_ADDRESS,
  isSponsored: true,
  ...(SPONSORSHIP_POLICY_ID ? { sponsorshipPolicyId: SPONSORSHIP_POLICY_ID } : {}),
});

const account = await wallet.getAccount(0);
const address = await account.getAddress();
console.log("Akun gasless (EOA):", address);

const balance = await account.getTokenBalance(USDT);
console.log("Saldo USDT        :", balance);
if (BigInt(balance) < 1_000_000n) {
  console.error(
    "❌ Saldo USDT kurang dari 1 USDT — mint dulu via scripts/mint-usdt.mjs, " +
      "atau kirim ke alamat di atas."
  );
  wallet.dispose();
  process.exit(1);
}

// Penerima: akun index 1 dari seed yang sama.
const account1 = await wallet.getAccount(1);
const recipient = await account1.getAddress();
console.log("Penerima          :", recipient);

const quote = await account.quoteTransfer({
  token: USDT,
  recipient,
  amount: 1_000_000n, // 1 USDT (6 desimal)
});
console.log("Estimasi fee      :", quote.fee, "(0 diharapkan bila sponsored)");

const result = await account.transfer({
  token: USDT,
  recipient,
  amount: 1_000_000n,
});
console.log("UserOperation hash:", result.hash);

// account.transfer() hanya balikin userOpHash — tunggu confirmed lalu ambil
// transactionHash on-chain sungguhan via getTransactionReceipt (polling).
console.log("Menunggu confirmed...");
const start = Date.now();
let receipt = null;
while (Date.now() - start < 120_000) {
  receipt = await account.getTransactionReceipt(result.hash);
  if (receipt) break;
  await new Promise((r) => setTimeout(r, 4_000));
}

if (!receipt) {
  console.error("❌ UserOperation belum confirmed setelah 2 menit");
  wallet.dispose();
  process.exit(1);
}
if (receipt.status !== 1) {
  console.error("❌ Transaksi revert on-chain:", receipt);
  wallet.dispose();
  process.exit(1);
}

console.log("Transaction hash  :", receipt.hash);
console.log("Explorer          : https://sepolia.etherscan.io/tx/" + receipt.hash);
console.log("✅ Transfer USDT gasless (EIP-7702 + ERC-4337) TERVALIDASI di Sepolia — 0 ETH dipakai kapten.");

wallet.dispose();
process.exit(0);
