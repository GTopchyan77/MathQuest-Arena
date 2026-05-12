"use client";

import Link from "next/link";
import { Activity, Flame, Medal, Rocket, Star, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { DailyChallengeCard } from "@/features/games/components/DailyChallengeCard";
import { games } from "@/lib/games/catalog";
import { useLocale } from "@/lib/i18n/useLocale";
import { getProgressionSnapshot, getRecommendedNextChallenge } from "@/lib/progression";
import { getUserProfile, getUserScores } from "@/lib/supabase/scores";
import type { Profile, ScoreRow } from "@/lib/types";
import { Button } from "@/shared/components/ui/Button";

function fill(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);
}

function getBadgeLabel(id: string, t: (key: any) => string) {
  const labels = {
    "first-run": t("badge.first-run.label"),
    "five-runs": t("badge.five-runs.label"),
    "high-scorer": t("badge.high-scorer.label"),
    "streak-starter": t("badge.streak-starter.label"),
    "weekly-streak": t("badge.weekly-streak.label"),
    "xp-climber": t("badge.xp-climber.label"),
    "xp-veteran": t("badge.xp-veteran.label")
  } as const;

  return labels[id as keyof typeof labels] ?? id;
}

function getBadgeDescription(id: string, t: (key: any) => string) {
  const descriptions = {
    "first-run": t("badge.first-run.description"),
    "five-runs": t("badge.five-runs.description"),
    "high-scorer": t("badge.high-scorer.description"),
    "streak-starter": t("badge.streak-starter.description"),
    "weekly-streak": t("badge.weekly-streak.description"),
    "xp-climber": t("badge.xp-climber.description"),
    "xp-veteran": t("badge.xp-veteran.description")
  } as const;

  return descriptions[id as keyof typeof descriptions] ?? "";
}

function localizeRecommendationReason(reason: string, t: (key: any) => string) {
  const reasons = {
    "Run it again while the pattern is fresh and push accuracy above 70%.": t("progression.reason.retryAccuracy"),
    "This is your weakest recent lane based on saved performance, so it has the biggest upside.": t("progression.reason.weakestLane"),
    "You have not saved a run here yet, so this is the clearest way to broaden your progress.": t("progression.reason.unseenGame")
  } as const;

  return reasons[reason as keyof typeof reasons] ?? reason;
}

