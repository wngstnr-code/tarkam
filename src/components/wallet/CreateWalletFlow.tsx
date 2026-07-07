"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWdkWallet } from "@/hooks/useWdkWallet";
import { useI18n } from "@/lib/i18n/context";
import { SeedPhraseReveal } from "./SeedPhraseReveal";

type Step = "password" | "backup" | "confirm" | "done";

export function CreateWalletFlow() {
  const router = useRouter();
  const { t } = useI18n();
  const { create } = useWdkWallet();
  const [step, setStep] = useState<Step>("password");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [seedPhrase, setSeedPhrase] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Konfirmasi backup: minta user mengetik ulang 3 kata acak.
  const checkIndexes = useMemo(() => {
    if (!seedPhrase) return [];
    const idx = new Set<number>();
    while (idx.size < 3) idx.add(Math.floor(Math.random() * 12));
    return [...idx].sort((a, b) => a - b);
  }, [seedPhrase]);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  async function handleCreate() {
    setError(null);
    if (password.length < 8) {
      setError(t("cw.err_pw_len"));
      return;
    }
    if (password !== password2) {
      setError(t("cw.err_pw_match"));
      return;
    }
    setBusy(true);
    try {
      setSeedPhrase(await create(password));
      setStep("backup");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function handleConfirm() {
    if (!seedPhrase) return;
    const words = seedPhrase.split(" ");
    const ok = checkIndexes.every(
      (i) => (answers[i] ?? "").trim().toLowerCase() === words[i]
    );
    if (!ok) {
      setError(t("cw.err_wrong_word"));
      return;
    }
    setSeedPhrase(null); // buang plaintext dari state
    setError(null);
    setStep("done");
  }

  if (step === "password") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pw">{t("cw.pw_label")}</Label>
          <Input
            id="pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("cw.pw_placeholder")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pw2">{t("cw.pw2_label")}</Label>
          <Input
            id="pw2"
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
          />
        </div>
        <p className="text-sm text-muted-foreground">{t("cw.pw_note")}</p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={handleCreate} disabled={busy} className="w-full">
          {busy ? t("cw.creating") : t("cw.create_btn")}
        </Button>
      </div>
    );
  }

  if (step === "backup" && seedPhrase) {
    return (
      <div className="space-y-4">
        <SeedPhraseReveal seedPhrase={seedPhrase} />
        <Button onClick={() => setStep("confirm")} className="w-full">
          {t("cw.noted_next")}
        </Button>
      </div>
    );
  }

  if (step === "confirm" && seedPhrase) {
    return (
      <div className="space-y-4">
        <p className="text-sm">
          {t("cw.confirm_prompt", {
            positions: checkIndexes.map((i) => i + 1).join(", "),
          })}
        </p>
        {checkIndexes.map((i) => (
          <div key={i} className="space-y-2">
            <Label htmlFor={`w${i}`}>{t("cw.word_n", { n: i + 1 })}</Label>
            <Input
              id={`w${i}`}
              autoComplete="off"
              value={answers[i] ?? ""}
              onChange={(e) =>
                setAnswers((a) => ({ ...a, [i]: e.target.value }))
              }
            />
          </div>
        ))}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setError(null);
              setStep("backup");
            }}
          >
            {t("cw.view_again")}
          </Button>
          <Button onClick={handleConfirm} className="flex-1">
            {t("cw.confirm_backup")}
          </Button>
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="-m-4 overflow-hidden rounded-xl">
        {/* Kartu papan skor: strip gelap atas/bawah + tengah putih */}
        <div className="flex items-center justify-between bg-foreground px-4 py-2 text-background">
          <span className="font-display text-sm tracking-wider">Tarkam</span>
          <span className="font-mono text-xs tracking-widest uppercase">
            {t("cw.status_safe")}
          </span>
        </div>
        <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
          <div className="flex size-24 items-center justify-center rounded-full border-2 border-foreground bg-card shadow-hard-sm">
            <span className="text-5xl text-secondary" aria-hidden>
              ✓
            </span>
          </div>
          <h2 className="font-display text-3xl leading-none">{t("cw.wallet_ready")}</h2>
          <p className="max-w-xs text-sm text-muted-foreground">{t("cw.ready_body")}</p>
          <Button className="w-full" size="lg" onClick={() => router.push("/")}>
            {t("cw.go_dashboard")}
          </Button>
        </div>
        <div className="border-t border-foreground/20 bg-muted px-4 py-1.5 text-center">
          <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
            {t("cw.grassroots")}
          </span>
        </div>
      </div>
    );
  }

  return null;
}
