import {
  ESCROW_ADDRESS,
  ESCROW_DEPLOY_BLOCK,
  LOG_RPC_URLS,
  RPC_URLS,
  USDT_ADDRESS,
  USDT_DEPLOY_BLOCK,
} from "./config";

/** Topic0 event Transfer(address,address,uint256) ERC-20. */
const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

/** Ukuran jendela blok saat fallback chunked (drpc free tier maks 10rb). */
const CHUNK_BLOCKS = 9_999;

export type PoolEvent = {
  direction: "in" | "out";
  counterparty: string;
  amount: bigint;
  txHash: string;
  blockNumber: number;
  timestamp: number;
  /** Jenis event escrow (mode escrow saja; mode simple = transfer polos). */
  kind?: "deposit" | "prize" | "refund" | "surplus";
};

type JsonRpcLog = {
  topics: string[];
  data: string;
  transactionHash: string;
  blockNumber: string;
};

/** Alamat 20 byte → topic 32 byte (pad kiri, lowercase). */
function addressToTopic(addr: string): string {
  return "0x" + addr.toLowerCase().replace(/^0x/, "").padStart(64, "0");
}

/** Topic 32 byte → alamat 20 byte ("0x" + 40 hex terakhir). */
function topicToAddress(topic: string): string {
  return "0x" + topic.slice(26);
}

/**
 * Panggil satu method JSON-RPC, coba tiap RPC_URLS berurutan sampai salah
 * satu berhasil (fallback bila node publik gagal/menolak).
 */
export async function rpcCall<T = unknown>(
  method: string,
  params: unknown[],
  urls: string[] = RPC_URLS
): Promise<T> {
  let lastError: unknown = null;
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method,
          params,
        }),
      });
      if (!res.ok) {
        lastError = new Error(`RPC ${url} HTTP ${res.status}`);
        continue;
      }
      const json = await res.json();
      if (json.error) {
        lastError = new Error(json.error.message ?? "RPC error");
        continue;
      }
      return json.result as T;
    } catch (e) {
      lastError = e;
      continue;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Semua RPC gagal");
}

const toHex = (n: number) => "0x" + n.toString(16);

/**
 * eth_getLogs sejak blok deploy kontrak. Strategi dua tahap:
 * 1. Full-range sekali jalan via LOG_RPC_URLS (Tenderly melayani ini gratis).
 * 2. Bila semua menolak (batas rentang node publik), pecah jadi jendela
 *    CHUNK_BLOCKS dan kueri berurutan via RPC biasa.
 */
async function getLogsWithFallback(
  contractAddress: string,
  topics: (string | null)[],
  deployBlock: number
): Promise<JsonRpcLog[]> {
  const baseParams = { address: contractAddress, topics };
  try {
    return await rpcCall<JsonRpcLog[]>(
      "eth_getLogs",
      [{ ...baseParams, fromBlock: toHex(deployBlock), toBlock: "latest" }],
      LOG_RPC_URLS
    );
  } catch {
    const latestHex = await rpcCall<string>("eth_blockNumber", []);
    const latest = Number(BigInt(latestHex));
    const logs: JsonRpcLog[] = [];
    for (let from = deployBlock; from <= latest; from += CHUNK_BLOCKS + 1) {
      const to = Math.min(from + CHUNK_BLOCKS, latest);
      logs.push(
        ...(await rpcCall<JsonRpcLog[]>("eth_getLogs", [
          { ...baseParams, fromBlock: toHex(from), toBlock: toHex(to) },
        ]))
      );
    }
    return logs;
  }
}

/**
 * Ambil riwayat setoran (in) & payout (out) sebuah alamat pool, dari log
 * Transfer ERC-20 token USDT, langsung via JSON-RPC (tanpa ethers/viem).
 */
export async function fetchPoolActivity(pool: string): Promise<PoolEvent[]> {
  const poolTopic = addressToTopic(pool);

  const [incoming, outgoing] = await Promise.all([
    getLogsWithFallback(USDT_ADDRESS, [TRANSFER_TOPIC, null, poolTopic], USDT_DEPLOY_BLOCK),
    getLogsWithFallback(USDT_ADDRESS, [TRANSFER_TOPIC, poolTopic, null], USDT_DEPLOY_BLOCK),
  ]);

  const rawEvents = [
    ...incoming.map((log) => ({
      direction: "in" as const,
      counterparty: topicToAddress(log.topics[1]),
      amount: BigInt(log.data),
      txHash: log.transactionHash,
      blockNumber: Number(BigInt(log.blockNumber)),
      blockHex: log.blockNumber,
    })),
    ...outgoing.map((log) => ({
      direction: "out" as const,
      counterparty: topicToAddress(log.topics[2]),
      amount: BigInt(log.data),
      txHash: log.transactionHash,
      blockNumber: Number(BigInt(log.blockNumber)),
      blockHex: log.blockNumber,
    })),
  ];

  return withTimestamps(rawEvents);
}

