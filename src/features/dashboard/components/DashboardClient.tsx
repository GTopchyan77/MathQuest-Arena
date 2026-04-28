"use client";

import Link from "next/link";
import { Brain, Flame, Medal, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import { games } from "@/lib/games/catalog";
import { getUserScores } from "@/lib/supabase/scores";
import type { ScoreRow } from "@/lib/types";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function DashboardClient() {
  const { user } = useAuth();
  const [scores, setScores] = useState<ScoreRow[]>([]);

  useEffect(() => {
    getUserScores().then(setScores);
  }, []);

  const stats = useMemo(() => {
    const best = scores.reduce((max, score) => Math.max(max, score.score), 0);
    const total = scores.reduce((sum, score) => sum + score.score, 0);
    const avgAccuracy = scores.length ? Math.round(scores.reduce((sum, score) => sum + score.accuracy, 0) / scores.length) : 0;
    return { avgAccuracy, best, total };
  }, [scores]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="panel-strong relative overflow-hidden rounded-[2rem] p-6 text-white sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,.18),transparent_26%),radial-gradient(circle_at_92%_12%,rgba(139,92,246,.2),transparent_24%)]" />
        <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-center">
          <div className="relative">
            <p className="surface-label text-amber-200/80">Dashboard</p>
            <h1 className="mt-3 font-[var(--font-sora)] text-4xl font-extrabold sm:text-5xl">Ready for your next run?</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
              Welcome back, {user?.user_metadata?.display_name ?? user?.email?.split("@")[0] ?? "math explorer"}. Sharpen speed, patterns, and logic in one focused arena.
            </p>
            <Button asChild className="mt-7">
              <Link href="/games">
                <Play className="h-5 w-5" /> Play now
              </Link>
            </Button>
          </div>
          <div className="relative grid grid-cols-3 gap-3">
            <HeroStat icon={Medal} label="Best" value={stats.best} />
            <HeroStat icon={Flame} label="Total XP" value={stats.total} />
            <HeroStat icon={Brain} label="Accuracy" value={`${stats.avgAccuracy}%`} />
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="panel rounded-[28px] p-6">
          <h2 className="font-[var(--font-sora)] text-2xl font-extrabold text-white">Recommended games</h2>
          <div className="mt-5 grid gap-3">
            {games.map((game) => (
              <Link className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/20 hover:bg-white/10" href={`/games/${game.slug}`} key={game.slug}>
                <div>
                  <p className="font-black text-white">{game.title}</p>
                  <p className="text-sm font-semibold text-slate-400">{game.skills.join(" / ")}</p>
                </div>
                <Play className="h-5 w-5 text-cyan-200" />
              </Link>
            ))}
          </div>
        </div>
        <div className="panel rounded-[28px] p-6">
          <h2 className="font-[var(--font-sora)] text-2xl font-extrabold text-white">Recent progress</h2>
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
      </section>
    </main>
  );
}

function HeroStat({ icon: Icon, label, value }: { icon: typeof Medal; label: string; value: number | string }) {
  return (
    <div className="rounded-[24px] border border-white/12 bg-white/8 p-4 backdrop-blur-xl">
      <Icon className="h-6 w-6 text-cyan-200" />
      <p className="mt-5 text-2xl font-black text-white">{value}</p>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
    </div>
  );
}

function formatGame(slug: string) {
  return slug
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}
