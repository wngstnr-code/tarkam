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
import { useI18n } from "@/lib/i18n/context";
import type { Team, Tournament } from "@/types";

type Step = "form" | "paying" | "done";

export function AddTeamDialog({
  tournament,
  disabled,
}: {
  tournament: Tournament;
  disabled?: boolean;
}) {
  const { t } = useI18n();
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
    if (!name.trim()) return setError(t("at.err_name"));
    if (captainAddress && !/^0x[0-9a-fA-F]{40}$/.test(captainAddress.trim())) {
      return setError(t("at.err_addr"));
    }
    if (!password) return setError(t("at.err_pw"));

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
          {t("at.add_team")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        {step === "done" && txHash ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("at.done_title")}</DialogTitle>
              <DialogDescription>
                {t("at.done_desc", {
                  name: name || t("at.default_team"),
                  fee: tournament.entryFee,
                })}
              </DialogDescription>
            </DialogHeader>
            <TxReceipt hash={txHash} label={t("at.receipt")} />
            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)}>{t("at.done")}</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t("at.dialog_title")}</DialogTitle>
              <DialogDescription>
                {t("at.dialog_desc_1")}{" "}
                <span className="font-mono font-semibold text-secondary tabular-nums">
                  {tournament.entryFee} USDT
                </span>{" "}
                {t("at.dialog_desc_2")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <GasWarning ethBalance={ethBalance} />
              <div className="space-y-2">
                <Label htmlFor="team-name">{t("at.team_name")}</Label>
                <Input
                  id="team-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Garuda FC"
                  disabled={step === "paying"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-addr">{t("at.captain_opt")}</Label>
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
                <Label htmlFor="team-pw">{t("at.pw_label")}</Label>
                <Input
                  id="team-pw"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && step !== "paying" && handlePayAndAdd()
                  }
                  placeholder={t("at.pw_placeholder")}
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
                  ? t("at.sending")
                  : t("at.pay_btn", { fee: tournament.entryFee })}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
