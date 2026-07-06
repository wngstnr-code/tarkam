"use client";

// Halaman smoke-test sementara (AC Fase 0): membuktikan WDK jalan
// di client Next.js — generate seed, derive address, cek saldo native.
// Dihapus sebelum submission.

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function WdkTestPage() {
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    const lines: string[] = [];
    try {
      const { generateSeedPhrase, deriveAccount } = await import(
        "@/lib/wallet/wdk"
      );
      const phrase = generateSeedPhrase();
      lines.push(`seed (${phrase.split(" ").length} kata): ${phrase}`);
      const { account, address } = await deriveAccount(phrase);
      lines.push(`address: ${address}`);
      const balance = await account.getBalance();
      lines.push(`native balance (wei): ${balance}`);
      lines.push("✅ WDK jalan di browser");
    } catch (e) {
      lines.push(`❌ ${e instanceof Error ? e.message : String(e)}`);
    }
    setLog(lines);
    setBusy(false);
  }

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-8">
      <h1 className="text-xl font-bold">WDK smoke test</h1>
      <Button onClick={run} disabled={busy}>
        {busy ? "Menjalankan…" : "Jalankan tes WDK"}
      </Button>
      <pre className="whitespace-pre-wrap rounded-md border p-4 text-sm">
        {log.join("\n") || "Belum dijalankan."}
      </pre>
    </main>
  );
}
