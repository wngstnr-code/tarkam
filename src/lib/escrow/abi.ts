import { Interface } from "ethers";

/**
 * ABI TarkamEscrow (contracts/TarkamEscrow.sol). `Interface` ethers dipakai
 * HANYA untuk encode/decode calldata — tanda tangan & broadcast tetap via WDK.
 */
export const ESCROW_IFACE = new Interface([
  "function createTournament(address token, uint256 entryFee, uint256[] prizes, uint256 approvalThreshold, uint256 refundDeadline) returns (uint256)",
  "function deposit(uint256 id, address team)",
  "function proposePayout(uint256 id, address[] winners)",
  "function approvePayout(uint256 id)",
  "function executePayout(uint256 id)",
  "function cancel(uint256 id)",
  "function claimRefund(uint256 id, address team)",
  "function depositOf(uint256 id, address team) view returns (uint256)",
  "function hasApproved(uint256 id, address team) view returns (bool)",
  "function getTournament(uint256 id) view returns (tuple(address organizer, address token, uint256 entryFee, uint256[] prizes, uint256 approvalThreshold, uint256 refundDeadline, uint8 status, uint256 pot, uint256 teamCount, address[] winners, uint256 approvals))",
  "function getTeams(uint256 id) view returns (address[])",
  "event TournamentCreated(uint256 indexed id, address indexed organizer, address token, uint256 entryFee, uint256[] prizes, uint256 approvalThreshold, uint256 refundDeadline)",
  "event Deposited(uint256 indexed id, address indexed team, address indexed payer, uint256 amount)",
  "event PayoutProposed(uint256 indexed id, address[] winners)",
  "event PayoutApproved(uint256 indexed id, address indexed team, uint256 approvals)",
  "event PrizePaid(uint256 indexed id, address indexed team, uint256 rank, uint256 amount)",
  "event SurplusWithdrawn(uint256 indexed id, address indexed organizer, uint256 amount)",
  "event TournamentCancelled(uint256 indexed id)",
  "event Refunded(uint256 indexed id, address indexed team, uint256 amount)",
]);

/** ABI minimum ERC-20 untuk approve/allowance (setoran via transferFrom). */
export const ERC20_IFACE = new Interface([
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
]);

/** Status turnamen di kontrak (urutan enum Solidity). */
export const ESCROW_STATUS = ["open", "proposed", "paid", "cancelled"] as const;
export type EscrowStatus = (typeof ESCROW_STATUS)[number];
