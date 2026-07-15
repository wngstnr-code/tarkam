// Helper bersama untuk test suite TarkamEscrow: spawn anvil lokal, compile
// kontrak via solc (pola sama seperti scripts/deploy-*.mjs), dan util kecil.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import solc from "solc";
import { ethers } from "ethers";

const ROOT = path.resolve(import.meta.dirname, "..");

/**
 * Cari binary anvil tanpa mengunci path absolut ke satu mesin:
 * 1. env `ANVIL_BIN` (paling eksplisit — dipakai CI atau instalasi tak lazim),
 * 2. `anvil` di PATH (kasus umum bila shell sudah di-setup foundryup),
 * 3. lokasi default foundryup: `~/.foundry/bin/anvil` (PATH sering belum
 *    ter-load di shell non-interaktif, jadi ini fallback yang sah).
 * Bila tak ketemu, lempar pesan yang menyebutkan cara memasang.
 */
function resolveAnvilBin() {
  if (process.env.ANVIL_BIN) return process.env.ANVIL_BIN;

  const exeName = process.platform === "win32" ? "anvil.exe" : "anvil";
  const candidates = (process.env.PATH ?? "")
    .split(path.delimiter)
    .filter(Boolean)
    .map((dir) => path.join(dir, exeName));
  candidates.push(path.join(os.homedir(), ".foundry", "bin", exeName));

  for (const candidate of candidates) {
    try {
      fs.accessSync(candidate, fs.constants.X_OK);
      return candidate;
    } catch {
      // lanjut ke kandidat berikutnya
    }
  }

  throw new Error(
    "anvil tidak ditemukan. Pasang Foundry (https://getfoundry.sh):\n" +
      "  curl -L https://foundry.paradigm.xyz | bash && foundryup\n" +
      "atau tunjuk langsung: ANVIL_BIN=/path/ke/anvil npm test"
  );
}

// Mnemonic default anvil ("test test test test test test test test test test test junk").
export const ANVIL_MNEMONIC = "test test test test test test test test test test test junk";

/** Compile satu file kontrak Solidity via solc (standard JSON), pola sama
 *  dengan scripts/deploy-escrow.mjs / deploy-mockusdt.mjs. */
export function compileContract(fileName, contractName) {
  const source = fs.readFileSync(path.join(ROOT, "contracts", fileName), "utf8");
  const input = {
    language: "Solidity",
    sources: { [fileName]: { content: source } },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
    },
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const errs = (output.errors ?? []).filter((e) => e.severity === "error");
  if (errs.length) {
    throw new Error(errs.map((e) => e.formattedMessage).join("\n"));
  }
  const artifact = output.contracts[fileName][contractName];
  return { abi: artifact.abi, bytecode: artifact.evm.bytecode.object };
}

/** Spawn anvil di port yang diberikan, tunggu sampai RPC siap. */
export async function startAnvil() {
  const anvilBin = resolveAnvilBin();
  const port = 8600 + Math.floor(Math.random() * 1000);
  const child = spawn(
    anvilBin,
    ["--port", String(port), "--silent", "--mnemonic", ANVIL_MNEMONIC, "--accounts", "10"],
    { stdio: ["ignore", "ignore", "pipe"] }
  );

  let stderrBuf = "";
  child.stderr?.on("data", (d) => {
    stderrBuf += d.toString();
  });

  // spawn gagal (mis. ENOENT) dilaporkan lewat event async, bukan exitCode —
  // tanpa handler ini test hanya menggantung sampai timeout tanpa sebab jelas.
  let spawnError = null;
  child.on("error", (err) => {
    spawnError = err;
  });

  // cacheTimeout: -1 penting — AbstractProvider ethers v6 secara default
  // menyatukan ("cache") request identik (mis. eth_getTransactionCount
  // dengan tag "pending") yang terjadi dalam window ~250ms. Karena anvil
  // mining instan, dua deploy/tx berurutan dari signer yang sama bisa
  // terjadi dalam window itu, sehingga nonce basi ter-cache dan dipakai
  // ulang → "nonce has already been used". Matikan cache ini.
  const url = `http://127.0.0.1:${port}`;
  const provider = new ethers.JsonRpcProvider(
    url,
    { chainId: 31337, name: "anvil" },
    { staticNetwork: true, batchMaxCount: 1, cacheTimeout: -1 }
  );

  const deadline = Date.now() + 15000;
  let ready = false;
  while (Date.now() < deadline) {
    if (spawnError) {
      throw new Error(`anvil gagal dijalankan (${anvilBin}): ${spawnError.message}`);
    }
    if (child.exitCode !== null) {
      throw new Error(`anvil keluar dini (kode ${child.exitCode}): ${stderrBuf}`);
    }
    try {
      await provider.send("eth_chainId", []);
      ready = true;
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  if (!ready) {
    child.kill("SIGKILL");
    throw new Error(`anvil tidak siap dalam waktu: ${stderrBuf}`);
  }

  return { child, provider, url, port };
}

export function stopAnvil(child) {
  if (!child) return;
  if (child.exitCode === null && child.signalCode === null) {
    child.kill("SIGKILL");
  }
}

/** Ambil N signer dari mnemonic default anvil, terhubung ke provider. */
export function getSigners(provider, n = 10) {
  const signers = [];
  for (let i = 0; i < n; i++) {
    const w = ethers.HDNodeWallet.fromPhrase(ANVIL_MNEMONIC, undefined, `m/44'/60'/0'/0/${i}`);
    signers.push(w.connect(provider));
  }
  return signers;
}

export async function increaseTimeAndMine(provider, seconds) {
  await provider.send("evm_increaseTime", [seconds]);
  await provider.send("evm_mine", []);
}

export const U = (n) => ethers.parseUnits(String(n), 6);
