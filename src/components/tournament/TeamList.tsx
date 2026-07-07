"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [editAddr, setEditAddr] = useState("");
  const [editErr, setEditErr] = useState<string | null>(null);
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

  function openEdit(team: Team) {
    setEditTeam(team);
    setEditAddr(team.captainAddress ?? "");
    setEditErr(null);
  }

  async function saveAddr() {
    if (!editTeam) return;
    const addr = editAddr.trim();
    if (addr && !/^0x[0-9a-fA-F]{40}$/.test(addr)) {
      setEditErr("Alamat dompet tidak valid (0x…40 hex).");
      return;
    }
    await updateTeam(editTeam.id, { captainAddress: addr || undefined });
    setEditTeam(null);
  }

  return (
    <div className="space-y-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tim</TableHead>
            <TableHead>Dompet kapten</TableHead>
            <TableHead>Status bayar</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TableRow key={team.id}>
              <TableCell className="font-medium">{team.name}</TableCell>
              <TableCell className="font-mono text-xs">
                {team.captainAddress ? (
                  shortenAddress(team.captainAddress)
                ) : (
                  <span className="font-sans text-muted-foreground italic">
                    belum diisi
                  </span>
                )}
              </TableCell>
              <TableCell>
                {team.paid ? (
                  <Badge variant="secondary">Lunas ✓ on-chain</Badge>
                ) : (
                  <Badge variant="outline">Belum bayar</Badge>
                )}
              </TableCell>
              <TableCell className="space-x-1 text-right">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openEdit(team)}
                  title="Atur alamat dompet kapten (tujuan hadiah)"
                >
                  {team.captainAddress ? "✎ Dompet" : "+ Dompet"}
                </Button>
                {!locked && !team.paid && (
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

      <Dialog
        open={editTeam !== null}
        onOpenChange={(o) => !o && setEditTeam(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dompet kapten — {editTeam?.name}</DialogTitle>
            <DialogDescription>
              Alamat ini jadi tujuan transfer hadiah bila tim ini juara. Bisa
              diubah kapan saja sebelum payout dikirim.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="edit-addr">Alamat dompet (0x…)</Label>
            <Input
              id="edit-addr"
              value={editAddr}
              onChange={(e) => setEditAddr(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveAddr()}
              placeholder="0x…"
              className="font-mono"
              autoFocus
            />
            {editErr && <p className="text-sm text-destructive">{editErr}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTeam(null)}>
              Batal
            </Button>
            <Button onClick={saveAddr}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
