"use client";

import { CalendarDays, Flame, Mail, Medal, Target, Trophy, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { StatCard } from "@/shared/components/ui/StatCard";
import { games } from "@/lib/games/catalog";
import { getProgressionSnapshot } from "@/lib/progression";
import { getCurrentProfile } from "@/lib/supabase/profileRepository";
import { getUserScores } from "@/lib/supabase/scores";
import type { ScoreRow } from "@/lib/types";

export function ProfileClient() {
  const { user } = useAuth();
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

  const displayName = profileName || user?.user_metadata?.display_name || user?.email?.split("@")[0] || "MathQuest Player";
  const joined = user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Preview account";

  return (
    <main className="mx-auto max-w-[1440px] p-4 sm:p-6">
      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <aside className="panel-strong rounded-[30px] p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(139,92,246,0.2))] text-cyan-100">
              <UserRound className="h-10 w-10" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-[var(--font-sora)] text-2xl font-extrabold text-white">{displayName}</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-400">
                <Mail className="h-4 w-4" /> {user?.email ?? "preview@mathquest.local"}
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            <ProfileLine icon={CalendarDays} label="Joined" value={joined} />
            <ProfileLine icon={Trophy} label="Progress source" value={scores.length ? "Saved scores" : "No saved scores yet"} />
          </div>
        </aside>

        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard icon={Medal} label="Best score" tone="lemon" value={stats.bestScore.toLocaleString()} />
          <StatCard icon={Flame} label="Total XP" tone="coral" value={stats.totalXp.toLocaleString()} />
          <StatCard icon={Target} label="Average accuracy" tone="mint" value={`${stats.accuracy}%`} />
          <StatCard icon={Trophy} label="Best streak" tone="violet" value={stats.bestStreak} />
        </div>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.82fr]">
        <div className="panel rounded-[30px] p-6">
          <p className="surface-label">Activity</p>
          <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">Recent sessions</h2>
          <div className="mt-5 grid gap-3">
            {scores.length ? (
              scores.map((score) => (
                <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/6 p-4 sm:grid-cols-[1fr_auto] sm:items-center" key={score.id}>
                  <div>
                    <p className="font-black text-white">{formatGame(score.game_slug)}</p>
                    <p className="text-sm font-semibold text-slate-400">{new Date(score.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <MiniMetric label="Score" value={score.score} />
                    <MiniMetric label="Accuracy" value={`${score.accuracy}%`} />
                    <MiniMetric label="Streak" value={score.max_streak} />
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-white/10 bg-white/6 p-4 font-semibold text-slate-300">
                No saved sessions yet. Play and save your first game.
              </p>
            )}
          </div>
        </div>

        <div className="panel rounded-[30px] p-6">
          <p className="surface-label text-cyan-200/80">Mastery</p>
          <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">Skill map</h2>
          {scores.length ? (
            <div className="mt-5 grid gap-4">
              {skillMap.map((game) => (
                <div key={game.title}>
                  <div className="mb-2 flex items-center justify-between gap-4 text-sm font-black text-white">
                    <span>{game.title}</span>
                    <span className="text-cyan-200">
                      {game.runs ? `${game.averageAccuracy}% accuracy` : "No saved runs"}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee_0%,#0ea5e9_52%,#8b5cf6_100%)] shadow-[0_0_18px_rgba(34,211,238,0.24)]"
                      style={{ width: `${Math.max(game.averageAccuracy, game.runs ? 12 : 0)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-400">
                    {game.runs ? `Best score ${game.bestScore.toLocaleString()} across ${game.runs} saved run${game.runs === 1 ? "" : "s"}` : "Play and save a run to see game-specific progress."}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-2xl border border-white/10 bg-white/6 p-4 font-semibold text-slate-300">
              No saved sessions yet. Play and save your first game.
            </p>
          )}
        </div>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="panel rounded-[30px] p-6">
          <p className="surface-label text-emerald-200/80">Summary</p>
          <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">Performance snapshot</h2>
          <div className="mt-5 space-y-4">
            <MiniBar label="Accuracy trend" value={`${stats.accuracy}%`} width={`${Math.max(stats.accuracy, 14)}%`} />
            <MiniBar label="XP growth" value={stats.totalXp.toLocaleString()} width={`${Math.min(24 + scores.length * 8, 92)}%`} />
            <MiniBar label="Consistency" value={`${stats.bestStreak} streak`} width={`${Math.min(22 + stats.bestStreak * 6, 94)}%`} />
          </div>
        </div>
        <div className="panel rounded-[30px] p-6">
          <p className="surface-label">Achievements</p>
          <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">Unlocked highlights</h2>
          {earnedBadges.length ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {earnedBadges.map((badge) => (
                <div className="rounded-[24px] border border-white/10 bg-white/6 p-4" key={badge.id}>
                  <p className="text-sm font-black text-white">{badge.label}</p>
                  <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-cyan-200">{badge.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-2xl border border-white/10 bg-white/6 p-4 font-semibold text-slate-300">
              No saved sessions yet. Play and save your first game.
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
