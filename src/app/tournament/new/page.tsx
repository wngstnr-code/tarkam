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
      <Card>
        <CardHeader>
          <CardTitle>Turnamen baru</CardTitle>
          <CardDescription>
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
