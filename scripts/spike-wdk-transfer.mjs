// Spike validasi (blocking §10.1): transfer ERC-20 via WDK MURNI di Sepolia.
// Pakai: node scripts/spike-wdk-transfer.mjs

import fs from "node:fs";
import WalletManagerEvm from "@tetherto/wdk-wallet-evm";
import { SeedSignerEvm } from "@tetherto/wdk-wallet-evm/signers";

const RPC_URL = "https://sepolia.drpc.org";
const USDT = "0x0304dda2A4F3B6Daa28ad87CacEeea4B634F5a28";

const { mnemonic } = JSON.parse(
  fs.readFileSync(".demo-secrets/deployer.json", "utf8")
);

const wallet = new WalletManagerEvm(new SeedSignerEvm(mnemonic), {
  provider: RPC_URL,
});
const account = await wallet.getAccount(0);
const address = await account.getAddress();
console.log("Akun WDK        :", address);

const balBefore = await account.getTokenBalance(USDT);
console.log("Saldo USDT (WDK):", balBefore);

// Penerima: akun index 1 dari seed yang sama.
const account1 = await wallet.getAccount(1);
const recipient = await account1.getAddress();
console.log("Penerima        :", recipient);

const quote = await account.quoteTransfer({
  token: USDT,
  recipient,
  amount: 25_000_000n, // 25 USDT
});
console.log("Estimasi fee    :", quote.fee, "wei");

const result = await account.transfer({
  token: USDT,
  recipient,
  amount: 25_000_000n,
});
console.log("Transfer hash   :", result.hash);
console.log("Explorer        : https://sepolia.etherscan.io/tx/" + result.hash);

// Tunggu confirmed: poll saldo penerima via WDK.
for (let i = 0; i < 30; i++) {
  const balTo = await account1.getTokenBalance(USDT);
  if (BigInt(balTo) >= 25_000_000n) {
    console.log("Saldo penerima  :", balTo, "(confirmed)");
    console.log("✅ account.transfer() ERC-20 via WDK TERVALIDASI di Sepolia");
    wallet.dispose();
    process.exit(0);
  }
  await new Promise((r) => setTimeout(r, 4000));
}
console.error("❌ transfer belum terlihat confirmed setelah 2 menit");
process.exit(1);
