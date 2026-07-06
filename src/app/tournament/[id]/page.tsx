"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PoolPanel } from "@/components/tournament/PoolPanel";
import { TeamList } from "@/components/tournament/TeamList";
import { AddTeamDialog } from "@/components/tournament/AddTeamDialog";
import { BracketView } from "@/components/tournament/BracketView";
import { PayoutDialog } from "@/components/tournament/PayoutDialog";
import { TxReceipt } from "@/components/common/TxReceipt";
import {
  getTournament,
  listTeams,
  listMatches,
  listPayouts,
  putMatches,
  updateTournament,
} from "@/lib/db/repo";
import { generateBracket, getWinners, isFinished } from "@/lib/bracket/engine";
import type { Team } from "@/types";

export default function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const tournament = useLiveQuery(() => getTournament(id), [id]);
  const teams = useLiveQuery(() => listTeams(id), [id]) ?? [];
  const matches = useLiveQuery(() => listMatches(id), [id]) ?? [];
  const payouts = useLiveQuery(() => listPayouts(id), [id]) ?? [];

  const [payoutTarget, setPayoutTarget] = useState<{
    team: Team;
    rank: number;
    amount: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (tournament === undefined) return null;
  if (tournament === null || !tournament) {
    return (
      <main className="mx-auto max-w-2xl p-6 pt-12 text-center text-sm text-muted-foreground">
        Turnamen tidak ditemukan.{" "}
        <Link href="/" className="underline">
          Kembali
        </Link>
      </main>
    );
  }

  const paidTeams = teams.filter((t) => t.paid);
  const finished = matches.length > 0 && isFinished(matches);
  const winners = matches.length > 0 ? getWinners(matches) : null;

  async function startTournament() {
    setError(null);
    try {
      const bracket = generateBracket(id, paidTeams);
      await putMatches(bracket);
      await updateTournament(id, { status: "running" });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  const teamById = (tid?: string) => teams.find((t) => t.id === tid);

  // Baris payout: juara 1, 2 (juara 3 dibayar manual dua kali di sub II — MVP: rank 1 & 2 + kedua semifinalis kalah utk rank 3 dibagi manual)
  const payoutRows = finished && winners
    ? tournament.prizes
        .map((prize) => {
          const teamId =
            prize.rank === 1
              ? winners.champion
              : prize.rank === 2
                ? winners.runnerUp
                : winners.semifinalLosers[0]; // MVP: juara 3 = semifinalis kalah pertama
          return { prize, team: teamById(teamId) };
        })
        .filter((r): r is { prize: (typeof tournament.prizes)[0]; team: Team } => !!r.team)
    : [];

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6 pt-10">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            ← Semua turnamen
          </Link>
          <h1 className="font-display text-3xl">{tournament.name}</h1>
          <p className="text-sm text-muted-foreground">
            {tournament.teamCount} tim · {tournament.entryFee} USDT/tim · sistem
            gugur
          </p>
        </div>
        <Badge variant={finished ? "secondary" : "default"}>
          {finished
            ? "Selesai"
            : tournament.status === "running"
              ? "Berjalan"
              : "Pendaftaran"}
        </Badge>
      </header>

      <PoolPanel tournament={tournament} />

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Tim ({paidTeams.length} lunas / {teams.length} terdaftar)</CardTitle>
            <CardDescription>
              &quot;Lunas&quot; hanya bisa ditandai bila saldo pool on-chain
              sudah menutup biayanya.
            </CardDescription>
          </div>
          {tournament.status === "setup" && (
            <AddTeamDialog
              tournamentId={id}
              disabled={teams.length >= tournament.teamCount}
            />
          )}
        </CardHeader>
        <CardContent>
          <TeamList
            tournament={tournament}
            teams={teams}
            locked={tournament.status !== "setup"}
          />
        </CardContent>
      </Card>

      {tournament.status === "setup" && (
        <div className="space-y-2">
          <Button
            className="w-full"
            disabled={paidTeams.length < 2}
            onClick={startTournament}
          >
            Mulai turnamen ({paidTeams.length} tim lunas) — susun bracket
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )}

      {matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bracket</CardTitle>
          </CardHeader>
          <CardContent>
            <BracketView matches={matches} teams={teams} />
          </CardContent>
        </Card>
      )}

      {finished && winners && (
        <Card>
          <CardHeader>
            <CardTitle>
              🏆 Juara: {teamById(winners.champion)?.name}
            </CardTitle>
            <CardDescription>
              Bayar hadiah on-chain — resi = hash transaksi, bisa diaudit siapa
              pun.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {payoutRows.map(({ prize, team }) => {
              const paid = payouts.find(
                (p) => p.rank === prize.rank && p.txHash
              );
              return (
                <div
                  key={prize.rank}
                  className="flex items-center justify-between gap-3 rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">
                      Juara {prize.rank}: {team.name}
                    </p>
                    <p className="text-sm text-muted-foreground tabular-nums">
                      {prize.amount} USDT
                    </p>
                  </div>
                  {paid?.txHash ? (
                    <TxReceipt hash={paid.txHash} label="Dibayar ✓" />
                  ) : (
                    <Button
                      onClick={() =>
                        setPayoutTarget({
                          team,
                          rank: prize.rank,
                          amount: prize.amount,
                        })
                      }
                    >
                      Bayar hadiah
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {payoutTarget && (
        <PayoutDialog
          open={!!payoutTarget}
          onOpenChange={(o) => !o && setPayoutTarget(null)}
          tournament={tournament}
          team={payoutTarget.team}
          rank={payoutTarget.rank}
          amount={payoutTarget.amount}
          onPaid={async () => {
            await updateTournament(id, { status: "finished" });
          }}
        />
      )}
    </main>
  );
}
