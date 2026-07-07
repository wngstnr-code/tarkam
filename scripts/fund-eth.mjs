// Dev tooling: kirim Sepolia ETH (gas) dari dompet deployer ke alamat mana pun.
// Berguna saat dompet demo baru belum punya ETH dan faucet publik minta saldo mainnet.
// Pakai:  node scripts/fund-eth.mjs <alamat> [jumlahETH=0.02]

import fs from "node:fs";
import { ethers } from "ethers";

const [to, amountStr = "0.02"] = process.argv.slice(2);
if (!to || !/^0x[0-9a-fA-F]{40}$/.test(to)) {
  console.error("Pakai: node scripts/fund-eth.mjs <alamat 0x…> [jumlahETH]");
  process.exit(1);
}

const RPC_URL =
  process.env.RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com";
const { mnemonic } = JSON.parse(
  fs.readFileSync(".demo-secrets/deployer.json", "utf8")
);

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic).connect(provider);

const bal = await provider.getBalance(wallet.address);
const value = ethers.parseEther(amountStr);
console.log(`Deployer ${wallet.address} punya ${ethers.formatEther(bal)} ETH`);
if (bal <= value) {
  console.error("Saldo deployer tidak cukup untuk jumlah ini.");
  process.exit(1);
}

const tx = await wallet.sendTransaction({ to, value });
console.log("Kirim tx:", tx.hash);
await tx.wait();
console.log(`✅ ${amountStr} ETH terkirim ke ${to}`);
