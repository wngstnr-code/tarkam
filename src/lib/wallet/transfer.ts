import { deriveAccount } from "./wdk";
import { USDT_ADDRESS } from "@/lib/chain/config";

export interface TransferResult {
  hash: string;
  fee: bigint;
}

/**
 * Kirim USDT via WDK: derive akun dari seed (yang baru saja di-unlock),
 * `account.transfer()` ERC-20, lalu buang key dari memori.
 */
export async function transferUsdt(
  seedPhrase: string,
  recipient: string,
  amountBase: bigint
): Promise<TransferResult> {
  const { wallet, account } = await deriveAccount(seedPhrase);
  try {
    const result = await account.transfer({
      token: USDT_ADDRESS,
      recipient,
      amount: amountBase,
    });
    return { hash: result.hash, fee: BigInt(result.fee ?? 0) };
  } finally {
    wallet.dispose();
  }
}
