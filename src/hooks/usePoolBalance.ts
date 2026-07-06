"use client";

import { useEffect, useState } from "react";
import { getUsdtBalance } from "@/lib/wallet/balance";

/** Polling saldo USDT sebuah alamat pool — sumber "saldo pot live". */
export function usePoolBalance(address: string | undefined, intervalMs = 15_000) {
  const [balance, setBalance] = useState<bigint | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    let stop = false;

    async function tick() {
      try {
        const b = await getUsdtBalance(address!);
        if (!stop) {
          setBalance(b);
          setError(null);
        }
      } catch (e) {
        if (!stop) setError(e instanceof Error ? e.message : String(e));
      }
    }

    tick();
    const id = setInterval(tick, intervalMs);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [address, intervalMs]);

  return { balance, error };
}
