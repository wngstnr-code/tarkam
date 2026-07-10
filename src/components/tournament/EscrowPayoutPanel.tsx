"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useEscrowState } from "@/hooks/useEscrowState";
import {
  proposeEscrowPayout,
  approveEscrowPayout,
  executeEscrowPayout,
} from "@/lib/escrow/write";
import { humanizeTxError } from "@/lib/wallet/errors";
import { addPayout, updateTournament } from "@/lib/db/repo";
import { parseUSDT, shortenAddress } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import type { Payout, Prize, Team, Tournament } from "@/types";

type Action = "propose" | "approve" | "execute";

/**
 * Payout mode escrow — tiga langkah on-chain, semua via WDK:
 * 1. proposePayout: panitia mengusulkan pemenang (terkunci: harus tim penyetor).
 * 2. approvePayout: tim-tim penyetor menyetujui (M-of-N, threshold dari kontrak).
 * 3. executePayout: SEMUA hadiah dibayar dalam SATU transaksi + surplus ke panitia.
 */
export function EscrowPayoutPanel({
  tournament,
  rows,
  payouts,
}: {
  tournament: Tournament;
  rows: { prize: Prize; team: Team }[];
  payouts: Payout[];
}) {
  const { t } = useI18n();
  const { unlockSeed } = useWdkWallet();
  const { state, refresh } = useEscrowState(tournament.escrowId, 10_000);
  const [action, setAction] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastHash, setLastHash] = useState<string | null>(null);

  const escrowId = tournament.escrowId!;
  const executedHash = payouts.find((p) => p.txHash)?.txHash ?? null;

  // Pemenang menurut bracket, urut rank — wajib punya alamat kapten & unik.
  const winnerAddresses = rows.map((r) => r.team.captainAddress);
  const missingAddress = winnerAddresses.some((a) => !a);
  const duplicated =
    new Set(winnerAddresses.filter(Boolean)).size !==
    winnerAddresses.filter(Boolean).length;
  const canPropose =
    !missingAddress && !duplicated && rows.length === tournament.prizes.length;

  async function run(action: Action, password: string) {
    setError(null);
    const seed = await unlockSeed(password);
    try {
      if (action === "propose") {
        const { hash } = await proposeEscrowPayout(
          seed,
          escrowId,
          winnerAddresses as string[]
        );
        setLastHash(hash);
      } else if (action === "approve") {
        const { hash } = await approveEscrowPayout(seed, escrowId);
        setLastHash(hash);
      } else {
        const { hash } = await executeEscrowPayout(seed, escrowId);
        setLastHash(hash);
        // Catat resi per rank (satu tx untuk semua hadiah) + tutup turnamen.
        for (const row of rows) {
          await addPayout({
            id: crypto.randomUUID(),
            tournamentId: tournament.id,
            teamId: row.team.id,
            rank: row.prize.rank,
            amount: row.prize.amount,
            txHash: hash,
            status: "sent",
            createdAt: Date.now(),
          });
        }
        await updateTournament(tournament.id, { status: "finished" });
      }
      await refresh();
    } catch (e) {
      throw new Error(humanizeTxError(e));
    }
  }

  const status = state?.status;
  const approvals = state?.approvals ?? 0;
  const threshold = state?.approvalThreshold ?? 0;
  const totalPrizes = tournament.prizes.reduce(
    (acc, p) => acc + parseUSDT(p.amount),
    0n
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">
          {t("ep.title")}{" "}
          <Badge variant="secondary" className="ml-1 align-middle">
            {t("pp.escrow_badge")}
          </Badge>
        </CardTitle>
        <CardDescription>{t("ep.desc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Daftar pemenang menurut bracket */}
        <div className="space-y-2 rounded-lg border border-foreground/25 bg-muted/40 p-4 text-sm">
          {rows.map(({ prize, team }) => (
            <div key={prize.rank} className="flex items-center justify-between gap-2">
              <span className="text-xs tracking-wider text-muted-foreground uppercase">
                {t("td.rank", { n: prize.rank })}
              </span>
              <span className="min-w-0 flex-1 truncate px-2 font-bold">
                {team.name}
                <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                  {team.captainAddress
                    ? shortenAddress(team.captainAddress)
                    : t("tl.not_set")}
                </span>
              </span>
              <span className="font-mono tabular-nums">{prize.amount} USDT</span>
            </div>
          ))}
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-xs tracking-wider text-muted-foreground uppercase">
              {t("ep.total")}
            </span>
            <span className="font-mono text-lg font-bold text-secondary tabular-nums">
              {tournament.prizes
                .reduce((acc, p) => acc + Number(p.amount), 0)
                .toString()}{" "}
              USDT
            </span>
          </div>
        </div>

        {missingAddress && (
          <p className="text-sm text-amber-600">{t("ep.missing_addr")}</p>
        )}
        {duplicated && <p className="text-sm text-amber-600">{t("ep.dup_addr")}</p>}
        {state && state.pot < totalPrizes && status === "open" && (
          <p className="text-sm text-amber-600">{t("ep.pot_short")}</p>
        )}

        {/* Langkah on-chain sesuai status kontrak */}
        {status === "paid" || executedHash ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-secondary">{t("ep.done")}</p>
            {(executedHash ?? lastHash) && (
              <TxReceipt hash={(executedHash ?? lastHash)!} label={t("ep.receipt")} />
            )}
          </div>
        ) : status === "proposed" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-foreground/25 p-3 text-sm">
              <span>{t("ep.approvals")}</span>
              <span className="font-mono text-lg font-bold tabular-nums">
                {approvals} / {threshold}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{t("ep.approve_hint")}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="outline" onClick={() => setAction("approve")}>
                {t("ep.approve_btn")}
              </Button>
              <Button
                disabled={approvals < threshold}
                onClick={() => setAction("execute")}
              >
                {t("ep.execute_btn")}
              </Button>
            </div>
            {lastHash && <TxReceipt hash={lastHash} label={t("ep.last_tx")} />}
          </div>
        ) : (
          <Button
            className="w-full"
            disabled={!canPropose || !state}
            onClick={() => setAction("propose")}
          >
            {t("ep.propose_btn")}
          </Button>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>

      <UnlockDialog
        open={action !== null}
        onOpenChange={(o) => !o && setAction(null)}
        title={
          action === "propose"
            ? t("ep.unlock_propose")
            : action === "approve"
              ? t("ep.unlock_approve")
              : t("ep.unlock_execute")
        }
        description={t("ep.unlock_desc")}
        confirmLabel={t("ep.unlock_confirm")}
        onUnlock={async (password) => {
          if (action) await run(action, password);
        }}
      />
    </Card>
  );
}
