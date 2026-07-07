"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWallet } from "@/lib/wallet/createWallet";
import { addTournament } from "@/lib/db/repo";
import { SeedPhraseReveal } from "@/components/wallet/SeedPhraseReveal";
import { useI18n } from "@/lib/i18n/context";
import type { Tournament } from "@/types";

/**
 * Buat turnamen: satu submit = generate dompet pool self-custodial (WDK)
 * + simpan metadata local-first. Seed pool dienkripsi password panitia.
 */
export function TournamentForm() {
  const router = useRouter();
  const { t } = useI18n();
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
    if (!name.trim()) return setError(t("tf.err_name"));
    if (teamCount < 2 || teamCount > 64)
      return setError(t("tf.err_count"));
    if (password.length < 8)
      return setError(t("tf.err_pw"));
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
        <div className="border-l-4 border-chart-3 bg-chart-3/15 p-3 text-sm">
          <p className="font-semibold tracking-wide uppercase">
            {t("tf.backup_warn_title")}
          </p>
          <p className="text-muted-foreground">{t("tf.backup_warn_body")}</p>
        </div>
        <SeedPhraseReveal seedPhrase={created.poolSeed} />
        <Button
          variant="secondary"
          className="w-full"
          size="lg"
          onClick={() => router.push(`/tournament/${created.id}`)}
        >
          {t("tf.noted_open")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tname">{t("tf.name_label")}</Label>
        <Input
          id="tname"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("tf.name_placeholder")}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tcount">{t("tf.count_label")}</Label>
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
          <Label htmlFor="tfee">{t("tf.fee_label")}</Label>
          <Input
            id="tfee"
            inputMode="decimal"
            className="text-right font-mono text-secondary tabular-nums"
            value={entryFee}
            onChange={(e) => setEntryFee(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          [t("tf.rank1"), prize1, setPrize1],
          [t("tf.rank2"), prize2, setPrize2],
          [t("tf.rank3"), prize3, setPrize3],
        ].map(([label, value, setter]) => (
          <div key={label as string} className="space-y-2">
            <Label>
              {label as string} {t("tf.prize_unit")}
            </Label>
            <Input
              inputMode="decimal"
              className="text-right font-mono text-secondary tabular-nums"
              value={value as string}
              onChange={(e) =>
                (setter as (v: string) => void)(e.target.value)
              }
            />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Label htmlFor="tpw">{t("tf.pw_label")}</Label>
        <Input
          id="tpw"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("tf.pw_placeholder")}
        />
        <p className="text-xs text-muted-foreground">{t("tf.pw_note")}</p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button onClick={handleCreate} disabled={busy} size="lg" className="w-full">
        {busy ? t("tf.creating") : t("tf.create_btn")}
      </Button>
    </div>
  );
}
