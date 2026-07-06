// Dev tooling (bukan jalur uang app): compile + deploy MockUSDT ke Sepolia.
// Jalur uang di aplikasi tetap 100% via WDK.
//
// Pakai:  node scripts/deploy-mockusdt.mjs
// Seed deployer dibuat otomatis di .demo-secrets/deployer.json (gitignored).

import fs from "node:fs";
import path from "node:path";
import solc from "solc";
import { ethers } from "ethers";

const RPC_URL = process.env.RPC_URL ?? "https://sepolia.drpc.org";
const SECRETS_DIR = ".demo-secrets";
const DEPLOYER_FILE = path.join(SECRETS_DIR, "deployer.json");

// ── Dompet deployer (persist agar alamat stabil untuk faucet) ──────────
fs.mkdirSync(SECRETS_DIR, { recursive: true });
let mnemonic;
if (fs.existsSync(DEPLOYER_FILE)) {
  mnemonic = JSON.parse(fs.readFileSync(DEPLOYER_FILE, "utf8")).mnemonic;
} else {
  mnemonic = ethers.Wallet.createRandom().mnemonic.phrase;
  fs.writeFileSync(DEPLOYER_FILE, JSON.stringify({ mnemonic }, null, 2));
}
const provider = new ethers.JsonRpcProvider(RPC_URL);
// Path m/44'/60'/0'/0/0 — sama dengan akun 0 WDK.
const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic).connect(provider);

console.log("Deployer:", wallet.address);
const balance = await provider.getBalance(wallet.address);
console.log("Saldo   :", ethers.formatEther(balance), "ETH (Sepolia)");

if (balance === 0n) {
  console.log(`
⛽ Deployer belum punya gas. Isi dulu dari faucet Sepolia:
   - https://cloud.google.com/application/web3/faucet/ethereum/sepolia
   - https://sepolia-faucet.pk910.de  (PoW, tanpa login)
   Kirim ke: ${wallet.address}
Lalu jalankan lagi script ini.`);
  process.exit(1);
}

// ── Compile ─────────────────────────────────────────────────────────────
const source = fs.readFileSync("contracts/MockUSDT.sol", "utf8");
const input = {
  language: "Solidity",
  sources: { "MockUSDT.sol": { content: source } },
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
const artifact = output.contracts["MockUSDT.sol"].MockUSDT;
console.log("Compile OK, bytecode", artifact.evm.bytecode.object.length / 2, "bytes");

// ── Deploy + mint awal ke deployer ──────────────────────────────────────
const factory = new ethers.ContractFactory(
  artifact.abi,
  artifact.evm.bytecode.object,
  wallet
);
const contract = await factory.deploy();
console.log("Deploy tx:", contract.deploymentTransaction().hash);
await contract.waitForDeployment();
const address = await contract.getAddress();
console.log("MockUSDT :", address);

const mintTx = await contract.mint(wallet.address, 1_000_000n * 10n ** 6n);
await mintTx.wait();
console.log("Mint 1.000.000 USDT ke deployer:", mintTx.hash);

// ── Catat hasil ─────────────────────────────────────────────────────────
fs.writeFileSync(
  "contracts/deploy-notes.md",
  `# MockUSDT — catatan deploy

- **Network:** Sepolia (chainId 11155111)
- **Alamat kontrak:** \`${address}\`
- **Deploy tx:** https://sepolia.etherscan.io/tx/${contract.deploymentTransaction().hash}
- **Deployer:** \`${wallet.address}\`
- **Desimal:** 6 — \`mint(address,uint256)\` terbuka untuk mengisi dompet demo.

Mint manual (contoh 1000 USDT):
\`\`\`
node scripts/mint-usdt.mjs <alamat-tujuan> 1000
\`\`\`
`
);
const envPath = ".env.local";
const env = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
const line = `NEXT_PUBLIC_USDT_ADDRESS=${address}`;
fs.writeFileSync(
  envPath,
  env.match(/^NEXT_PUBLIC_USDT_ADDRESS=.*$/m)
    ? env.replace(/^NEXT_PUBLIC_USDT_ADDRESS=.*$/m, line)
    : env + (env.endsWith("\n") || env === "" ? "" : "\n") + line + "\n"
);
console.log("✅ Selesai — alamat tercatat di contracts/deploy-notes.md & .env.local");
