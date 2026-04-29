"use client";

import type { Route } from "next";
import Link from "next/link";
import { Activity, ArrowRight, Award, Brain, Crown, Flame, Medal, Play, Rocket, Sparkles, Star, Target, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DailyChallengeCard } from "@/features/games/components/DailyChallengeCard";
import { Button } from "@/shared/components/ui/Button";
import { getLevelCeiling, getLevelFloor, getProgressionSnapshot, getRecommendedNextChallenge } from "@/lib/progression";
import { getUserProfile, getUserScores } from "@/lib/supabase/scores";
import type { Profile, ScoreRow } from "@/lib/types";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function DashboardClient() {
  const { user } = useAuth();
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
  const xpRange = Math.max(getLevelCeiling(stats.progression.level) - getLevelFloor(stats.progression.level), 1);
  const latestBadge = stats.progression.badges.find((badge) => badge.earned) ?? null;

  return (
    <main className="mx-auto max-w-[1440px] p-4 sm:p-6">
      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="panel-strong relative overflow-hidden rounded-[30px] p-6 text-white">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent),radial-gradient(circle_at_top_left,rgba(34,211,238,.16),transparent_28%),radial-gradient(circle_at_92%_12%,rgba(139,92,246,.18),transparent_24%)]" />
          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="surface-label">Overview</p>
                <h1 className="mt-3 font-[var(--font-sora)] text-3xl font-extrabold sm:text-4xl">
                  {isFirstSession ? "Start with one quick win" : "Ready for your next run?"}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  {isFirstSession
                    ? `Welcome, ${user?.user_metadata?.display_name ?? user?.email?.split("@")[0] ?? "math explorer"}. Begin with Quick Math Duel, save your first score, then come back here to watch your progress light up.`
                    : `Welcome back, ${user?.user_metadata?.display_name ?? user?.email?.split("@")[0] ?? "math explorer"}. Sharpen speed, patterns, and logic in one focused arena.`}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-400/16 bg-emerald-400/10 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-emerald-100">
                {isFirstSession ? "First session" : "Daily challenge ready"}
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild className={isFirstSession ? "shadow-[0_22px_70px_rgba(34,211,238,0.32)]" : undefined}>
                <Link href={isFirstSession ? "/games/quick-math-duel" : "/games"}>
                  <Play className="h-5 w-5" /> {isFirstSession ? "Play Quick Math Duel" : "Launch games"}
                </Link>
              </Button>
              {!isFirstSession ? (
                <Button asChild variant="secondary">
                  <Link href="/leaderboard">
                    <Trophy className="h-5 w-5" /> View rankings
                  </Link>
                </Button>
              ) : null}
            </div>
            {isFirstSession ? (
              <div className="mt-4 rounded-[24px] border border-cyan-300/16 bg-[linear-gradient(135deg,rgba(34,211,238,0.1),rgba(139,92,246,0.08))] px-4 py-3 text-sm font-semibold text-slate-200">
                One fast win. One saved score. Your dashboard unlocks for real.
              </div>
            ) : null}
            {isFirstSession ? (
              <div className="mt-6 grid gap-3 lg:grid-cols-3">
                <OnboardingStep
                  step="1"
                  title="Play Quick Math Duel"
                  body="It is the fastest way to get your first win on the board."
                />
                <OnboardingStep
                  step="2"
                  title="Save your first score"
                  body="When the round ends, save it to unlock stats, streaks, and badges."
                />
                <OnboardingStep
                  step="3"
                  title="Come back here"
                  body="Your dashboard will update with XP, activity, and a recommended next challenge."
                />
              </div>
            ) : null}
            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard icon={Flame} label="Total XP" tone="cyan" value={stats.totalXp.toLocaleString()} />
              <MetricCard icon={Rocket} label="Daily streak" tone="violet" value={stats.progression.currentStreak} />
              <MetricCard icon={Medal} label="Games completed" tone="green" value={stats.completed} />
              <MetricCard icon={Target} label={`Level ${stats.progression.level}`} tone="amber" value={`${stats.progression.xpToNextLevel} XP left`} />
            </div>
            {!isFirstSession ? (
              <div className="mt-6 grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
                <ProgressPanel
                  accent="cyan"
                  helper={`${stats.totalXp.toLocaleString()} XP banked`}
                  label="XP progress"
                  progress={Math.round((stats.progression.xpIntoLevel / xpRange) * 100)}
                  value={`Level ${stats.progression.level}`}
                />
                <ProgressPanel
                  accent="violet"
                  helper="Keep your streak alive with one saved run"
                  label="Streak momentum"
                  progress={Math.min(100, stats.progression.currentStreak * 14)}
                  value={`${stats.progression.currentStreak} day streak`}
                />
              </div>
            ) : null}
          </div>
        </div>

        {isFirstSession ? (
          <div className="panel rounded-[30px] p-5">
            <p className="surface-label text-amber-200/80">Activation</p>
            <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">Your first save unlocks the board</h2>
            <div className="mt-5 rounded-[24px] border border-white/10 bg-slate-950/45 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-amber-100">
                  <Crown className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Locked until first save
                </span>
              </div>
              <p className="mt-4 font-black text-white">Leaderboard motivation</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Save your first score to claim a spot, start your streak, and unlock your first visible badge.
              </p>
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
                <div>
                  <p className="text-sm font-black text-white">First goal</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Enter the arena board</p>
                </div>
                <ArrowRight className="h-4 w-4 text-cyan-200" />
              </div>
            </div>
          </div>
        ) : (
          <div className="panel rounded-[30px] p-5">
            <p className="surface-label text-emerald-200/80">Daily Challenge</p>
            <div className="mt-4">
              <DailyChallengeCard compact />
            </div>
          </div>
        )}
      </section>

      {isFirstSession ? null : (
        <section className="mt-4 panel-strong rounded-[30px] p-5">
          <p className="surface-label text-cyan-200/80">Progress Chain</p>
          <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">Saved run to next challenge, in one glance</h2>
          <div className="mt-5 grid gap-3 lg:grid-cols-4">
            <ChainStep
              body={stats.completed === 1 ? "Your first saved run is now on your record." : `${stats.completed} saved runs are feeding your progression.`}
              eyebrow="1. Saved run"
              title={`${stats.completed} run${stats.completed === 1 ? "" : "s"} saved`}
            />
            <ChainStep
              body={`${stats.totalXp.toLocaleString()} XP earned. Level ${stats.progression.level} is now live.`}
              eyebrow="2. XP and level"
              title={`${stats.progression.xpToNextLevel} XP to next level`}
            />
            <ChainStep
              body={latestBadge ? `${latestBadge.label} is unlocked and your streak is ${stats.progression.currentStreak} day${stats.progression.currentStreak === 1 ? "" : "s"}.` : `Current streak: ${stats.progression.currentStreak} day${stats.progression.currentStreak === 1 ? "" : "s"}.`}
              eyebrow="3. Badge and streak"
              title={latestBadge ? latestBadge.label : "Progress unlocked"}
            />
            <ChainStep
              body={stats.recommendedNext.reason}
              eyebrow="4. Recommended next"
              title={stats.recommendedNext.title}
            />
          </div>
        </section>
      )}

      {isFirstSession ? null : (
      <section className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="panel rounded-[30px] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="surface-label">Habit Loop</p>
              <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">What did I do, improve, and do next?</h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/6 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Session guidance
            </div>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[24px] border border-white/10 bg-slate-950/45 p-4">
              <p className="text-sm font-black text-white">{isFirstSession ? "What happens after the first run?" : "What did I do?"}</p>
              <div className="mt-4 space-y-4">
                <MetricLine label="Runs saved" value={`${stats.completed}`} width={`${Math.min(24 + stats.completed * 8, 92)}%`} />
                <MetricLine label="Total XP earned" value={stats.totalXp.toLocaleString()} width={`${Math.min(18 + stats.progression.level * 12, 96)}%`} />
                <MetricLine label="Daily streak" value={`${stats.progression.currentStreak} days`} width={`${Math.min(18 + stats.progression.currentStreak * 14, 96)}%`} />
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-slate-950/45 p-4">
              <p className="text-sm font-black text-white">{isFirstSession ? "What will unlock?" : "What improved?"}</p>
              <div className="mt-4 space-y-4">
                <MetricLine label="Best score" value={stats.best.toLocaleString()} width="74%" />
                <MetricLine label="Average accuracy" value={`${stats.avgAccuracy}%`} width={`${Math.max(stats.avgAccuracy, 18)}%`} />
                <MetricLine
                  label="Latest run delta"
                  value={stats.improvement === null ? "Start a run" : `${stats.improvement >= 0 ? "+" : ""}${stats.improvement}`}
                  width={`${Math.min(40 + Math.max(stats.improvement ?? 0, 0) / 25, 92)}%`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="panel rounded-[30px] p-5">
          <p className="surface-label">Next Up</p>
          <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">What should I do next?</h2>
          <div className="mt-5 grid gap-3">
            <RecommendedChallengeCard href={stats.recommendedNext.href as Route<string>} reason={stats.recommendedNext.reason} title={stats.recommendedNext.title} />
            <QuickAction href="/leaderboard" icon={Trophy} subtitle="See where you stand this week" title="Check the leaderboard" />
            <QuickAction href="/profile" icon={Brain} subtitle="Review your level, streak, and badge progress" title="Open your profile" />
          </div>
        </div>
      </section>
      )}

      {isFirstSession ? null : (
      <section className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="panel rounded-[30px] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="surface-label">Activity</p>
              <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">Recent activity</h2>
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
                  <p className="mt-4 font-[var(--font-sora)] text-xl font-extrabold text-white">Your first win will light this up.</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                  Start with Quick Math Duel, save your first score, and this feed will update right away with your latest result.
                  </p>
                  <Button asChild className="mt-4" variant="secondary">
                    <Link href="/games/quick-math-duel">Start first run</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="panel rounded-[30px] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="surface-label text-cyan-200/80">Games</p>
              <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">Badge and challenge progress</h2>
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
                      {badge.earned ? "Earned" : `${badge.progress}/${badge.target}`}
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
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-sm font-black text-cyan-100">
          {step}
        </div>
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
  const barClass =
    accent === "cyan"
      ? "bg-[linear-gradient(90deg,#22d3ee_0%,#0ea5e9_100%)]"
      : "bg-[linear-gradient(90deg,#8b5cf6_0%,#22d3ee_100%)]";

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

function RecommendedChallengeCard({ href, reason, title }: { href: Route<string>; reason: string; title: string }) {
  return (
    <Link className="relative overflow-hidden rounded-[26px] border border-cyan-300/16 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(139,92,246,0.08))] p-5 transition hover:-translate-y-0.5 hover:border-cyan-300/24" href={href}>
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100">
            <Play className="h-5 w-5" />
          </div>
          <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-emerald-100">
            Recommended
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
