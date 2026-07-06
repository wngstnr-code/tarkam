// Dev tooling: mint MockUSDT ke alamat mana pun (testnet demo).
// Pakai:  node scripts/mint-usdt.mjs <alamat> <jumlahUSDT>

import fs from "node:fs";
import { ethers } from "ethers";

const [to, amountStr] = process.argv.slice(2);
if (!to || !amountStr) {
  console.error("Pakai: node scripts/mint-usdt.mjs <alamat> <jumlahUSDT>");
  process.exit(1);
}

const RPC_URL = process.env.RPC_URL ?? "https://sepolia.drpc.org";
const { mnemonic } = JSON.parse(
  fs.readFileSync(".demo-secrets/deployer.json", "utf8")
);
const env = fs.readFileSync(".env.local", "utf8");
const usdtAddress = env.match(/^NEXT_PUBLIC_USDT_ADDRESS=(0x[0-9a-fA-F]{40})$/m)?.[1];
if (!usdtAddress) {
  console.error("NEXT_PUBLIC_USDT_ADDRESS belum ada di .env.local — deploy dulu.");
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic).connect(provider);
const abi = ["function mint(address to, uint256 amount) external"];
const contract = new ethers.Contract(usdtAddress, abi, wallet);

const amount = BigInt(Math.round(Number(amountStr) * 1e6));
const tx = await contract.mint(to, amount);
console.log("Mint tx:", tx.hash);
await tx.wait();
console.log(`✅ ${amountStr} USDT di-mint ke ${to}`);
