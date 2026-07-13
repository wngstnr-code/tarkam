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
import { UnknownDepositors } from "@/components/tournament/UnknownDepositors";
import { AddTeamDialog } from "@/components/tournament/AddTeamDialog";
import { BracketView } from "@/components/tournament/BracketView";
import { PayoutDialog } from "@/components/tournament/PayoutDialog";
import { EscrowPayoutPanel } from "@/components/tournament/EscrowPayoutPanel";
import { EscrowRefundPanel } from "@/components/tournament/EscrowRefundPanel";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";
import { ShareJoinLink } from "@/components/tournament/ShareJoinLink";
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
import { computePayoutRows } from "@/lib/bracket/payout";
import { useEscrowState } from "@/hooks/useEscrowState";
import { useI18n } from "@/lib/i18n/context";
import type { Team } from "@/types";

export default function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { t } = useI18n();
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

  // SATU-satunya poller state escrow on-chain di halaman ini — hasilnya
  // dibagikan ke PoolPanel/PayoutPanel/RefundPanel/AssistantPanel via props,
  // bukan 4 polling loop identik ke RPC publik.
  const escrow = useEscrowState(
    tournament?.mode === "escrow" ? tournament.escrowId : undefined,
    10_000
  );

  if (tournament === undefined) return null;
  if (tournament === null || !tournament) {
    return (
      <main className="mx-auto max-w-2xl p-6 pt-12 text-center text-sm text-muted-foreground">
        {t("td.not_found")}{" "}
        <Link href="/" className="underline">
          {t("td.back")}
        </Link>
      </main>
    );
  }

  const paidTeams = teams.filter((t) => t.paid);
  const finished = matches.length > 0 && isFinished(matches);
  const winners = matches.length > 0 ? getWinners(matches) : null;
  const isEscrow = tournament.mode === "escrow";
  const cancelled = tournament.status === "cancelled";

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

  // Aturan pemetaan hadiah→pemenang hidup di satu tempat (dipakai juga Wasit AI).
  const payoutRows = computePayoutRows(tournament.prizes, teams, matches);

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6 pt-10">
      <header className="flex items-end justify-between gap-4">
        <div>
          <Link
            href="/"
            className="text-xs font-semibold tracking-wider text-primary uppercase hover:underline"
          >
            {t("td.all_tournaments")}
          </Link>
          <h1 className="mt-1 font-display text-4xl leading-none">
            {tournament.name}
          </h1>
          <p className="mt-2 text-xs tracking-wider text-muted-foreground uppercase">
            {t("td.meta", {
              count: tournament.teamCount,
              fee: tournament.entryFee,
            })}
          </p>
        </div>
        <Badge
          className="shrink-0 shadow-hard-xs"
          variant={
            cancelled
              ? "destructive"
              : finished
                ? "outline"
                : tournament.status === "running"
                  ? "secondary"
                  : "default"
          }
        >
          {cancelled
            ? t("td.status_cancelled")
            : finished
              ? t("td.status_finished")
              : tournament.status === "running"
                ? t("td.status_running")
                : t("td.status_registration")}
        </Badge>
      </header>

      <PoolPanel
        tournament={tournament}
        escrowState={escrow.state}
        escrowError={escrow.error}
      />

      {/* Mode escrow: link/QR untuk kapten daftar & menyetujui dari HP-nya sendiri */}
      {isEscrow &&
        tournament.escrowId !== undefined &&
        !cancelled &&
        tournament.status !== "finished" && (
          <ShareJoinLink
            escrowId={tournament.escrowId}
            tournamentName={tournament.name}
          />
        )}

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="font-display text-xl">
              {t("td.teams")}{" "}
              <span className="text-sm text-muted-foreground normal-case">
                {t("td.teams_count", {
                  paid: paidTeams.length,
                  total: teams.length,
                })}
              </span>
            </CardTitle>
            <CardDescription>{t("td.teams_desc")}</CardDescription>
          </div>
          {tournament.status === "setup" && (
            <AddTeamDialog
              tournament={tournament}
              disabled={teams.length >= tournament.teamCount}
            />
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isEscrow && tournament.status === "setup" && (
            <UnknownDepositors
              tournament={tournament}
              teams={teams}
              escrowTeamCount={escrow.state?.teamCount}
            />
          )}
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
            {t("td.start_btn", { n: paidTeams.length })}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )}

      {matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">{t("td.bracket")}</CardTitle>
          </CardHeader>
          <CardContent>
            <BracketView matches={matches} teams={teams} />
          </CardContent>
        </Card>
      )}

      {finished && winners && !cancelled && (
        <section className="space-y-4">
          <div className="border-b-2 border-foreground pb-3">
            <h2 className="font-display text-2xl">
              {t("td.champion", { name: teamById(winners.champion)?.name ?? "" })}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isEscrow ? t("td.payout_desc_escrow") : t("td.payout_desc")}
            </p>
          </div>
          {isEscrow ? (
            <EscrowPayoutPanel
              tournament={tournament}
              rows={payoutRows}
              payouts={payouts}
              escrowState={escrow.state}
              refreshEscrow={escrow.refresh}
            />
          ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {payoutRows.map(({ prize, team }) => {
              const paid = payouts.find(
                (p) => p.rank === prize.rank && p.txHash
              );
              return (
                <div
                  key={prize.rank}
                  className="flex flex-col rounded-xl border border-foreground bg-card p-5 shadow-hard-sm"
                >
                  <p className="text-xs tracking-wider text-muted-foreground uppercase">
                    {t("td.rank", { n: prize.rank })}
                  </p>
                  <p className="mt-1 font-display text-xl leading-tight">
                    {team.name}
                  </p>
                  <p
                    className={`mt-3 mb-5 font-mono text-2xl tabular-nums ${
                      paid?.txHash
                        ? "text-muted-foreground opacity-70"
                        : "text-foreground"
                    }`}
                  >
                    {prize.amount} USDT
                  </p>
                  <div className="mt-auto">
                    {paid?.txHash ? (
                      <TxReceipt hash={paid.txHash} label={t("td.paid_receipt")} />
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() =>
                          setPayoutTarget({
                            team,
                            rank: prize.rank,
                            amount: prize.amount,
                          })
                        }
                      >
                        {t("td.pay_prize")}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </section>
      )}

      {/* Mode escrow: zona batal (sebelum payout) / panel refund (setelah batal) */}
      {isEscrow && tournament.status !== "finished" && (
        <EscrowRefundPanel
          tournament={tournament}
          teams={teams}
          escrowState={escrow.state}
          refreshEscrow={escrow.refresh}
        />
      )}

      {tournament.status !== "finished" && (
        <AssistantPanel
          tournament={tournament}
          teams={teams}
          matches={matches}
          escrowState={escrow.state}
          refreshEscrow={escrow.refresh}
        />
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
