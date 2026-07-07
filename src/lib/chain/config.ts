export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 11155111);

// RPC publik Sepolia sering balas 500 saat broadcast tx. Pakai daftar dengan
// failover otomatis (WDK pindah ke node berikutnya bila satu gagal).
const DEFAULT_RPCS = [
  "https://ethereum-sepolia-rpc.publicnode.com",
  "https://sepolia.drpc.org",
];

/** Daftar RPC (env boleh berisi beberapa, dipisah koma). Env di depan, lalu cadangan. */
export const RPC_URLS: string[] = Array.from(
  new Set(
    [
      ...(process.env.NEXT_PUBLIC_RPC_URL?.split(",").map((s) => s.trim()) ?? []),
      ...DEFAULT_RPCS,
    ].filter(Boolean)
  )
);

/** RPC utama (kompat untuk pemakaian yang butuh satu URL). */
export const RPC_URL = RPC_URLS[0];

/** Alamat kontrak MockUSDT (ERC-20, 6 desimal) di Sepolia. */
export const USDT_ADDRESS =
  process.env.NEXT_PUBLIC_USDT_ADDRESS ??
  "0x0304dda2A4F3B6Daa28ad87CacEeea4B634F5a28"; // MockUSDT (lihat contracts/deploy-notes.md)

export const USDT_DECIMALS = 6;

export const EXPLORER_BASE =
  process.env.NEXT_PUBLIC_EXPLORER ?? "https://sepolia.etherscan.io";

export const txUrl = (hash: string) => `${EXPLORER_BASE}/tx/${hash}`;
export const addressUrl = (addr: string) => `${EXPLORER_BASE}/address/${addr}`;
