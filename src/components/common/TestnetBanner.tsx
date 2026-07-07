"use client";

import { useI18n } from "@/lib/i18n/context";

export function TestnetBanner() {
  const { t } = useI18n();
  return (
    <div className="border-b border-foreground/30 bg-[#f2b705] px-4 py-1 text-center text-xs font-semibold tracking-widest text-[#3d2e00] uppercase">
      {t("banner.testnet")}
    </div>
  );
}
