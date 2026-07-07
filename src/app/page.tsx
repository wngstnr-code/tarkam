"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/button";
import { TournamentCard } from "@/components/tournament/TournamentCard";
import { useWdkWallet } from "@/hooks/useWdkWallet";
import { listTournaments } from "@/lib/db/repo";

export default function DashboardPage() {
  const router = useRouter();
  const { address, hydrated } = useWdkWallet();
  const tournaments = useLiveQuery(listTournaments, []);

  useEffect(() => {
    if (hydrated && !address) router.replace("/onboarding");
  }, [hydrated, address, router]);

  if (!hydrated || !address) return null;

  return (
    <main className="mx-auto max-w-5xl space-y-10 p-6 pt-10">
      <section className="pitch-texture relative overflow-hidden rounded-xl border border-foreground bg-muted/60 p-8 shadow-hard md:p-10">
        <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl space-y-3">
            <h1 className="font-display text-4xl leading-none sm:text-6xl">
              Hadiah turnamen yang{" "}
              <span className="text-primary">tak bisa dibawa kabur</span>
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Brankas hadiah on-chain untuk turnamen tarkam — semua orang bisa
              mengawasi potnya, payout juara tercatat permanen.
            </p>
          </div>
          <Button asChild size="lg" className="px-6 text-base whitespace-nowrap">
            <Link href="/tournament/new">+ Turnamen Baru</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between border-b-2 border-foreground pb-3">
          <h2 className="font-display text-2xl">Turnamenmu</h2>
          {tournaments !== undefined && tournaments.length > 0 && (
            <p className="text-xs tracking-wider text-muted-foreground uppercase">
              {tournaments.length} turnamen
            </p>
          )}
        </div>
        {tournaments === undefined ? null : tournaments.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-foreground/30 bg-card/50 p-10 text-center">
            <p className="mb-3 text-5xl" aria-hidden>
              ⚽
            </p>
            <p className="mb-1 font-display text-xl text-muted-foreground">
              Belum ada turnamen
            </p>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              Area ini masih sepi. Buat yang pertama — brankas hadiah on-chain
              dibuat otomatis.
            </p>
            <Button asChild variant="outline">
              <Link href="/tournament/new">Buat yang pertama</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
