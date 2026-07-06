"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { applyResult } from "@/lib/bracket/engine";
import { putMatches } from "@/lib/db/repo";
import type { Match, Team } from "@/types";

export function BracketView({
  matches,
  teams,
}: {
  matches: Match[];
  teams: Team[];
}) {
  const teamName = (id?: string) =>
    id ? teams.find((t) => t.id === id)?.name ?? "?" : undefined;
  const rounds = [...new Set(matches.map((m) => m.round))].sort((a, b) => a - b);
  const maxRound = rounds[rounds.length - 1];

  return (
    <div className="flex gap-6 overflow-x-auto pb-2">
      {rounds.map((round) => (
        <div key={round} className="min-w-56 space-y-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            {round === maxRound
              ? "Final"
              : round === maxRound - 1
                ? "Semifinal"
                : `Ronde ${round}`}
          </p>
          {matches
            .filter((m) => m.round === round)
            .sort((a, b) => a.slot - b.slot)
            .map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                matches={matches}
                nameA={teamName(m.teamAId)}
                nameB={teamName(m.teamBId)}
              />
            ))}
        </div>
      ))}
    </div>
  );
}

function MatchCard({
  match,
  matches,
  nameA,
  nameB,
}: {
  match: Match;
  matches: Match[];
  nameA?: string;
  nameB?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [sa, setSa] = useState("");
  const [sb, setSb] = useState("");
  const [error, setError] = useState<string | null>(null);
  const playable = !!match.teamAId && !!match.teamBId && !match.winnerTeamId;
  const isBye =
    (match.teamAId || match.teamBId) &&
    (!match.teamAId || !match.teamBId) &&
    match.winnerTeamId;

  async function save() {
    setError(null);
    try {
      const updated = applyResult(matches, match.id, Number(sa), Number(sb));
      await putMatches(updated);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="rounded-md border p-2 text-sm">
      <Row
        name={nameA}
        score={match.scoreA}
        winner={!!match.winnerTeamId && match.winnerTeamId === match.teamAId}
      />
      <Row
        name={nameB}
        score={match.scoreB}
        winner={!!match.winnerTeamId && match.winnerTeamId === match.teamBId}
      />
      {isBye && <p className="mt-1 text-xs text-muted-foreground">Bye — lolos otomatis</p>}
      {playable && !editing && (
        <Button
          size="sm"
          variant="outline"
          className="mt-2 w-full"
          onClick={() => setEditing(true)}
        >
          Input skor
        </Button>
      )}
      {editing && (
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2">
            <Input
              className="h-8"
              inputMode="numeric"
              placeholder="0"
              value={sa}
              onChange={(e) => setSa(e.target.value)}
            />
            <span className="text-muted-foreground">–</span>
            <Input
              className="h-8"
              inputMode="numeric"
              placeholder="0"
              value={sb}
              onChange={(e) => setSb(e.target.value)}
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={save}>
              Simpan
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Batal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  name,
  score,
  winner,
}: {
  name?: string;
  score?: number;
  winner: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-1 py-0.5 ${
        winner ? "font-bold" : name ? "" : "text-muted-foreground"
      }`}
    >
      <span>{name ?? "…"}</span>
      <span className="tabular-nums">{score ?? ""}</span>
    </div>
  );
}
