// Test suite properti TarkamEscrow — jalan 100% lokal di atas anvil (Foundry).
// Fokus: membuktikan panitia TIDAK PERNAH bisa menarik pot turnamen kecuali
// sisa (surplus) yang transparan sejak awal, dan dana hanya keluar sebagai
// hadiah ke tim terdaftar atau refund ke penyetor.

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { ethers } from "ethers";
import {
  compileContract,
  startAnvil,
  stopAnvil,
  getSigners,
  increaseTimeAndMine,
  U,
} from "./helpers.mjs";

let anvil;
let provider;
let usdt;
let escrow;
let signers; // [organizer, teamA, teamB, teamC, teamD, stranger, ...]
let organizer, teamA, teamB, teamC, teamD, stranger;

async function mustRevert(promise, substring) {
  await assert.rejects(promise, (err) => {
    const msg = String(err?.shortMessage ?? err?.reason ?? err?.message ?? err);
    assert.ok(
      msg.includes(substring),
      `error harus mengandung "${substring}", dapat: ${msg}`
    );
    return true;
  });
}

/** Buat turnamen baru dengan parameter default (bisa dioverride), kembalikan id. */
async function createTournament(opts = {}) {
  const {
    token = usdt.target,
    entryFee = U(10),
    prizes = [U(15), U(5)],
    threshold = 1,
    deadline = 0,
    from = organizer,
  } = opts;
  const c = escrow.connect(from);
  const id = await c.createTournament.staticCall(token, entryFee, prizes, threshold, deadline);
  await (await c.createTournament(token, entryFee, prizes, threshold, deadline)).wait();
  return id;
}

async function deposit(id, teamSigner) {
  await (await escrow.connect(teamSigner).deposit(id, teamSigner.address)).wait();
}

before(async () => {
  anvil = await startAnvil();
  provider = anvil.provider;
  signers = getSigners(provider, 8);
  [organizer, teamA, teamB, teamC, teamD, stranger] = signers;

  const usdtArtifact = compileContract("MockUSDT.sol", "MockUSDT");
  const usdtFactory = new ethers.ContractFactory(usdtArtifact.abi, usdtArtifact.bytecode, organizer);
  usdt = await usdtFactory.deploy();
  await usdt.waitForDeployment();

  const escrowArtifact = compileContract("TarkamEscrow.sol", "TarkamEscrow");
  globalThis.__escrowAbi = escrowArtifact.abi; // dipakai test ABI-surface
  const factory = new ethers.ContractFactory(escrowArtifact.abi, escrowArtifact.bytecode, organizer);
  escrow = await factory.deploy();
  await escrow.waitForDeployment();

  // Mint & approve untuk semua akun yang dipakai sebagai tim/organizer.
  for (const s of [organizer, teamA, teamB, teamC, teamD, stranger]) {
    await (await usdt.connect(organizer).mint(s.address, U(1_000_000))).wait();
    await (await usdt.connect(s).approve(escrow.target, ethers.MaxUint256)).wait();
  }
});

after(async () => {
  try {
    provider?.destroy?.();
  } finally {
    stopAnvil(anvil?.child);
  }
});

// ── 1. createTournament ─────────────────────────────────────────────────

test("createTournament: id increment berurutan", async () => {
  const id1 = await createTournament();
  const id2 = await createTournament();
  assert.equal(id2, id1 + 1n);
});

test("createTournament: emit event TournamentCreated dengan data benar", async () => {
  const prizes = [U(15), U(5)];
  const c = escrow.connect(organizer);
  const id = await c.createTournament.staticCall(usdt.target, U(10), prizes, 1, 0);
  const tx = await c.createTournament(usdt.target, U(10), prizes, 1, 0);
  const receipt = await tx.wait();
  const parsed = receipt.logs
    .map((l) => {
      try {
        return escrow.interface.parseLog(l);
      } catch {
        return null;
      }
    })
    .find((e) => e?.name === "TournamentCreated");
  assert.ok(parsed, "event TournamentCreated harus ada");
  assert.equal(parsed.args.id, id);
  assert.equal(parsed.args.organizer, organizer.address);
  assert.equal(parsed.args.token, usdt.target);
  assert.equal(parsed.args.entryFee, U(10));
  assert.equal(parsed.args.approvalThreshold, 1n);
});

test("createTournament: entryFee 0 ditolak", async () => {
  await mustRevert(createTournament({ entryFee: 0n }), "biaya daftar 0");
});

test("createTournament: daftar hadiah kosong ditolak", async () => {
  await mustRevert(createTournament({ prizes: [] }), "hadiah kosong");
});

test("createTournament: token address(0) ditolak", async () => {
  await mustRevert(createTournament({ token: ethers.ZeroAddress }), "token kosong");
});

// ── 2. deposit ───────────────────────────────────────────────────────────

