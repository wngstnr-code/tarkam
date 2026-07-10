"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AddressChip } from "@/components/common/AddressChip";
import { TestnetBanner } from "@/components/common/TestnetBanner";
import { TxReceipt } from "@/components/common/TxReceipt";
import { UnlockDialog } from "@/components/wallet/UnlockDialog";
import { GasWarning } from "@/components/wallet/GasWarning";
import { useEscrowState } from "@/hooks/useEscrowState";
import { useWdkWallet } from "@/hooks/useWdkWallet";
import { getEscrowDeposit, getEscrowHasApproved, isRefundOpen } from "@/lib/escrow/read";
import { depositEscrow, approveEscrowPayout, claimEscrowRefund } from "@/lib/escrow/write";
import { humanizeTxError } from "@/lib/wallet/errors";
import { addressUrl, ESCROW_ADDRESS, GASLESS_ENABLED } from "@/lib/chain/config";
import { formatUSDT, shortenAddress } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

type Action = "deposit" | "approve" | "refund";

/** Peta status escrow → kunci kamus; exhaustive, dicek TypeScript. */
const STATUS_KEY = {
  open: "jn.status_open",
  proposed: "jn.status_proposed",
  paid: "jn.status_paid",
  cancelled: "jn.status_cancelled",
} as const;

/**
 * Halaman kapten, dibuka di HP kaptennya sendiri: lihat detail turnamen
 * langsung on-chain, bayar deposit & setujui payout dari dompet WDK sendiri.
 * Tidak memakai data lokal panitia sama sekali.
 */
