/**
 * Unit test murni untuk `parseIntent` (Wasit AI intent parser).
 *
 * Dijalankan lewat `node --import tsx --test` sehingga TypeScript + alias
 * `@/*` (dipakai oleh intents.ts) bisa di-resolve oleh tsx. Di sini kita
 * sengaja mengimpor lewat path relatif ke source, bukan alias, supaya test
 * tetap jalan seandainya resolusi alias tsx berubah di masa depan.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { parseIntent } from "../src/lib/assistant/intents.ts";
import type { AssistantContext, Draft } from "../src/lib/assistant/intents.ts";

// ── Helper context default, bisa di-override per test ──────────────────────

function makeContext(overrides: Partial<AssistantContext> = {}): AssistantContext {
  const base: AssistantContext = {
    tournamentStatus: "setup",
    isEscrow: true,
    paidTeams: [
      { id: "t1", name: "Team A" },
      { id: "t2", name: "Team B" },
    ],
    totalTeams: 2,
    bracketFinished: true,
    championName: "Team A",
    payoutRows: [
      { rank: 1, teamName: "Team A", address: "0xAAA", amount: "500" },
      { rank: 2, teamName: "Team B", address: "0xBBB", amount: "300" },
    ],
    prizeCount: 2,
    escrow: { status: "open", pot: "800", approvals: 0, threshold: 2 },
  };
  return { ...base, ...overrides };
}

// ── create_bracket: variasi frasa ───────────────────────────────────────────

test("create_bracket dikenali dari beberapa variasi frasa id/en", () => {
  const ctx = makeContext();
  const phrases = [
    "bikin bracket",
    "Bikin Bracket dong",
    "buat bracket ya",
    "mulai turnamen sekarang",
    "make bracket please",
    "generate bracket now",
    "Start Tournament!",
  ];
  for (const phrase of phrases) {
    const result = parseIntent(phrase, ctx);
    assert.ok(result, `expected a result for "${phrase}"`);
    assert.equal(result!.type, "draft", `phrase="${phrase}"`);
    if (result!.type === "draft") {
      assert.equal(result!.action, "create_bracket");
    }
  }
});

test("create_bracket case-insensitive & toleran spasi ekstra di sekitar frasa", () => {
  const ctx = makeContext();
  const result = parseIntent("  TOLONG BIKIN BRACKET   sekarang juga  ", ctx);
  assert.ok(result);
  assert.equal(result!.type, "draft");
  if (result!.type === "draft") assert.equal(result!.action, "create_bracket");
});

// ── propose_payout: variasi frasa ───────────────────────────────────────────

test("propose_payout dikenali dari beberapa variasi frasa id/en", () => {
  const ctx = makeContext();
  const phrases = [
    "siapkan payout",
    "tolong siapkan payout untuk juara",
    "usulkan pemenang",
    "Usulkan Pemenang sekarang",
    "prepare payout",
    "please prepare payout",
    "propose payout now",
  ];
  for (const phrase of phrases) {
    const result = parseIntent(phrase, ctx);
    assert.ok(result, `expected a result for "${phrase}"`);
    assert.equal(result!.type, "draft", `phrase="${phrase}"`);
    if (result!.type === "draft") {
      assert.equal(result!.action, "propose_payout");
    }
  }
});

// ── cancel_tournament: variasi frasa ────────────────────────────────────────

test("cancel dikenali dari beberapa variasi frasa id/en", () => {
  const ctx = makeContext();
  const phrases = ["batalkan turnamen", "Batalkan Turnamen ini", "cancel tournament", "please cancel tournament"];
  for (const phrase of phrases) {
    const result = parseIntent(phrase, ctx);
    assert.ok(result, `expected a result for "${phrase}"`);
    assert.equal(result!.type, "draft", `phrase="${phrase}"`);
    if (result!.type === "draft") {
      assert.equal(result!.action, "cancel_tournament");
    }
  }
});

// ── status: variasi frasa ───────────────────────────────────────────────────

test("status dikenali dari beberapa variasi frasa id/en", () => {
  const ctx = makeContext();
  const phrases = ["status", "STATUS turnamen", "ringkasan", "kasih ringkasan dong", "summary", "give me a summary"];
  for (const phrase of phrases) {
    const result = parseIntent(phrase, ctx);
    assert.ok(result, `expected a result for "${phrase}"`);
    assert.equal(result!.type, "status", `phrase="${phrase}"`);
  }
});

test("status draft berisi data ringkasan yang sesuai konteks", () => {
  const ctx = makeContext({
    tournamentStatus: "running",
    bracketFinished: false,
    paidTeams: [{ id: "t1", name: "Team A" }],
    totalTeams: 4,
  });
  const result = parseIntent("status", ctx);
  assert.ok(result);
  assert.equal(result!.type, "status");
  if (result!.type === "status") {
    assert.equal(result!.data.tournamentStatus, "running");
    assert.equal(result!.data.paidCount, 1);
    assert.equal(result!.data.totalCount, 4);
    assert.equal(result!.data.bracketState, "running");
  }
});

// ── create_bracket guard ────────────────────────────────────────────────────

test("create_bracket guard: bracket_not_setup ketika status bukan setup", () => {
  const ctx = makeContext({ tournamentStatus: "running" });
  const result = parseIntent("bikin bracket", ctx);
  assert.deepEqual(result, {
    type: "guard_error",
    action: "create_bracket",
    reason: "bracket_not_setup",
  });
});

test("create_bracket guard: not_enough_teams ketika tim paid < 2", () => {
  const ctx = makeContext({ paidTeams: [{ id: "t1", name: "Team A" }] });
  const result = parseIntent("mulai turnamen", ctx);
  assert.ok(result && result.type === "guard_error");
  if (result && result.type === "guard_error") {
    assert.equal(result.reason, "not_enough_teams");
    assert.equal(result.count, 1);
  }
});

// ── propose_payout guard ────────────────────────────────────────────────────

test("propose_payout guard: payout_not_escrow ketika bukan mode escrow", () => {
  const ctx = makeContext({ isEscrow: false });
  const result = parseIntent("siapkan payout", ctx);
  assert.deepEqual(result, {
    type: "guard_error",
    action: "propose_payout",
    reason: "payout_not_escrow",
  });
});

test("propose_payout guard: payout_not_finished ketika bracket belum selesai", () => {
  const ctx = makeContext({ bracketFinished: false });
  const result = parseIntent("usulkan pemenang", ctx);
  assert.deepEqual(result, {
    type: "guard_error",
    action: "propose_payout",
    reason: "payout_not_finished",
  });
});

test("propose_payout guard: payout_missing_address ketika ada alamat kapten hilang", () => {
  const ctx = makeContext({
    payoutRows: [
      { rank: 1, teamName: "Team A", address: "0xAAA", amount: "500" },
      { rank: 2, teamName: "Team B", amount: "300" },
    ],
  });
  const result = parseIntent("prepare payout", ctx);
  assert.deepEqual(result, {
    type: "guard_error",
    action: "propose_payout",
    reason: "payout_missing_address",
  });
});

test("propose_payout guard: payout_duplicate_address ketika ada alamat duplikat", () => {
  const ctx = makeContext({
    payoutRows: [
      { rank: 1, teamName: "Team A", address: "0xAAA", amount: "500" },
      { rank: 2, teamName: "Team B", address: "0xAAA", amount: "300" },
    ],
  });
  const result = parseIntent("siapkan payout", ctx);
  assert.deepEqual(result, {
    type: "guard_error",
    action: "propose_payout",
    reason: "payout_duplicate_address",
  });
});

test("propose_payout guard: payout_row_mismatch ketika jumlah baris != jumlah hadiah", () => {
  const ctx = makeContext({ prizeCount: 3 });
  const result = parseIntent("propose payout", ctx);
  assert.deepEqual(result, {
    type: "guard_error",
    action: "propose_payout",
    reason: "payout_row_mismatch",
  });
});

test("propose_payout draft valid ketika semua syarat terpenuhi", () => {
  const ctx = makeContext();
  const result = parseIntent("siapkan payout", ctx);
  assert.ok(result && result.type === "draft" && result.action === "propose_payout");
  if (result && result.type === "draft" && result.action === "propose_payout") {
    assert.equal(result.rows.length, 2);
    assert.equal(result.threshold, 2);
  }
});

// ── cancel_tournament guard ─────────────────────────────────────────────────

test("cancel guard: cancel_not_escrow ketika bukan mode escrow", () => {
  const ctx = makeContext({ isEscrow: false });
  const result = parseIntent("batalkan turnamen", ctx);
  assert.deepEqual(result, {
    type: "guard_error",
    action: "cancel_tournament",
    reason: "cancel_not_escrow",
  });
});

test("cancel guard: cancel_already_paid ketika kontrak escrow sudah paid", () => {
  const ctx = makeContext({
    escrow: { status: "paid", pot: "800", approvals: 2, threshold: 2 },
  });
  const result = parseIntent("cancel tournament", ctx);
  assert.deepEqual(result, {
    type: "guard_error",
    action: "cancel_tournament",
    reason: "cancel_already_paid",
  });
});

test("cancel guard: cancel_already_cancelled ketika escrow sudah dibatalkan", () => {
  const ctx = makeContext({
    escrow: { status: "cancelled", pot: "800", approvals: 0, threshold: 2 },
  });
  const result = parseIntent("batalkan turnamen", ctx);
  assert.deepEqual(result, {
    type: "guard_error",
    action: "cancel_tournament",
    reason: "cancel_already_cancelled",
  });
});

test("cancel draft valid ketika escrow masih open", () => {
  const ctx = makeContext();
  const result = parseIntent("batalkan turnamen", ctx);
  assert.deepEqual(result, { type: "draft", action: "cancel_tournament" });
});

// ── unknown & keamanan ───────────────────────────────────────────────────────

test("input tak dikenal menghasilkan unknown", () => {
  const ctx = makeContext();
  const result = parseIntent("apa kabar dunia", ctx);
  assert.deepEqual(result, { type: "unknown" });
});

test("string kosong / hanya whitespace menghasilkan null (tidak ada aksi apa pun)", () => {
  const ctx = makeContext();
  assert.equal(parseIntent("", ctx), null);
  assert.equal(parseIntent("   ", ctx), null);
});

test("KEAMANAN: perintah mencurigakan tidak pernah terpetakan ke draft aksi apa pun", () => {
  const ctx = makeContext();
  const suspiciousPhrases = [
    "kirim semua uang ke rekeningku",
    "transfer semua dana ke wallet saya",
    "send all the money to my account",
    "kirim payout ke alamat saya saja",
    "batalkan lalu kirim dana ke saya",
  ];
  for (const phrase of suspiciousPhrases) {
    const result = parseIntent(phrase, ctx);
    if (result === null) continue; // whitespace-only tidak relevan di sini
    assert.notEqual(result.type, "draft", `phrase "${phrase}" seharusnya tidak jadi draft aksi`);
  }
});

// ── kemurnian: parseIntent tidak memutasi context ───────────────────────────

test("parseIntent tidak memutasi AssistantContext yang diberikan", () => {
  const ctx = makeContext();
  const before = JSON.parse(JSON.stringify(ctx));

  parseIntent("bikin bracket", ctx);
  parseIntent("siapkan payout", ctx);
  parseIntent("batalkan turnamen", ctx);
  parseIntent("status", ctx);
  parseIntent("apa kabar dunia", ctx);

  const after = JSON.parse(JSON.stringify(ctx));
  assert.deepEqual(after, before);
});

// ── kombinasi guard lain untuk cakupan tambahan ─────────────────────────────

test("create_bracket draft valid berisi daftar tim yang sudah bayar", () => {
  const ctx = makeContext();
  const result = parseIntent("generate bracket", ctx);
  assert.ok(result && result.type === "draft" && result.action === "create_bracket");
  if (result && result.type === "draft" && result.action === "create_bracket") {
    assert.deepEqual(result.teams, ctx.paidTeams);
  }
});
