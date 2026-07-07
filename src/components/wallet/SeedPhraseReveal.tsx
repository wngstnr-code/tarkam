"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";

export function SeedPhraseReveal({ seedPhrase }: { seedPhrase: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const words = seedPhrase.split(" ");

  async function copy() {
    await navigator.clipboard.writeText(seedPhrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-3">
      <ol className="grid grid-cols-3 gap-2">
        {words.map((w, i) => (
          <li
            key={i}
            className="flex items-center gap-1.5 rounded-md border border-foreground/20 bg-accent px-2 py-1.5 font-mono text-sm text-accent-foreground"
          >
            <span className="select-none text-[10px] text-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </span>
            {w}
          </li>
        ))}
      </ol>
      <Button type="button" variant="outline" size="sm" onClick={copy}>
        {copied ? t("sp.copied") : t("sp.copy")}
      </Button>
      <div className="flex items-start gap-2 border-l-4 border-chart-3 bg-chart-3/15 p-3 text-sm">
        <span aria-hidden>⚠️</span>
        <p>
          <strong>{t("sp.warn_strong")}</strong> {t("sp.warn_body")}
        </p>
      </div>
    </div>
  );
}
