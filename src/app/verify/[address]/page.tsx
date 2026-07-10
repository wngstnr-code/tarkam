"use client";

import { Suspense, use, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AddressChip } from "@/components/common/AddressChip";
import { TestnetBanner } from "@/components/common/TestnetBanner";
import { addressUrl, txUrl } from "@/lib/chain/config";
import {
  fetchEscrowActivity,
  fetchPoolActivity,
  type PoolEvent,
} from "@/lib/chain/logs";
import { formatUSDT, shortenAddress } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

/** Halaman publik read-only: timeline aliran dana sebuah pool. Tanpa wallet, tanpa data lokal. */
function VerifyPageInner({ params }: { params: Promise<{ address: string }> }) {
  const { t } = useI18n();
  const { address } = use(params);
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  // Mode escrow: filter event kontrak per id turnamen (satu kontrak = banyak turnamen).
  const escrowIdParam = searchParams.get("escrowId");
  const escrowId = escrowIdParam !== null ? Number(escrowIdParam) : null;

  const [events, setEvents] = useState<PoolEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result =
        escrowId !== null && Number.isFinite(escrowId)
          ? await fetchEscrowActivity(escrowId)
          : await fetchPoolActivity(address);
      setEvents(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [address, escrowId]);

  useEffect(() => {
    load();
  }, [load]);

  const totalIn = (events ?? [])
    .filter((e) => e.direction === "in")
    .reduce((sum, e) => sum + e.amount, 0n);
  const totalOut = (events ?? [])
    .filter((e) => e.direction === "out")
    .reduce((sum, e) => sum + e.amount, 0n);
  const net = totalIn - totalOut;

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6 pt-10">
      <TestnetBanner />

      <header>
        <h1 className="font-display text-3xl leading-none">
          {name || t("vf.title_fallback")}
          {escrowId !== null && (
            <Badge variant="secondary" className="ml-2 align-middle">
              {t("pp.escrow_badge")}
            </Badge>
          )}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("vf.subtitle")}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <AddressChip address={address} />
          <a
            className="text-primary underline underline-offset-2 hover:no-underline"
            href={addressUrl(address)}
            target="_blank"
            rel="noreferrer"
          >
            {t("vf.open_explorer")}
          </a>
        </div>
      </header>

      {/* Panel ringkasan ala papan skor, senada dengan PoolPanel */}
      <section className="shadow-hard relative overflow-hidden rounded-xl border border-foreground bg-[#0e3d20] p-5 text-white">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">
              {t("vf.total_in")}
            </p>
            <p className="font-mono text-2xl font-bold tabular-nums text-[#7fe0a7]">
              {formatUSDT(totalIn)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">
              {t("vf.total_out")}
            </p>
            <p className="font-mono text-2xl font-bold tabular-nums text-red-300">
              {formatUSDT(totalOut)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">
              {t("vf.net")}
            </p>
            <p className="font-mono text-2xl font-bold tabular-nums text-white">
              {formatUSDT(net)}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl">{t("vf.timeline")}</h2>

        {loading && (
          <p className="text-sm text-muted-foreground">{t("vf.loading")}</p>
        )}

        {!loading && error && (
          <Card>
            <CardContent className="space-y-3 text-center">
              <p className="text-sm text-destructive">
                {t("vf.error", { error })}
              </p>
              <Button onClick={load}>{t("vf.retry")}</Button>
            </CardContent>
          </Card>
        )}

        {!loading && !error && events && events.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("vf.empty")}</p>
        )}

        {!loading && !error && events && events.length > 0 && (
          <ul className="space-y-2">
            {events.map((e) => (
              <li key={e.txHash + e.direction}>
                <Card size="sm">
                  <CardContent className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={e.direction === "in" ? "default" : "destructive"}
                        className={
                          e.direction === "in"
                            ? "border-foreground bg-[#0e3d20] text-[#7fe0a7]"
                            : ""
                        }
                      >
                        {e.direction === "in" ? t("vf.in") : t("vf.out")}
                      </Badge>
                      {e.kind && (
                        <span className="rounded border border-foreground/30 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                          {t(`vf.k_${e.kind}`)}
                        </span>
                      )}
                      <div>
                        <p className="font-mono text-lg font-bold tabular-nums">
                          {formatUSDT(e.amount)} USDT
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <a
                            href={addressUrl(e.counterparty)}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono hover:underline"
                          >
                            {shortenAddress(e.counterparty)}
                          </a>
                          {" · "}
                          {new Date(e.timestamp * 1000).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <a
                      href={txUrl(e.txHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 text-xs text-primary underline underline-offset-2 hover:no-underline"
                    >
                      {t("vf.open_explorer")}
                    </a>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="pt-2 text-center text-xs text-muted-foreground">
        {t("vf.footer")}
      </footer>
    </main>
  );
}

export default function VerifyPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <VerifyPageInner params={params} />
    </Suspense>
  );
}
