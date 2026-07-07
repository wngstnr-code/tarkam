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

const FAUCET_AMOUNT = "1000";

export default function WalletPage() {
  const router = useRouter();
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
        <h1 className="font-display text-3xl">Dompet</h1>
        <Badge variant="outline">Self-custodial · WDK</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Saldo USDT</CardTitle>
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
              ⛽ Gas
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
              Muat ulang saldo
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setFaucetTx(null);
                setShowFaucet(true);
              }}
            >
              + Isi {FAUCET_AMOUNT} USDT uji
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Faucet testnet — mint MockUSDT ke dompetmu. Butuh sedikit Sepolia ETH
            untuk gas.
          </p>
          {faucetTx && (
            <TxReceipt hash={faucetTx} label={`+${FAUCET_AMOUNT} USDT uji ✓`} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Backup</CardTitle>
          <CardDescription>
            Lihat lagi seed phrase-mu (butuh password).
          </CardDescription>
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
                Sembunyikan
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setShowUnlock(true)}>
              Tampilkan seed phrase
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Ganti dompet</CardTitle>
          <CardDescription>
            Keluarkan dompet ini dari device, lalu buat atau pulihkan dompet lain
            saat onboarding.
          </CardDescription>
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
            Keluar / ganti akun
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
            <DialogTitle>Keluarkan dompet dari device?</DialogTitle>
            <DialogDescription>
              Seed terenkripsi dompet ini akan dihapus dari device. Tanpa catatan
              seed phrase, dompet dan saldonya{" "}
              <span className="font-semibold text-destructive">
                tidak bisa dipulihkan
              </span>
              . Data turnamen lokal tetap ada.
            </DialogDescription>
          </DialogHeader>
          <label className="flex items-start gap-2 rounded-lg border border-foreground bg-muted/40 p-3 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 size-4 accent-primary"
              checked={ackBackup}
              onChange={(e) => setAckBackup(e.target.checked)}
            />
            <span>
              Saya sudah mencatat seed phrase dan paham dompet ini akan hilang
              dari device.
            </span>
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogout(false)}>
              Batal
            </Button>
            <Button
              variant="secondary"
              className="border-destructive bg-destructive text-white"
              disabled={!ackBackup}
              onClick={handleLogout}
            >
              Keluarkan dompet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UnlockDialog
        open={showUnlock}
        onOpenChange={setShowUnlock}
        title="Tampilkan seed phrase"
        description="Pastikan tidak ada orang lain yang melihat layarmu."
        onUnlock={async (pw) => {
          setRevealedSeed(await unlockSeed(pw));
        }}
      />

      <UnlockDialog
        open={showFaucet}
        onOpenChange={setShowFaucet}
        title={`Isi ${FAUCET_AMOUNT} USDT uji`}
        description="Masukkan password untuk menandatangani mint MockUSDT ke dompetmu."
        confirmLabel="Mint USDT uji"
        onUnlock={handleFaucet}
      />
    </main>
  );
}
