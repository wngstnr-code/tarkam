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
import { useWdkWallet } from "@/hooks/useWdkWallet";
import { AddressChip } from "@/components/common/AddressChip";
import { UnlockDialog } from "@/components/wallet/UnlockDialog";
import { SeedPhraseReveal } from "@/components/wallet/SeedPhraseReveal";
import { formatUSDT } from "@/lib/format";
import { USDT_ADDRESS } from "@/lib/chain/config";

export default function WalletPage() {
  const router = useRouter();
  const { address, hydrated, usdtBalance, refreshBalance, unlockSeed } =
    useWdkWallet();
  const [showUnlock, setShowUnlock] = useState(false);
  const [revealedSeed, setRevealedSeed] = useState<string | null>(null);

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
          <CardTitle>Saldo USDT</CardTitle>
          <CardDescription>
            <AddressChip address={address} />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-3xl font-bold tabular-nums">
            {usdtBalance === null ? "—" : formatUSDT(usdtBalance)}{" "}
            <span className="text-base font-normal text-muted-foreground">
              USDT
            </span>
          </p>
          <Button variant="outline" size="sm" onClick={refreshBalance}>
            Muat ulang saldo
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup</CardTitle>
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

      <UnlockDialog
        open={showUnlock}
        onOpenChange={setShowUnlock}
        title="Tampilkan seed phrase"
        description="Pastikan tidak ada orang lain yang melihat layarmu."
        onUnlock={async (pw) => {
          setRevealedSeed(await unlockSeed(pw));
        }}
      />
    </main>
  );
}
