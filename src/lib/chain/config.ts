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

/**
 * RPC khusus eth_getLogs. Node publik biasa membatasi rentang blok ketat
 * (publicnode ±ratusan blok, drpc 10rb); Tenderly gateway melayani full-range.
 * Urutan: env → Tenderly → daftar RPC biasa (fallback chunked).
 */
export const LOG_RPC_URLS: string[] = Array.from(
  new Set(
    [
      ...(process.env.NEXT_PUBLIC_LOG_RPC_URL?.split(",").map((s) => s.trim()) ?? []),
      "https://sepolia.gateway.tenderly.co",
      ...RPC_URLS,
    ].filter(Boolean)
  )
);

/** Blok deploy kontrak — batas bawah kueri log (tak ada event sebelum ini). */
export const USDT_DEPLOY_BLOCK = Number(
  process.env.NEXT_PUBLIC_USDT_DEPLOY_BLOCK ?? 11217803
);
export const ESCROW_DEPLOY_BLOCK = Number(
  process.env.NEXT_PUBLIC_ESCROW_DEPLOY_BLOCK ?? 11239548
);

/** Alamat kontrak MockUSDT (ERC-20, 6 desimal) di Sepolia. */
export const USDT_ADDRESS =
  process.env.NEXT_PUBLIC_USDT_ADDRESS ??
  "0x0304dda2A4F3B6Daa28ad87CacEeea4B634F5a28"; // MockUSDT (lihat contracts/deploy-notes.md)

export const USDT_DECIMALS = 6;

/** Alamat kontrak TarkamEscrow di Sepolia (lihat contracts/deploy-notes.md). */
export const ESCROW_ADDRESS =
  process.env.NEXT_PUBLIC_ESCROW_ADDRESS ??
  "0xd572cffB8d01f1FFD129A88F301209dA346E2d5f";

export const EXPLORER_BASE =
  process.env.NEXT_PUBLIC_EXPLORER ?? "https://sepolia.etherscan.io";

export const txUrl = (hash: string) => `${EXPLORER_BASE}/tx/${hash}`;
export const addressUrl = (addr: string) => `${EXPLORER_BASE}/address/${addr}`;

/**
 * Konfigurasi jalur gasless (WDK `wdk-wallet-evm-7702-gasless`, EIP-7702 +
 * ERC-4337). Env-gated: tanpa `NEXT_PUBLIC_BUNDLER_URL` fitur ini tidak
 * pernah dipakai, sehingga app berperilaku identik dengan jalur klasik.
 */
export const BUNDLER_URL = process.env.NEXT_PUBLIC_BUNDLER_URL ?? "";

/** ID kebijakan sponsorship paymaster (opsional — bergantung provider). */
export const SPONSORSHIP_POLICY_ID =
  process.env.NEXT_PUBLIC_SPONSORSHIP_POLICY_ID ?? "";

/** Alamat implementasi smart account tempat EOA didelegasikan (EIP-7702). */
export const DELEGATION_ADDRESS =
  process.env.NEXT_PUBLIC_DELEGATION_ADDRESS ??
  "0xe6Cae83BdE06E4c305530e199D7217f42808555B";

/** Jalur gasless aktif hanya bila bundler URL disetel lewat env. */
export const GASLESS_ENABLED = BUNDLER_URL.length > 0;
