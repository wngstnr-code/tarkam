"use client";

import { useState } from "react";
import { addressUrl } from "@/lib/chain/config";
import { shortenAddress } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

export function AddressChip({
  address,
  light = false,
}: {
  address: string;
  light?: boolean;
}) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs ${
        light
          ? "border-white/25 bg-white/10 text-white"
          : "bg-muted/40"
      }`}
    >
      <a
        href={addressUrl(address)}
        target="_blank"
        rel="noreferrer"
        className="hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        title={t("ac.view_explorer")}
      >
        {shortenAddress(address)}
      </a>
      <button
        type="button"
        onClick={copy}
        className={`p-0.5 focus-visible:ring-2 focus-visible:ring-ring ${
          light
            ? "text-white/70 hover:text-white"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title={t("ac.copy_addr")}
        aria-label={t("ac.copy_addr")}
      >
        {copied ? "✓" : "⧉"}
      </button>
    </span>
  );
}