test("deposit: transfer USDT masuk kontrak, pot & teamCount bertambah", async () => {
  const id = await createTournament();
  const contractBalBefore = await usdt.balanceOf(escrow.target);
  const payerBalBefore = await usdt.balanceOf(teamA.address);

  await deposit(id, teamA);

  const contractBalAfter = await usdt.balanceOf(escrow.target);
  const payerBalAfter = await usdt.balanceOf(teamA.address);
  assert.equal(contractBalAfter - contractBalBefore, U(10));
  assert.equal(payerBalBefore - payerBalAfter, U(10));

  const t = await escrow.getTournament(id);
  assert.equal(t.pot, U(10));
  assert.equal(t.teamCount, 1n);
});

test("deposit: tim yang sama deposit dua kali ditolak", async () => {
  const id = await createTournament();
  await deposit(id, teamA);
  await mustRevert(deposit(id, teamA), "tim sudah bayar");
});

test("deposit: ditolak saat status bukan Open", async () => {
  const id = await createTournament({ threshold: 0 });
  await deposit(id, teamA);
  await (await escrow.connect(organizer).cancel(id)).wait();
  await mustRevert(deposit(id, teamB), "bukan fase pendaftaran");
});

// ── 3. Tidak ada jalan panitia menarik pot ──────────────────────────────

test("proposePayout: pemenang yang bukan tim penyetor ditolak (termasuk alamat panitia sendiri)", async () => {
  const id = await createTournament();
  await deposit(id, teamA);
  await deposit(id, teamB);

  // teamD tidak pernah deposit.
  await mustRevert(
    escrow.connect(organizer).proposePayout(id, [teamA.address, teamD.address]),
    "pemenang bukan tim terdaftar"
  );
  // Organizer sendiri bukan tim terdaftar → tidak bisa jadi pemenang.
  await mustRevert(
    escrow.connect(organizer).proposePayout(id, [teamA.address, organizer.address]),
    "pemenang bukan tim terdaftar"
  );
});

test("ABI surface: fungsi yang bisa memindahkan dana keluar kontrak hanya {deposit, executePayout, claimRefund}", async () => {
  const abi = globalThis.__escrowAbi;
  const allFns = abi.filter((e) => e.type === "function").map((e) => e.name);
  // Fungsi yang diketahui TIDAK memindahkan dana (baca kode: hanya ubah state/administrasi).
  const nonFundMoving = new Set([
    "createTournament",
    "proposePayout",
    "approvePayout",
    "cancel",
    "getTournament",
    "getTeams",
    "tournamentCount",
    "depositOf",
    "hasApproved",
  ]);
  const fundMoving = allFns.filter((n) => !nonFundMoving.has(n)).sort();
  assert.deepEqual(fundMoving, ["claimRefund", "deposit", "executePayout"]);
});

// ── 4. proposePayout ─────────────────────────────────────────────────────

test("proposePayout: hanya organizer yang boleh", async () => {
  const id = await createTournament();
  await deposit(id, teamA);
  await mustRevert(escrow.connect(teamA).proposePayout(id, [teamA.address]), "bukan panitia");
});

test("proposePayout: jumlah pemenang harus sama dengan jumlah hadiah", async () => {
  const id = await createTournament(); // prizes.length == 2
  await deposit(id, teamA);
  await mustRevert(
    escrow.connect(organizer).proposePayout(id, [teamA.address]),
    "jumlah pemenang != hadiah"
  );
});

test("proposePayout: pemenang duplikat ditolak", async () => {
  const id = await createTournament();
  await deposit(id, teamA);
  await deposit(id, teamB);
  await mustRevert(
    escrow.connect(organizer).proposePayout(id, [teamA.address, teamA.address]),
    "pemenang duplikat"
  );
});

test("proposePayout: pot kurang dari total hadiah ditolak", async () => {
  // entryFee 5, 2 tim terdaftar → pot 10, tapi total hadiah 20.
  const id = await createTournament({ entryFee: U(5), prizes: [U(15), U(5)] });
  await deposit(id, teamA);
  await deposit(id, teamB);
  await mustRevert(
    escrow.connect(organizer).proposePayout(id, [teamA.address, teamB.address]),
    "pot kurang dari total hadiah"
  );
});

test("proposePayout: mengusulkan ulang me-reset approvals ke 0 dan hasApproved semua tim", async () => {
  const id = await createTournament({ entryFee: U(10), prizes: [U(15), U(5)], threshold: 1 });
  await deposit(id, teamA);
  await deposit(id, teamB);
  await (await escrow.connect(organizer).proposePayout(id, [teamA.address, teamB.address])).wait();
  await (await escrow.connect(teamA).approvePayout(id)).wait();

  let t = await escrow.getTournament(id);
  assert.equal(t.approvals, 1n);
  assert.equal(await escrow.hasApproved(id, teamA.address), true);

  // Usulkan ulang dengan urutan berbeda (koreksi).
  await (await escrow.connect(organizer).proposePayout(id, [teamB.address, teamA.address])).wait();

  t = await escrow.getTournament(id);
  assert.equal(t.approvals, 0n);
  assert.equal(await escrow.hasApproved(id, teamA.address), false);
  assert.equal(await escrow.hasApproved(id, teamB.address), false);
});

