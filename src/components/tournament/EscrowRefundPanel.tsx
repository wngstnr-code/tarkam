"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TxReceipt } from "@/components/common/TxReceipt";
import { UnlockDialog } from "@/components/wallet/UnlockDialog";
import { useWdkWallet } from "@/hooks/useWdkWallet";
import { isRefundOpen, type EscrowTournamentState } from "@/lib/escrow/read";
import { cancelEscrow, claimEscrowRefund } from "@/lib/escrow/write";
import { humanizeTxError } from "@/lib/wallet/errors";
import { updateTournament } from "@/lib/db/repo";
import { shortenAddress } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import type { Team, Tournament } from "@/types";

/**
 * Pembatalan & refund (mode escrow):
 * - cancel: panitia membatalkan turnamen di kontrak → jalur refund terbuka.
 * - claimRefund: tarik kembali biaya daftar tiap tim — dana SELALU ke alamat
 *   tim (ditegakkan kontrak), siapa pun yang menekan tombolnya.
 */
export function EscrowRefundPanel({
  tournament,
  teams,
  escrowState: state,
  refreshEscrow: refresh,
}: {
  tournament: Tournament;
  teams: Team[];
  /** State escrow on-chain dari poller tunggal milik halaman. */
  escrowState: EscrowTournamentState | null;
  refreshEscrow: () => Promise<void>;
}) {
  const { t } = useI18n();
  const { unlockSeed } = useWdkWallet();
  const [action, setAction] = useState<
    { kind: "cancel" } | { kind: "refund"; team: Team } | null
  >(null);
  const [refundHashes, setRefundHashes] = useState<Record<string, string>>({});

  // Selector bersama dengan halaman /join: refund terbuka bila dibatalkan
  // ATAU deadline lewat (proteksi "panitia menghilang" di kontrak).
  const refundOpen = !!state && isRefundOpen(state);
  const paidTeams = teams.filter((team) => team.paid && team.captainAddress);

  async function run(password: string) {
    if (!action) return;
    const seed = await unlockSeed(password);
    try {
      if (action.kind === "cancel") {
        await cancelEscrow(seed, tournament.escrowId!);
        await updateTournament(tournament.id, { status: "cancelled" });
      } else {
        const { hash } = await claimEscrowRefund(
          seed,
          tournament.escrowId!,
          action.team.captainAddress!
        );
        setRefundHashes((prev) => ({ ...prev, [action.team.id]: hash }));
      }
      await refresh();
    } catch (e) {
      throw new Error(humanizeTxError(e));
    }
  }

  if (!refundOpen) {
    // Refund belum terbuka: tampilkan hanya tombol cancel kecil (zona hati-hati).
    return (
      <>
        <div className="flex items-center justify-between rounded-xl border border-destructive/40 bg-destructive/5 p-4">
          <div>
            <p className="text-sm font-semibold">{t("er.cancel_title")}</p>
            <p className="text-xs text-muted-foreground">{t("er.cancel_desc")}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 border-destructive/50 text-destructive hover:bg-destructive/10"
            onClick={() => setAction({ kind: "cancel" })}
          >
            {t("er.cancel_btn")}
          </Button>
        </div>
        <UnlockDialog
          open={action !== null}
          onOpenChange={(o) => !o && setAction(null)}
          title={t("er.cancel_unlock_title")}
          description={t("er.cancel_unlock_desc")}
          confirmLabel={t("er.cancel_confirm")}
          onUnlock={run}
        />
      </>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">{t("er.refund_title")}</CardTitle>
        <CardDescription>{t("er.refund_desc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {paidTeams.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("er.no_teams")}</p>
        )}
        {paidTeams.map((team) => (
          <div
            key={team.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-foreground/25 p-3 text-sm"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold">{team.name}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {shortenAddress(team.captainAddress!)}
              </p>
            </div>
            {refundHashes[team.id] ? (
              <TxReceipt hash={refundHashes[team.id]} label={t("er.refunded")} />
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAction({ kind: "refund", team })}
              >
                {t("er.refund_btn", { fee: tournament.entryFee })}
              </Button>
            )}
          </div>
        ))}
      </CardContent>
      <UnlockDialog
        open={action !== null}
        onOpenChange={(o) => !o && setAction(null)}
        title={t("er.refund_unlock_title")}
        description={t("er.refund_unlock_desc")}
        confirmLabel={t("er.refund_confirm")}
        onUnlock={run}
      />
    </Card>
  );
}
