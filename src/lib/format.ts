import { USDT_DECIMALS } from "@/lib/chain/config";

/** Base units (bigint) → string tampilan, mis. 1500000n → "1.5". */
export function formatUSDT(base: bigint): string {
  const div = 10n ** BigInt(USDT_DECIMALS);
  const whole = base / div;
  const frac = base % div;
  if (frac === 0n) return whole.toString();
  const fracStr = frac
    .toString()
    .padStart(USDT_DECIMALS, "0")
    .replace(/0+$/, "");
  return `${whole}.${fracStr}`;
}

/** String tampilan ("1.5") → base units (1500000n). */
export function parseUSDT(display: string): bigint {
  const [whole, frac = ""] = display.trim().split(".");
  if (!/^\d*$/.test(whole) || !/^\d*$/.test(frac) || frac.length > USDT_DECIMALS) {
    throw new Error(`Nominal USDT tidak valid: ${display}`);
  }
  return (
    BigInt(whole || "0") * 10n ** BigInt(USDT_DECIMALS) +
    BigInt(frac.padEnd(USDT_DECIMALS, "0") || "0")
  );
}

export function shortenAddress(addr: string, chars = 4): string {
  if (addr.length <= 2 + chars * 2) return addr;
  return `${addr.slice(0, 2 + chars)}…${addr.slice(-chars)}`;
}
