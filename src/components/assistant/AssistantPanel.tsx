"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TxReceipt } from "@/components/common/TxReceipt";
import { UnlockDialog } from "@/components/wallet/UnlockDialog";
import { useWdkWallet } from "@/hooks/useWdkWallet";
import type { EscrowTournamentState } from "@/lib/escrow/read";
import { proposeEscrowPayout, cancelEscrow } from "@/lib/escrow/write";
import { humanizeTxError } from "@/lib/wallet/errors";
import { putMatches, updateTournament } from "@/lib/db/repo";
import { generateBracket, getWinners, isFinished } from "@/lib/bracket/engine";
import { computePayoutRows } from "@/lib/bracket/payout";
import { formatUSDT, shortenAddress } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import {
  parseIntent,
  type AssistantContext,
  type Draft,
} from "@/lib/assistant/intents";
import type { Match, Team, Tournament } from "@/types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  txHash?: string;
}

/** Draft aksi yang butuh approval; "draft" adalah satu-satunya variant Draft yang menuntut persetujuan. */
type PendingDraft = Extract<Draft, { type: "draft" }>;

/**
 * "Wasit AI" — panel asisten rule-based di halaman detail turnamen.
 * Tidak ada aksi yang dieksekusi tanpa klik "Setujui" (+ password untuk aksi on-chain).
 */
