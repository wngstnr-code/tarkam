// Helper bersama untuk test suite TarkamEscrow: spawn anvil lokal, compile
// kontrak via solc (pola sama seperti scripts/deploy-*.mjs), dan util kecil.

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import solc from "solc";
import { ethers } from "ethers";

const ANVIL_BIN = process.env.ANVIL_BIN ?? "/Users/mac/.foundry/bin/anvil";
const ROOT = path.resolve(import.meta.dirname, "..");

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
  const port = 8600 + Math.floor(Math.random() * 1000);
  const child = spawn(
    ANVIL_BIN,
    ["--port", String(port), "--silent", "--mnemonic", ANVIL_MNEMONIC, "--accounts", "10"],
    { stdio: ["ignore", "ignore", "pipe"] }
  );

  let stderrBuf = "";
  child.stderr?.on("data", (d) => {
    stderrBuf += d.toString();
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
