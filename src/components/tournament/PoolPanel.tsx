"use client";

import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddressChip } from "@/components/common/AddressChip";
import { usePoolBalance } from "@/hooks/usePoolBalance";
import { formatUSDT, parseUSDT } from "@/lib/format";
import { addressUrl } from "@/lib/chain/config";
import type { Tournament } from "@/types";

export function PoolPanel({ tournament }: { tournament: Tournament }) {
  const { balance, error } = usePoolBalance(tournament.poolAddress);
  const target =
    parseUSDT(tournament.entryFee) * BigInt(tournament.teamCount);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brankas hadiah (pool)</CardTitle>
        <CardDescription>
          Alamat publik — siapa pun bisa cek saldonya di explorer, tanpa akun.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-start gap-4">
        <div className="rounded-md border bg-white p-2">
          <QRCodeSVG value={tournament.poolAddress} size={96} />
        </div>
        <div className="space-y-2">
          <p className="text-3xl font-bold tabular-nums">
            {balance === null ? "—" : formatUSDT(balance)}{" "}
            <span className="text-base font-normal text-muted-foreground">
              / {formatUSDT(target)} USDT
            </span>
          </p>
          <AddressChip address={tournament.poolAddress} />
          <p className="text-xs text-muted-foreground">
            Saldo live dari chain (refresh tiap 15 dtk).{" "}
            <a
              className="underline"
              href={addressUrl(tournament.poolAddress)}
              target="_blank"
              rel="noreferrer"
            >
              Audit sendiri di Etherscan →
            </a>
          </p>
          {error && (
            <p className="text-xs text-destructive">RPC error: {error}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
