"use client";

import { QRCodeSVG } from "qrcode.react";
import { AddressChip } from "@/components/common/AddressChip";
import { usePoolBalance } from "@/hooks/usePoolBalance";
import { formatUSDT, parseUSDT } from "@/lib/format";
import { addressUrl } from "@/lib/chain/config";
import { useI18n } from "@/lib/i18n/context";
import type { Tournament } from "@/types";

/** Panel brankas ala papan skor: panel hijau lapangan gelap + garis lapangan. */
export function PoolPanel({ tournament }: { tournament: Tournament }) {
  const { t } = useI18n();
  const { balance, error } = usePoolBalance(tournament.poolAddress);
  const target = parseUSDT(tournament.entryFee) * BigInt(tournament.teamCount);

  return (
    <section
      aria-label={t("pp.aria")}
      className="shadow-hard relative overflow-hidden rounded-xl border border-foreground bg-[#0e3d20] p-5 text-white"
    >
      {/* Garis lapangan: lingkaran tengah + garis tengah, dekoratif */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]"
        viewBox="0 0 400 160"
        preserveAspectRatio="xMidYMid slice"
      >
        <g fill="none" stroke="white" strokeWidth="1.5">
          <line x1="200" y1="0" x2="200" y2="160" />
          <circle cx="200" cy="80" r="42" />
          <circle cx="200" cy="80" r="3" fill="white" />
          <rect x="-40" y="30" width="80" height="100" />
          <rect x="360" y="30" width="80" height="100" />
        </g>
      </svg>

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="shadow-hard-sm shrink-0 self-center rounded-lg border border-foreground bg-white p-2 sm:self-auto">
          <QRCodeSVG value={tournament.poolAddress} size={104} />
        </div>
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">
            {t("pp.label")}
          </p>
          <p className="font-mono text-4xl font-bold tabular-nums text-[#7fe0a7]">
            {balance === null ? "—" : formatUSDT(balance)}
            <span className="ml-2 text-base font-normal text-white/60">
              / {formatUSDT(target)} USDT
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <AddressChip address={tournament.poolAddress} light />
            <a
              className="text-white/70 underline underline-offset-2 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60"
              href={addressUrl(tournament.poolAddress)}
              target="_blank"
              rel="noreferrer"
            >
              {t("pp.audit")}
            </a>
          </div>
          <p className="text-xs text-white/50">{t("pp.note")}</p>
          {error && (
            <p className="text-xs text-amber-300">{t("pp.rpc_error", { error })}</p>
          )}
        </div>
      </div>
    </section>
  );
}
