/**
 * "Wasit AI" — parser intent MURNI, tanpa side effect dan tanpa import React.
 *
 * SEAM QVAC: `parseIntent` adalah titik tukar untuk versi berikutnya. Saat ini
 * ia rule-based (cocokkan kata kunci id/en). Nanti ia bisa digantikan model
 * lokal QVAC selama kontrak tipe tetap sama: menerima teks + `AssistantContext`
 * ringan, mengembalikan `AssistantResult` (draft aksi / status / guard-error /
 * unknown) — TANPA pernah mengeksekusi apa pun sendiri. Eksekusi & approval
 * manusia selalu terjadi di layer UI (`AssistantPanel`), bukan di sini.
 */

import type { Tournament } from "@/types";

// ── Konteks ringan yang dibutuhkan untuk memutuskan guard & isi draft ──────

export interface AssistantPayoutRow {
  rank: number;
  teamName: string;
  address?: string;
  amount: string;
}

export interface AssistantEscrowOnChain {
  status: "open" | "proposed" | "paid" | "cancelled";
  pot: string;
  approvals: number;
  threshold: number;
}

export interface AssistantContext {
  tournamentStatus: Tournament["status"];
  isEscrow: boolean;
  paidTeams: { id: string; name: string }[];
  totalTeams: number;
  bracketFinished: boolean;
  championName?: string;
  /** Baris pemenang menurut bracket (sudah dipetakan ke tim, sebelum divalidasi). */
  payoutRows: AssistantPayoutRow[];
  prizeCount: number;
  escrow?: AssistantEscrowOnChain;
}

// ── Hasil ───────────────────────────────────────────────────────────────

export type AssistantAction = "create_bracket" | "propose_payout" | "cancel_tournament";

export type GuardReason =
  | "bracket_not_setup"
  | "not_enough_teams"
  | "payout_not_escrow"
  | "payout_not_finished"
  | "payout_missing_address"
  | "payout_duplicate_address"
  | "payout_row_mismatch"
  | "cancel_not_escrow"
  | "cancel_already_paid"
  | "cancel_already_cancelled";

export interface StatusData {
  tournamentStatus: Tournament["status"];
  paidCount: number;
  totalCount: number;
  bracketState: "none" | "running" | "finished";
  championName?: string;
  isEscrow: boolean;
  escrow?: AssistantEscrowOnChain;
}

export type Draft =
  | { type: "draft"; action: "create_bracket"; teams: { id: string; name: string }[] }
  | {
      type: "draft";
      action: "propose_payout";
      rows: { rank: number; teamName: string; address: string; amount: string }[];
      threshold: number;
    }
  | { type: "draft"; action: "cancel_tournament" }
  | { type: "status"; data: StatusData }
  | { type: "guard_error"; action: AssistantAction; reason: GuardReason; count?: number }
  | { type: "unknown" };

// ── Pengenalan kata kunci (case-insensitive, id + en) ──────────────────────

function norm(input: string): string {
  return input.trim().toLowerCase();
}

function matchesAny(text: string, patterns: string[]): boolean {
  return patterns.some((p) => text.includes(p));
}

const CANCEL_PATTERNS = ["batalkan turnamen", "batalkan  turnamen", "cancel tournament"];
const PROPOSE_PATTERNS = [
  "siapkan payout",
  "usulkan payout",
  "usulkan pemenang",
  "propose payout",
  "prepare payout",
];
const CREATE_BRACKET_PATTERNS = [
  "bikin bracket",
  "buat bracket",
  "mulai turnamen",
  "make bracket",
  "generate bracket",
  "start tournament",
];
const STATUS_PATTERNS = ["status", "ringkasan", "summary"];

function detectAction(text: string): AssistantAction | "status" | null {
  if (matchesAny(text, CANCEL_PATTERNS)) return "cancel_tournament";
  if (matchesAny(text, PROPOSE_PATTERNS)) return "propose_payout";
  if (matchesAny(text, CREATE_BRACKET_PATTERNS)) return "create_bracket";
  if (matchesAny(text, STATUS_PATTERNS)) return "status";
  return null;
}

