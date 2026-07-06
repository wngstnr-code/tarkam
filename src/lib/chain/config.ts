export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 11155111);

export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ?? "https://sepolia.drpc.org";

/** Alamat kontrak MockUSDT (ERC-20, 6 desimal) di Sepolia. */
export const USDT_ADDRESS =
  process.env.NEXT_PUBLIC_USDT_ADDRESS ??
  "0x0304dda2A4F3B6Daa28ad87CacEeea4B634F5a28"; // MockUSDT (lihat contracts/deploy-notes.md)

export const USDT_DECIMALS = 6;

export const EXPLORER_BASE =
  process.env.NEXT_PUBLIC_EXPLORER ?? "https://sepolia.etherscan.io";

export const txUrl = (hash: string) => `${EXPLORER_BASE}/tx/${hash}`;
export const addressUrl = (addr: string) => `${EXPLORER_BASE}/address/${addr}`;