export default function JoinPage({
  params,
}: {
  params: Promise<{ escrowId: string }>;
}) {
  const { t } = useI18n();
  const { escrowId: escrowIdParam } = use(params);
  const escrowId = Number(escrowIdParam);
  const validId = Number.isFinite(escrowId) && Number.isInteger(escrowId);

  const { state, error, refresh } = useEscrowState(validId ? escrowId : undefined);
  const { address, hydrated, usdtBalance, ethBalance, unlockSeed, refreshBalance } =
    useWdkWallet();

  const [deposit, setDeposit] = useState<bigint | null>(null);
  const [approved, setApproved] = useState(false);
  const [action, setAction] = useState<Action | null>(null);
  const [lastHash, setLastHash] = useState<string | null>(null);

  const refreshUserState = useCallback(async () => {
    if (!validId || !address) return;
    const [d, a] = await Promise.all([
      getEscrowDeposit(escrowId, address),
      getEscrowHasApproved(escrowId, address),
    ]);
    setDeposit(d);
    setApproved(a);
  }, [validId, escrowId, address]);

  useEffect(() => {
    refreshUserState();
  }, [refreshUserState]);

  if (!validId) {
    return (
      <main className="mx-auto max-w-2xl space-y-6 p-6 pt-10">
        <TestnetBanner />
        <p className="text-sm text-destructive">{t("jn.invalid_id")}</p>
      </main>
    );
  }

  async function run(kind: Action, password: string) {
    const seed = await unlockSeed(password);
    try {
      if (kind === "deposit") {
        const { hash } = await depositEscrow(seed, escrowId, address!, state!.entryFee);
        setLastHash(hash);
      } else if (kind === "approve") {
        const { hash } = await approveEscrowPayout(seed, escrowId);
        setLastHash(hash);
      } else {
        const { hash } = await claimEscrowRefund(seed, escrowId, address!);
        setLastHash(hash);
      }
      await Promise.all([refresh(), refreshUserState(), refreshBalance()]);
    } catch (e) {
      throw new Error(humanizeTxError(e));
    }
  }

  const status = state?.status;
  const refundOpen = !!state && isRefundOpen(state);
  const lowBalance =
    !!state && usdtBalance !== null && usdtBalance < state.entryFee;
  const verifyHref = `/verify/${ESCROW_ADDRESS}?escrowId=${escrowId}`;

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6 pt-10">
      <TestnetBanner />

      <header className="space-y-3">
        <h1 className="font-display text-3xl leading-none">
          {t("jn.title", { id: escrowId })}{" "}
          <Badge variant="secondary" className="ml-1 align-middle">
            {t("jn.escrow_badge")}
          </Badge>
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground">{t("jn.contract_label")}</span>
          <AddressChip address={ESCROW_ADDRESS} />
          <a
            className="text-primary underline underline-offset-2 hover:no-underline"
            href={addressUrl(ESCROW_ADDRESS)}
            target="_blank"
            rel="noreferrer"
          >
            {t("jn.open_explorer")}
          </a>
          <Link
            className="text-primary underline underline-offset-2 hover:no-underline"
            href={verifyHref}
          >
            {t("jn.verify_link")}
          </Link>
        </div>
      </header>

      {!state && !error && (
        <p className="text-sm text-muted-foreground">{t("jn.loading")}</p>
      )}

      {error && (
        <Card>
          <CardContent className="space-y-3 text-center">
            <p className="text-sm text-destructive">{t("jn.load_error", { error })}</p>
            <Button onClick={refresh}>{t("jn.retry")}</Button>
          </CardContent>
        </Card>
      )}

      {state && (
        <>
          {/* Panel ringkasan ala papan skor, senada dengan verify/PoolPanel */}
          <section className="shadow-hard relative overflow-hidden rounded-xl border border-foreground bg-[#0e3d20] p-5 text-white">
            <div className="relative space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold tracking-widest text-white/70 uppercase">
                  {t(STATUS_KEY[state.status])}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">
                    {t("jn.entry_fee")}
                  </p>
                  <p className="font-mono text-2xl font-bold tabular-nums text-[#7fe0a7]">
                    {formatUSDT(state.entryFee)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">
                    {t("jn.pot")}
                  </p>
                  <p className="font-mono text-2xl font-bold tabular-nums text-[#7fe0a7]">
                    {formatUSDT(state.pot)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">
                    {t("jn.team_count")}
                  </p>
                  <p className="font-mono text-2xl font-bold tabular-nums text-white">
                    {state.teamCount}
                  </p>
                </div>
              </div>
              <Separator className="bg-white/20" />
              <div className="space-y-1.5">
                <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">
                  {t("jn.prizes_title")}
                </p>
                {state.prizes.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-white/80">{t("jn.prize_rank", { n: i + 1 })}</span>
                    <span className="font-mono tabular-nums">{formatUSDT(p)} USDT</span>
                  </div>
                ))}
              </div>
              {status === "proposed" && (
                <div className="flex items-center justify-between rounded-lg border border-white/20 p-3 text-sm">
                  <span>{t("jn.approvals")}</span>
                  <span className="font-mono text-lg font-bold tabular-nums">
                    {state.approvals} / {state.approvalThreshold}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Gate dompet */}
          {hydrated && address === null && (
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-xl">
                  {t("jn.no_wallet_title")}
                </CardTitle>
                <CardDescription>{t("jn.no_wallet_desc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/onboarding">
                  <Button>{t("jn.no_wallet_btn")}</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {address && (
            <>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-muted-foreground">{t("jn.your_wallet")}</span>
                <AddressChip address={address} />
                {GASLESS_ENABLED && (
                  <Badge variant="secondary" className="font-normal">
                    {t("gl.badge")}
                  </Badge>
                )}
              </div>

              {/* Status open: belum daftar → tombol bayar */}
              {status === "open" && (deposit ?? 0n) === 0n && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display text-xl">
                      {t("jn.deposit_title")}
                    </CardTitle>
                    <CardDescription>{t("jn.deposit_desc")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {lowBalance && (
                      <div className="space-y-2">
                        <p className="text-sm text-amber-600">
                          {t("jn.balance_low", {
                            balance: formatUSDT(usdtBalance ?? 0n),
                            fee: formatUSDT(state.entryFee),
                          })}
                        </p>
                        <Link href="/wallet">
                          <Button variant="outline" size="sm">
                            {t("jn.go_wallet")}
                          </Button>
                        </Link>
                      </div>
                    )}
                    {!GASLESS_ENABLED && <GasWarning ethBalance={ethBalance} />}
                    <Button
                      className="w-full"
                      disabled={lowBalance}
                      onClick={() => setAction("deposit")}
                    >
                      {t("jn.deposit_btn")}
                    </Button>
                    {lastHash && <TxReceipt hash={lastHash} label={t("jn.receipt")} />}
                  </CardContent>
                </Card>
              )}

              {/* Sudah daftar (deposit > 0) — hanya selama escrow masih open;
                  saat proposed/paid/refund ada kartu sendiri yang lebih relevan. */}
              {(deposit ?? 0n) > 0n && status === "open" && !refundOpen && (
                <Card>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-secondary">
                        {t("jn.registered_title")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("jn.registered_desc", { amount: formatUSDT(deposit!) })}
                      </p>
                    </div>
                    {lastHash && <TxReceipt hash={lastHash} label={t("jn.receipt")} />}
                  </CardContent>
                </Card>
              )}

              {/* Status proposed: daftar pemenang + persetujuan */}
              {status === "proposed" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display text-xl">
                      {t("jn.proposed_title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 rounded-lg border border-foreground/25 bg-muted/40 p-4 text-sm">
                      {state.winners.map((w, i) => (
                        <div key={i} className="flex items-center justify-between gap-2">
                          <span className="text-xs tracking-wider text-muted-foreground uppercase">
                            {t("jn.prize_rank", { n: i + 1 })}
                          </span>
                          <span className="font-mono">
                            {shortenAddress(w)}
                            {address.toLowerCase() === w.toLowerCase() && (
                              <span className="ml-2 text-secondary">
                                {t("jn.you_are_winner")}
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                    {(deposit ?? 0n) === 0n ? (
                      <p className="text-sm text-muted-foreground">
                        {t("jn.not_depositor")}
                      </p>
                    ) : approved ? (
                      <p className="text-sm font-semibold text-secondary">
                        {t("jn.already_approved")}
                      </p>
                    ) : (
                      <Button className="w-full" onClick={() => setAction("approve")}>
                        {t("jn.approve_btn")}
                      </Button>
                    )}
                    {lastHash && <TxReceipt hash={lastHash} label={t("jn.receipt")} />}
                  </CardContent>
                </Card>
              )}

              {/* Status paid */}
              {status === "paid" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display text-xl">
                      {t("jn.paid_title")}
                    </CardTitle>
                    <CardDescription>{t("jn.paid_desc")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link
                      className="text-primary text-sm underline underline-offset-2 hover:no-underline"
                      href={verifyHref}
                    >
                      {t("jn.verify_link")}
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Refund terbuka (cancelled atau deadline lewat) */}
              {refundOpen && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display text-xl">
                      {t("jn.refund_title")}
                    </CardTitle>
                    <CardDescription>{t("jn.refund_desc")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(deposit ?? 0n) === 0n ? (
                      <p className="text-sm text-muted-foreground">
                        {t("jn.no_deposit_refund")}
                      </p>
                    ) : (
                      <Button className="w-full" onClick={() => setAction("refund")}>
                        {t("jn.refund_btn")}
                      </Button>
                    )}
                    {lastHash && <TxReceipt hash={lastHash} label={t("jn.receipt")} />}
                  </CardContent>
                </Card>
              )}

            </>
          )}
        </>
      )}

      <UnlockDialog
        open={action !== null}
        onOpenChange={(o) => !o && setAction(null)}
        title={
          action === "deposit"
            ? t("jn.deposit_unlock_title")
            : action === "approve"
              ? t("jn.approve_unlock_title")
              : t("jn.refund_unlock_title")
        }
        description={
          action === "deposit"
            ? t("jn.deposit_unlock_desc")
            : action === "approve"
              ? t("jn.approve_unlock_desc")
              : t("jn.refund_unlock_desc")
        }
        confirmLabel={t("jn.unlock_confirm")}
        onUnlock={async (password) => {
          if (action) await run(action, password);
        }}
      />

      <footer className="pt-2 text-center text-xs text-muted-foreground">
        {t("jn.footer")}
      </footer>
    </main>
  );
}
