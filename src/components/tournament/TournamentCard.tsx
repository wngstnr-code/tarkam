"use client";

import Link from "next/link";
import { formatUSDT, parseUSDT, shortenAddress } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import type { Tournament } from "@/types";

const STATUS: Record<
  Tournament["status"],
  {
    labelKey:
      | "card.status_setup"
      | "card.status_running"
      | "card.status_finished"
      | "card.status_cancelled";
    className: string;
  }
> = {
  setup: { labelKey: "card.status_setup", className: "bg-primary text-primary-foreground" },
  running: { labelKey: "card.status_running", className: "bg-secondary text-secondary-foreground" },
  finished: { labelKey: "card.status_finished", className: "bg-muted text-muted-foreground" },
  cancelled: { labelKey: "card.status_cancelled", className: "bg-destructive text-white" },
};

export function TournamentCard({ tournament }: { tournament: Tournament }) {
  const { t } = useI18n();
  const status = STATUS[tournament.status];
  const targetPot =
    parseUSDT(tournament.entryFee) * BigInt(tournament.teamCount);

  return (
    <Link
      href={`/tournament/${tournament.id}`}
      className="group block rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <article
        className={`relative flex h-full flex-col overflow-hidden rounded-xl border border-foreground bg-card p-5 shadow-hard-sm transition-shadow group-hover:shadow-hard ${
          tournament.status === "finished" ? "opacity-80" : ""
        }`}
      >
        <span
          className={`absolute top-0 right-0 rounded-bl-lg border-b border-l border-foreground px-3 py-1 text-xs font-semibold tracking-wide uppercase ${status.className}`}
        >
          {t(status.labelKey)}
        </span>

        <h3 className="mb-4 pr-24 font-display text-xl leading-tight">
          {tournament.name}
        </h3>

        <div className="mb-4 grid grid-cols-2 gap-4 border-t border-border pt-3">
          <div>
            <p className="mb-1 text-xs tracking-wider text-muted-foreground uppercase">
              {t("card.teams")}
            </p>
            <p className="text-sm font-bold">
              {t("card.team_unit", { n: tournament.teamCount })}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs tracking-wider text-muted-foreground uppercase">
              {t("card.entry_fee")}
            </p>
            <p className="font-mono text-sm text-secondary tabular-nums">
              {t("card.fee_unit", { fee: tournament.entryFee })}
            </p>
          </div>
        </div>

        <div className="mt-auto rounded-lg border border-foreground bg-background p-3">
          <div className="mb-1 flex items-center justify-between">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
              {t("card.prize_pot")}
              {tournament.status !== "finished" && (
                <span
                  aria-hidden
                  className="size-2 rounded-full bg-secondary motion-safe:animate-pulse"
                />
              )}
            </p>
            <p className="text-xs text-muted-foreground">{t("card.full_target")}</p>
          </div>
          <p className="text-right font-mono text-2xl text-secondary tabular-nums">
            {formatUSDT(targetPot)} USDT
          </p>
          <p className="mt-1 text-right font-mono text-[10px] text-muted-foreground opacity-60 transition-opacity group-hover:opacity-100">
            🔗 {shortenAddress(tournament.poolAddress)}
          </p>
        </div>
      </article>
    </Link>
  );
}