/** Lengkapi event mentah dengan timestamp blok (dedupe biar hemat request), urut terbaru dulu. */
async function withTimestamps(
  rawEvents: (Omit<PoolEvent, "timestamp"> & { blockHex: string })[]
): Promise<PoolEvent[]> {
  const uniqueBlockHex = Array.from(new Set(rawEvents.map((e) => e.blockHex)));
  const timestampByBlock = new Map<string, number>();
  await Promise.all(
    uniqueBlockHex.map(async (blockHex) => {
      const block = await rpcCall<{ timestamp: string }>("eth_getBlockByNumber", [
        blockHex,
        false,
      ]);
      timestampByBlock.set(blockHex, Number(BigInt(block.timestamp)));
    })
  );

  const events: PoolEvent[] = rawEvents.map(({ blockHex, ...e }) => ({
    ...e,
    timestamp: timestampByBlock.get(blockHex) ?? 0,
  }));

  events.sort((a, b) => b.blockNumber - a.blockNumber);
  return events;
}

// ── Event TarkamEscrow (mode escrow) ─────────────────────────────────────
// Topic0 tiap event dana (hardcode supaya halaman verify tidak perlu ethers).
const DEPOSITED_TOPIC =
  "0x984a71c9d95fd4794aeba33ae72edfec22053fde75488d63abef9dc69ee795af"; // Deposited(uint256,address,address,uint256)
const PRIZE_PAID_TOPIC =
  "0x9876798000e86a77bb07d26e263906cb8cf99a0fa89a7e907712cdf563901679"; // PrizePaid(uint256,address,uint256,uint256)
const SURPLUS_TOPIC =
  "0x044f98d3a69f7ea3f0918b4bdd25788604a743ad9a24911e511e402333c3d74d"; // SurplusWithdrawn(uint256,address,uint256)
const REFUNDED_TOPIC =
  "0x7ca5472b7ea78c2c0141c5a12ee6d170cf4ce8ed06be3d22c8252ddfc7a6a2c4"; // Refunded(uint256,address,uint256)

/** Word ke-i (uint256) dari `data` log. */
function dataWord(data: string, i: number): bigint {
  return BigInt("0x" + data.slice(2 + i * 64, 2 + (i + 1) * 64));
}

/**
 * Ambil aliran dana SATU turnamen escrow dari event kontrak TarkamEscrow
 * (terfilter per id turnamen via topic ter-index) — bukan transfer mentah,
 * karena satu kontrak menampung banyak turnamen.
 */
export async function fetchEscrowActivity(escrowId: number): Promise<PoolEvent[]> {
  const idTopic = "0x" + escrowId.toString(16).padStart(64, "0");

  const [deposits, prizes, surpluses, refunds] = await Promise.all([
    getLogsWithFallback(ESCROW_ADDRESS, [DEPOSITED_TOPIC, idTopic], ESCROW_DEPLOY_BLOCK),
    getLogsWithFallback(ESCROW_ADDRESS, [PRIZE_PAID_TOPIC, idTopic], ESCROW_DEPLOY_BLOCK),
    getLogsWithFallback(ESCROW_ADDRESS, [SURPLUS_TOPIC, idTopic], ESCROW_DEPLOY_BLOCK),
    getLogsWithFallback(ESCROW_ADDRESS, [REFUNDED_TOPIC, idTopic], ESCROW_DEPLOY_BLOCK),
  ]);

  const base = (log: JsonRpcLog) => ({
    txHash: log.transactionHash,
    blockNumber: Number(BigInt(log.blockNumber)),
    blockHex: log.blockNumber,
  });

  const rawEvents = [
    // Deposited: setoran tim masuk pot (counterparty = tim yang terdaftar).
    ...deposits.map((log) => ({
      direction: "in" as const,
      kind: "deposit" as const,
      counterparty: topicToAddress(log.topics[2]),
      amount: dataWord(log.data, 0),
      ...base(log),
    })),
    // PrizePaid: hadiah keluar ke tim pemenang.
    ...prizes.map((log) => ({
      direction: "out" as const,
      kind: "prize" as const,
      counterparty: topicToAddress(log.topics[2]),
      amount: dataWord(log.data, 1),
      ...base(log),
    })),
    // SurplusWithdrawn: sisa pot (operasional) ke panitia.
    ...surpluses.map((log) => ({
      direction: "out" as const,
      kind: "surplus" as const,
      counterparty: topicToAddress(log.topics[2]),
      amount: dataWord(log.data, 0),
      ...base(log),
    })),
    // Refunded: biaya daftar kembali ke tim.
    ...refunds.map((log) => ({
      direction: "out" as const,
      kind: "refund" as const,
      counterparty: topicToAddress(log.topics[2]),
      amount: dataWord(log.data, 0),
      ...base(log),
    })),
  ];

  return withTimestamps(rawEvents);
}

