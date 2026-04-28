"use client";

import { Crown, Medal, Target, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import { StatCard } from "@/shared/components/ui/StatCard";
import { games } from "@/lib/games/catalog";
import { mockLeaderboard } from "@/lib/mockData";
import { getLeaderboard } from "@/lib/supabase/scores";
import type { GameSlug, LeaderboardEntry } from "@/lib/types";

type Filter = "all" | GameSlug;

export function LeaderboardClient() {
  const [filter, setFilter] = useState<Filter>("all");
  const [entries, setEntries] = useState<LeaderboardEntry[]>(mockLeaderboard);
  const [usingMock, setUsingMock] = useState(true);

  useEffect(() => {
    getLeaderboard(filter === "all" ? undefined : filter).then((data) => {
      if (data.length) {
        setEntries(data);
        setUsingMock(false);
      } else {
        setEntries(mockLeaderboard);
        setUsingMock(true);
      }
    });
  }, [filter]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-end">
        <div>
          <p className="surface-label">Leaderboard</p>
          <h1 className="mt-3 font-[var(--font-sora)] text-4xl font-extrabold text-white sm:text-5xl">Top players in the arena</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            Scores update from Supabase when connected, with a polished mock board available for local preview.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Button onClick={() => setFilter("all")} variant={filter === "all" ? "primary" : "secondary"}>
            All
          </Button>
          {games.map((game) => (
            <Button key={game.slug} onClick={() => setFilter(game.slug)} variant={filter === game.slug ? "primary" : "secondary"}>
              {game.title}
            </Button>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <StatCard icon={Crown} label="Leader score" tone="lemon" value={entries[0]?.best_score ?? 0} />
        <StatCard icon={Trophy} label="Total runs" tone="coral" value={entries.reduce((sum, entry) => sum + entry.games_played, 0)} />
        <StatCard icon={Target} label={usingMock ? "Preview mode" : "Live board"} tone="mint" value={usingMock ? "Mock" : "Live"} />
      </section>

      <section className="panel overflow-hidden rounded-[30px]">
        <div className="hidden grid-cols-[0.4fr_1.4fr_0.7fr_0.7fr_0.7fr] border-b border-white/10 bg-white/6 px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400 md:grid">
          <span>Rank</span>
          <span>Player</span>
          <span>Best</span>
          <span>Total</span>
          <span>Games</span>
        </div>
        <div className="divide-y divide-white/10">
          {entries.map((entry) => (
            <div className="grid gap-4 px-5 py-4 transition hover:bg-white/6 md:grid-cols-[0.4fr_1.4fr_0.7fr_0.7fr_0.7fr] md:items-center" key={entry.user_id}>
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-2xl border text-sm font-black ${
                  entry.rank === 1
                    ? "border-amber-300/30 bg-amber-300/14 text-amber-100 shadow-[0_0_24px_rgba(252,211,77,0.15)]"
                    : entry.rank === 2
                      ? "border-slate-300/20 bg-slate-200/12 text-slate-100"
                      : entry.rank === 3
                        ? "border-orange-300/24 bg-orange-300/12 text-orange-100"
                        : "border-white/10 bg-white/6 text-white"
                }`}>
                  #{entry.rank}
                </span>
                {entry.rank <= 3 ? <Medal className="h-5 w-5 text-amber-200 md:hidden" /> : null}
              </div>
              <div>
                <p className="font-black text-white">{entry.display_name || "Anonymous player"}</p>
                <p className="text-sm font-semibold text-slate-400">MathQuest competitor</p>
              </div>
              <Score label="Best" value={entry.best_score} />
              <Score label="Total" value={entry.total_score} />
              <Score label="Games" value={entry.games_played} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400 md:hidden">{label}</p>
      <p className="text-lg font-black text-white">{value.toLocaleString()}</p>
    </div>
  );
}
