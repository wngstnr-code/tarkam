"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { shortenAddress } from "@/lib/format";
import type { Tournament } from "@/types";

const STATUS_LABEL: Record<Tournament["status"], string> = {
  setup: "Pendaftaran",
  running: "Berjalan",
  finished: "Selesai",
};

export function TournamentCard({ tournament }: { tournament: Tournament }) {
  return (
    <Link href={`/tournament/${tournament.id}`} className="block">
      <Card className="transition-colors hover:bg-muted/40">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">{tournament.name}</CardTitle>
          <Badge
            variant={tournament.status === "finished" ? "secondary" : "default"}
          >
            {STATUS_LABEL[tournament.status]}
          </Badge>
        </CardHeader>
        <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {tournament.teamCount} tim · {tournament.entryFee} USDT/tim
          </span>
          <span className="font-mono">{shortenAddress(tournament.poolAddress)}</span>
        </CardContent>
      </Card>
    </Link>
  );
}
