// "Wasit" berbasis aturan (submission I): bracket sistem gugur.
// Fungsi murni — mudah diuji, dan nanti dibungkus Wasit AI (QVAC) di sub II.

import type { Match, Team } from "@/types";

function nextPowerOfTwo(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/**
 * Generate bracket gugur dari daftar tim (urutan = seeding).
 * Tim yang tidak genap pangkat dua dapat bye (lawan kosong di ronde 1).
 * round dimulai dari 1; slot 0-based per ronde.
 */
export function generateBracket(tournamentId: string, teams: Team[]): Match[] {
  if (teams.length < 2) throw new Error("Minimal 2 tim untuk membuat bracket");
  const size = nextPowerOfTwo(teams.length);
  const rounds = Math.log2(size);
  const matches: Match[] = [];

  // Ronde 1: pasangkan seed standar (1 vs terakhir, dst) agar bye jatuh ke seed atas.
  const seeded: (Team | undefined)[] = [...teams];
  while (seeded.length < size) seeded.push(undefined);
  const order = seedOrder(size);

  for (let slot = 0; slot < size / 2; slot++) {
    const a = seeded[order[slot * 2]];
    const b = seeded[order[slot * 2 + 1]];
    matches.push({
      id: crypto.randomUUID(),
      tournamentId,
      round: 1,
      slot,
      teamAId: a?.id,
      teamBId: b?.id,
      // Bye: lawan kosong → menang otomatis.
      winnerTeamId: a && !b ? a.id : !a && b ? b.id : undefined,
    });
  }

  for (let round = 2; round <= rounds; round++) {
    const slots = size / 2 ** round;
    for (let slot = 0; slot < slots; slot++) {
      matches.push({
        id: crypto.randomUUID(),
        tournamentId,
        round,
        slot,
      });
    }
  }

  return propagateWinners(matches);
}

/** Urutan seeding standar bracket (1 vs N, dst) untuk ukuran pangkat dua. */
function seedOrder(size: number): number[] {
  let order = [0];
  while (order.length < size) {
    const next: number[] = [];
    const len = order.length * 2;
    for (const s of order) {
      next.push(s);
      next.push(len - 1 - s);
    }
    order = next;
  }
  return order;
}

/** Isi skor sebuah match → tentukan pemenang. Seri tidak sah di sistem gugur. */
export function applyResult(
  matches: Match[],
  matchId: string,
  scoreA: number,
  scoreB: number
): Match[] {
  if (scoreA === scoreB) {
    throw new Error("Skor seri — sistem gugur butuh pemenang (adu penalti?)");
  }
  const updated = matches.map((m) =>
    m.id === matchId
      ? {
          ...m,
          scoreA,
          scoreB,
          winnerTeamId: scoreA > scoreB ? m.teamAId : m.teamBId,
        }
      : m
  );
  return propagateWinners(updated);
}

/** Dorong pemenang tiap match ke slot ronde berikutnya. */
export function propagateWinners(matches: Match[]): Match[] {
  const result = matches.map((m) => ({ ...m }));
  const maxRound = Math.max(...result.map((m) => m.round));
  for (let round = 1; round < maxRound; round++) {
    for (const m of result.filter((x) => x.round === round)) {
      if (!m.winnerTeamId) continue;
      const next = result.find(
        (x) => x.round === round + 1 && x.slot === Math.floor(m.slot / 2)
      );
      if (!next) continue;
      if (m.slot % 2 === 0) next.teamAId = m.winnerTeamId;
      else next.teamBId = m.winnerTeamId;
    }
  }
  return result;
}

/** Juara 1/2/3 bila sudah ditentukan. Juara 3 = versi sederhana: kalah semifinal (dua-duanya rank 3). */
export function getWinners(matches: Match[]): {
  champion?: string;
  runnerUp?: string;
  semifinalLosers: string[];
} {
  const maxRound = Math.max(...matches.map((m) => m.round));
  const final = matches.find((m) => m.round === maxRound);
  const champion = final?.winnerTeamId;
  const runnerUp =
    final && champion
      ? final.teamAId === champion
        ? final.teamBId
        : final.teamAId
      : undefined;
  const semifinalLosers = matches
    .filter((m) => m.round === maxRound - 1 && m.winnerTeamId)
    .map((m) => (m.teamAId === m.winnerTeamId ? m.teamBId : m.teamAId))
    .filter((id): id is string => !!id);
  return { champion, runnerUp, semifinalLosers };
}

/** Turnamen selesai bila final punya pemenang. */
export function isFinished(matches: Match[]): boolean {
  return !!getWinners(matches).champion;
}
