"use client";

import { useCallback, useEffect, useState } from "react";
import { getEscrowTournament, type EscrowTournamentState } from "@/lib/escrow/read";

/** Polling state on-chain turnamen escrow (pot, status, approvals, dst.). */
export function useEscrowState(escrowId: number | undefined, intervalMs = 15_000) {
  const [state, setState] = useState<EscrowTournamentState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (escrowId === undefined) return;
    try {
      const s = await getEscrowTournament(escrowId);
      setState(s);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [escrowId]);

  useEffect(() => {
    if (escrowId === undefined) return;
    refresh();
    const id = setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [escrowId, intervalMs, refresh]);

  return { state, error, refresh };
}
