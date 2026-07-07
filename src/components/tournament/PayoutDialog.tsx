"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { decryptSeed } from "@/lib/wallet/crypto";
import { transferUsdt } from "@/lib/wallet/transfer";
import { addPayout, updatePayout } from "@/lib/db/repo";
import { formatUSDT, parseUSDT, shortenAddress } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";
import type { Team, Tournament } from "@/types";

interface PayoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournament: Tournament;
  team: Team;
  rank: number;
  amount: string; // USDT display units
  onPaid: (txHash: string) => void;
}

/**
 * Kartu konfirmasi payout — human-in-the-loop:
 * tinjau jumlah + penerima → password brankas → WDK tanda tangan & broadcast.
 */
export function PayoutDialog({
  open,
  onOpenChange,
  tournament,
  team,
  rank,
  amount,
  onPaid,
}: PayoutDialogProps) {
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePayout() {
    if (!team.captainAddress) return;
    setBusy(true);
    setError(null);
    try {
      const seed = await decryptSeed(tournament.poolEncryptedSeed, password);
      const payoutId = crypto.randomUUID();
      await addPayout({
        id: payoutId,
        tournamentId: tournament.id,
        teamId: team.id,
        rank,
        amount,
        status: "pending",
        createdAt: Date.now(),
      });
      const { hash } = await transferUsdt(
        seed,
        team.captainAddress,
        parseUSDT(amount)
      );
      await updatePayout(payoutId, { txHash: hash, status: "sent" });
      setPassword("");
      onOpenChange(false);
      onPaid(hash);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {t("pd.title", { n: rank })}
          </DialogTitle>
          <DialogDescription>{t("pd.desc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-lg border border-foreground/25 bg-muted/40 p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs tracking-wider text-muted-foreground uppercase">
              {t("pd.recipient")}
            </span>
            <span className="font-bold">{team.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs tracking-wider text-muted-foreground uppercase">
              {t("pd.wallet")}
            </span>
            <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
              {team.captainAddress ? shortenAddress(team.captainAddress, 6) : "—"}
            </span>
          </div>
          <Separator />
          <div className="flex items-end justify-between">
            <span className="text-xs tracking-wider text-muted-foreground uppercase">
              {t("pd.total")}
            </span>
            <span className="font-mono text-xl font-bold text-secondary tabular-nums">
              {formatUSDT(parseUSDT(amount))} USDT
            </span>
          </div>
        </div>

        {!team.captainAddress ? (
          <p className="text-sm text-destructive">{t("pd.no_addr")}</p>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="pool-pw">{t("pd.pw_label")}</Label>
            <Input
              id="pool-pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("pd.cancel")}
          </Button>
          <Button
            onClick={handlePayout}
            disabled={busy || !password || !team.captainAddress}
          >
            {busy ? t("pd.signing") : t("pd.approve")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