export function AssistantPanel({
  tournament,
  teams,
  matches,
  escrowState,
  refreshEscrow,
}: {
  tournament: Tournament;
  teams: Team[];
  matches: Match[];
  /** State escrow on-chain dari poller tunggal milik halaman (null pada mode simple). */
  escrowState: EscrowTournamentState | null;
  refreshEscrow: () => Promise<void>;
}) {
  const { t } = useI18n();
  const { unlockSeed } = useWdkWallet();
  const isEscrow = tournament.mode === "escrow";

  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [pendingDraft, setPendingDraft] = useState<PendingDraft | null>(null);
  const [unlockFor, setUnlockFor] = useState<
    "propose_payout" | "cancel_tournament" | null
  >(null);
  const [busy, setBusy] = useState(false);

  function pushAssistant(text: string, txHash?: string) {
    setHistory((h) => [
      ...h,
      { id: crypto.randomUUID(), role: "assistant", text, txHash },
    ]);
  }

  function buildContext(): AssistantContext {
    const paidTeams = teams
      .filter((tm) => tm.paid)
      .map((tm) => ({ id: tm.id, name: tm.name }));
    const teamById = (id?: string) => teams.find((tm) => tm.id === id);
    const finished = matches.length > 0 && isFinished(matches);
    const winners = matches.length > 0 ? getWinners(matches) : null;

    // Pemetaan hadiah→pemenang dari modul bersama — identik dengan PayoutDialog.
    const payoutRows = computePayoutRows(tournament.prizes, teams, matches).map((r) => ({
      rank: r.prize.rank,
      teamName: r.team.name,
      address: r.team.captainAddress,
      amount: r.prize.amount,
    }));

    return {
      tournamentStatus: tournament.status,
      isEscrow,
      paidTeams,
      totalTeams: teams.length,
      bracketFinished: finished,
      championName: finished && winners ? teamById(winners.champion)?.name : undefined,
      payoutRows,
      prizeCount: tournament.prizes.length,
      escrow:
        isEscrow && escrowState
          ? {
              status: escrowState.status,
              pot: formatUSDT(escrowState.pot),
              approvals: escrowState.approvals,
              threshold: escrowState.approvalThreshold,
            }
          : undefined,
    };
  }

  function describeResult(result: Draft): { text: string; asDraft: PendingDraft | null } {
    switch (result.type) {
      case "draft":
        return { text: "", asDraft: result };
      case "status": {
        const d = result.data;
        const lines = [
          t("as.status.header", { status: t(statusKey(d.tournamentStatus)) }),
          t("as.status.teams", { paid: d.paidCount, total: d.totalCount }),
          d.bracketState === "finished"
            ? t("as.status.bracket_finished", { name: d.championName ?? "" })
            : d.bracketState === "running"
              ? t("as.status.bracket_running")
              : t("as.status.bracket_none"),
        ];
        if (d.isEscrow && d.escrow) {
          lines.push(t("as.status.escrow_pot", { pot: d.escrow.pot }));
          lines.push(
            t("as.status.escrow_approvals", {
              approvals: d.escrow.approvals,
              threshold: d.escrow.threshold,
            })
          );
          lines.push(t("as.status.escrow_status", { status: d.escrow.status }));
        }
        return { text: lines.join("\n"), asDraft: null };
      }
      case "guard_error":
        return {
          text: t(`as.guard.${result.reason}`, { n: result.count ?? 0 }),
          asDraft: null,
        };
      case "unknown":
      default:
        return { text: t("as.unknown"), asDraft: null };
    }
  }

  function statusKey(status: Tournament["status"]) {
    if (status === "cancelled") return "td.status_cancelled" as const;
    if (status === "finished") return "td.status_finished" as const;
    if (status === "running") return "td.status_running" as const;
    return "td.status_registration" as const;
  }

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setHistory((h) => [...h, { id: crypto.randomUUID(), role: "user", text }]);

    const result = parseIntent(text, buildContext());
    if (!result) return;
    const { text: reply, asDraft } = describeResult(result);
    if (asDraft) {
      setPendingDraft(asDraft);
    } else {
      pushAssistant(reply);
    }
  }

  async function runCreateBracket() {
    setBusy(true);
    try {
      const paid = teams.filter((tm) => tm.paid);
      const bracket = generateBracket(tournament.id, paid);
      await putMatches(bracket);
      await updateTournament(tournament.id, { status: "running" });
      setPendingDraft(null);
      pushAssistant(t("as.result.create_bracket_done"));
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      pushAssistant(t("as.result.error", { message }));
    } finally {
      setBusy(false);
    }
  }

  async function runOnChain(password: string) {
    if (!unlockFor) return;
    const seed = await unlockSeed(password);
    try {
      if (unlockFor === "propose_payout" && pendingDraft?.action === "propose_payout") {
        const winnerAddresses = pendingDraft.rows.map((r) => r.address);
        const { hash } = await proposeEscrowPayout(
          seed,
          tournament.escrowId!,
          winnerAddresses
        );
        setPendingDraft(null);
        pushAssistant(t("as.result.propose_payout_done"), hash);
      } else if (unlockFor === "cancel_tournament") {
        const { hash } = await cancelEscrow(seed, tournament.escrowId!);
        await updateTournament(tournament.id, { status: "cancelled" });
        setPendingDraft(null);
        pushAssistant(t("as.result.cancel_done"), hash);
      }
      await refreshEscrow();
    } catch (e) {
      const message = humanizeTxError(e);
      pushAssistant(t("as.result.error", { message }));
      throw new Error(message);
    }
  }

  function approveDraft() {
    if (!pendingDraft) return;
    if (pendingDraft.action === "create_bracket") {
      runCreateBracket();
    } else if (pendingDraft.action === "propose_payout") {
      setUnlockFor("propose_payout");
    } else if (pendingDraft.action === "cancel_tournament") {
      setUnlockFor("cancel_tournament");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-xl">
          {t("as.title")}
          <Badge variant="secondary" className="align-middle">
            {t("as.badge")}
          </Badge>
        </CardTitle>
        <CardDescription>{t("as.desc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {history.length === 0 && !pendingDraft && (
            <p className="text-sm text-muted-foreground">{t("as.empty")}</p>
          )}
          {history.map((msg) => (
            <div
              key={msg.id}
              className={
                msg.role === "user"
                  ? "ml-auto max-w-[85%] rounded-xl border border-foreground bg-primary px-3 py-2 text-sm text-primary-foreground shadow-hard-xs"
                  : "mr-auto max-w-[85%] space-y-2 rounded-xl border border-foreground/25 bg-muted/40 px-3 py-2 text-sm"
              }
            >
              <p className="whitespace-pre-line">{msg.text}</p>
              {msg.txHash && <TxReceipt hash={msg.txHash} />}
            </div>
          ))}

          {pendingDraft && (
            <div className="mr-auto max-w-[95%] space-y-3 rounded-xl border-2 border-foreground bg-card p-4 shadow-hard-sm">
              {pendingDraft.action === "create_bracket" && (
                <>
                  <p className="font-display text-lg">
                    {t("as.draft.create_bracket.title")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("as.draft.create_bracket.detail", {
                      n: pendingDraft.teams.length,
                    })}
                  </p>
                  <ul className="list-inside list-disc text-sm">
                    {pendingDraft.teams.map((tm) => (
                      <li key={tm.id}>{tm.name}</li>
                    ))}
                  </ul>
                </>
              )}

              {pendingDraft.action === "propose_payout" && (
                <>
                  <p className="font-display text-lg">
                    {t("as.draft.propose_payout.title")}
                  </p>
                  <div className="space-y-2 rounded-lg border border-foreground/25 bg-muted/40 p-3 text-sm">
                    {pendingDraft.rows.map((r) => (
                      <div key={r.rank} className="flex items-center justify-between gap-2">
                        <span className="text-xs tracking-wider text-muted-foreground uppercase">
                          {t("td.rank", { n: r.rank })}
                        </span>
                        <span className="min-w-0 flex-1 truncate px-2 font-bold">
                          {r.teamName}
                          <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                            {shortenAddress(r.address)}
                          </span>
                        </span>
                        <span className="font-mono tabular-nums">{r.amount} USDT</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("as.draft.propose_payout.note", { n: pendingDraft.threshold })}
                  </p>
                </>
              )}

              {pendingDraft.action === "cancel_tournament" && (
                <>
                  <p className="font-display text-lg">
                    {t("as.draft.cancel_tournament.title")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("as.draft.cancel_tournament.detail")}
                  </p>
                </>
              )}

              <Separator />
              <div className="flex gap-2">
                <Button className="flex-1" disabled={busy} onClick={approveDraft}>
                  {t("as.approve")}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={busy}
                  onClick={() => setPendingDraft(null)}
                >
                  {t("as.cancel_btn")}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={t("as.placeholder")}
          />
          <Button onClick={handleSend}>{t("as.send")}</Button>
        </div>
      </CardContent>

      <UnlockDialog
        open={unlockFor !== null}
        onOpenChange={(o) => !o && setUnlockFor(null)}
        title={
          unlockFor === "propose_payout"
            ? t("as.unlock.propose_title")
            : t("as.unlock.cancel_title")
        }
        description={t("as.unlock.desc")}
        confirmLabel={t("as.unlock.confirm")}
        onUnlock={runOnChain}
      />
    </Card>
  );
}
