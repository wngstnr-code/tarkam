"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWdkWallet } from "@/hooks/useWdkWallet";
import { SeedPhraseReveal } from "./SeedPhraseReveal";

type Step = "password" | "backup" | "confirm";

export function CreateWalletFlow() {
  const router = useRouter();
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
      setError("Password minimal 8 karakter");
      return;
    }
    if (password !== password2) {
      setError("Password tidak sama");
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
      setError("Ada kata yang salah — cek lagi catatan backup-mu.");
      return;
    }
    setSeedPhrase(null); // buang plaintext dari state
    router.push("/");
  }

  if (step === "password") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pw">Password dompet</Label>
          <Input
            id="pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 8 karakter"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pw2">Ulangi password</Label>
          <Input
            id="pw2"
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Password ini mengenkripsi seed phrase di device-mu. Diminta setiap
          kali kamu akan mengirim uang.
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={handleCreate} disabled={busy} className="w-full">
          {busy ? "Membuat dompet…" : "Buat dompet"}
        </Button>
      </div>
    );
  }

  if (step === "backup" && seedPhrase) {
    return (
      <div className="space-y-4">
        <SeedPhraseReveal seedPhrase={seedPhrase} />
        <Button onClick={() => setStep("confirm")} className="w-full">
          Sudah kucatat — lanjut konfirmasi
        </Button>
      </div>
    );
  }

  if (step === "confirm" && seedPhrase) {
    return (
      <div className="space-y-4">
        <p className="text-sm">
          Isi kata ke-{checkIndexes.map((i) => i + 1).join(", ke-")} untuk
          membuktikan backup-mu benar:
        </p>
        {checkIndexes.map((i) => (
          <div key={i} className="space-y-2">
            <Label htmlFor={`w${i}`}>Kata ke-{i + 1}</Label>
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
            Lihat lagi
          </Button>
          <Button onClick={handleConfirm} className="flex-1">
            Konfirmasi backup
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
