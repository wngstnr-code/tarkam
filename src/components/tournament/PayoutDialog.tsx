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
          <DialogTitle>Bayar hadiah juara {rank}</DialogTitle>
          <DialogDescription>
            Transfer USDT on-chain dari brankas pool — permanen dan publik.
            Periksa baik-baik.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-md border p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Penerima</span>
            <span className="font-medium">{team.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dompet</span>
            <span className="font-mono text-xs">
              {team.captainAddress ? shortenAddress(team.captainAddress, 6) : "—"}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between text-base font-bold">
            <span>Jumlah</span>
            <span className="tabular-nums">
              {formatUSDT(parseUSDT(amount))} USDT
            </span>
          </div>
        </div>

        {!team.captainAddress ? (
          <p className="text-sm text-destructive">
            Tim ini belum punya alamat dompet kapten — tambahkan dulu di daftar
            tim.
          </p>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="pool-pw">Password brankas pool</Label>
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
            Batal
          </Button>
          <Button
            onClick={handlePayout}
            disabled={busy || !password || !team.captainAddress}
          >
            {busy ? "Menandatangani & broadcast…" : "Approve & kirim"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
