"use client";

import { txUrl } from "@/lib/chain/config";
import { shortenAddress } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

/** Resi on-chain: hash = bukti yang tidak bisa dipalsukan siapa pun. */
export function TxReceipt({ hash, label }: { hash: string; label?: string }) {
  const { t } = useI18n();
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-secondary bg-accent px-3 py-2 text-sm text-accent-foreground">
      <span className="text-xs font-semibold tracking-wide uppercase">
        {label ?? t("tr.default")}
      </span>
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
