"use client";

import { useCallback, useEffect } from "react";
import { useWalletStore } from "@/store/useWalletStore";
import { getWalletMeta, saveWalletMeta } from "@/lib/db/repo";
import { getUsdtBalance } from "@/lib/wallet/balance";
import { decryptSeed } from "@/lib/wallet/crypto";
import { createWallet } from "@/lib/wallet/createWallet";
import { restoreWallet } from "@/lib/wallet/restoreWallet";

/**
 * Fasad dompet user: hydrate dari IndexedDB, buat/restore/unlock, saldo.
 * Seed hanya hidup sesaat di memori saat dibutuhkan (unlock → pakai → buang).
 */
export function useWdkWallet() {
  const { address, hydrated, usdtBalance, setAddress, setHydrated, setUsdtBalance } =
    useWalletStore();

  useEffect(() => {
    if (hydrated) return;
    getWalletMeta().then((meta) => {
      setAddress(meta?.address ?? null);
      setHydrated();
    });
  }, [hydrated, setAddress, setHydrated]);

  const create = useCallback(
    async (password: string) => {
      const { meta, seedPhrase } = await createWallet(password);
      await saveWalletMeta(meta);
      setAddress(meta.address);
      return seedPhrase; // untuk flow backup — jangan dipersist
    },
    [setAddress]
  );

  const restore = useCallback(
    async (seedPhrase: string, password: string) => {
      const meta = await restoreWallet(seedPhrase, password);
      await saveWalletMeta(meta);
      setAddress(meta.address);
    },
    [setAddress]
  );

  /** Buka seed user dengan password (untuk tanda tangan / backup ulang). */
  const unlockSeed = useCallback(async (password: string) => {
    const meta = await getWalletMeta();
    if (!meta) throw new Error("Belum ada dompet di device ini");
    return decryptSeed(meta.encryptedSeed, password);
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!address) return;
    setUsdtBalance(await getUsdtBalance(address));
  }, [address, setUsdtBalance]);

  return {
    address,
    hydrated,
    usdtBalance,
    create,
    restore,
    unlockSeed,
    refreshBalance,
  };
}
