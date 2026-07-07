"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TxReceipt } from "@/components/common/TxReceipt";
import { GasWarning } from "@/components/wallet/GasWarning";
import { useWdkWallet } from "@/hooks/useWdkWallet";
import { transferUsdt } from "@/lib/wallet/transfer";
import { humanizeTxError } from "@/lib/wallet/errors";
import { addTeam } from "@/lib/db/repo";
import { parseUSDT } from "@/lib/format";
import type { Team, Tournament } from "@/types";

type Step = "form" | "paying" | "done";

export function AddTeamDialog({
  tournament,
  disabled,
}: {
  tournament: Tournament;
  disabled?: boolean;
}) {
  const { unlockSeed, refreshBalance, ethBalance } = useWdkWallet();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [captainAddress, setCaptainAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  function reset() {
    setStep("form");
    setName("");
    setCaptainAddress("");
    setPassword("");
    setError(null);
    setTxHash(null);
  }

  function handleOpenChange(next: boolean) {
    // Jangan tutup di tengah pengiriman on-chain.
    if (step === "paying") return;
    setOpen(next);
    if (next) refreshBalance(); // segarkan status gas saat dialog dibuka
    if (!next) reset();
  }

  async function handlePayAndAdd() {
    setError(null);
    if (!name.trim()) return setError("Nama tim wajib diisi");
    if (captainAddress && !/^0x[0-9a-fA-F]{40}$/.test(captainAddress.trim())) {
      return setError("Alamat dompet kapten tidak valid (0x…40 hex)");
    }
    if (!password) return setError("Password dompet wajib untuk membayar");

    setStep("paying");
    try {
      // 1. Buka seed dompet panitia (dibuang lagi setelah dipakai di transferUsdt).
      const seed = await unlockSeed(password);
      // 2. Kirim biaya daftar ke brankas turnamen. Gagal di sini = tim tidak dibuat.
      const { hash } = await transferUsdt(
        seed,
        tournament.poolAddress,
        parseUSDT(tournament.entryFee)
      );
      // 3. Baru simpan tim — sudah lunas, dengan bukti tx-nya.
      const team: Team = {
        id: crypto.randomUUID(),
        tournamentId: tournament.id,
        name: name.trim(),
        captainAddress: captainAddress.trim() || undefined,
        paid: true,
        paymentTxHash: hash,
      };
      await addTeam(team);
      await refreshBalance();
      setTxHash(hash);
      setStep("done");
    } catch (e) {
      setError(humanizeTxError(e));
      setStep("form");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          + Tambah tim
        </Button>
      </DialogTrigger>
      <DialogContent>
        {step === "done" && txHash ? (
          <>
            <DialogHeader>
              <DialogTitle>Tim terdaftar &amp; lunas</DialogTitle>
              <DialogDescription>
                {name || "Tim"} sudah membayar {tournament.entryFee} USDT ke
                brankas. Bukti transfer tersimpan permanen di chain.
              </DialogDescription>
            </DialogHeader>
            <TxReceipt hash={txHash} label="Biaya daftar terkirim ✓" />
            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)}>Selesai</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Tambah tim</DialogTitle>
              <DialogDescription>
                Biaya daftar{" "}
                <span className="font-mono font-semibold text-secondary tabular-nums">
                  {tournament.entryFee} USDT
                </span>{" "}
                dikirim dari dompetmu ke brankas. Tim baru masuk setelah transfer
                sukses.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <GasWarning ethBalance={ethBalance} />
              <div className="space-y-2">
                <Label htmlFor="team-name">Nama tim</Label>
                <Input
                  id="team-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Garuda FC"
                  disabled={step === "paying"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-addr">
                  Dompet kapten (opsional, tujuan hadiah)
                </Label>
                <Input
                  id="team-addr"
                  value={captainAddress}
                  onChange={(e) => setCaptainAddress(e.target.value)}
                  placeholder="0x…"
                  className="font-mono"
                  disabled={step === "paying"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-pw">Password dompet (untuk membayar)</Label>
                <Input
                  id="team-pw"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && step !== "paying" && handlePayAndAdd()
                  }
                  placeholder="Password dompet panitia"
                  disabled={step === "paying"}
                />
              </div>
              {error && (
                <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-2 text-sm break-words text-destructive">
                  {error}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handlePayAndAdd} disabled={step === "paying"}>
                {step === "paying"
                  ? "Mengirim ke brankas…"
                  : `Bayar ${tournament.entryFee} USDT & daftar`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
