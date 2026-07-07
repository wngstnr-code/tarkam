/**
 * Terjemahkan error transaksi (ethers/WDK/kontrak) jadi pesan bahasa manusia.
 * Tanpa ini, revert mentah seperti `execution reverted: "insufficient balance"
 * (action="estimateGas", data="0x08c379a0…")` membanjiri UI dan bikin panik.
 */
export function humanizeTxError(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e);
  const s = raw.toLowerCase();

  // Saldo token (USDT) kurang — revert dari kontrak MockUSDT._transfer.
  if (s.includes("insufficient balance")) {
    return "Saldo USDT dompet kurang untuk jumlah ini. Isi dulu USDT uji lewat menu Dompet.";
  }
  // Saldo native (ETH) kurang untuk gas.
  if (s.includes("insufficient funds")) {
    return "ETH untuk biaya gas kurang. Isi Sepolia ETH dulu ke dompet ini (faucet testnet).";
  }
  // Password salah → AES-GCM gagal decrypt.
  if (
    s.includes("operationerror") ||
    s.includes("decrypt") ||
    s.includes("bad decrypt") ||
    s.includes("password")
  ) {
    return "Password dompet salah.";
  }
  // Alamat tujuan tidak valid.
  if (s.includes("invalid address") || s.includes("bad address")) {
    return "Alamat tujuan tidak valid.";
  }
  // Node RPC balas error server (HTTP 500 dsb) — khas ethers SERVER_ERROR.
  if (
    s.includes("server response") ||
    s.includes("server_error") ||
    s.includes("bad response") ||
    s.includes("could not coalesce") ||
    s.includes("missing response")
  ) {
    return "Node RPC sedang bermasalah (server 500). Coba lagi sebentar — aplikasi otomatis mencoba node cadangan.";
  }
  // Masalah jaringan / RPC.
  if (
    s.includes("network") ||
    s.includes("timeout") ||
    s.includes("fetch") ||
    s.includes("econn")
  ) {
    return "Gangguan jaringan ke node. Coba lagi sebentar.";
  }

  // Fallback: ambil kalimat pertama yang ringkas, jangan seluruh dump.
  const firstLine = raw.split("\n")[0].split(" (")[0].trim();
  return firstLine.length > 140 ? firstLine.slice(0, 140) + "…" : firstLine;
}