export function DashboardClient() {
  const { user } = useAuth();
  const { t } = useLocale();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scores, setScores] = useState<ScoreRow[]>([]);

  useEffect(() => {
    getUserProfile().then(setProfile);
    getUserScores().then(setScores);
  }, []);

  const stats = useMemo(() => {
    const totalXp = profile?.total_xp ?? scores.reduce((sum, score) => sum + score.score, 0);
    const progression = getProgressionSnapshot(totalXp, scores);
    const best = scores.reduce((max, score) => Math.max(max, score.score), 0);
    const avgAccuracy = scores.length ? Math.round(scores.reduce((sum, score) => sum + score.accuracy, 0) / scores.length) : 0;
    const completed = scores.length;
    const latest = scores[0] ?? null;
    const previousSameGame = latest ? scores.slice(1).find((score) => score.game_slug === latest.game_slug) ?? null : null;
    const improvement = latest ? latest.score - (previousSameGame?.score ?? 0) : null;
    const recommendedNext = latest
      ? getRecommendedNextChallenge(
          {
            accuracy: latest.accuracy,
            correct: 0,
            gameSlug: latest.game_slug,
            maxStreak: latest.max_streak,
            score: latest.score,
            total: 0
          },
          scores
        )
      : getRecommendedNextChallenge(
          {
            accuracy: 100,
            correct: 0,
            gameSlug: "quick-math-duel",
            maxStreak: 0,
            score: 0,
            total: 0
          },
          scores
        );

    return {
      avgAccuracy,
      best,
      completed,
      improvement,
      progression,
      recommendedNext,
      totalXp
    };
  }, [profile, scores]);

  const playerName = user?.user_metadata?.display_name ?? user?.email?.split("@")[0] ?? t("dashboard.playerFallback");
  const skillProgress = useMemo(
    () =>
      games
        .map((game) => {
          const gameScores = scores.filter((score) => score.game_slug === game.slug);
          const averageAccuracy = gameScores.length
            ? Math.round(gameScores.reduce((sum, score) => sum + score.accuracy, 0) / gameScores.length)
            : 0;

          return {
            accuracy: averageAccuracy,
            bestScore: gameScores.reduce((max, score) => Math.max(max, score.score), 0),
            runs: gameScores.length,
            title: game.title
          };
        })
        .filter((game) => game.runs > 0)
        .sort((a, b) => b.accuracy - a.accuracy)
        .slice(0, 4),
    [scores]
  );

  return (
    <main className="mx-auto max-w-[1240px] px-5 py-8 sm:px-6 lg:px-10 lg:py-10">
      <section>
        <h1 className="font-[var(--font-sora)] text-3xl font-extrabold text-white sm:text-4xl">
          {t("dashboard.welcomeBack").replace("{name}", playerName)}
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">{t("dashboard.heroSubtitle")}</p>
      </section>

      <section className="mt-7">
        <DailyChallengeCard compact />
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Flame} label={t("dashboard.metrics.totalXp")} tone="cyan" value={stats.totalXp.toLocaleString()} />
        <MetricCard icon={Rocket} label={t("dashboard.metrics.dailyStreak")} tone="violet" value={stats.progression.currentStreak} />
        <MetricCard icon={Medal} label={fill(t("dashboard.metrics.level"), { level: stats.progression.level })} tone="green" value={stats.completed} />
        <MetricCard icon={Target} label={t("profile.averageAccuracy")} tone="amber" value={`${stats.avgAccuracy}%`} />
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1.14fr_0.86fr]">
        <div className="rounded-[30px] border border-white/6 bg-[rgba(18,24,46,0.9)] p-6 shadow-[0_16px_38px_rgba(2,8,23,0.12)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="surface-label">{t("dashboard.activity.surface")}</p>
              <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">{t("dashboard.activity.title")}</h2>
            </div>
            <Activity className="h-5 w-5 text-cyan-200" />
          </div>
          <div className="mt-5 grid gap-3">
            {scores.length ? (
              scores.slice(0, 4).map((score) => (
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 rounded-[24px] bg-white/[0.04] px-5 py-5" key={score.id}>
                  <div className="min-w-0">
                    <p className="truncate font-black text-white">{formatGame(score.game_slug)}</p>
                    <p className="text-sm font-semibold text-slate-400">{new Date(score.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-8 text-right sm:min-w-[200px]">
                    <div>
                      <p className="text-lg font-black text-white">{score.score}</p>
                      <p className="text-xs font-medium text-slate-500">{t("profile.metricScore")}</p>
                    </div>
                    <div>
                      <p className="text-lg font-black text-white">{score.accuracy}%</p>
                      <p className="text-xs font-medium text-slate-500">{t("profile.metricAccuracy")}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] bg-white/[0.04] p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-100">
                  <Star className="h-5 w-5" />
                </div>
                <p className="mt-4 font-[var(--font-sora)] text-xl font-extrabold text-white">{t("dashboard.activity.emptyTitle")}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{t("profile.emptySavedSessions")}</p>
                <Button asChild className="mt-4" variant="secondary">
                  <Link href="/games/quick-math-duel">{t("dashboard.activity.startFirstRun")}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/6 bg-[rgba(18,24,46,0.9)] p-6 shadow-[0_16px_38px_rgba(2,8,23,0.12)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="surface-label text-cyan-200/80">{t("profile.mastery")}</p>
              <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">{t("profile.skillMap")}</h2>
            </div>
          </div>
          {skillProgress.length ? (
            <div className="mt-5 grid gap-4">
              {skillProgress.map((game) => (
                <div className="rounded-[22px] bg-white/[0.035] px-4 py-4" key={game.title}>
                  <div className="mb-3 flex items-center justify-between gap-4 text-sm font-black text-white">
                    <span className="truncate">{game.title}</span>
                    <span className="shrink-0 text-cyan-200">{game.accuracy}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[rgba(255,255,255,0.05)]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#06d6a0_0%,#22d3ee_48%,#8b5cf6_100%)] shadow-[0_0_14px_rgba(34,211,238,0.18)]"
                      style={{ width: `${Math.max(game.accuracy, 12)}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-400">
                    {fill(t("profile.bestScoreRuns"), {
                      count: game.runs,
                      score: game.bestScore.toLocaleString()
                    })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-2xl bg-white/[0.04] p-4 text-sm font-semibold text-slate-300">
              {t("profile.playToSeeProgress")}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  icon: Icon,
  label,
  tone,
  value
}: {
  icon: typeof Medal;
  label: string;
  tone: "amber" | "cyan" | "green" | "violet";
  value: number | string;
}) {
  const toneMap = {
    amber: "bg-amber-300/10 text-amber-100",
    cyan: "bg-cyan-400/10 text-cyan-100",
    green: "bg-emerald-400/10 text-emerald-100",
    violet: "bg-violet/12 text-[rgb(237,233,254)]"
  };

  return (
    <div className="rounded-[28px] border border-white/6 bg-[rgba(18,24,46,0.88)] p-6 shadow-[0_14px_34px_rgba(2,8,23,0.12)]">
      <div className={`flex h-12 w-12 items-center justify-center rounded-[16px] ${toneMap[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-6 text-[2.15rem] font-black text-white">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-400">{label}</p>
    </div>
  );
}

function formatGame(slug: string) {
  return slug
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}