// ── 5. approvePayout ──────────────────────────────────────────────────────

test("approvePayout: hanya tim penyetor yang boleh menyetujui", async () => {
  const id = await createTournament();
  await deposit(id, teamA);
  await deposit(id, teamB);
  await (await escrow.connect(organizer).proposePayout(id, [teamA.address, teamB.address])).wait();
  await mustRevert(escrow.connect(stranger).approvePayout(id), "bukan tim penyetor");
});

test("approvePayout: dobel approve dari tim yang sama ditolak", async () => {
  const id = await createTournament();
  await deposit(id, teamA);
  await deposit(id, teamB);
  await (await escrow.connect(organizer).proposePayout(id, [teamA.address, teamB.address])).wait();
  await (await escrow.connect(teamA).approvePayout(id)).wait();
  await mustRevert(escrow.connect(teamA).approvePayout(id), "sudah menyetujui");
});

test("approvePayout: approvals bertambah tiap persetujuan baru", async () => {
  const id = await createTournament({ threshold: 2 });
  await deposit(id, teamA);
  await deposit(id, teamB);
  await (await escrow.connect(organizer).proposePayout(id, [teamA.address, teamB.address])).wait();

  await (await escrow.connect(teamA).approvePayout(id)).wait();
  let t = await escrow.getTournament(id);
  assert.equal(t.approvals, 1n);

  await (await escrow.connect(teamB).approvePayout(id)).wait();
  t = await escrow.getTournament(id);
  assert.equal(t.approvals, 2n);
});

// ── 6. executePayout ──────────────────────────────────────────────────────

test("executePayout: ditolak bila approvals kurang dari threshold", async () => {
  const id = await createTournament({ threshold: 2 });
  await deposit(id, teamA);
  await deposit(id, teamB);
  await (await escrow.connect(organizer).proposePayout(id, [teamA.address, teamB.address])).wait();
  await (await escrow.connect(teamA).approvePayout(id)).wait(); // hanya 1 dari 2
  await mustRevert(escrow.connect(stranger).executePayout(id), "persetujuan kurang");
});

