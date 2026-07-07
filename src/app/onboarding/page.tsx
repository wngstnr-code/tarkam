"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateWalletFlow } from "@/components/wallet/CreateWalletFlow";
import { RestoreWalletForm } from "@/components/wallet/RestoreWalletForm";

export default function OnboardingPage() {
  const [mode, setMode] = useState<"create" | "restore">("create");

  return (
    <main className="mx-auto max-w-md space-y-6 p-6 pt-12">
      <div className="space-y-2 text-center">
        <p className="font-display text-lg text-primary" aria-hidden>
          ⚽ Tarkam
        </p>
        <h1 className="font-display text-3xl">Dompet kamu, kunci kamu</h1>
        <p className="text-sm text-muted-foreground">
          Seed phrase dibuat dan tersimpan terenkripsi di device ini — tidak
          pernah menyentuh server mana pun.
        </p>
      </div>
      <div
        role="tablist"
        aria-label="Mode dompet"
        className="flex gap-1 rounded-lg border border-foreground bg-card p-1 shadow-hard-sm"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "create"}
          className={`flex-1 rounded-md px-3 py-2 font-display text-sm tracking-wide transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
            mode === "create"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          }`}
          onClick={() => setMode("create")}
        >
          Buat baru
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "restore"}
          className={`flex-1 rounded-md px-3 py-2 font-display text-sm tracking-wide transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
            mode === "restore"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          }`}
          onClick={() => setMode("restore")}
        >
          Pulihkan
        </button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "Buat dompet baru" : "Pulihkan dari seed phrase"}
          </CardTitle>
          <CardDescription>
            {mode === "create"
              ? "Dompet self-custodial via Tether WDK."
              : "Masukkan 12 kata seed phrase dompetmu."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === "create" ? <CreateWalletFlow /> : <RestoreWalletForm />}
        </CardContent>
      </Card>
    </main>
  );
}
