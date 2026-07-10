import "@/polyfill";
import WalletManagerEvm7702Gasless from "@tetherto/wdk-wallet-evm-7702-gasless";
import {
  RPC_URLS,
  BUNDLER_URL,
  SPONSORSHIP_POLICY_ID,
  DELEGATION_ADDRESS,
} from "@/lib/chain/config";

/**
 * Wallet manager gasless (EIP-7702 delegasi + ERC-4337 UserOperation, gas
 * disponsori paymaster). `getAddress()` mengembalikan alamat EOA langsung
 * (bukan alamat smart-contract terpisah) — sama dengan dompet klasik WDK.
 *
 * Hanya dipakai bila `GASLESS_ENABLED` true (lihat `src/lib/chain/config.ts`);
 * caller wajib mengecek itu sebelum memanggil fungsi ini.
 */
export function gaslessWalletFromSeed(seedPhrase: string) {
  return new WalletManagerEvm7702Gasless(seedPhrase, {
    provider: RPC_URLS,
    bundlerUrl: BUNDLER_URL,
    delegationAddress: DELEGATION_ADDRESS,
    isSponsored: true,
    // sponsorshipPolicyId opsional — sertakan hanya bila diisi di env, agar
    // tidak mengirim string kosong ke paymaster.
    ...(SPONSORSHIP_POLICY_ID ? { sponsorshipPolicyId: SPONSORSHIP_POLICY_ID } : {}),
  });
}

/** Derive akun pertama (index 0) dari seed phrase, jalur gasless. */
export async function deriveGaslessAccount(seedPhrase: string) {
  const wallet = gaslessWalletFromSeed(seedPhrase);
  const account = await wallet.getAccount(0);
  return { wallet, account };
}
