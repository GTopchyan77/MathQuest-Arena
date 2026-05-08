"use client";

import { Crown, Medal, Sparkles, Target, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/useLocale";
import { Button } from "@/shared/components/ui/Button";
import { games } from "@/lib/games/catalog";
import { getLeaderboard } from "@/lib/supabase/scores";
import type { GameSlug, LeaderboardEntry } from "@/lib/types";

type Filter = "all" | GameSlug;

export function LeaderboardClient() {
  const { t } = useLocale();
  const [filter, setFilter] = useState<Filter>("all");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const leader = entries[0];
  const totalRuns = entries.reduce((sum, entry) => sum + entry.games_played, 0);

  useEffect(() => {
    getLeaderboard(filter === "all" ? undefined : filter).then((data) => {
      setEntries(data);
    });
  }, [filter]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <section className="relative overflow-hidden py-2">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.14),transparent_58%)]" />
        <div className="relative flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] border border-cyan-300/18 bg-[linear-gradient(180deg,rgba(30,64,175,0.2),rgba(15,23,42,0.72))] text-cyan-100 shadow-[0_0_32px_rgba(56,189,248,0.12)]">
              <Trophy className="h-9 w-9" />
            </div>
            <div className="min-w-0 pt-1">
              <p className="surface-label text-cyan-200/80">{t("leaderboard.label")}</p>
              <h1 className="mt-2 font-[var(--font-sora)] text-3xl font-extrabold text-white sm:text-[3.25rem] sm:leading-none">{t("leaderboard.title")}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                {t("leaderboard.body")}
              </p>
            </div>
          </div>
        </div>

        <div className="relative mt-6 overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(17,24,39,0.62))] shadow-[0_18px_50px_rgba(2,6,23,0.22)]">
          <div
            className="bg-white/10"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "1px",
            }}
          >
            <SummaryStripItem icon={Users} label={t("leaderboard.summaryPlayers")} value={entries.length.toLocaleString()} />
            <SummaryStripItem icon={Trophy} label={t("leaderboard.totalRuns")} value={totalRuns.toLocaleString()} />
            <SummaryStripItem icon={Target} label={t("leaderboard.leaderScore")} value={(leader?.best_score ?? 0).toLocaleString()} />
            <SummaryStripItem icon={Crown} label={t("leaderboard.summaryLeader")} value={leader?.display_name || t("leaderboard.anonymous")} />
          </div>
        </div>

        <div className="relative mt-3 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.72),rgba(17,24,39,0.52))] px-4 py-4 shadow-[0_14px_40px_rgba(2,6,23,0.14)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="pr-4">
              <p className="surface-label text-cyan-200/80">{t("leaderboard.filters")}</p>
              <h2 className="mt-1 font-[var(--font-sora)] text-xl font-extrabold text-white">{t("leaderboard.scopeTitle")}</h2>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
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
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,13,33,0.96),rgba(11,18,40,0.92))] shadow-[0_18px_55px_rgba(2,6,23,0.28)]">
        <div className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] px-5 py-4">
          <div className="flex items-center gap-2 text-slate-100">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            <h2 className="font-[var(--font-sora)] text-xl font-extrabold text-white">{t("leaderboard.listTitle")}</h2>
          </div>
        </div>
        <div className="m-5 overflow-x-auto rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,36,0.98),rgba(6,12,28,0.96))] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.025] text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                <th className="w-20 px-6 py-4 text-left">{t("leaderboard.rank")}</th>
                <th className="px-4 py-4 text-left">{t("leaderboard.player")}</th>
                <th className="w-[140px] px-4 py-4 text-right">{t("leaderboard.bestScore")}</th>
                <th className="w-[140px] px-4 py-4 text-right">{t("leaderboard.totalScore")}</th>
                <th className="w-[100px] px-6 py-4 text-right">{t("leaderboard.gamesPlayed")}</th>
              </tr>
            </thead>
            <tbody>
              {entries.length ? (
                entries.map((entry) => (
                  <tr
                    className={`h-16 border-b border-white/10 last:border-b-0 transition duration-150 ${
                      entry.rank === 1
                        ? "bg-[linear-gradient(90deg,rgba(252,211,77,0.08),rgba(255,255,255,0))] hover:bg-[linear-gradient(90deg,rgba(252,211,77,0.11),rgba(255,255,255,0.015))]"
                        : entry.rank === 2
                          ? "bg-[linear-gradient(90deg,rgba(226,232,240,0.05),rgba(255,255,255,0))] hover:bg-[linear-gradient(90deg,rgba(226,232,240,0.075),rgba(255,255,255,0.015))]"
                          : entry.rank === 3
                            ? "bg-[linear-gradient(90deg,rgba(251,146,60,0.06),rgba(255,255,255,0))] hover:bg-[linear-gradient(90deg,rgba(251,146,60,0.09),rgba(255,255,255,0.015))]"
                            : "hover:bg-white/[0.03]"
                    }`}
                    key={entry.user_id}
                  >
                    <td className="px-6 py-3 align-middle">
                      <span className={`inline-flex h-9 min-w-[52px] items-center justify-center rounded-xl border px-2 text-sm font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ${
                        entry.rank === 1
                          ? "border-amber-300/35 bg-[linear-gradient(180deg,rgba(251,191,36,0.18),rgba(120,53,15,0.14))] text-amber-100"
                          : entry.rank === 2
                            ? "border-slate-300/25 bg-[linear-gradient(180deg,rgba(226,232,240,0.16),rgba(51,65,85,0.12))] text-slate-100"
                            : entry.rank === 3
                              ? "border-orange-300/28 bg-[linear-gradient(180deg,rgba(251,146,60,0.18),rgba(124,45,18,0.14))] text-orange-100"
                              : "border-white/10 bg-white/6 text-white"
                      }`}>
                        #{entry.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-[11px] font-black ${
                          entry.rank === 1
                            ? "border-amber-300/35 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.45),rgba(59,7,0,0.2))] text-amber-50"
                            : entry.rank === 2
                              ? "border-slate-300/25 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.35),rgba(30,41,59,0.22))] text-slate-100"
                              : entry.rank === 3
                              ? "border-orange-300/30 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.38),rgba(67,20,7,0.22))] text-orange-50"
                              : "border-white/10 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),rgba(15,23,42,0.18))] text-cyan-100"
                        }`}>
                          {getPlayerInitials(entry.display_name || t("leaderboard.anonymous"))}
                        </span>
                        <span className="min-w-0 truncate text-[17px] font-extrabold text-white">{entry.display_name || t("leaderboard.anonymous")}</span>
                        {entry.rank <= 3 ? (
                          <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${
                            entry.rank === 1
                              ? "border-amber-300/30 bg-[linear-gradient(180deg,rgba(251,191,36,0.18),rgba(120,53,15,0.14))] text-amber-100"
                              : entry.rank === 2
                                ? "border-slate-300/20 bg-[linear-gradient(180deg,rgba(226,232,240,0.16),rgba(51,65,85,0.12))] text-slate-100"
                                : "border-orange-300/24 bg-[linear-gradient(180deg,rgba(251,146,60,0.16),rgba(124,45,18,0.14))] text-orange-100"
                          }`}>
                            <Medal className="h-3 w-3" />
                            {entry.rank === 1 ? t("leaderboard.champion") : entry.rank === 2 ? t("leaderboard.runnerUp") : t("leaderboard.thirdPlace")}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right align-middle text-base font-black tabular-nums text-slate-50">{entry.best_score.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right align-middle text-base font-black tabular-nums text-slate-50">{entry.total_score.toLocaleString()}</td>
                    <td className="px-6 py-3 text-right align-middle text-base font-black tabular-nums text-slate-50">{entry.games_played.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-8 text-center text-sm font-semibold text-slate-300" colSpan={5}>
                    <div className="mx-auto max-w-md">
                      <p>{t("leaderboard.emptyMessage")}</p>
                      <p className="mt-3 font-bold text-cyan-100">{t("leaderboard.summaryFirstSave")}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function getPlayerInitials(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "MQ";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part[0]).join("");
  return letters.toUpperCase();
}

function SummaryStripItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(15,23,42,0.58))] px-5 py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-cyan-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-400">{label}</p>
          <p className="mt-1 truncate text-3xl font-black text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
