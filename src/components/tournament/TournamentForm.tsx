"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWallet } from "@/lib/wallet/createWallet";
import { addTournament } from "@/lib/db/repo";
import { SeedPhraseReveal } from "@/components/wallet/SeedPhraseReveal";
import { GasWarning } from "@/components/wallet/GasWarning";
import { useWdkWallet } from "@/hooks/useWdkWallet";
import { createEscrowTournament } from "@/lib/escrow/write";
import { humanizeTxError } from "@/lib/wallet/errors";
import { ESCROW_ADDRESS } from "@/lib/chain/config";
import { parseUSDT } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import type { PoolMode, Tournament } from "@/types";

/**
 * Buat turnamen. Dua mode brankas:
 * - "simple": generate dompet pool self-custodial (WDK) + backup seed.
 * - "escrow": kunci dana di kontrak TarkamEscrow on-chain (trustless) —
 *   tanpa dompet pool, panitia tanda tangan lewat dompet user via WDK.
 */
export function TournamentForm() {
  const router = useRouter();
  const { t } = useI18n();
  const { unlockSeed, ethBalance, refreshBalance } = useWdkWallet();
  const [mode, setMode] = useState<PoolMode>("escrow");
  const [name, setName] = useState("");
  const [teamCount, setTeamCount] = useState(8);
  const [entryFee, setEntryFee] = useState("50");
  const [prize1, setPrize1] = useState("250");
  const [prize2, setPrize2] = useState("100");
  const [prize3, setPrize3] = useState("50");
  const [threshold, setThreshold] = useState(1);
  const [refundDays, setRefundDays] = useState(30);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Setelah dibuat (mode simple): tampilkan backup seed pool sekali.
  const [created, setCreated] = useState<{
    id: string;
    poolSeed: string;
    poolAddress: string;
  } | null>(null);

  useEffect(() => {
    if (mode === "escrow") refreshBalance();
  }, [mode, refreshBalance]);

  function buildPrizes() {
    return [
      { rank: 1, amount: prize1 },
      { rank: 2, amount: prize2 },
      { rank: 3, amount: prize3 },
    ].filter((p) => Number(p.amount) > 0);
  }

  function validate(): string | null {
    if (!name.trim()) return t("tf.err_name");
    if (teamCount < 2 || teamCount > 64) return t("tf.err_count");
    if (mode === "simple" && password.length < 8) return t("tf.err_pw");
    if (mode === "escrow" && !password) return t("tf.err_pw_unlock");
    if (mode === "escrow" && (threshold < 0 || threshold > teamCount))
      return t("tf.err_threshold");
    return null;
  }

  async function handleCreate() {
    setError(null);
    const invalid = validate();
    if (invalid) return setError(invalid);
    setBusy(true);
    try {
      if (mode === "escrow") {
        // 1. Buka seed dompet user (panitia) — dibuang lagi setelah dipakai.
        const seed = await unlockSeed(password);
        // 2. Buat turnamen di kontrak escrow (WDK tanda tangan & broadcast).
        const prizes = buildPrizes();
        const deadline =
          refundDays > 0
            ? Math.floor(Date.now() / 1000) + refundDays * 86_400
            : 0;
        const { escrowId } = await createEscrowTournament(
          seed,
          parseUSDT(entryFee),
          prizes.map((p) => parseUSDT(p.amount)),
          threshold,
          deadline
        );
        const tournament: Tournament = {
          id: crypto.randomUUID(),
          name: name.trim(),
          format: "single_elim",
          teamCount,
          entryFee,
          prizes,
          poolAddress: ESCROW_ADDRESS,
          poolEncryptedSeed: "",
          mode: "escrow",
          escrowId,
          status: "setup",
          createdAt: Date.now(),
        };
        await addTournament(tournament);
        router.push(`/tournament/${tournament.id}`);
        return;
      }

      const { meta, seedPhrase } = await createWallet(password);
      const tournament: Tournament = {
        id: crypto.randomUUID(),
        name: name.trim(),
        format: "single_elim",
        teamCount,
        entryFee,
        prizes: buildPrizes(),
        poolAddress: meta.address,
        poolEncryptedSeed: meta.encryptedSeed,
        mode: "simple",
        status: "setup",
        createdAt: Date.now(),
      };
      await addTournament(tournament);
      setCreated({
        id: tournament.id,
        poolSeed: seedPhrase,
        poolAddress: meta.address,
      });
    } catch (e) {
      setError(humanizeTxError(e));
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
      {/* Pemilih mode brankas */}
      <div className="space-y-2">
        <Label>{t("tf.mode_label")}</Label>
        <div className="grid gap-3 sm:grid-cols-2" role="radiogroup">
          {(
            [
              ["escrow", t("tf.mode_escrow"), t("tf.mode_escrow_desc")],
              ["simple", t("tf.mode_simple"), t("tf.mode_simple_desc")],
            ] as const
          ).map(([value, title, desc]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={mode === value}
              onClick={() => setMode(value)}
              className={`rounded-xl border p-3 text-left text-sm transition-colors ${
                mode === value
                  ? "border-foreground bg-secondary/10 shadow-hard-xs"
                  : "border-foreground/25 hover:border-foreground/60"
              }`}
            >
              <p className="font-semibold">{title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
            </button>
          ))}
        </div>
      </div>

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

      {mode === "escrow" && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tthreshold">{t("tf.threshold_label")}</Label>
              <Input
                id="tthreshold"
                type="number"
                min={0}
                max={teamCount}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                {t("tf.threshold_note")}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="trefund">{t("tf.refund_label")}</Label>
              <Input
                id="trefund"
                type="number"
                min={0}
                value={refundDays}
                onChange={(e) => setRefundDays(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">{t("tf.refund_note")}</p>
            </div>
          </div>
          <GasWarning ethBalance={ethBalance} />
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="tpw">
          {mode === "escrow" ? t("tf.pw_label_unlock") : t("tf.pw_label")}
        </Label>
        <Input
          id="tpw"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={
            mode === "escrow" ? t("tf.pw_placeholder_unlock") : t("tf.pw_placeholder")
          }
        />
        <p className="text-xs text-muted-foreground">
          {mode === "escrow" ? t("tf.pw_note_unlock") : t("tf.pw_note")}
        </p>
      </div>
      {error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-2 text-sm break-words text-destructive">
          {error}
        </p>
      )}
      <Button onClick={handleCreate} disabled={busy} size="lg" className="w-full">
        {busy
          ? mode === "escrow"
            ? t("tf.creating_escrow")
            : t("tf.creating")
          : t("tf.create_btn")}
      </Button>
    </div>
  );
}
