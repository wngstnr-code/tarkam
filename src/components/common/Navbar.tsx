"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AddressChip } from "@/components/common/AddressChip";
import { Logo } from "@/components/common/Logo";
import { useWdkWallet } from "@/hooks/useWdkWallet";

export function Navbar() {
  const { address } = useWdkWallet();

  return (
    <nav className="sticky top-0 z-40 border-b border-foreground bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          aria-label="Tarkam — beranda"
        >
          <Logo />
        </Link>
        {address && (
          <div className="flex items-center gap-2">
            <AddressChip address={address} />
            <Button variant="outline" size="sm" asChild>
              <Link href="/wallet">Dompet</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
