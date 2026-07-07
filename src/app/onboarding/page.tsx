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
import { Logo } from "@/components/common/Logo";
import { useI18n } from "@/lib/i18n/context";

export default function OnboardingPage() {
  const { t } = useI18n();
  const [mode, setMode] = useState<"create" | "restore">("create");

  return (
    <main className="mx-auto max-w-md space-y-6 p-6 pt-12">
      <div className="space-y-2 text-center">
        <Logo className="justify-center text-lg" iconClassName="size-5" />
        <h1 className="font-display text-3xl">{t("ob.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("ob.subtitle")}</p>
      </div>
      <div
        role="tablist"
        aria-label={t("ob.tablist_aria")}
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
          {t("ob.create")}
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
          {t("ob.restore")}
        </button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "create" ? t("ob.create_title") : t("ob.restore_title")}
          </CardTitle>
          <CardDescription>
            {mode === "create" ? t("ob.create_desc") : t("ob.restore_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === "create" ? <CreateWalletFlow /> : <RestoreWalletForm />}
        </CardContent>
      </Card>
    </main>
  );
}
