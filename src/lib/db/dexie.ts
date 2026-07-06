import Dexie, { type EntityTable } from "dexie";
import type { Tournament, Team, Match, Payout, WalletMeta } from "@/types";

// Local-first: seluruh metadata turnamen di IndexedDB device panitia.
// Tidak ada backend. Seed hanya tersimpan TERENKRIPSI.
const db = new Dexie("tarkam") as Dexie & {
  tournaments: EntityTable<Tournament, "id">;
  teams: EntityTable<Team, "id">;
  matches: EntityTable<Match, "id">;
  payouts: EntityTable<Payout, "id">;
  wallet: EntityTable<WalletMeta, "address">;
};

db.version(1).stores({
  tournaments: "id, status, createdAt",
  teams: "id, tournamentId",
  matches: "id, tournamentId, [tournamentId+round+slot]",
  payouts: "id, tournamentId",
  wallet: "address",
});

export { db };
