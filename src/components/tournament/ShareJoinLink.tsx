"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";

/**
 * Kartu ajakan kapten: QR + link ke halaman `/join/[escrowId]`, yang
 * kaptennya buka di HP-nya sendiri untuk daftar & bayar dari dompetnya sendiri.
 */
export function ShareJoinLink({
  escrowId,
  tournamentName,
}: {
  escrowId: number;
  tournamentName?: string;
}) {
  const { t } = useI18n();
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Origin hanya ada di client — render QR/link setelah mount.
  useEffect(() => {
    setUrl(`${window.location.origin}/join/${escrowId}`);
  }, [escrowId]);

  async function copy() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">{t("sj.title")}</CardTitle>
        <CardDescription>
          {tournamentName ?? null}
          {tournamentName ? " · " : ""}
          {t("sj.desc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
        <div className="shadow-hard-sm shrink-0 rounded-lg border border-foreground bg-white p-2">
          {url && <QRCodeSVG value={url} size={104} />}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="block truncate font-mono text-xs text-primary underline underline-offset-2 hover:no-underline"
              title={url}
            >
              {url}
            </a>
          ) : (
            <p className="font-mono text-xs text-muted-foreground">…</p>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={copy}
            disabled={!url}
          >
            {copied ? t("sj.copied") : t("sj.copy")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
