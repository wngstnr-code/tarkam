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
    <main className="mx-auto max-w-2xl space-y-8 p-6 pt-10">
      <header className="space-y-3 text-center">
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">
          Hadiah turnamen yang{" "}
          <span className="text-primary">tak bisa dibawa kabur</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Brankas hadiah on-chain untuk turnamen tarkam — semua orang bisa
          mengawasi potnya, payout juara tercatat permanen.
        </p>
        <Button asChild size="lg" className="font-semibold">
          <Link href="/tournament/new">+ Turnamen Baru</Link>
        </Button>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-muted-foreground">
          Turnamenmu
        </h2>
        {tournaments === undefined ? null : tournaments.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center">
            <p className="mb-1 text-2xl" aria-hidden>
              ⚽
            </p>
            <p className="text-sm text-muted-foreground">
              Belum ada turnamen. Buat yang pertama — brankas hadiah on-chain
              dibuat otomatis.
            </p>
          </div>
        ) : (
          tournaments.map((t) => <TournamentCard key={t.id} tournament={t} />)
        )}
      </section>
    </main>
  );
}
