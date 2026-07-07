"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWdkWallet } from "@/hooks/useWdkWallet";
import { AddressChip } from "@/components/common/AddressChip";
import { TxReceipt } from "@/components/common/TxReceipt";
import { UnlockDialog } from "@/components/wallet/UnlockDialog";
import { SeedPhraseReveal } from "@/components/wallet/SeedPhraseReveal";
import { GasWarning } from "@/components/wallet/GasWarning";
import { mintTestUsdt } from "@/lib/wallet/mint";
import { humanizeTxError } from "@/lib/wallet/errors";
import { formatUSDT, formatEth, parseUSDT, MIN_GAS_WEI } from "@/lib/format";
import { USDT_ADDRESS } from "@/lib/chain/config";
import { useI18n } from "@/lib/i18n/context";

const FAUCET_AMOUNT = "1000";

export default function WalletPage() {
  const router = useRouter();
  const { t } = useI18n();
  const {
    address,
    hydrated,
    usdtBalance,
    ethBalance,
    refreshBalance,
    unlockSeed,
    logout,
  } = useWdkWallet();
  const [showUnlock, setShowUnlock] = useState(false);
  const [revealedSeed, setRevealedSeed] = useState<string | null>(null);
  const [showLogout, setShowLogout] = useState(false);
  const [ackBackup, setAckBackup] = useState(false);
  const [showFaucet, setShowFaucet] = useState(false);
  const [faucetTx, setFaucetTx] = useState<string | null>(null);

  async function handleLogout() {
    await logout();
    router.replace("/onboarding");
  }

  async function handleFaucet(password: string) {
    try {
      const seed = await unlockSeed(password);
      const hash = await mintTestUsdt(seed, address!, parseUSDT(FAUCET_AMOUNT));
      setFaucetTx(hash);
      await refreshBalance();
    } catch (e) {
      // UnlockDialog menampilkan pesan yang dilempar — buat ramah dulu.
      throw new Error(humanizeTxError(e));
    }
  }

  useEffect(() => {
    if (hydrated && !address) router.replace("/onboarding");
  }, [hydrated, address, router]);

  useEffect(() => {
    if (address && USDT_ADDRESS) refreshBalance();
  }, [address, refreshBalance]);

  if (!hydrated || !address) return null;

  return (
    <main className="mx-auto max-w-md space-y-6 p-6 pt-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">{t("w.title")}</h1>
        <Badge variant="outline">{t("w.badge")}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">{t("w.usdt_balance")}</CardTitle>
          <CardDescription>
            <AddressChip address={address} />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="font-mono text-3xl font-bold text-secondary tabular-nums">
            {usdtBalance === null ? "—" : formatUSDT(usdtBalance)}{" "}
            <span className="text-base font-normal text-muted-foreground">
              USDT
            </span>
          </p>
          <div className="flex items-center justify-between border-t border-border pt-2 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              {t("w.gas")}
            </span>
            <span
              className={`font-mono tabular-nums ${
                ethBalance !== null && ethBalance < MIN_GAS_WEI
                  ? "font-bold text-destructive"
                  : "text-foreground"
              }`}
            >
              {ethBalance === null ? "—" : formatEth(ethBalance)} ETH
            </span>
          </div>
          <GasWarning ethBalance={ethBalance} />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={refreshBalance}>
              {t("w.refresh")}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setFaucetTx(null);
                setShowFaucet(true);
              }}
            >
              {t("w.faucet_btn", { amt: FAUCET_AMOUNT })}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{t("w.faucet_note")}</p>
          {faucetTx && (
            <TxReceipt
              hash={faucetTx}
              label={t("w.faucet_receipt", { amt: FAUCET_AMOUNT })}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">{t("w.backup")}</CardTitle>
          <CardDescription>{t("w.backup_desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {revealedSeed ? (
            <>
              <SeedPhraseReveal seedPhrase={revealedSeed} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRevealedSeed(null)}
              >
                {t("w.hide")}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setShowUnlock(true)}>
              {t("w.show_seed")}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">{t("w.switch_wallet")}</CardTitle>
          <CardDescription>{t("w.switch_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="border-destructive text-destructive"
            onClick={() => {
              setAckBackup(false);
              setShowLogout(true);
            }}
          >
            {t("w.logout_btn")}
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={showLogout}
        onOpenChange={(o) => {
          setShowLogout(o);
          if (!o) setAckBackup(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("w.logout_title")}</DialogTitle>
            <DialogDescription>
              {t("w.logout_desc_1")}{" "}
              <span className="font-semibold text-destructive">
                {t("w.logout_desc_strong")}
              </span>
              {t("w.logout_desc_2")}
            </DialogDescription>
          </DialogHeader>
          <label className="flex items-start gap-2 rounded-lg border border-foreground bg-muted/40 p-3 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 size-4 accent-primary"
              checked={ackBackup}
              onChange={(e) => setAckBackup(e.target.checked)}
            />
            <span>{t("w.logout_ack")}</span>
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogout(false)}>
              {t("w.cancel")}
            </Button>
            <Button
              variant="secondary"
              className="border-destructive bg-destructive text-white"
              disabled={!ackBackup}
              onClick={handleLogout}
            >
              {t("w.logout_confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UnlockDialog
        open={showUnlock}
        onOpenChange={setShowUnlock}
        title={t("w.unlock_seed_title")}
        description={t("w.unlock_seed_desc")}
        onUnlock={async (pw) => {
          setRevealedSeed(await unlockSeed(pw));
        }}
      />

      <UnlockDialog
        open={showFaucet}
        onOpenChange={setShowFaucet}
        title={t("w.faucet_title", { amt: FAUCET_AMOUNT })}
        description={t("w.faucet_unlock_desc")}
        confirmLabel={t("w.faucet_confirm")}
        onUnlock={handleFaucet}
      />
    </main>
  );
}
