import { getUsdtBalance } from "./balance";
import { parseUSDT } from "@/lib/format";
import type { Tournament } from "@/types";

/**
 * Verifikasi pembayaran berbasis saldo on-chain (MVP):
 * saldo pool harus ≥ (jumlah tim lunas + 1) × biaya daftar
 * sebelum tim berikutnya boleh ditandai lunas.
 * Sumber kebenaran = chain, bukan klaim panitia.
 */
export async function verifyNextPayment(
  tournament: Tournament,
  paidCount: number
): Promise<{ ok: boolean; balance: bigint; required: bigint }> {
  const balance = await getUsdtBalance(tournament.poolAddress);
  const required = parseUSDT(tournament.entryFee) * BigInt(paidCount + 1);
  return { ok: balance >= required, balance, required };
}
