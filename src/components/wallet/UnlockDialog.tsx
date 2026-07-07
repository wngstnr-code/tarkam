"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/context";

interface UnlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  /** Dipanggil dengan password; lempar error bila salah. */
  onUnlock: (password: string) => Promise<void>;
  confirmLabel?: string;
}

export function UnlockDialog({
  open,
  onOpenChange,
  title,
  description,
  onUnlock,
  confirmLabel,
}: UnlockDialogProps) {
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUnlock() {
    setBusy(true);
    setError(null);
    try {
      await onUnlock(password);
      setPassword("");
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title ?? t("ud.title")}</DialogTitle>
          <DialogDescription>{description ?? t("ud.desc")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="unlock-pw">{t("ud.pw")}</Label>
          <Input
            id="unlock-pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !busy && handleUnlock()}
            autoFocus
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("ud.cancel")}
          </Button>
          <Button onClick={handleUnlock} disabled={busy || !password}>
            {busy ? t("ud.unlocking") : confirmLabel ?? t("ud.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
