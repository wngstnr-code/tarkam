import "@/polyfill";
import WalletManagerEvm, {
  WalletAccountReadOnlyEvm,
} from "@tetherto/wdk-wallet-evm";
import { SeedSignerEvm } from "@tetherto/wdk-wallet-evm/signers";
import * as bip39 from "bip39";
import { RPC_URL } from "@/lib/chain/config";

/** Buat wallet manager WDK dari seed phrase BIP-39. */
export function walletFromSeed(seedPhrase: string) {
  return new WalletManagerEvm(new SeedSignerEvm(seedPhrase), {
    provider: RPC_URL,
  });
}

/** Generate seed phrase BIP-39 baru (12 kata). */
export function generateSeedPhrase(): string {
  return bip39.generateMnemonic();
}

export function isValidSeedPhrase(phrase: string): boolean {
  return bip39.validateMnemonic(phrase.trim().toLowerCase());
}

/** Akun read-only untuk alamat mana pun (pantau saldo pool tanpa seed). */
export function readOnlyAccount(address: string) {
  return new WalletAccountReadOnlyEvm(address, { provider: RPC_URL });
}

/** Derive akun pertama (index 0) + alamatnya dari sebuah seed phrase. */
export async function deriveAccount(seedPhrase: string) {
  const wallet = walletFromSeed(seedPhrase);
  const account = await wallet.getAccount(0);
  const address = await account.getAddress();
  return { wallet, account, address };
}
