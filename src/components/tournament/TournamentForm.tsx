"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWallet } from "@/lib/wallet/createWallet";
import { addTournament } from "@/lib/db/repo";
import { SeedPhraseReveal } from "@/components/wallet/SeedPhraseReveal";
import type { Tournament } from "@/types";

/**
 * Buat turnamen: satu submit = generate dompet pool self-custodial (WDK)
 * + simpan metadata local-first. Seed pool dienkripsi password panitia.
 */
export function TournamentForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [teamCount, setTeamCount] = useState(8);
  const [entryFee, setEntryFee] = useState("50");
  const [prize1, setPrize1] = useState("250");
  const [prize2, setPrize2] = useState("100");
  const [prize3, setPrize3] = useState("50");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Setelah dibuat: tampilkan backup seed pool sekali.
  const [created, setCreated] = useState<{
    id: string;
    poolSeed: string;
    poolAddress: string;
  } | null>(null);

  async function handleCreate() {
    setError(null);
    if (!name.trim()) return setError("Nama turnamen wajib diisi");
    if (teamCount < 2 || teamCount > 64)
      return setError("Jumlah tim 2–64");
    if (password.length < 8)
      return setError("Password brankas minimal 8 karakter");
    setBusy(true);
    try {
      const { meta, seedPhrase } = await createWallet(password);
      const t: Tournament = {
        id: crypto.randomUUID(),
        name: name.trim(),
        format: "single_elim",
        teamCount,
        entryFee,
        prizes: [
          { rank: 1, amount: prize1 },
          { rank: 2, amount: prize2 },
          { rank: 3, amount: prize3 },
        ].filter((p) => Number(p.amount) > 0),
        poolAddress: meta.address,
        poolEncryptedSeed: meta.encryptedSeed,
        status: "setup",
        createdAt: Date.now(),
      };
      await addTournament(t);
      setCreated({ id: t.id, poolSeed: seedPhrase, poolAddress: meta.address });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (created) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-700 dark:bg-amber-950">
          <p className="font-semibold">Backup seed brankas pool — SEKALI ini saja</p>
          <p className="text-muted-foreground">
            Brankas hadiah turnamen ini adalah dompet self-custodial. Catat 12
            kata di bawah; tanpa ini hadiah tidak bisa dicairkan bila device
            hilang.
          </p>
        </div>
        <SeedPhraseReveal seedPhrase={created.poolSeed} />
        <Button
          className="w-full"
          onClick={() => router.push(`/tournament/${created.id}`)}
        >
          Sudah kucatat — buka turnamen
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tname">Nama turnamen</Label>
        <Input
          id="tname"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Piala Kemerdekaan RT 05"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tcount">Jumlah tim</Label>
          <Input
            id="tcount"
            type="number"
            min={2}
            max={64}
            value={teamCount}
            onChange={(e) => setTeamCount(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tfee">Biaya daftar (USDT/tim)</Label>
          <Input
            id="tfee"
            inputMode="decimal"
            value={entryFee}
            onChange={(e) => setEntryFee(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          ["Juara 1", prize1, setPrize1],
          ["Juara 2", prize2, setPrize2],
          ["Juara 3", prize3, setPrize3],
        ].map(([label, value, setter]) => (
          <div key={label as string} className="space-y-2">
            <Label>{label as string} (USDT)</Label>
            <Input
              inputMode="decimal"
              value={value as string}
              onChange={(e) =>
                (setter as (v: string) => void)(e.target.value)
              }
            />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Label htmlFor="tpw">Password brankas pool</Label>
        <Input
          id="tpw"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimal 8 karakter — diminta saat payout"
        />
        <p className="text-xs text-muted-foreground">
          Mengenkripsi seed dompet pool di device ini. Hanya pemegang password
          yang bisa mencairkan hadiah.
        </p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button onClick={handleCreate} disabled={busy} className="w-full">
        {busy ? "Membuat brankas pool…" : "Buat turnamen + brankas pool"}
      </Button>
    </div>
  );
}
