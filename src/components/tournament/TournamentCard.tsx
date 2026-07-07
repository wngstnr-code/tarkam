"use client";

import Link from "next/link";
import { formatUSDT, parseUSDT, shortenAddress } from "@/lib/format";
import type { Tournament } from "@/types";

const STATUS: Record<
  Tournament["status"],
  { label: string; className: string }
> = {
  setup: { label: "Pendaftaran", className: "bg-primary text-primary-foreground" },
  running: { label: "Berjalan", className: "bg-secondary text-secondary-foreground" },
  finished: { label: "Selesai", className: "bg-muted text-muted-foreground" },
};

export function TournamentCard({ tournament }: { tournament: Tournament }) {
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
          {status.label}
        </span>

        <h3 className="mb-4 pr-24 font-display text-xl leading-tight">
          {tournament.name}
        </h3>

        <div className="mb-4 grid grid-cols-2 gap-4 border-t border-border pt-3">
          <div>
            <p className="mb-1 text-xs tracking-wider text-muted-foreground uppercase">
              Tim
            </p>
            <p className="text-sm font-bold">{tournament.teamCount} tim</p>
          </div>
          <div>
            <p className="mb-1 text-xs tracking-wider text-muted-foreground uppercase">
              Biaya daftar
            </p>
            <p className="font-mono text-sm text-secondary tabular-nums">
              {tournament.entryFee} USDT/tim
            </p>
          </div>
        </div>

        <div className="mt-auto rounded-lg border border-foreground bg-background p-3">
          <div className="mb-1 flex items-center justify-between">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
              Pot hadiah
              {tournament.status !== "finished" && (
                <span
                  aria-hidden
                  className="size-2 rounded-full bg-secondary motion-safe:animate-pulse"
                />
              )}
            </p>
            <p className="text-xs text-muted-foreground">target penuh</p>
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
