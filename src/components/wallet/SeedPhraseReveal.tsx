"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SeedPhraseReveal({ seedPhrase }: { seedPhrase: string }) {
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
            className="rounded-md border bg-muted/40 px-2 py-1.5 font-mono text-sm"
          >
            <span className="mr-1.5 select-none text-muted-foreground">
              {i + 1}.
            </span>
            {w}
          </li>
        ))}
      </ol>
      <Button type="button" variant="outline" size="sm" onClick={copy}>
        {copied ? "Tersalin ✓" : "Salin seed phrase"}
      </Button>
      <p className="text-sm text-muted-foreground">
        Tulis 12 kata ini di kertas dan simpan di tempat aman. Siapa pun yang
        memegang kata-kata ini memegang uangnya. Tarkam tidak menyimpan salinan —
        hilang berarti hilang.
      </p>
    </div>
  );
}