test("executePayout: satu transaksi membayar semua hadiah + surplus ke organizer, status Paid, event lengkap", async () => {
  const entryFee = U(10);
  const prizes = [U(15), U(5)];
  const id = await createTournament({ entryFee, prizes, threshold: 1 });
  await deposit(id, teamA);
  await deposit(id, teamB);
  await deposit(id, teamC); // pot = 30, total hadiah = 20, surplus = 10

  await (await escrow.connect(organizer).proposePayout(id, [teamA.address, teamB.address])).wait();
  await (await escrow.connect(teamA).approvePayout(id)).wait();

  const balA0 = await usdt.balanceOf(teamA.address);
  const balB0 = await usdt.balanceOf(teamB.address);
  const balOrg0 = await usdt.balanceOf(organizer.address);

  const tx = await escrow.connect(stranger).executePayout(id);
  const receipt = await tx.wait();

  const balA1 = await usdt.balanceOf(teamA.address);
  const balB1 = await usdt.balanceOf(teamB.address);
  const balOrg1 = await usdt.balanceOf(organizer.address);

  assert.equal(balA1 - balA0, U(15));
  assert.equal(balB1 - balB0, U(5));
  assert.equal(balOrg1 - balOrg0, U(10)); // surplus

  const t = await escrow.getTournament(id);
  assert.equal(t.status, 2n); // Status.Paid
  assert.equal(t.pot, 0n);

  const parsed = receipt.logs
    .map((l) => {
      try {
        return escrow.interface.parseLog(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  const prizePaidEvents = parsed.filter((e) => e.name === "PrizePaid");
  const surplusEvents = parsed.filter((e) => e.name === "SurplusWithdrawn");
  assert.equal(prizePaidEvents.length, 2);
  assert.equal(surplusEvents.length, 1);
  assert.equal(surplusEvents[0].args.amount, U(10));
});

// ── 7. cancel + claimRefund ─────────────────────────────────────────────

test("cancel: hanya organizer yang boleh membatalkan", async () => {
  const id = await createTournament();
  await deposit(id, teamA);
  await mustRevert(escrow.connect(teamA).cancel(id), "bukan panitia");
});

test("claimRefund: setelah cancel tiap tim bisa menarik persis setorannya", async () => {
  const id = await createTournament({ entryFee: U(10) });
  await deposit(id, teamA);
  await deposit(id, teamB);
  await (await escrow.connect(organizer).cancel(id)).wait();

  const balBefore = await usdt.balanceOf(teamA.address);
  await (await escrow.connect(stranger).claimRefund(id, teamA.address)).wait();
  const balAfter = await usdt.balanceOf(teamA.address);
  assert.equal(balAfter - balBefore, U(10));
});

test("claimRefund: refund kedua kali ditolak", async () => {
  const id = await createTournament();
  await deposit(id, teamA);
  await (await escrow.connect(organizer).cancel(id)).wait();
  await (await escrow.connect(teamA).claimRefund(id, teamA.address)).wait();
  await mustRevert(escrow.connect(teamA).claimRefund(id, teamA.address), "tidak ada setoran");
});

test("claimRefund: ditolak bila belum dibatalkan dan belum lewat deadline", async () => {
  const id = await createTournament({ deadline: 0 });
  await deposit(id, teamA);
  await mustRevert(escrow.connect(teamA).claimRefund(id, teamA.address), "tidak dibatalkan");
});

// ── 8. refundDeadline ────────────────────────────────────────────────────

test("refundDeadline: sebelum deadline claimRefund ditolak, setelah deadline sukses tanpa cancel", async () => {
  const block = await provider.getBlock("latest");
  const deadline = block.timestamp + 10; // 10 detik dari sekarang
  const id = await createTournament({ entryFee: U(10), deadline });
  await deposit(id, teamA);

  await mustRevert(escrow.connect(teamA).claimRefund(id, teamA.address), "tidak dibatalkan");

  await increaseTimeAndMine(provider, 20);

  const balBefore = await usdt.balanceOf(teamA.address);
  await (await escrow.connect(teamA).claimRefund(id, teamA.address)).wait();
  const balAfter = await usdt.balanceOf(teamA.address);
  assert.equal(balAfter - balBefore, U(10));
});

test("refundDeadline: tidak berlaku lagi setelah status Paid", async () => {
  const block = await provider.getBlock("latest");
  const deadline = block.timestamp + 10;
  const id = await createTournament({
    entryFee: U(10),
    prizes: [U(15)],
    threshold: 0,
    deadline,
  });
  await deposit(id, teamA);
  await deposit(id, teamB); // pot 20 >= prize 15

  await (await escrow.connect(organizer).proposePayout(id, [teamA.address])).wait();
  await (await escrow.connect(stranger).executePayout(id)).wait(); // threshold 0, langsung eksekusi

  let t = await escrow.getTournament(id);
  assert.equal(t.status, 2n); // Paid

  await increaseTimeAndMine(provider, 20); // lewati deadline

  // teamB tidak menang, tapi masih terdaftar (depositOf > 0) — refund deadline
  // seharusnya tidak berlaku lagi karena status sudah Paid.
  await mustRevert(escrow.connect(teamB).claimRefund(id, teamB.address), "tidak dibatalkan");
});

// ── 9. Interaksi refund x payout ─────────────────────────────────────────

test("executePayout: pemenang yang sudah menarik refund (via deadline) membuat payout revert", async () => {
  const block = await provider.getBlock("latest");
  const deadline = block.timestamp + 10;
  const id = await createTournament({
    entryFee: U(10),
    prizes: [U(15), U(5)],
    threshold: 0,
    deadline,
  });
  await deposit(id, teamA);
  await deposit(id, teamB);

  await (await escrow.connect(organizer).proposePayout(id, [teamA.address, teamB.address])).wait();

  // Lewati deadline sementara masih status Proposed (belum Paid) → teamA bisa refund.
  await increaseTimeAndMine(provider, 20);
  await (await escrow.connect(teamA).claimRefund(id, teamA.address)).wait();

  await mustRevert(escrow.connect(stranger).executePayout(id), "pemenang sudah refund");
});

// ── 10. Setelah Paid: semua aksi lain ditolak (status final) ────────────

test("setelah Paid: deposit/approvePayout/cancel/proposePayout semua ditolak", async () => {
  const id = await createTournament({ entryFee: U(10), prizes: [U(5)], threshold: 0 });
  await deposit(id, teamA);
  await (await escrow.connect(organizer).proposePayout(id, [teamA.address])).wait();
  await (await escrow.connect(stranger).executePayout(id)).wait();

  const t = await escrow.getTournament(id);
  assert.equal(t.status, 2n); // Paid

  await mustRevert(escrow.connect(teamB).deposit(id, teamB.address), "bukan fase pendaftaran");
  await mustRevert(escrow.connect(teamA).approvePayout(id), "tidak ada usulan");
  await mustRevert(escrow.connect(organizer).cancel(id), "sudah final");
  await mustRevert(escrow.connect(organizer).proposePayout(id, [teamA.address]), "sudah final");
});
