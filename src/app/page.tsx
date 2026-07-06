"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/button";
import { TournamentCard } from "@/components/tournament/TournamentCard";
import { useWdkWallet } from "@/hooks/useWdkWallet";
import { listTournaments } from "@/lib/db/repo";
import { AddressChip } from "@/components/common/AddressChip";

export default function DashboardPage() {
  const router = useRouter();
  const { address, hydrated } = useWdkWallet();
  const tournaments = useLiveQuery(listTournaments, []);

  useEffect(() => {
    if (hydrated && !address) router.replace("/onboarding");
  }, [hydrated, address, router]);

  if (!hydrated || !address) return null;

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6 pt-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">⚽ Tarkam</h1>
          <p className="text-sm text-muted-foreground">
            Hadiah turnamen yang tak bisa dibawa kabur.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AddressChip address={address} />
          <Button variant="outline" size="sm" asChild>
            <Link href="/wallet">Dompet</Link>
          </Button>
        </div>
      </header>

      <Button asChild className="w-full">
        <Link href="/tournament/new">+ Turnamen baru</Link>
      </Button>

      <section className="space-y-3">
        {tournaments === undefined ? null : tournaments.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Belum ada turnamen. Buat yang pertama — brankas hadiah on-chain
            dibuat otomatis.
          </div>
        ) : (
          tournaments.map((t) => <TournamentCard key={t.id} tournament={t} />)
        )}
      </section>
    </main>
  );
}
