"use client";

import { formatEth, MIN_GAS_WEI } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

/**
 * Peringatan gas: muncul saat saldo ETH dompet di bawah ambang aman.
 * Tanpa ETH, mint/bayar akan gagal — ini menjelaskan sebelum user klik.
 */
export function GasWarning({
  ethBalance,
  className = "",
}: {
  ethBalance: bigint | null;
  className?: string;
}) {
  const { t } = useI18n();
  if (ethBalance === null || ethBalance >= MIN_GAS_WEI) return null;

  const empty = ethBalance === 0n;

  return (
    <div
      className={`rounded-lg border border-foreground bg-[#f2b705] p-3 text-xs text-[#3d2e00] shadow-hard-xs ${className}`}
    >
      <p className="mb-1 font-bold tracking-wide uppercase">
        ⛽ {empty ? t("gw.no_eth") : t("gw.low_eth")}
      </p>
      <p className="leading-snug">
        {t("gw.body_1", { balance: formatEth(ethBalance) })}{" "}
        <a
          href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
          target="_blank"
          rel="noreferrer"
          className="font-semibold underline"
        >
          {t("gw.body_gcloud")}
        </a>{" "}
        {t("gw.body_2")}{" "}
        <a
          href="https://sepolia-faucet.pk910.de"
          target="_blank"
          rel="noreferrer"
          className="font-semibold underline"
        >
          {t("gw.body_pow")}
        </a>{" "}
        {t("gw.body_3")}
      </p>
    </div>
  );
}
