"use client";

import { useState } from "react";
import { addressUrl } from "@/lib/chain/config";
import { shortenAddress } from "@/lib/format";

export function AddressChip({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 font-mono text-xs">
      <a
        href={addressUrl(address)}
        target="_blank"
        rel="noreferrer"
        className="hover:underline"
        title="Lihat di explorer"
      >
        {shortenAddress(address)}
      </a>
      <button
        type="button"
        onClick={copy}
        className="text-muted-foreground hover:text-foreground"
        title="Salin alamat"
      >
        {copied ? "✓" : "⧉"}
      </button>
    </span>
  );
}