// ── Guard + draft builders ─────────────────────────────────────────────

function buildCreateBracket(ctx: AssistantContext): Draft {
  if (ctx.tournamentStatus !== "setup") {
    return { type: "guard_error", action: "create_bracket", reason: "bracket_not_setup" };
  }
  if (ctx.paidTeams.length < 2) {
    return {
      type: "guard_error",
      action: "create_bracket",
      reason: "not_enough_teams",
      count: ctx.paidTeams.length,
    };
  }
  return { type: "draft", action: "create_bracket", teams: ctx.paidTeams };
}

function buildProposePayout(ctx: AssistantContext): Draft {
  if (!ctx.isEscrow) {
    return { type: "guard_error", action: "propose_payout", reason: "payout_not_escrow" };
  }
  if (!ctx.bracketFinished) {
    return { type: "guard_error", action: "propose_payout", reason: "payout_not_finished" };
  }
  const missingAddress = ctx.payoutRows.some((r) => !r.address);
  if (missingAddress) {
    return {
      type: "guard_error",
      action: "propose_payout",
      reason: "payout_missing_address",
    };
  }
  const addresses = ctx.payoutRows.map((r) => r.address as string);
  const duplicated = new Set(addresses).size !== addresses.length;
  if (duplicated) {
    return {
      type: "guard_error",
      action: "propose_payout",
      reason: "payout_duplicate_address",
    };
  }
  if (ctx.payoutRows.length !== ctx.prizeCount) {
    return {
      type: "guard_error",
      action: "propose_payout",
      reason: "payout_row_mismatch",
    };
  }
  return {
    type: "draft",
    action: "propose_payout",
    rows: ctx.payoutRows.map((r) => ({
      rank: r.rank,
      teamName: r.teamName,
      address: r.address as string,
      amount: r.amount,
    })),
    threshold: ctx.escrow?.threshold ?? 0,
  };
}

function buildCancelTournament(ctx: AssistantContext): Draft {
  if (!ctx.isEscrow) {
    return { type: "guard_error", action: "cancel_tournament", reason: "cancel_not_escrow" };
  }
  if (ctx.escrow?.status === "paid") {
    return {
      type: "guard_error",
      action: "cancel_tournament",
      reason: "cancel_already_paid",
    };
  }
  // Kontrak cancel() hanya menerima status Open/Proposed — cancel kedua kali
  // pasti revert, jadi tahan di sini dengan pesan jelas.
  if (ctx.escrow?.status === "cancelled") {
    return {
      type: "guard_error",
      action: "cancel_tournament",
      reason: "cancel_already_cancelled",
    };
  }
  return { type: "draft", action: "cancel_tournament" };
}

function buildStatus(ctx: AssistantContext): Draft {
  const bracketState: StatusData["bracketState"] = ctx.bracketFinished
    ? "finished"
    : ctx.tournamentStatus === "running"
      ? "running"
      : "none";
  return {
    type: "status",
    data: {
      tournamentStatus: ctx.tournamentStatus,
      paidCount: ctx.paidTeams.length,
      totalCount: ctx.totalTeams,
      bracketState,
      championName: ctx.championName,
      isEscrow: ctx.isEscrow,
      escrow: ctx.escrow,
    },
  };
}

/**
 * Cocokkan perintah bahasa natural (id/en) ke sebuah draft aksi / balasan.
 * Fungsi murni: tidak membaca/menulis apa pun, tidak melempar. Validasi
 * ulang tetap wajib dilakukan di layer eksekusi sebelum aksi on-chain/lokal
 * benar-benar dijalankan.
 */
export function parseIntent(input: string, ctx: AssistantContext): Draft | null {
  const text = norm(input);
  if (!text) return null;

  const action = detectAction(text);
  switch (action) {
    case "create_bracket":
      return buildCreateBracket(ctx);
    case "propose_payout":
      return buildProposePayout(ctx);
    case "cancel_tournament":
      return buildCancelTournament(ctx);
    case "status":
      return buildStatus(ctx);
    default:
      return { type: "unknown" };
  }
}
