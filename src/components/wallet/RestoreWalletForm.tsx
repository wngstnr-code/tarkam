"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWdkWallet } from "@/hooks/useWdkWallet";

export function RestoreWalletForm() {
  const router = useRouter();
  const { restore } = useWdkWallet();
  const [phrase, setPhrase] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRestore() {
    setError(null);
    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }
    setBusy(true);
    try {
      await restore(phrase, password);
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phrase">Seed phrase (12 kata)</Label>
        <textarea
          id="phrase"
          className="min-h-24 w-full rounded-md border bg-transparent px-3 py-2 font-mono text-sm"
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          placeholder="kata1 kata2 kata3 …"
          autoComplete="off"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="rpw">Password dompet baru</Label>
        <Input
          id="rpw"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimal 8 karakter"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button onClick={handleRestore} disabled={busy} className="w-full">
        {busy ? "Memulihkan…" : "Pulihkan dompet"}
      </Button>
    </div>
  );
}
