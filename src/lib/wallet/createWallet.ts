import { generateSeedPhrase, deriveAccount } from "./wdk";
import { encryptSeed } from "./crypto";
import type { WalletMeta } from "@/types";

/**
 * Generate dompet baru: seed BIP-39 → address (WDK) → seed terenkripsi.
 * Seed plaintext dikembalikan SEKALI untuk flow backup, jangan dipersist.
 */
export async function createWallet(password: string): Promise<{
  meta: WalletMeta;
  seedPhrase: string;
}> {
  const seedPhrase = generateSeedPhrase();
  const { wallet, address } = await deriveAccount(seedPhrase);
  wallet.dispose();
  const encryptedSeed = await encryptSeed(seedPhrase, password);
  return {
    meta: { address, encryptedSeed, createdAt: Date.now() },
    seedPhrase,
  };
}
