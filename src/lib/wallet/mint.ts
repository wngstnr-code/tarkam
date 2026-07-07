import { Interface } from "ethers";
import { deriveAccount } from "./wdk";
import { USDT_ADDRESS } from "@/lib/chain/config";

const MINT_IFACE = new Interface([
  "function mint(address to, uint256 amount) external",
]);

/**
 * Faucet demo: mint MockUSDT (testnet) ke sebuah alamat.
 * `mint()` di kontrak terbuka, jadi dompet mana pun bisa mengisi saldo ujinya
 * sendiri — cukup bayar gas Sepolia. Bukan untuk mainnet.
 */
export async function mintTestUsdt(
  seedPhrase: string,
  to: string,
  amountBase: bigint
): Promise<string> {
  const { wallet, account } = await deriveAccount(seedPhrase);
  try {
    const data = MINT_IFACE.encodeFunctionData("mint", [to, amountBase]);
    const result = await account.sendTransaction({
      to: USDT_ADDRESS,
      data,
      value: 0n,
    });
    return result.hash;
  } finally {
    wallet.dispose();
  }
}
