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
import { addTeam } from "@/lib/db/repo";
import type { Team } from "@/types";

export function AddTeamDialog({
  tournamentId,
  disabled,
}: {
  tournamentId: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [captainAddress, setCaptainAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    setError(null);
    if (!name.trim()) return setError("Nama tim wajib diisi");
    if (captainAddress && !/^0x[0-9a-fA-F]{40}$/.test(captainAddress.trim())) {
      return setError("Alamat dompet kapten tidak valid (0x…40 hex)");
    }
    const team: Team = {
      id: crypto.randomUUID(),
      tournamentId,
      name: name.trim(),
      captainAddress: captainAddress.trim() || undefined,
      paid: false,
    };
    await addTeam(team);
    setName("");
    setCaptainAddress("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          + Tambah tim
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah tim</DialogTitle>
          <DialogDescription>
            Alamat dompet kapten = tujuan transfer hadiah bila juara.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team-name">Nama tim</Label>
            <Input
              id="team-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Garuda FC"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team-addr">Dompet kapten (opsional, bisa nanti)</Label>
            <Input
              id="team-addr"
              value={captainAddress}
              onChange={(e) => setCaptainAddress(e.target.value)}
              placeholder="0x…"
              className="font-mono"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={handleAdd}>Tambah</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
