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
import { useI18n } from "@/lib/i18n/context";
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
  const { t } = useI18n();
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
          t("tl.notice_insufficient", {
            balance: formatUSDT(balance),
            required: formatUSDT(required),
            name: team.name,
          })
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
      setEditErr(t("tl.invalid_addr"));
      return;
    }
    await updateTeam(editTeam.id, { captainAddress: addr || undefined });
    setEditTeam(null);
  }

  return (
    <div className="space-y-2">
      <div className="-mx-1 overflow-x-auto px-1">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("tl.team")}</TableHead>
            <TableHead>{t("tl.captain_wallet")}</TableHead>
            <TableHead>{t("tl.pay_status")}</TableHead>
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
                    {t("tl.not_set")}
                  </span>
                )}
              </TableCell>
              <TableCell>
                {team.paid ? (
                  <Badge variant="secondary">{t("tl.paid_badge")}</Badge>
                ) : (
                  <Badge variant="outline">{t("tl.unpaid_badge")}</Badge>
                )}
              </TableCell>
              <TableCell className="space-x-1 text-right">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openEdit(team)}
                  title={t("tl.wallet_title_attr")}
                >
                  {team.captainAddress ? t("tl.wallet_edit") : t("tl.wallet_add")}
                </Button>
                {!locked && !team.paid && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === team.id}
                      onClick={() => markPaid(team)}
                    >
                      {busyId === team.id ? t("tl.checking") : t("tl.mark_paid")}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeTeam(team.id)}
                    >
                      {t("tl.remove")}
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
                {t("tl.no_teams")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
      {notice && <p className="text-sm text-amber-600">{notice}</p>}

      <Dialog
        open={editTeam !== null}
        onOpenChange={(o) => !o && setEditTeam(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("tl.dialog_title", { name: editTeam?.name ?? "" })}</DialogTitle>
            <DialogDescription>{t("tl.dialog_desc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="edit-addr">{t("tl.addr_label")}</Label>
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
              {t("tl.cancel")}
            </Button>
            <Button onClick={saveAddr}>{t("tl.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
