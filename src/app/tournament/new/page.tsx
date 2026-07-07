"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TournamentForm } from "@/components/tournament/TournamentForm";

export default function NewTournamentPage() {
  return (
    <main className="mx-auto max-w-lg space-y-6 p-6 pt-12">
      <Card className="shadow-hard">
        <CardHeader className="relative overflow-hidden border-b border-foreground/20 pb-4">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-6 -right-4 text-8xl opacity-10 select-none"
          >
            ⚽
          </span>
          <CardTitle className="relative z-10 font-display text-2xl text-primary">
            Turnamen Baru
          </CardTitle>
          <CardDescription className="relative z-10">
            Satu turnamen = satu brankas hadiah on-chain. Alamatnya publik —
            semua tim bisa memantau saldonya.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TournamentForm />
        </CardContent>
      </Card>
    </main>
  );
}
