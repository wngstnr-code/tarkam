import { formatEth, MIN_GAS_WEI } from "@/lib/format";

/**
 * Peringatan gas: muncul saat saldo ETH dompet di bawah ambang aman.
 * Tanpa ETH, mint/bayar akan gagal — ini menjelaskan sebelum user klik.
 */
export function GasWarning({
  ethBalance,
  className = "",
}: {
  ethBalance: bigint | null;
  className?: string;
}) {
  if (ethBalance === null || ethBalance >= MIN_GAS_WEI) return null;

  const empty = ethBalance === 0n;

  return (
    <div
      className={`rounded-lg border border-foreground bg-[#f2b705] p-3 text-xs text-[#3d2e00] shadow-hard-xs ${className}`}
    >
      <p className="mb-1 font-bold tracking-wide uppercase">
        ⛽ {empty ? "Belum ada ETH untuk gas" : "ETH untuk gas menipis"}
      </p>
      <p className="leading-snug">
        Saldo gas {formatEth(ethBalance)} ETH. Setiap transaksi (mint, bayar,
        payout) butuh sedikit Sepolia ETH. Faucet tanpa syarat saldo mainnet:{" "}
        <a
          href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
          target="_blank"
          rel="noreferrer"
          className="font-semibold underline"
        >
          Google Cloud faucet
        </a>{" "}
        (cukup login Google) atau{" "}
        <a
          href="https://sepolia-faucet.pk910.de"
          target="_blank"
          rel="noreferrer"
          className="font-semibold underline"
        >
          PoW faucet
        </a>{" "}
        (menambang di browser). Lalu muat ulang saldo.
      </p>
    </div>
  );
}
