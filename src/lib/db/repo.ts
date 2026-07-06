import { db } from "./dexie";
import type { Tournament, Team, Match, Payout, WalletMeta } from "@/types";

// ── Wallet (satu per device) ────────────────────────────────────────────
export async function getWalletMeta(): Promise<WalletMeta | undefined> {
  return (await db.wallet.toArray())[0];
}

export async function saveWalletMeta(meta: WalletMeta): Promise<void> {
  await db.wallet.clear();
  await db.wallet.add(meta);
}

// ── Tournament ──────────────────────────────────────────────────────────
export async function listTournaments(): Promise<Tournament[]> {
  return db.tournaments.orderBy("createdAt").reverse().toArray();
}

export async function getTournament(id: string): Promise<Tournament | undefined> {
  return db.tournaments.get(id);
}

export async function addTournament(t: Tournament): Promise<void> {
  await db.tournaments.add(t);
}

export async function updateTournament(
  id: string,
  changes: Partial<Tournament>
): Promise<void> {
  await db.tournaments.update(id, changes);
}

// ── Team ────────────────────────────────────────────────────────────────
export async function listTeams(tournamentId: string): Promise<Team[]> {
  return db.teams.where({ tournamentId }).toArray();
}

export async function addTeam(team: Team): Promise<void> {
  await db.teams.add(team);
}

export async function updateTeam(id: string, changes: Partial<Team>): Promise<void> {
  await db.teams.update(id, changes);
}

export async function removeTeam(id: string): Promise<void> {
  await db.teams.delete(id);
}

// ── Match ───────────────────────────────────────────────────────────────
export async function listMatches(tournamentId: string): Promise<Match[]> {
  return db.matches.where({ tournamentId }).toArray();
}

export async function putMatches(matches: Match[]): Promise<void> {
  await db.matches.bulkPut(matches);
}

export async function updateMatch(id: string, changes: Partial<Match>): Promise<void> {
  await db.matches.update(id, changes);
}

// ── Payout ──────────────────────────────────────────────────────────────
export async function listPayouts(tournamentId: string): Promise<Payout[]> {
  return db.payouts.where({ tournamentId }).toArray();
}

export async function addPayout(p: Payout): Promise<void> {
  await db.payouts.add(p);
}

export async function updatePayout(id: string, changes: Partial<Payout>): Promise<void> {
  await db.payouts.update(id, changes);
}
