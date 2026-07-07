"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AddressChip } from "@/components/common/AddressChip";
import { useWdkWallet } from "@/hooks/useWdkWallet";

export function Navbar() {
  const { address } = useWdkWallet();

  return (
    <nav className="sticky top-0 z-40 border-b border-foreground bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="font-display text-2xl text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          ⚽ Tarkam
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
