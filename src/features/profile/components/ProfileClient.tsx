"use client";

import { CalendarDays, Flame, Mail, Medal, Target, Trophy, UserRound } from "lucide-react";
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

  const displayName = profileName || user?.user_metadata?.display_name || user?.email?.split("@")[0] || t("dashboard.playerFallback");
  const joined = user?.created_at ? new Date(user.created_at).toLocaleDateString() : t("profile.previewJoined");

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <aside className="panel-strong rounded-[30px] p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(139,92,246,0.2))] text-cyan-100">
              <UserRound className="h-10 w-10" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-[var(--font-sora)] text-2xl font-extrabold text-white">{displayName}</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-400">
                <Mail className="h-4 w-4" /> {user?.email ?? t("profile.previewEmail")}
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            <ProfileLine icon={CalendarDays} label={t("profile.joined")} value={joined} />
            <ProfileLine icon={Trophy} label={t("profile.progressSource")} value={scores.length ? t("profile.savedScores") : t("profile.noSavedScores")} />
          </div>
        </aside>

        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard icon={Medal} label={t("profile.bestScore")} tone="lemon" value={stats.bestScore.toLocaleString()} />
          <StatCard icon={Flame} label={t("profile.totalXp")} tone="coral" value={stats.totalXp.toLocaleString()} />
          <StatCard icon={Target} label={t("profile.averageAccuracy")} tone="mint" value={`${stats.accuracy}%`} />
          <StatCard icon={Trophy} label={t("profile.bestStreak")} tone="violet" value={stats.bestStreak} />
        </div>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.82fr]">
        <div className="panel rounded-[30px] p-6">
          <p className="surface-label">{t("profile.activity")}</p>
          <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">{t("profile.recentSessions")}</h2>
          <div className="mt-5 grid gap-3">
            {scores.length ? (
              scores.map((score) => (
                <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/6 p-4 sm:grid-cols-[1fr_auto] sm:items-center" key={score.id}>
                  <div>
                    <p className="font-black text-white">{formatGame(score.game_slug)}</p>
                    <p className="text-sm font-semibold text-slate-400">{new Date(score.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <MiniMetric label={t("profile.metricScore")} value={score.score} />
                    <MiniMetric label={t("profile.metricAccuracy")} value={`${score.accuracy}%`} />
                    <MiniMetric label={t("profile.metricStreak")} value={score.max_streak} />
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-white/10 bg-white/6 p-4 font-semibold text-slate-300">
                {t("profile.emptySavedSessions")}
              </p>
            )}
          </div>
        </div>

        <div className="panel rounded-[30px] p-6">
          <p className="surface-label text-cyan-200/80">{t("profile.mastery")}</p>
          <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">{t("profile.skillMap")}</h2>
          {scores.length ? (
            <div className="mt-5 grid gap-4">
              {skillMap.map((game) => (
                <div key={game.title}>
                  <div className="mb-2 flex items-center justify-between gap-4 text-sm font-black text-white">
                    <span>{game.title}</span>
                    <span className="text-cyan-200">
                      {game.runs ? fill(t("profile.skillAccuracy"), { count: game.averageAccuracy }) : t("profile.noSavedRuns")}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee_0%,#0ea5e9_52%,#8b5cf6_100%)] shadow-[0_0_18px_rgba(34,211,238,0.24)]"
                      style={{ width: `${Math.max(game.averageAccuracy, game.runs ? 12 : 0)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-400">
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
            <p className="mt-5 rounded-2xl border border-white/10 bg-white/6 p-4 font-semibold text-slate-300">
              {t("profile.emptySavedSessions")}
            </p>
          )}
        </div>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="panel rounded-[30px] p-6">
          <p className="surface-label text-emerald-200/80">{t("profile.summary")}</p>
          <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">{t("profile.performanceSnapshot")}</h2>
          <div className="mt-5 space-y-4">
            <MiniBar label={t("profile.accuracyTrend")} value={`${stats.accuracy}%`} width={`${Math.max(stats.accuracy, 14)}%`} />
            <MiniBar label={t("profile.xpGrowth")} value={stats.totalXp.toLocaleString()} width={`${Math.min(24 + scores.length * 8, 92)}%`} />
            <MiniBar label={t("profile.consistency")} value={fill(t("profile.consistencyValue"), { count: stats.bestStreak })} width={`${Math.min(22 + stats.bestStreak * 6, 94)}%`} />
          </div>
        </div>
        <div className="panel rounded-[30px] p-6">
          <p className="surface-label">{t("profile.achievements")}</p>
          <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">{t("profile.unlockedHighlights")}</h2>
          {earnedBadges.length ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {earnedBadges.map((badge) => (
                <div className="rounded-[24px] border border-white/10 bg-white/6 p-4" key={badge.id}>
                  <p className="text-sm font-black text-white">{getBadgeLabel(badge.id, t)}</p>
                  <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-cyan-200">{getBadgeDescription(badge.id, t)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-2xl border border-white/10 bg-white/6 p-4 font-semibold text-slate-300">
              {t("profile.emptySavedSessions")}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

function ProfileLine({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/6 p-4">
      <div className="flex items-center gap-3 text-sm font-black text-slate-400">
        <Icon className="h-4 w-4" /> {label}
      </div>
      <p className="text-right text-sm font-black text-white">{value}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-3 py-2">
      <p className="font-black text-white">{value}</p>
      <p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-slate-400">{label}</p>
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
