export type Format = "single_elim" | "round_robin";

/**
 * Mode brankas hadiah:
 * - "simple"  — dompet pool WDK milik panitia (transparansi radikal).
 * - "escrow"  — dana dikunci smart contract TarkamEscrow (trustless: panitia
 *   tidak pernah memegang dana; hadiah/refund ditegakkan kontrak).
 */
export type PoolMode = "simple" | "escrow";

export interface WalletMeta {
  /** 1 per device — dompet user/panitia. */
  address: string;
  /** AES-GCM blob "salt.iv.ciphertext" (base64). */
  encryptedSeed: string;
  createdAt: number;
}

export interface Prize {
  rank: number;
  /** Jumlah USDT dalam unit tampilan (mis. "500"), 6 desimal saat on-chain. */
  amount: string;
}

export interface Tournament {
  id: string;
  name: string;
  format: Format;
  teamCount: number;
  entryFee: string;
  prizes: Prize[];
  poolAddress: string;
  /** Seed dompet pool, terenkripsi dengan password panitia. Kosong pada mode escrow. */
  poolEncryptedSeed: string;
  /** Default "simple" (turnamen lama tanpa field ini). */
  mode?: PoolMode;
  /** Id turnamen di kontrak TarkamEscrow (mode escrow saja). */
  escrowId?: number;
  status: "setup" | "running" | "finished" | "cancelled";
  createdAt: number;
}

export interface Team {
  id: string;
  tournamentId: string;
  name: string;
  /** Dompet penerima hadiah. */
  captainAddress?: string;
  paid: boolean;
  paymentTxHash?: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  round: number;
  slot: number;
  teamAId?: string;
  teamBId?: string;
  scoreA?: number;
  scoreB?: number;
  winnerTeamId?: string;
}

export interface Payout {
  id: string;
  tournamentId: string;
  teamId: string;
  rank: number;
  amount: string;
  txHash?: string;
  status: "pending" | "sent" | "confirmed";
  createdAt: number;
}
