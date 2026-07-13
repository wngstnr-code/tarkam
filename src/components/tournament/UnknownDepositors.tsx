"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddressChip } from "@/components/common/AddressChip";
import { getEscrowTeams } from "@/lib/escrow/read";
import { addTeam } from "@/lib/db/repo";
import { useI18n } from "@/lib/i18n/context";
import type { Team, Tournament } from "@/types";

/**
 * Depositor on-chain yang belum punya tim di daftar lokal panitia — terjadi
 * saat kapten scan QR dan bayar lewat /join sebelum panitia mendaftarkannya.
 * Setorannya sudah terkunci di kontrak; di sini panitia tinggal memberi nama
 * supaya tim masuk daftar (langsung berstatus lunas, tanpa tx baru).
 */
export function UnknownDepositors({
  tournament,
  teams,
  escrowTeamCount,
}: {
  tournament: Tournament;
  teams: Team[];
  /** teamCount dari poller escrow halaman — pemicu refetch saat ada setoran baru. */
  escrowTeamCount?: number;
}) {
  const { t } = useI18n();
  const [onchain, setOnchain] = useState<string[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const escrowId = tournament.escrowId;

  useEffect(() => {
    if (escrowId === undefined) return;
    let stale = false;
    getEscrowTeams(escrowId)
      .then((addrs) => !stale && setOnchain(addrs))
      .catch(() => {}); // gagal baca RPC bukan alasan mengganggu halaman
    return () => {
      stale = true;
    };
  }, [escrowId, escrowTeamCount]);

  const known = new Set(
    teams
      .map((tm) => tm.captainAddress?.toLowerCase())
      .filter((a): a is string => !!a)
  );
  const unknown = onchain.filter((a) => !known.has(a.toLowerCase()));

  if (unknown.length === 0) return null;

  async function register(addr: string) {
    const name = (names[addr] ?? "").trim();
    if (!name) {
      setError(t("nd.err_name"));
      return;
    }
    setBusy(addr);
    setError(null);
    try {
      // Setoran sudah terverifikasi on-chain (alamat datang dari getTeams),
      // jadi tim langsung lunas — tanpa tombol "tandai lunas" lagi.
      await addTeam({
        id: crypto.randomUUID(),
        tournamentId: tournament.id,
        name,
        captainAddress: addr,
        paid: true,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-secondary/40 bg-secondary/5 p-4">
      <div>
        <p className="text-sm font-semibold text-secondary">
          {t("nd.title", { n: unknown.length })}
        </p>
        <p className="text-xs text-muted-foreground">{t("nd.desc")}</p>
      </div>
      {unknown.map((addr) => (
        <div key={addr} className="flex flex-wrap items-center gap-2">
          <AddressChip address={addr} />
          <Input
            className="h-8 max-w-48 flex-1"
            value={names[addr] ?? ""}
            onChange={(e) => setNames((m) => ({ ...m, [addr]: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && busy === null && register(addr)}
            placeholder={t("nd.name_placeholder")}
            disabled={busy !== null}
          />
          <Button
            size="sm"
            variant="outline"
            disabled={busy !== null}
            onClick={() => register(addr)}
          >
            {busy === addr ? t("nd.adding") : t("nd.add_btn")}
          </Button>
        </div>
      ))}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
