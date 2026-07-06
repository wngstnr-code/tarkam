"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateWalletFlow } from "@/components/wallet/CreateWalletFlow";
import { RestoreWalletForm } from "@/components/wallet/RestoreWalletForm";

export default function OnboardingPage() {
  const [mode, setMode] = useState<"create" | "restore">("create");

  return (
    <main className="mx-auto max-w-md space-y-6 p-6 pt-12">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">Dompet kamu, kunci kamu</h1>
        <p className="text-sm text-muted-foreground">
          Seed phrase dibuat dan tersimpan terenkripsi di device ini — tidak
          pernah menyentuh server mana pun.
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant={mode === "create" ? "default" : "outline"}
          className="flex-1"
          onClick={() => setMode("create")}
        >
          Buat baru
        </Button>
        <Button
          variant={mode === "restore" ? "default" : "outline"}
          className="flex-1"
          onClick={() => setMode("restore")}
        >
          Pulihkan
        </Button>
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
