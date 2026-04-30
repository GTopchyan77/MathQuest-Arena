"use client";

import type { Route } from "next";
import Link from "next/link";
import { Activity, ArrowRight, Award, Brain, Crown, Flame, Medal, Play, Rocket, Sparkles, Star, Target, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { DailyChallengeCard } from "@/features/games/components/DailyChallengeCard";
import { useLocale } from "@/lib/i18n/useLocale";
import { getLevelCeiling, getLevelFloor, getProgressionSnapshot, getRecommendedNextChallenge } from "@/lib/progression";
import { getUserProfile, getUserScores } from "@/lib/supabase/scores";
import type { Profile, ScoreRow } from "@/lib/types";
import { Button } from "@/shared/components/ui/Button";

function fill(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);
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

  const isFirstSession = scores.length === 0;
  const isFirstReturn = scores.length === 1;
  const xpRange = Math.max(getLevelCeiling(stats.progression.level) - getLevelFloor(stats.progression.level), 1);
  const latestBadge = stats.progression.badges.find((badge) => badge.earned) ?? null;
  const playerName = user?.user_metadata?.display_name ?? user?.email?.split("@")[0] ?? "math explorer";
  const streakText = t("common.dayStreak").replace("{count}", String(stats.progression.currentStreak));

  return (
    <main className="mx-auto max-w-[1440px] p-4 sm:p-6">
      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="panel-strong relative overflow-hidden rounded-[30px] p-6 text-white">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent),radial-gradient(circle_at_top_left,rgba(34,211,238,.16),transparent_28%),radial-gradient(circle_at_92%_12%,rgba(139,92,246,.18),transparent_24%)]" />
          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="surface-label">{t("dashboard.overview")}</p>
                <h1 className="mt-3 font-[var(--font-sora)] text-3xl font-extrabold sm:text-4xl">
                  {isFirstSession ? t("dashboard.firstSession.title") : t("dashboard.returning.title")}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  {isFirstSession
                    ? `${playerName}. ${t("dashboard.firstSession.body")}`
                    : fill(t("dashboard.returning.body"), { name: playerName })}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-400/16 bg-emerald-400/10 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-emerald-100">
                {isFirstSession ? t("dashboard.firstSession.badge") : t("dashboard.returning.badge")}
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild className={isFirstSession ? "shadow-[0_22px_70px_rgba(34,211,238,0.32)]" : undefined}>
                <Link href={isFirstSession || isFirstReturn ? "/games/quick-math-duel" : "/games"}>
                  <Play className="h-5 w-5" />{" "}
                  {isFirstSession ? t("dashboard.firstSession.cta") : isFirstReturn ? t("dashboard.firstReturn.cta") : t("dashboard.returning.cta")}
                </Link>
              </Button>
              {!isFirstSession && !isFirstReturn ? (
                <Button asChild variant="secondary">
                  <Link href="/leaderboard">
                    <Trophy className="h-5 w-5" /> {t("dashboard.returning.viewRankings")}
                  </Link>
                </Button>
              ) : null}
            </div>
            {isFirstSession ? (
              <div className="mt-4 rounded-[24px] border border-cyan-300/16 bg-[linear-gradient(135deg,rgba(34,211,238,0.1),rgba(139,92,246,0.08))] px-4 py-3 text-sm font-semibold text-slate-200">
                {t("dashboard.firstSession.helper")}
              </div>
            ) : null}
            {isFirstSession ? (
              <div className="mt-6 grid gap-3 lg:grid-cols-3">
                <OnboardingStep body={t("dashboard.firstSession.step1Body")} step="1" title={t("dashboard.firstSession.step1Title")} />
                <OnboardingStep body={t("dashboard.firstSession.step2Body")} step="2" title={t("dashboard.firstSession.step2Title")} />
                <OnboardingStep body={t("dashboard.firstSession.step3Body")} step="3" title={t("dashboard.firstSession.step3Title")} />
              </div>
            ) : null}
            {!isFirstReturn ? (
              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard icon={Flame} label={t("dashboard.metrics.totalXp")} tone="cyan" value={stats.totalXp.toLocaleString()} />
                <MetricCard icon={Rocket} label={t("dashboard.metrics.dailyStreak")} tone="violet" value={stats.progression.currentStreak} />
                <MetricCard icon={Medal} label={t("dashboard.metrics.gamesCompleted")} tone="green" value={stats.completed} />
                <MetricCard
                  icon={Target}
                  label={fill(t("dashboard.metrics.level"), { level: stats.progression.level })}
                  tone="amber"
                  value={fill(t("dashboard.metrics.xpLeft"), { count: stats.progression.xpToNextLevel })}
                />
              </div>
            ) : null}
            {!isFirstSession && !isFirstReturn ? (
              <div className="mt-6 grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
                <ProgressPanel
                  accent="cyan"
                  helper={fill(t("dashboard.progress.xpHelper"), { count: stats.totalXp.toLocaleString() })}
                  label={t("dashboard.progress.xpLabel")}
                  progress={Math.round((stats.progression.xpIntoLevel / xpRange) * 100)}
                  value={fill(t("dashboard.metrics.level"), { level: stats.progression.level })}
                />
                <ProgressPanel
                  accent="violet"
                  helper={t("dashboard.progress.streakHelper")}
                  label={t("dashboard.progress.streakLabel")}
                  progress={Math.min(100, stats.progression.currentStreak * 14)}
                  value={fill(t("dashboard.progress.streakValue"), { count: stats.progression.currentStreak })}
                />
              </div>
            ) : null}
          </div>
        </div>

        {isFirstSession ? (
          <div className="panel rounded-[30px] p-5">
            <p className="surface-label text-amber-200/80">{t("dashboard.firstSession.activation")}</p>
            <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">{t("dashboard.firstSession.unlockBoardTitle")}</h2>
            <div className="mt-5 rounded-[24px] border border-white/10 bg-slate-950/45 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-amber-100">
                  <Crown className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  {t("dashboard.firstSession.locked")}
                </span>
              </div>
              <p className="mt-4 font-black text-white">{t("dashboard.firstSession.motivationTitle")}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{t("dashboard.firstSession.motivationBody")}</p>
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
                <div>
                  <p className="text-sm font-black text-white">{t("dashboard.firstSession.goalTitle")}</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{t("dashboard.firstSession.goalBody")}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-cyan-200" />
              </div>
            </div>
          </div>
        ) : isFirstReturn ? (
          <div className="panel rounded-[30px] p-5">
            <p className="surface-label text-emerald-200/80">{t("dashboard.firstReturn.surface")}</p>
            <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">{t("dashboard.firstReturn.title")}</h2>
            <div className="mt-5 grid gap-3">
              <ChainStep
                body={fill(t("dashboard.firstReturn.xpTrackingBody"), { level: stats.progression.level, xp: stats.totalXp.toLocaleString() })}
                eyebrow={t("dashboard.firstReturn.unlockedEyebrow")}
                title={t("dashboard.firstReturn.xpTrackingTitle")}
              />
              <ChainStep
                body={
                  latestBadge
                    ? fill(t("dashboard.firstReturn.markersBodyWithBadge"), { badge: latestBadge.label, count: streakText })
                    : fill(t("dashboard.firstReturn.markersBodyNoBadge"), { count: streakText })
                }
                eyebrow={t("dashboard.firstReturn.unlockedEyebrow")}
                title={latestBadge ? latestBadge.label : t("dashboard.firstReturn.markersTitle")}
              />
              <ChainStep body={stats.recommendedNext.reason} eyebrow={t("dashboard.firstReturn.nextChallengeEyebrow")} title={stats.recommendedNext.title} />
            </div>
            <Button asChild className="mt-5 w-full" size="lg">
              <Link href={stats.recommendedNext.href as Route<string>}>
                <ArrowRight className="h-5 w-5" /> {t("dashboard.firstReturn.cta")}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="panel rounded-[30px] p-5">
            <p className="surface-label text-emerald-200/80">{t("dashboard.dailyChallenge")}</p>
            <div className="mt-4">
              <DailyChallengeCard compact />
            </div>
          </div>
        )}
      </section>

      {isFirstSession || isFirstReturn ? null : (
        <section className="mt-4 panel-strong rounded-[30px] p-5">
          <p className="surface-label text-cyan-200/80">{t("dashboard.chain.surface")}</p>
          <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">{t("dashboard.chain.title")}</h2>
          <div className="mt-5 grid gap-3 lg:grid-cols-4">
            <ChainStep
              body={stats.completed === 1 ? t("dashboard.chain.savedBodySingle") : fill(t("dashboard.chain.savedBodyMany"), { count: stats.completed })}
              eyebrow={t("dashboard.chain.savedEyebrow")}
              title={fill(t("dashboard.chain.savedTitle"), { count: stats.completed })}
            />
            <ChainStep
              body={fill(t("dashboard.chain.xpBody"), { level: stats.progression.level, xp: stats.totalXp.toLocaleString() })}
              eyebrow={t("dashboard.chain.xpEyebrow")}
              title={fill(t("dashboard.chain.xpTitle"), { count: stats.progression.xpToNextLevel })}
            />
            <ChainStep
              body={
                latestBadge
                  ? fill(t("dashboard.chain.badgeBodyWithBadge"), { badge: latestBadge.label, count: streakText })
                  : fill(t("dashboard.chain.badgeBodyNoBadge"), { count: streakText })
              }
              eyebrow={t("dashboard.chain.badgeEyebrow")}
              title={latestBadge ? latestBadge.label : t("dashboard.chain.badgeFallback")}
            />
            <ChainStep body={stats.recommendedNext.reason} eyebrow={t("dashboard.chain.nextEyebrow")} title={stats.recommendedNext.title} />
          </div>
        </section>
      )}

      {isFirstSession || isFirstReturn ? null : (
        <section className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="panel rounded-[30px] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="surface-label">{t("dashboard.habit.surface")}</p>
                <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">{t("dashboard.habit.title")}</h2>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/6 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                {t("dashboard.habit.guidance")}
              </div>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[24px] border border-white/10 bg-slate-950/45 p-4">
                <p className="text-sm font-black text-white">{isFirstSession ? t("dashboard.habit.afterFirstRun") : t("dashboard.habit.whatDidIDo")}</p>
                <div className="mt-4 space-y-4">
                  <MetricLine label={t("dashboard.habit.runsSaved")} value={`${stats.completed}`} width={`${Math.min(24 + stats.completed * 8, 92)}%`} />
                  <MetricLine label={t("dashboard.habit.totalXpEarned")} value={stats.totalXp.toLocaleString()} width={`${Math.min(18 + stats.progression.level * 12, 96)}%`} />
                  <MetricLine label={t("dashboard.habit.dailyStreak")} value={t("common.daysShort").replace("{count}", String(stats.progression.currentStreak))} width={`${Math.min(18 + stats.progression.currentStreak * 14, 96)}%`} />
                </div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-slate-950/45 p-4">
                <p className="text-sm font-black text-white">{isFirstSession ? t("dashboard.habit.whatWillUnlock") : t("dashboard.habit.whatImproved")}</p>
                <div className="mt-4 space-y-4">
                  <MetricLine label={t("dashboard.habit.bestScore")} value={stats.best.toLocaleString()} width="74%" />
                  <MetricLine label={t("dashboard.habit.averageAccuracy")} value={`${stats.avgAccuracy}%`} width={`${Math.max(stats.avgAccuracy, 18)}%`} />
                  <MetricLine
                    label={t("dashboard.habit.latestRunDelta")}
                    value={stats.improvement === null ? t("dashboard.habit.startRun") : `${stats.improvement >= 0 ? "+" : ""}${stats.improvement}`}
                    width={`${Math.min(40 + Math.max(stats.improvement ?? 0, 0) / 25, 92)}%`}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="panel rounded-[30px] p-5">
            <p className="surface-label">{t("dashboard.next.surface")}</p>
            <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">{t("dashboard.next.title")}</h2>
            <div className="mt-5 grid gap-3">
              <RecommendedChallengeCard badgeLabel={t("dashboard.next.recommended")} href={stats.recommendedNext.href as Route<string>} reason={stats.recommendedNext.reason} title={stats.recommendedNext.title} />
              <QuickAction href="/leaderboard" icon={Trophy} subtitle={t("dashboard.next.leaderboardBody")} title={t("dashboard.next.leaderboardTitle")} />
              <QuickAction href="/profile" icon={Brain} subtitle={t("dashboard.next.profileBody")} title={t("dashboard.next.profileTitle")} />
            </div>
          </div>
        </section>
      )}

      {isFirstSession || isFirstReturn ? null : (
        <section className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="panel rounded-[30px] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="surface-label">{t("dashboard.activity.surface")}</p>
                <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">{t("dashboard.activity.title")}</h2>
              </div>
              <Activity className="h-5 w-5 text-cyan-200" />
            </div>
            <div className="mt-5 grid gap-3">
              {scores.length ? (
                scores.slice(0, 6).map((score) => (
                  <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border border-white/10 bg-white/6 p-4" key={score.id}>
                    <div>
                      <p className="font-black text-white">{formatGame(score.game_slug)}</p>
                      <p className="text-sm font-semibold text-slate-400">{new Date(score.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-white">{score.score}</p>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{score.accuracy}%</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="relative overflow-hidden rounded-[26px] border border-cyan-300/16 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(139,92,246,0.08))] p-5">
                  <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl" />
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100">
                      <Star className="h-5 w-5" />
                    </div>
                    <p className="mt-4 font-[var(--font-sora)] text-xl font-extrabold text-white">{t("dashboard.activity.emptyTitle")}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{t("dashboard.activity.emptyBody")}</p>
                    <Button asChild className="mt-4" variant="secondary">
                      <Link href="/games/quick-math-duel">{t("dashboard.activity.startFirstRun")}</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="panel rounded-[30px] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="surface-label text-cyan-200/80">{t("dashboard.games.surface")}</p>
                <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">{t("dashboard.games.title")}</h2>
              </div>
              <Sparkles className="h-5 w-5 text-violet" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {stats.progression.badges.map((badge) => (
                <div className={`relative overflow-hidden rounded-[24px] border p-4 ${badge.earned ? "border-emerald-300/18 bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(34,211,238,0.08))]" : "border-white/10 bg-white/6"}`} key={badge.id}>
                  <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-white/6 blur-2xl" />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${badge.earned ? "border-emerald-300/20 bg-emerald-400/12 text-emerald-100" : "border-cyan-300/18 bg-cyan-400/10 text-cyan-100"}`}>
                        <Award className="h-5 w-5" />
                      </div>
                      <span className={`text-xs font-black uppercase tracking-[0.14em] ${badge.earned ? "text-emerald-200" : "text-slate-500"}`}>
                        {badge.earned ? t("dashboard.games.earned") : `${badge.progress}/${badge.target}`}
                      </span>
                    </div>
                    <p className="mt-4 font-black text-white">{badge.label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-400">{badge.description}</p>
                    <div className="mt-3 h-2.5 rounded-full bg-white/8">
                      <div
                        className={`h-full rounded-full ${badge.earned ? "bg-[linear-gradient(90deg,#34d399_0%,#22d3ee_100%)]" : "bg-[linear-gradient(90deg,#22d3ee_0%,#8b5cf6_100%)]"}`}
                        style={{ width: `${Math.max((badge.progress / badge.target) * 100, badge.earned ? 100 : 8)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function OnboardingStep({ body, step, title }: { body: string; step: string; title: string }) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/42 p-4 backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.55),transparent)]" />
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-sm font-black text-cyan-100">{step}</div>
        <p className="font-black text-white">{title}</p>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{body}</p>
    </div>
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
    amber: "border-amber-300/20 bg-amber-300/10 text-amber-100",
    cyan: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
    green: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
    violet: "border-violet/20 bg-violet/12 text-[rgb(237,233,254)]"
  };

  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/42 p-4 backdrop-blur-xl">
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${toneMap[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-5 text-2xl font-black text-white">{value}</p>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
    </div>
  );
}

function MetricLine({ label, value, width }: { label: string; value: string; width: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-sm font-semibold text-slate-300">
        <span>{label}</span>
        <span className="text-white">{value}</span>
      </div>
      <div className="h-2.5 rounded-full bg-white/8">
        <div className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee_0%,#8b5cf6_100%)]" style={{ width }} />
      </div>
    </div>
  );
}

function ProgressPanel({
  accent,
  helper,
  label,
  progress,
  value
}: {
  accent: "cyan" | "violet";
  helper: string;
  label: string;
  progress: number;
  value: string;
}) {
  const barClass = accent === "cyan" ? "bg-[linear-gradient(90deg,#22d3ee_0%,#0ea5e9_100%)]" : "bg-[linear-gradient(90deg,#8b5cf6_0%,#22d3ee_100%)]";

  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/42 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
          <p className="mt-1 font-black text-white">{value}</p>
        </div>
        <span className="text-sm font-black text-cyan-100">{progress}%</span>
      </div>
      <div className="mt-4 h-2.5 rounded-full bg-white/8">
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${Math.max(progress, 6)}%` }} />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-400">{helper}</p>
    </div>
  );
}

function RecommendedChallengeCard({
  badgeLabel,
  href,
  reason,
  title
}: {
  badgeLabel: string;
  href: Route<string>;
  reason: string;
  title: string;
}) {
  return (
    <Link className="relative overflow-hidden rounded-[26px] border border-cyan-300/16 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(139,92,246,0.08))] p-5 transition hover:-translate-y-0.5 hover:border-cyan-300/24" href={href}>
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100">
            <Play className="h-5 w-5" />
          </div>
          <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-emerald-100">
            {badgeLabel}
          </span>
        </div>
        <p className="mt-4 font-[var(--font-sora)] text-xl font-extrabold text-white">{title}</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">{reason}</p>
      </div>
    </Link>
  );
}

function ChainStep({ body, eyebrow, title }: { body: string; eyebrow: string; title: string }) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/42 p-4">
      <div className="absolute left-0 top-0 h-full w-px bg-[linear-gradient(180deg,rgba(34,211,238,0.55),transparent)]" />
      <p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-200">{eyebrow}</p>
      <p className="mt-3 font-black text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  subtitle,
  title
}: {
  href: Route<string>;
  icon: typeof Play;
  subtitle: string;
  title: string;
}) {
  return (
    <Link className="rounded-[24px] border border-white/10 bg-white/6 p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/20 hover:bg-white/10" href={href}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100">
          <Icon className="h-5 w-5" />
        </div>
        <Sparkles className="h-4 w-4 text-slate-500" />
      </div>
      <p className="mt-4 font-black text-white">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-400">{subtitle}</p>
    </Link>
  );
}

function formatGame(slug: string) {
  return slug
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}
