// Dev tooling: verifikasi source TarkamEscrow & MockUSDT di Sepolia Etherscan
// (standard-JSON, Etherscan API v2). Setelah ini tab "Contract" menampilkan
// source Solidity lengkap + Read/Write — siapa pun benar-benar bisa mengaudit.
//
// Pakai:  node --env-file=.env.local scripts/verify-etherscan.mjs
// Butuh:  ETHERSCAN_API_KEY di .env.local

import fs from "node:fs";

const API = "https://api.etherscan.io/v2/api?chainid=11155111";
const KEY = process.env.ETHERSCAN_API_KEY ?? "";
// Harus persis versi solc yang dipakai deploy (package solc di repo ini).
const COMPILER = "v0.8.28+commit.7893614a";

const TARGETS = [
  {
    file: "TarkamEscrow.sol",
    name: "TarkamEscrow",
    address: process.env.NEXT_PUBLIC_ESCROW_ADDRESS ?? "0xd572cffB8d01f1FFD129A88F301209dA346E2d5f",
  },
  {
    file: "MockUSDT.sol",
    name: "MockUSDT",
    address: process.env.NEXT_PUBLIC_USDT_ADDRESS ?? "0x0304dda2A4F3B6Daa28ad87CacEeea4B634F5a28",
  },
];

if (!KEY) {
  console.error("❌ ETHERSCAN_API_KEY belum di-set di .env.local");
  process.exit(1);
}

async function api(params) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ apikey: KEY, ...params }),
  });
  return res.json();
}

for (const t of TARGETS) {
  const source = fs.readFileSync(`contracts/${t.file}`, "utf8");
  // Settings identik dengan scripts/deploy-*.mjs — wajib, agar bytecode cocok.
  const standardJson = {
    language: "Solidity",
    sources: { [t.file]: { content: source } },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
    },
  };

  console.log(`\n── ${t.name} @ ${t.address}`);
  const submit = await api({
    module: "contract",
    action: "verifysourcecode",
    contractaddress: t.address,
    codeformat: "solidity-standard-json-input",
    sourceCode: JSON.stringify(standardJson),
    contractname: `${t.file}:${t.name}`,
    compilerversion: COMPILER,
  });

  if (submit.status !== "1") {
    if (String(submit.result).toLowerCase().includes("already verified")) {
      console.log("✅ Sudah terverifikasi sebelumnya.");
      continue;
    }
    console.error("❌ Submit gagal:", submit.result);
    process.exitCode = 1;
    continue;
  }

  // Poll status pakai guid dari submit.
  const guid = submit.result;
  process.stdout.write("Menunggu hasil verifikasi");
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 5_000));
    const check = await api({ module: "contract", action: "checkverifystatus", guid });
    if (check.result === "Pending in queue") {
      process.stdout.write(".");
      continue;
    }
    console.log();
    if (check.status === "1" || String(check.result).includes("Verified")) {
      console.log(`✅ ${t.name} TERVERIFIKASI: https://sepolia.etherscan.io/address/${t.address}#code`);
    } else {
      console.error("❌ Verifikasi ditolak:", check.result);
      process.exitCode = 1;
    }
    break;
  }
}
