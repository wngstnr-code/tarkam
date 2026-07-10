import { rpcCall } from "@/lib/chain/logs";
import { ESCROW_ADDRESS } from "@/lib/chain/config";
import { ESCROW_IFACE, ERC20_IFACE, ESCROW_STATUS, type EscrowStatus } from "./abi";

/** State on-chain satu turnamen escrow — hasil decode getTournament(). */
export interface EscrowTournamentState {
  organizer: string;
  token: string;
  entryFee: bigint;
  prizes: bigint[];
  approvalThreshold: number;
  refundDeadline: number;
  status: EscrowStatus;
  pot: bigint;
  teamCount: number;
  winners: string[];
  approvals: number;
}

/**
 * Refund terbuka bila turnamen dibatalkan ATAU refund-deadline lewat sebelum
 * hadiah dibayar (proteksi "panitia menghilang" — sama dengan aturan
 * claimRefund di kontrak). Satu-satunya sumber kebenaran untuk semua UI.
 */
export function isRefundOpen(
  state: Pick<EscrowTournamentState, "status" | "refundDeadline">,
  nowMs = Date.now()
): boolean {
  if (state.status === "cancelled") return true;
  return (
    state.refundDeadline !== 0 &&
    nowMs / 1000 >= state.refundDeadline &&
    state.status !== "paid"
  );
}

/** eth_call read-only ke sebuah kontrak (tanpa wallet, failover antar RPC). */
async function ethCall(to: string, data: string): Promise<string> {
  return rpcCall<string>("eth_call", [{ to, data }, "latest"]);
}

export async function getEscrowTournament(
  escrowId: number
): Promise<EscrowTournamentState> {
  const data = ESCROW_IFACE.encodeFunctionData("getTournament", [escrowId]);
  const raw = await ethCall(ESCROW_ADDRESS, data);
  const [v] = ESCROW_IFACE.decodeFunctionResult("getTournament", raw);
  return {
    organizer: v.organizer as string,
    token: v.token as string,
    entryFee: v.entryFee as bigint,
    prizes: [...(v.prizes as bigint[])],
    approvalThreshold: Number(v.approvalThreshold),
    refundDeadline: Number(v.refundDeadline),
    status: ESCROW_STATUS[Number(v.status)],
    pot: v.pot as bigint,
    teamCount: Number(v.teamCount),
    winners: [...(v.winners as string[])],
    approvals: Number(v.approvals),
  };
}

/** Setoran sebuah tim (0 = belum bayar / sudah refund). */
export async function getEscrowDeposit(
  escrowId: number,
  team: string
): Promise<bigint> {
  const data = ESCROW_IFACE.encodeFunctionData("depositOf", [escrowId, team]);
  const raw = await ethCall(ESCROW_ADDRESS, data);
  return ESCROW_IFACE.decodeFunctionResult("depositOf", raw)[0] as bigint;
}

export async function getEscrowHasApproved(
  escrowId: number,
  team: string
): Promise<boolean> {
  const data = ESCROW_IFACE.encodeFunctionData("hasApproved", [escrowId, team]);
  const raw = await ethCall(ESCROW_ADDRESS, data);
  return ESCROW_IFACE.decodeFunctionResult("hasApproved", raw)[0] as boolean;
}

/** Allowance USDT `owner` untuk kontrak escrow (perlu approve sebelum deposit). */
export async function getEscrowAllowance(
  token: string,
  owner: string
): Promise<bigint> {
  const data = ERC20_IFACE.encodeFunctionData("allowance", [owner, ESCROW_ADDRESS]);
  const raw = await ethCall(token, data);
  return ERC20_IFACE.decodeFunctionResult("allowance", raw)[0] as bigint;
}
