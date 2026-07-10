import { deriveAccount } from "@/lib/wallet/wdk";
import { rpcCall } from "@/lib/chain/logs";
import { ESCROW_ADDRESS, USDT_ADDRESS } from "@/lib/chain/config";
import { ESCROW_IFACE, ERC20_IFACE } from "./abi";
import { getEscrowAllowance } from "./read";

/**
 * Semua transaksi escrow ditandatangani & di-broadcast via WDK
 * (`account.sendTransaction`) — `Interface` ethers hanya menyusun calldata.
 * Seed di-derive sesaat lalu dibuang (`dispose`) seperti transfer biasa.
 */

interface TxReceiptLog {
  topics: string[];
  data: string;
  address: string;
}

interface TxReceipt {
  status: string;
  logs: TxReceiptLog[];
}

/** Tunggu tx confirmed (polling eth_getTransactionReceipt). */
export async function waitForReceipt(
  hash: string,
  timeoutMs = 120_000
): Promise<TxReceipt> {
  const start = Date.now();
  for (;;) {
    const receipt = await rpcCall<TxReceipt | null>(
      "eth_getTransactionReceipt",
      [hash]
    );
    if (receipt) {
      if (receipt.status !== "0x1") {
        throw new Error(`Transaksi revert on-chain (${hash})`);
      }
      return receipt;
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Transaksi belum confirmed setelah ${timeoutMs / 1000}s (${hash})`);
    }
    await new Promise((r) => setTimeout(r, 4_000));
  }
}

/** Kirim satu contract call via WDK dan tunggu confirmed. */
async function sendViaWdk(
  seedPhrase: string,
  to: string,
  data: string
): Promise<{ hash: string; receipt: TxReceipt }> {
  const { wallet, account } = await deriveAccount(seedPhrase);
  try {
    const result = await account.sendTransaction({ to, data, value: 0n });
    const receipt = await waitForReceipt(result.hash);
    return { hash: result.hash, receipt };
  } finally {
    wallet.dispose();
  }
}

/**
 * Buat turnamen escrow on-chain. Mengembalikan id turnamen di kontrak
 * (didecode dari event TournamentCreated di receipt).
 */
export async function createEscrowTournament(
  seedPhrase: string,
  entryFee: bigint,
  prizes: bigint[],
  approvalThreshold: number,
  refundDeadline: number
): Promise<{ hash: string; escrowId: number }> {
  const data = ESCROW_IFACE.encodeFunctionData("createTournament", [
    USDT_ADDRESS,
    entryFee,
    prizes,
    approvalThreshold,
    refundDeadline,
  ]);
  const { hash, receipt } = await sendViaWdk(seedPhrase, ESCROW_ADDRESS, data);
  const createdTopic = ESCROW_IFACE.getEvent("TournamentCreated")!.topicHash;
  const log = receipt.logs.find(
    (l) =>
      l.address.toLowerCase() === ESCROW_ADDRESS.toLowerCase() &&
      l.topics[0] === createdTopic
  );
  if (!log) throw new Error("Event TournamentCreated tidak ditemukan di receipt");
  return { hash, escrowId: Number(BigInt(log.topics[1])) };
}

/**
 * Setor biaya pendaftaran untuk sebuah tim: approve USDT (bila allowance
 * kurang) lalu deposit. Dua transaksi berurutan, keduanya via WDK.
 */
export async function depositEscrow(
  seedPhrase: string,
  escrowId: number,
  teamAddress: string,
  entryFee: bigint
): Promise<{ hash: string }> {
  const { wallet, account } = await deriveAccount(seedPhrase);
  try {
    const owner = await account.getAddress();
    const allowance = await getEscrowAllowance(USDT_ADDRESS, owner);
    if (allowance < entryFee) {
      const approveData = ERC20_IFACE.encodeFunctionData("approve", [
        ESCROW_ADDRESS,
        entryFee,
      ]);
      const approveTx = await account.sendTransaction({
        to: USDT_ADDRESS,
        data: approveData,
        value: 0n,
      });
      await waitForReceipt(approveTx.hash);
    }
    const depositData = ESCROW_IFACE.encodeFunctionData("deposit", [
      escrowId,
      teamAddress,
    ]);
    const tx = await account.sendTransaction({
      to: ESCROW_ADDRESS,
      data: depositData,
      value: 0n,
    });
    await waitForReceipt(tx.hash);
    return { hash: tx.hash };
  } finally {
    wallet.dispose();
  }
}

/** Panitia mengusulkan pemenang (urut rank, sesuai daftar hadiah). */
export async function proposeEscrowPayout(
  seedPhrase: string,
  escrowId: number,
  winners: string[]
): Promise<{ hash: string }> {
  const data = ESCROW_IFACE.encodeFunctionData("proposePayout", [escrowId, winners]);
  const { hash } = await sendViaWdk(seedPhrase, ESCROW_ADDRESS, data);
  return { hash };
}

/** Tim penyetor menyetujui usulan payout. */
export async function approveEscrowPayout(
  seedPhrase: string,
  escrowId: number
): Promise<{ hash: string }> {
  const data = ESCROW_IFACE.encodeFunctionData("approvePayout", [escrowId]);
  const { hash } = await sendViaWdk(seedPhrase, ESCROW_ADDRESS, data);
  return { hash };
}

/** Eksekusi payout: semua hadiah + surplus dibayar dalam satu transaksi. */
export async function executeEscrowPayout(
  seedPhrase: string,
  escrowId: number
): Promise<{ hash: string }> {
  const data = ESCROW_IFACE.encodeFunctionData("executePayout", [escrowId]);
  const { hash } = await sendViaWdk(seedPhrase, ESCROW_ADDRESS, data);
  return { hash };
}

/** Batalkan turnamen — membuka jalur refund untuk semua tim. */
export async function cancelEscrow(
  seedPhrase: string,
  escrowId: number
): Promise<{ hash: string }> {
  const data = ESCROW_IFACE.encodeFunctionData("cancel", [escrowId]);
  const { hash } = await sendViaWdk(seedPhrase, ESCROW_ADDRESS, data);
  return { hash };
}

/** Tarik refund untuk sebuah tim (dana selalu ke alamat tim). */
export async function claimEscrowRefund(
  seedPhrase: string,
  escrowId: number,
  teamAddress: string
): Promise<{ hash: string }> {
  const data = ESCROW_IFACE.encodeFunctionData("claimRefund", [escrowId, teamAddress]);
  const { hash } = await sendViaWdk(seedPhrase, ESCROW_ADDRESS, data);
  return { hash };
}
