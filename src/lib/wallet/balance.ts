import { readOnlyAccount } from "./wdk";
import { USDT_ADDRESS } from "@/lib/chain/config";

/** Saldo USDT (base units, 6 desimal) alamat mana pun — read-only via WDK. */
export async function getUsdtBalance(address: string): Promise<bigint> {
  const account = readOnlyAccount(address);
  const balance = await account.getTokenBalance(USDT_ADDRESS);
  return BigInt(balance);
}

/** Saldo native ETH (wei) — untuk cek gas. */
export async function getNativeBalance(address: string): Promise<bigint> {
  const account = readOnlyAccount(address);
  const balance = await account.getBalance();
  return BigInt(balance);
}
