"use client";

import { Crown, Medal, Sparkles, Target, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { LeaderboardSummaryCard } from "@/features/leaderboard/components/LeaderboardSummaryCard";
import { TopThreePodium } from "@/features/leaderboard/components/TopThreePodium";
import { useLocale } from "@/lib/i18n/useLocale";
import { Button } from "@/shared/components/ui/Button";
import { StatCard } from "@/shared/components/ui/StatCard";
import { games } from "@/lib/games/catalog";
import { getLeaderboard } from "@/lib/supabase/scores";
import type { GameSlug, LeaderboardEntry } from "@/lib/types";

type Filter = "all" | GameSlug;

export function LeaderboardClient() {
  const { t } = useLocale();
  const [filter, setFilter] = useState<Filter>("all");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const topThree = entries.slice(0, 3);

  useEffect(() => {
    getLeaderboard(filter === "all" ? undefined : filter).then((data) => {
      setEntries(data);
    });
  }, [filter]);

  return (
    <main className="mx-auto max-w-[1440px] p-4 sm:p-6">
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="panel-strong rounded-[30px] p-6">
          <p className="surface-label">{t("leaderboard.label")}</p>
          <h1 className="mt-3 font-[var(--font-sora)] text-3xl font-extrabold text-white sm:text-4xl">{t("leaderboard.title")}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            {t("leaderboard.body")}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <StatCard icon={Crown} label={t("leaderboard.leaderScore")} tone="lemon" value={entries[0]?.best_score ?? 0} />
            <StatCard icon={Trophy} label={t("leaderboard.totalRuns")} tone="coral" value={entries.reduce((sum, entry) => sum + entry.games_played, 0)} />
            <StatCard icon={Target} label={t("leaderboard.boardStatus")} tone="mint" value={entries.length ? t("leaderboard.live") : t("leaderboard.empty")} />
          </div>
        </div>

        <div className="grid gap-4">
          <div className="panel rounded-[30px] p-5">
            <p className="surface-label text-cyan-200/80">{t("leaderboard.filters")}</p>
            <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">{t("leaderboard.scopeTitle")}</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={() => setFilter("all")} variant={filter === "all" ? "primary" : "secondary"}>
                {t("leaderboard.all")}
              </Button>
              {games.map((game) => (
                <Button key={game.slug} onClick={() => setFilter(game.slug)} variant={filter === game.slug ? "primary" : "secondary"}>
                  {game.title}
                </Button>
              ))}
            </div>
          </div>
          <LeaderboardSummaryCard entries={entries} />
        </div>
      </section>

      <TopThreePodium entries={topThree} />

      <section className="mt-4 panel overflow-hidden rounded-[30px]">
        <div className="border-b border-white/10 bg-white/6 px-5 py-4">
          <div className="flex items-center gap-2 text-slate-100">
            <Sparkles className="h-4 w-4 text-cyan-200" />
            <h2 className="font-[var(--font-sora)] text-xl font-extrabold text-white">{t("leaderboard.listTitle")}</h2>
          </div>
        </div>
        <div className="hidden grid-cols-[minmax(0,1.7fr)_minmax(120px,0.7fr)_minmax(120px,0.8fr)_minmax(120px,0.8fr)] items-center border-b border-white/10 bg-white/6 px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400 md:grid">
          <span>{t("leaderboard.player")}</span>
          <span>{t("leaderboard.bestScore")}</span>
          <span>{t("leaderboard.totalScore")}</span>
          <span className="text-right">{t("leaderboard.gamesPlayed")}</span>
        </div>
        <div className="divide-y divide-white/10">
          {entries.length ? (
            entries.map((entry) => (
              <div className="grid gap-4 px-5 py-5 transition hover:bg-white/6 md:grid-cols-[minmax(0,1.7fr)_minmax(120px,0.7fr)_minmax(120px,0.8fr)_minmax(120px,0.8fr)] md:items-center md:gap-6" key={entry.user_id}>
                <div className="min-w-0 md:flex md:items-center md:gap-4">
                  <div className="flex items-center gap-3 md:shrink-0">
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
                  </div>
                  <div className="mt-3 min-w-0 md:mt-0 md:flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <p className="min-w-0 truncate text-lg font-extrabold text-white sm:text-xl">{entry.display_name || t("leaderboard.anonymous")}</p>
                      {entry.rank <= 3 ? (
                        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-black uppercase tracking-[0.12em] ${
                          entry.rank === 1
                            ? "border-amber-300/30 bg-amber-300/12 text-amber-100"
                            : entry.rank === 2
                              ? "border-slate-300/20 bg-slate-200/10 text-slate-100"
                              : "border-orange-300/24 bg-orange-300/10 text-orange-100"
                        }`}>
                          <Medal className="h-3.5 w-3.5" />
                          {entry.rank === 1 ? t("leaderboard.champion") : entry.rank === 2 ? t("leaderboard.runnerUp") : t("leaderboard.thirdPlace")}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-400">{t("leaderboard.competitor")}</p>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3 md:hidden">
                    <ScoreChip label={t("leaderboard.bestScore")} value={entry.best_score} />
                    <ScoreChip label={t("leaderboard.totalScore")} value={entry.total_score} />
                    <ScoreChip label={t("leaderboard.gamesPlayed")} value={entry.games_played} />
                  </div>
                </div>
                <Score label={t("leaderboard.bestScore")} value={entry.best_score} />
                <Score label={t("leaderboard.totalScore")} value={entry.total_score} />
                <Score label={t("leaderboard.gamesPlayed")} value={entry.games_played} />
              </div>
            ))
          ) : (
            <div className="px-5 py-8">
              <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.76),rgba(30,41,59,0.58))] p-5">
                <h3 className="font-[var(--font-sora)] text-2xl font-extrabold text-white">{t("leaderboard.lowDataTitle")}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{t("leaderboard.emptyMessage")}</p>
                <p className="mt-4 text-sm font-bold text-cyan-100">{t("leaderboard.summaryFirstSave")}</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="hidden md:block md:text-right">
      <p className="text-lg font-black text-white">{value.toLocaleString()}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
    </div>
  );
}

function ScoreChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 md:hidden">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-black text-white">{value.toLocaleString()}</p>
    </div>
  );
}
