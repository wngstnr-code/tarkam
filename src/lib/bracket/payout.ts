import { getWinners, isFinished } from "./engine";
import type { Match, Prize, Team } from "@/types";

/** Satu baris payout: hadiah + tim penerimanya menurut hasil bracket. */
export interface PayoutRow {
  prize: Prize;
  team: Team;
}

/**
 * Petakan daftar hadiah ke tim pemenang menurut bracket — SATU-SATUNYA
 * tempat aturan ini hidup, dipakai PayoutDialog manual, EscrowPayoutPanel,
 * dan Wasit AI supaya ketiganya tidak pernah menyimpang.
 *
 * MVP: rank 1 = juara, rank 2 = runner-up, rank 3+ = semifinalis kalah
 * pertama (juara 3 bersama dibagi manual di luar aplikasi).
 * Kosong bila bracket belum selesai.
 */
export function computePayoutRows(
  prizes: Prize[],
  teams: Team[],
  matches: Match[]
): PayoutRow[] {
  if (matches.length === 0 || !isFinished(matches)) return [];
  const winners = getWinners(matches);
  const teamById = (id?: string) => teams.find((t) => t.id === id);

  return prizes
    .map((prize) => {
      const teamId =
        prize.rank === 1
          ? winners.champion
          : prize.rank === 2
            ? winners.runnerUp
            : winners.semifinalLosers[0];
      return { prize, team: teamById(teamId) };
    })
    .filter((r): r is PayoutRow => !!r.team);
}