// ── Event governance TarkamEscrow (M-of-N approval) ──────────────────────
// Topic0 tiap event tata kelola (hardcode dari ABI, sama seperti event dana).
const TOURNAMENT_CREATED_TOPIC =
  "0x7a45ecfe12194d3e69ddaf8aaa8c54da91b8a6581bd961a93d3cc1392740cc52"; // TournamentCreated(uint256,address,...)
const PAYOUT_PROPOSED_TOPIC =
  "0xd7fc8c45525208db33112345d6fb92adf157c9cdd4a5beffa0afd1c829f0460c"; // PayoutProposed(uint256,address[])
const PAYOUT_APPROVED_TOPIC =
  "0xec52a43e6a13721d3c406557f3e987e7d725387bcaa60193d13f1c8d600cb11e"; // PayoutApproved(uint256,address,uint256)
const TOURNAMENT_CANCELLED_TOPIC =
  "0xfa61ec8d7e5a58ceba17772b10ba0c6caa65b40b200302be35f00efc264c7895"; // TournamentCancelled(uint256)

export type GovernanceEvent = {
  kind: "created" | "proposed" | "approved" | "cancelled";
  actor?: string;
  approvals?: number;
  winners?: string[];
  txHash: string;
  blockNumber: number;
  timestamp: number;
};

/** Decode array `address[]` dari data log (offset dinamis standar ABI). */
function decodeAddressArray(data: string): string[] {
  const length = Number(dataWord(data, 1));
  const winners: string[] = [];
  for (let i = 0; i < length; i++) {
    const word = dataWord(data, 2 + i);
    winners.push("0x" + word.toString(16).padStart(40, "0"));
  }
  return winners;
}

/**
 * Ambil timeline event tata kelola (M-of-N approval) SATU turnamen escrow:
 * pembuatan, usulan pemenang, tiap persetujuan, dan pembatalan.
 * Diurutkan kronologis (blok terlama dulu) supaya enak dibaca dari atas.
 */
export async function fetchEscrowGovernance(escrowId: number): Promise<GovernanceEvent[]> {
  const idTopic = "0x" + escrowId.toString(16).padStart(64, "0");

  const [created, proposed, approved, cancelled] = await Promise.all([
    getLogsWithFallback(ESCROW_ADDRESS, [TOURNAMENT_CREATED_TOPIC, idTopic], ESCROW_DEPLOY_BLOCK),
    getLogsWithFallback(ESCROW_ADDRESS, [PAYOUT_PROPOSED_TOPIC, idTopic], ESCROW_DEPLOY_BLOCK),
    getLogsWithFallback(ESCROW_ADDRESS, [PAYOUT_APPROVED_TOPIC, idTopic], ESCROW_DEPLOY_BLOCK),
    getLogsWithFallback(ESCROW_ADDRESS, [TOURNAMENT_CANCELLED_TOPIC, idTopic], ESCROW_DEPLOY_BLOCK),
  ]);

  const base = (log: JsonRpcLog) => ({
    txHash: log.transactionHash,
    blockNumber: Number(BigInt(log.blockNumber)),
    blockHex: log.blockNumber,
  });

  const rawEvents = [
    // TournamentCreated: organizer membuat turnamen escrow.
    ...created.map((log) => ({
      kind: "created" as const,
      actor: topicToAddress(log.topics[2]),
      ...base(log),
    })),
    // PayoutProposed: usulan daftar pemenang untuk disetujui.
    ...proposed.map((log) => ({
      kind: "proposed" as const,
      winners: decodeAddressArray(log.data),
      ...base(log),
    })),
    // PayoutApproved: satu pihak menyetujui, dengan hitungan approval berjalan.
    ...approved.map((log) => ({
      kind: "approved" as const,
      actor: topicToAddress(log.topics[2]),
      approvals: Number(dataWord(log.data, 0)),
      ...base(log),
    })),
    // TournamentCancelled: turnamen dibatalkan, refund dibuka.
    ...cancelled.map((log) => ({
      kind: "cancelled" as const,
      ...base(log),
    })),
  ];

  // withTimestamps mengasumsikan bentuk PoolEvent, jadi lengkapi timestamp sendiri.
  const uniqueBlockHex = Array.from(new Set(rawEvents.map((e) => e.blockHex)));
  const timestampByBlock = new Map<string, number>();
  await Promise.all(
    uniqueBlockHex.map(async (blockHex) => {
      const block = await rpcCall<{ timestamp: string }>("eth_getBlockByNumber", [
        blockHex,
        false,
      ]);
      timestampByBlock.set(blockHex, Number(BigInt(block.timestamp)));
    })
  );

  const events: GovernanceEvent[] = rawEvents.map(({ blockHex, ...e }) => ({
    ...e,
    timestamp: timestampByBlock.get(blockHex) ?? 0,
  }));

  events.sort((a, b) => a.blockNumber - b.blockNumber);
  return events;
}
