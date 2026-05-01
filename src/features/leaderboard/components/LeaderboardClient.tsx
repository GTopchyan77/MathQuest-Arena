"use client";

import { Crown, Medal, Target, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
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
      </section>

      <section className="mt-4 panel overflow-hidden rounded-[30px]">
        <div className="hidden grid-cols-[0.4fr_1.4fr_0.7fr_0.7fr_0.7fr] border-b border-white/10 bg-white/6 px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400 md:grid">
          <span>{t("leaderboard.rank")}</span>
          <span>{t("leaderboard.player")}</span>
          <span>{t("leaderboard.best")}</span>
          <span>{t("leaderboard.total")}</span>
          <span>{t("leaderboard.games")}</span>
        </div>
        <div className="divide-y divide-white/10">
          {entries.length ? (
            entries.map((entry) => (
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
                  <p className="font-black text-white">{entry.display_name || t("leaderboard.anonymous")}</p>
                  <p className="text-sm font-semibold text-slate-400">{t("leaderboard.competitor")}</p>
                </div>
                <Score label={t("leaderboard.best")} value={entry.best_score} />
                <Score label={t("leaderboard.total")} value={entry.total_score} />
                <Score label={t("leaderboard.games")} value={entry.games_played} />
              </div>
            ))
          ) : (
            <p className="px-5 py-6 text-sm font-semibold text-slate-300">
              {t("leaderboard.emptyMessage")}
            </p>
          )}
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
