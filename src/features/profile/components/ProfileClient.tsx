"use client";

import { CalendarDays, Flame, Mail, Medal, Target, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { games } from "@/lib/games/catalog";
import { useLocale } from "@/lib/i18n/useLocale";
import { getProgressionSnapshot } from "@/lib/progression";
import { getCurrentProfile } from "@/lib/supabase/profileRepository";
import { getUserScores } from "@/lib/supabase/scores";
import type { ScoreRow } from "@/lib/types";
import { StatCard } from "@/shared/components/ui/StatCard";

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

export function ProfileClient() {
  const { user } = useAuth();
  const { t } = useLocale();
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    if (user) {
      getCurrentProfile(user.id).then((profile) => {
        setProfileName(profile?.display_name ?? "");
      });
    }

    getUserScores().then((data) => {
      setScores(data);
    });
  }, []);

  const stats = useMemo(() => {
    const bestScore = scores.reduce((max, score) => Math.max(max, score.score), 0);
    const totalXp = scores.reduce((sum, score) => sum + score.score, 0);
    const bestStreak = scores.reduce((max, score) => Math.max(max, score.max_streak), 0);
    const accuracy = scores.length ? Math.round(scores.reduce((sum, score) => sum + score.accuracy, 0) / scores.length) : 0;
    return { accuracy, bestScore, bestStreak, totalXp };
  }, [scores]);
  const progression = useMemo(() => getProgressionSnapshot(stats.totalXp, scores), [scores, stats.totalXp]);
  const skillMap = useMemo(
    () =>
      games.map((game) => {
        const gameScores = scores.filter((score) => score.game_slug === game.slug);
        const averageAccuracy = gameScores.length
          ? Math.round(gameScores.reduce((sum, score) => sum + score.accuracy, 0) / gameScores.length)
          : 0;
        const bestScore = gameScores.reduce((max, score) => Math.max(max, score.score), 0);

        return {
          averageAccuracy,
          bestScore,
          runs: gameScores.length,
          title: game.title
        };
      }),
    [scores]
  );
  const earnedBadges = progression.badges.filter((badge) => badge.earned);
  const topBadge = earnedBadges[0] ?? null;

  const displayName = profileName || user?.user_metadata?.display_name || user?.email?.split("@")[0] || t("dashboard.playerFallback");
  const joined = user?.created_at ? new Date(user.created_at).toLocaleDateString() : t("profile.previewJoined");

  return (
    <main className="mx-auto max-w-[1240px] px-5 py-8 sm:px-6 lg:px-10 lg:py-10">
      <section className="rounded-[34px] border border-cyan-300/10 bg-[linear-gradient(135deg,rgba(23,92,109,0.34),rgba(49,67,120,0.36),rgba(95,56,148,0.28))] p-7 shadow-[0_20px_48px_rgba(2,8,23,0.16)] sm:p-8 lg:p-9">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-5">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-[32px] border border-cyan-300/18 bg-[linear-gradient(135deg,rgba(34,211,238,0.32),rgba(139,92,246,0.38))] text-[2.6rem] font-black text-white shadow-[0_20px_42px_rgba(34,211,238,0.14)]">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-[var(--font-sora)] text-3xl font-extrabold text-white sm:text-[2.6rem]">{displayName}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-400">
                <Mail className="h-4 w-4" /> {user?.email ?? t("profile.previewEmail")}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-medium text-slate-400">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> {t("profile.joined")} {joined}
                </span>
                <span className="rounded-full bg-emerald-400/12 px-3 py-1 text-sm font-black text-emerald-100">
                  {fill(t("dashboard.metrics.level"), { level: progression.level })}
                </span>
                {topBadge ? (
                  <span className="rounded-full bg-violet-400/12 px-3 py-1 text-sm font-black text-violet-100">
                    {getBadgeLabel(topBadge.id, t)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Medal} label={t("profile.bestScore")} tone="lemon" value={stats.bestScore.toLocaleString()} />
          <StatCard icon={Flame} label={t("profile.totalXp")} tone="coral" value={stats.totalXp.toLocaleString()} />
          <StatCard icon={Target} label={t("profile.averageAccuracy")} tone="mint" value={`${stats.accuracy}%`} />
          <StatCard icon={Trophy} label={t("profile.bestStreak")} tone="violet" value={stats.bestStreak} />
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="rounded-[30px] border border-white/6 bg-[rgba(18,24,46,0.9)] p-6 shadow-[0_16px_38px_rgba(2,8,23,0.12)]">
          <p className="surface-label">{t("profile.activity")}</p>
          <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">{t("profile.recentSessions")}</h2>
          <div className="mt-5 grid gap-3">
            {scores.length ? (
              scores.slice(0, 4).map((score) => (
                <div className="grid gap-4 rounded-[24px] bg-white/[0.04] px-5 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center" key={score.id}>
                  <div className="min-w-0">
                    <p className="truncate font-black text-white">{formatGame(score.game_slug)}</p>
                    <p className="text-sm font-semibold text-slate-400">{new Date(score.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-6 text-right sm:min-w-[290px]">
                    <MetricColumn label={t("profile.metricScore")} value={score.score} />
                    <MetricColumn label={t("profile.metricAccuracy")} value={`${score.accuracy}%`} />
                    <MetricColumn label={t("profile.metricStreak")} value={score.max_streak} />
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-white/[0.04] p-5 font-semibold text-slate-300">
                {t("profile.emptySavedSessions")}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/6 bg-[rgba(18,24,46,0.9)] p-6 shadow-[0_16px_38px_rgba(2,8,23,0.12)]">
          <p className="surface-label">{t("profile.achievements")}</p>
          <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">{t("profile.unlockedHighlights")}</h2>
          {earnedBadges.length ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {earnedBadges.slice(0, 4).map((badge) => (
                <div className="rounded-[24px] bg-white/[0.04] p-5" key={badge.id}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-cyan-400/10 text-cyan-100">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <p className="mt-4 font-black text-white">{getBadgeLabel(badge.id, t)}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{getBadgeDescription(badge.id, t)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-[24px] bg-white/[0.04] p-5">
              <p className="font-black text-white">{t("profile.unlockedHighlights")}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{t("profile.playToSeeProgress")}</p>
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-[30px] border border-white/6 bg-[rgba(18,24,46,0.9)] p-6 shadow-[0_16px_38px_rgba(2,8,23,0.12)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="surface-label text-cyan-200/80">{t("profile.mastery")}</p>
            <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">{t("profile.skillMap")}</h2>
          </div>
        </div>
        {scores.length ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {skillMap.map((game) => (
              <div className="rounded-[24px] bg-white/[0.04] p-6" key={game.title}>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <span className="truncate text-lg font-black text-white">{game.title}</span>
                  <span className="shrink-0 rounded-full bg-emerald-400/12 px-3 py-1 text-sm font-black text-emerald-100">
                    {game.runs ? fill(t("profile.skillAccuracy"), { count: game.averageAccuracy }) : t("profile.noSavedRuns")}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee_0%,#0ea5e9_52%,#8b5cf6_100%)] shadow-[0_0_14px_rgba(34,211,238,0.16)]"
                    style={{ width: `${Math.max(game.averageAccuracy, game.runs ? 12 : 0)}%` }}
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {game.runs
                    ? fill(t("profile.bestScoreRuns"), {
                        count: game.runs,
                        score: game.bestScore.toLocaleString()
                      })
                    : t("profile.playToSeeProgress")}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-2xl bg-white/[0.04] p-5 font-semibold text-slate-300">
            {t("profile.emptySavedSessions")}
          </p>
        )}
      </section>
    </main>
  );
}

function ProfileLine({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.035] p-4">
      <div className="flex items-center gap-3 text-sm font-black text-slate-400">
        <Icon className="h-4 w-4" /> {label}
      </div>
      <p className="text-right text-sm font-black text-white">{value}</p>
    </div>
  );
}

function MetricColumn({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <p className="font-black text-white">{value}</p>
      <p className="text-[0.72rem] font-medium text-slate-400">{label}</p>
    </div>
  );
}

function MiniBar({ label, value, width }: { label: string; value: string; width: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-sm font-semibold text-slate-300">
        <span>{label}</span>
        <span className="text-white">{value}</span>
      </div>
      <div className="h-2.5 rounded-full bg-white/8">
        <div className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee_0%,#0ea5e9_52%,#8b5cf6_100%)]" style={{ width }} />
      </div>
    </div>
  );
}

function formatGame(slug: string) {
  return slug
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}
