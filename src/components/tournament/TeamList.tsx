"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateTeam, removeTeam } from "@/lib/db/repo";
import { verifyNextPayment } from "@/lib/wallet/verifyPayment";
import { formatUSDT, shortenAddress } from "@/lib/format";
import type { Team, Tournament } from "@/types";

export function TeamList({
  tournament,
  teams,
  locked,
}: {
  tournament: Tournament;
  teams: Team[];
  locked: boolean;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const paidCount = teams.filter((t) => t.paid).length;

  async function markPaid(team: Team) {
    setBusyId(team.id);
    setNotice(null);
    try {
      const { ok, balance, required } = await verifyNextPayment(
        tournament,
        paidCount
      );
      if (!ok) {
        setNotice(
          `Saldo pool ${formatUSDT(balance)} USDT — butuh ≥ ${formatUSDT(required)} USDT sebelum ${team.name} bisa ditandai lunas. Chain belum melihat pembayarannya.`
        );
        return;
      }
      await updateTeam(team.id, { paid: true });
    } catch (e) {
      setNotice(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tim</TableHead>
            <TableHead>Dompet kapten</TableHead>
            <TableHead>Status bayar</TableHead>
            {!locked && <TableHead />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TableRow key={team.id}>
              <TableCell className="font-medium">{team.name}</TableCell>
              <TableCell className="font-mono text-xs">
                {team.captainAddress
                  ? shortenAddress(team.captainAddress)
                  : "—"}
              </TableCell>
              <TableCell>
                {team.paid ? (
                  <Badge>Lunas ✓ (on-chain)</Badge>
                ) : (
                  <Badge variant="outline">Belum bayar</Badge>
                )}
              </TableCell>
              {!locked && (
                <TableCell className="space-x-1 text-right">
                  {!team.paid && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === team.id}
                        onClick={() => markPaid(team)}
                      >
                        {busyId === team.id ? "Cek chain…" : "Tandai lunas"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeTeam(team.id)}
                      >
                        Hapus
                      </Button>
                    </>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
          {teams.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-sm text-muted-foreground"
              >
                Belum ada tim terdaftar.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {notice && <p className="text-sm text-amber-600">{notice}</p>}
    </div>
  );
}
