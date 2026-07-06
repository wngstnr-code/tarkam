import { isValidSeedPhrase, deriveAccount } from "./wdk";
import { encryptSeed } from "./crypto";
import type { WalletMeta } from "@/types";

/** Restore dompet dari seed phrase yang diketik user. */
export async function restoreWallet(
  seedPhrase: string,
  password: string
): Promise<WalletMeta> {
  const phrase = seedPhrase.trim().toLowerCase().replace(/\s+/g, " ");
  if (!isValidSeedPhrase(phrase)) {
    throw new Error("Seed phrase tidak valid (cek ejaan & jumlah kata)");
  }
  const { wallet, address } = await deriveAccount(phrase);
  wallet.dispose();
  const encryptedSeed = await encryptSeed(phrase, password);
  return { address, encryptedSeed, createdAt: Date.now() };
}
