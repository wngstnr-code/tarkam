"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { applyResult } from "@/lib/bracket/engine";
import { putMatches } from "@/lib/db/repo";
import { useI18n } from "@/lib/i18n/context";
import type { Match, Team } from "@/types";

export function BracketView({
  matches,
  teams,
}: {
  matches: Match[];
  teams: Team[];
}) {
  const { t } = useI18n();
  const teamName = (id?: string) =>
    id ? teams.find((t) => t.id === id)?.name ?? "?" : undefined;
  const rounds = [...new Set(matches.map((m) => m.round))].sort((a, b) => a - b);
  const maxRound = rounds[rounds.length - 1];

  const roundLabel = (round: number) =>
    round === maxRound
      ? t("bv.final")
      : round === maxRound - 1
        ? t("bv.semifinal")
        : round === maxRound - 2
          ? t("bv.quarterfinal")
          : t("bv.round", { n: round });

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-h-[22rem] items-stretch">
        {rounds.map((round, ri) => {
          const rms = matches
            .filter((m) => m.round === round)
            .sort((a, b) => a.slot - b.slot);
          const isLast = ri === rounds.length - 1;
          return (
            <div key={round} className="flex items-stretch">
              {/* Kolom ronde */}
              <div className="flex w-64 shrink-0 flex-col">
                <p
                  className={`flex h-8 items-center justify-center text-center text-xs font-bold tracking-wider uppercase ${
                    round === maxRound ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {roundLabel(round)}
                </p>
                <div className="flex flex-1 flex-col">
                  {rms.map((m) => (
                    <div key={m.id} className="flex flex-1 items-center px-1 py-2">
                      <div className="w-full">
                        <MatchCard
                          match={m}
                          matches={matches}
                          nameA={teamName(m.teamAId)}
                          nameB={teamName(m.teamBId)}
                          isFinal={round === maxRound}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Garis penghubung ke ronde berikutnya */}
              {!isLast && <Connectors count={rms.length} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Garis siku "]" yang menyatukan tiap pasangan laga ke satu laga ronde berikutnya. */
function Connectors({ count }: { count: number }) {
  const pairs = Math.ceil(count / 2);
  return (
    <div className="flex w-8 shrink-0 flex-col">
      {/* penyelaras dengan label ronde */}
      <div className="h-8 shrink-0" />
      <div className="flex flex-1 flex-col">
        {Array.from({ length: pairs }).map((_, i) => (
          <div key={i} className="relative flex-1">
            {/* dua lengan (atas & bawah) + palang vertikal kanan */}
            <div className="absolute inset-y-1/4 right-1/2 left-0 rounded-r-md border-y-2 border-r-2 border-foreground/35" />
            {/* garis keluar menuju laga ronde berikutnya */}
            <div className="absolute top-1/2 right-0 left-1/2 border-t-2 border-foreground/35" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchCard({
  match,
  matches,
  nameA,
  nameB,
  isFinal,
}: {
  match: Match;
  matches: Match[];
  nameA?: string;
  nameB?: string;
  isFinal: boolean;
}) {
  const { t } = useI18n();
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
    <div
      className={`overflow-hidden rounded-lg border bg-card text-sm ${
        isFinal && playable
          ? "shadow-hard-primary border-2 border-primary"
          : "shadow-hard-sm border-foreground"
      }`}
    >
      {isFinal && playable && (
        <p className="bg-primary py-0.5 text-center text-[10px] font-bold tracking-widest text-primary-foreground uppercase">
          {t("bv.top_match")}
        </p>
      )}
      <div className="divide-y divide-foreground/15">
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
      </div>
      {isBye && (
        <p className="border-t border-foreground/15 px-2 py-1 text-xs text-muted-foreground">
          {t("bv.bye")}
        </p>
      )}
      {playable && !editing && (
        <div className="border-t border-foreground/15 bg-muted/40 p-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => setEditing(true)}
          >
            {t("bv.input_score")}
          </Button>
        </div>
      )}
      {editing && (
        <div className="space-y-2 border-t border-foreground/15 bg-muted/40 p-2">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label
                htmlFor={`sa-${match.id}`}
                className="mb-1 block truncate text-[10px] tracking-wider text-muted-foreground uppercase"
              >
                {nameA}
              </label>
              <Input
                id={`sa-${match.id}`}
                className="h-9 text-center font-mono text-lg tabular-nums"
                inputMode="numeric"
                placeholder="0"
                value={sa}
                onChange={(e) => setSa(e.target.value)}
              />
            </div>
            <span className="pb-1.5 font-display text-lg" aria-hidden>
              :
            </span>
            <div className="flex-1">
              <label
                htmlFor={`sb-${match.id}`}
                className="mb-1 block truncate text-[10px] tracking-wider text-muted-foreground uppercase"
              >
                {nameB}
              </label>
              <Input
                id={`sb-${match.id}`}
                className="h-9 text-center font-mono text-lg tabular-nums"
                inputMode="numeric"
                placeholder="0"
                value={sb}
                onChange={(e) => setSb(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" className="flex-1" onClick={save}>
              {t("bv.save")}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              {t("bv.cancel")}
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
      className={`flex items-center justify-between px-3 py-1.5 ${
        winner ? "font-bold" : name ? "" : "text-muted-foreground"
      }`}
    >
      <span className="truncate">{name ?? "…"}</span>
      <span className="ml-2 font-mono tabular-nums">{score ?? ""}</span>
    </div>
  );
}
