"use client";

import { CalendarDays, Flame, Mail, Medal, Target, Trophy, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { StatCard } from "@/shared/components/ui/StatCard";
import { games } from "@/lib/games/catalog";
import { mockScores } from "@/lib/mockData";
import { getCurrentProfile } from "@/lib/supabase/profileRepository";
import { getUserScores } from "@/lib/supabase/scores";
import type { ScoreRow } from "@/lib/types";

export function ProfileClient() {
  const { user } = useAuth();
  const [scores, setScores] = useState<ScoreRow[]>(mockScores);
  const [usingMock, setUsingMock] = useState(true);
  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    if (user) {
      getCurrentProfile(user.id).then((profile) => {
        setProfileName(profile?.display_name ?? "");
      });
    }

    getUserScores().then((data) => {
      if (data.length) {
        setScores(data);
        setUsingMock(false);
      }
    });
  }, []);

  const stats = useMemo(() => {
    const bestScore = scores.reduce((max, score) => Math.max(max, score.score), 0);
    const totalXp = scores.reduce((sum, score) => sum + score.score, 0);
    const bestStreak = scores.reduce((max, score) => Math.max(max, score.max_streak), 0);
    const accuracy = scores.length ? Math.round(scores.reduce((sum, score) => sum + score.accuracy, 0) / scores.length) : 0;
    return { accuracy, bestScore, bestStreak, totalXp };
  }, [scores]);

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
            <ProfileLine icon={Trophy} label="Progress source" value={usingMock ? "Mock preview" : "Saved scores"} />
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
            {scores.map((score) => (
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
            ))}
          </div>
        </div>

        <div className="panel rounded-[30px] p-6">
          <p className="surface-label text-cyan-200/80">Mastery</p>
          <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">Skill map</h2>
          <div className="mt-5 grid gap-4">
            {games.map((game, index) => (
              <div key={game.slug}>
                <div className="mb-2 flex items-center justify-between text-sm font-black text-white">
                  <span>{game.title}</span>
                  <span className="text-cyan-200">{82 + index * 5}%</span>
                </div>
                <div className="h-3 rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee_0%,#0ea5e9_52%,#8b5cf6_100%)] shadow-[0_0_18px_rgba(34,211,238,0.24)]" style={{ width: `${82 + index * 5}%` }} />
                </div>
              </div>
            ))}
          </div>
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
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Sharp Starter", value: "5 wins" },
              { label: "Pattern Pilot", value: "82% logic" },
              { label: "Arena Climber", value: `${stats.totalXp} XP` }
            ].map((item) => (
              <div className="rounded-[24px] border border-white/10 bg-white/6 p-4" key={item.label}>
                <p className="text-sm font-black text-white">{item.label}</p>
                <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-cyan-200">{item.value}</p>
              </div>
            ))}
          </div>
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
