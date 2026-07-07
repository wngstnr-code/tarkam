"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AddressChip } from "@/components/common/AddressChip";
import { Logo } from "@/components/common/Logo";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { useWdkWallet } from "@/hooks/useWdkWallet";
import { useI18n } from "@/lib/i18n/context";

export function Navbar() {
  const { address } = useWdkWallet();
  const { t } = useI18n();

  return (
    <nav className="sticky top-0 z-40 border-b border-foreground bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4">
        <Link
          href="/"
          className="shrink-0 rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          aria-label={t("nav.home_aria")}
        >
          <Logo className="text-lg sm:text-2xl" iconClassName="size-5 sm:size-6" />
        </Link>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <LanguageToggle />
          {address && (
            <>
              {/* Alamat disembunyikan di layar kecil agar navbar tak berdesakan — tetap tampil di /wallet. */}
              <span className="hidden sm:inline-flex">
                <AddressChip address={address} />
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link href="/wallet">{t("nav.wallet")}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
