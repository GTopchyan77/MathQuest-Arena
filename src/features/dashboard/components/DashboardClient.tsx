"use client";

import type { Route } from "next";
import Link from "next/link";
import { Activity, Brain, Flame, Medal, Play, Rocket, Sparkles, Target, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DailyChallengeCard } from "@/features/games/components/DailyChallengeCard";
import { Button } from "@/shared/components/ui/Button";
import { getProgressionSnapshot, getRecommendedNextChallenge } from "@/lib/progression";
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

  return (
    <main className="mx-auto max-w-[1440px] p-4 sm:p-6">
      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="panel-strong relative overflow-hidden rounded-[30px] p-6 text-white">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent),radial-gradient(circle_at_top_left,rgba(34,211,238,.16),transparent_28%),radial-gradient(circle_at_92%_12%,rgba(139,92,246,.18),transparent_24%)]" />
          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="surface-label">Overview</p>
                <h1 className="mt-3 font-[var(--font-sora)] text-3xl font-extrabold sm:text-4xl">Ready for your next run?</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  Welcome back, {user?.user_metadata?.display_name ?? user?.email?.split("@")[0] ?? "math explorer"}. Sharpen speed, patterns, and logic in one focused arena.
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-400/16 bg-emerald-400/10 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-emerald-100">
                Daily challenge ready
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/games">
                  <Play className="h-5 w-5" /> Launch games
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/leaderboard">
                  <Trophy className="h-5 w-5" /> View rankings
                </Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard icon={Flame} label="Total XP" tone="cyan" value={stats.totalXp.toLocaleString()} />
              <MetricCard icon={Rocket} label="Daily streak" tone="violet" value={stats.progression.currentStreak} />
              <MetricCard icon={Medal} label="Games completed" tone="green" value={stats.completed} />
              <MetricCard icon={Target} label={`Level ${stats.progression.level}`} tone="amber" value={`${stats.progression.xpToNextLevel} XP left`} />
            </div>
          </div>
        </div>

        <div className="panel rounded-[30px] p-5">
          <p className="surface-label text-emerald-200/80">Daily Challenge</p>
          <div className="mt-4">
            <DailyChallengeCard compact />
          </div>
        </div>
      </section>

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
              <p className="text-sm font-black text-white">What did I do?</p>
              <div className="mt-4 space-y-4">
                <MetricLine label="Runs saved" value={`${stats.completed}`} width={`${Math.min(24 + stats.completed * 8, 92)}%`} />
                <MetricLine label="Total XP earned" value={stats.totalXp.toLocaleString()} width={`${Math.min(18 + stats.progression.level * 12, 96)}%`} />
                <MetricLine label="Daily streak" value={`${stats.progression.currentStreak} days`} width={`${Math.min(18 + stats.progression.currentStreak * 14, 96)}%`} />
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-slate-950/45 p-4">
              <p className="text-sm font-black text-white">What improved?</p>
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
            <QuickAction
              href={stats.recommendedNext.href as Route<string>}
              icon={Play}
              subtitle={stats.recommendedNext.reason}
              title={stats.recommendedNext.title}
            />
            <QuickAction href="/leaderboard" icon={Trophy} subtitle="See where you stand this week" title="Check the leaderboard" />
            <QuickAction href="/profile" icon={Brain} subtitle="Review your level, streak, and badge progress" title="Open your profile" />
          </div>
        </div>
      </section>

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
              <p className="rounded-2xl border border-white/10 bg-white/6 p-4 font-semibold text-slate-300">Play and save a score to fill this space with progress.</p>
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
          <div className="mt-5 grid gap-3">
            {stats.progression.badges.map((badge) => (
              <div className="rounded-2xl border border-white/10 bg-white/6 p-4" key={badge.id}>
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-white">{badge.label}</p>
                    <span className={`text-xs font-black uppercase tracking-[0.14em] ${badge.earned ? "text-emerald-200" : "text-slate-500"}`}>
                      {badge.earned ? "Earned" : `${badge.progress}/${badge.target}`}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-400">{badge.description}</p>
                </div>
                <div className="mt-3 h-2.5 rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee_0%,#8b5cf6_100%)]"
                    style={{ width: `${Math.max((badge.progress / badge.target) * 100, badge.earned ? 100 : 8)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
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
