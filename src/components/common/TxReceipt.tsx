"use client";

import { txUrl } from "@/lib/chain/config";
import { shortenAddress } from "@/lib/format";

/** Resi on-chain: hash = bukti yang tidak bisa dipalsukan siapa pun. */
export function TxReceipt({ hash, label }: { hash: string; label?: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm dark:border-green-800 dark:bg-green-950">
      <span className="font-medium">{label ?? "Terkirim on-chain ✓"}</span>
      <a
        href={txUrl(hash)}
        target="_blank"
        rel="noreferrer"
        className="font-mono text-xs underline"
        title={hash}
      >
        {shortenAddress(hash, 6)} ↗
      </a>
    </div>
  );
}
