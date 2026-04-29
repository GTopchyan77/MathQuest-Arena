"use client";

import type { Route } from "next";
import Link from "next/link";
import { CheckCircle2, Crown, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import type { GameResult, PostGameInsights } from "@/lib/types";
import { saveGameResult } from "@/lib/supabase/scores";

type ResultPanelProps = {
  onRestart: () => void;
  result: GameResult;
};

export function ResultPanel({ onRestart, result }: ResultPanelProps) {
  const [status, setStatus] = useState("");
  const [insights, setInsights] = useState<PostGameInsights | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const response = await saveGameResult(result);
    setSaving(false);
    setStatus(response.message);
    setInsights(response.insights ?? null);
    setSaved(response.ok);
  }

  const isFirstSave = insights?.newlyEarnedBadges.some((badge) => badge.id === "first-run") ?? false;
  const firstBadge = insights?.newlyEarnedBadges[0] ?? null;
  const leaderboardUnlockMessage =
    insights?.rankAfter !== null && insights?.rankAfter !== undefined
      ? insights.rankBefore === null
        ? `You entered the leaderboard at #${insights.rankAfter}.`
        : insights.rankAfter < insights.rankBefore
          ? `You moved up to #${insights.rankAfter}.`
          : `You are holding at #${insights.rankAfter}.`
      : "One more saved run could move you onto the board.";

  return (
    <section className="panel-strong rounded-[30px] p-6">
      <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
        <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute left-0 top-0 h-20 w-20 rounded-full bg-violet/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/12 text-emerald-200">
          <CheckCircle2 className="h-7 w-7" />
          </span>
          <div>
            <h2 className="font-[var(--font-sora)] text-2xl font-extrabold text-white">Round complete</h2>
            <p className="text-sm font-bold text-slate-400">You can play now and decide later whether to save this run to your profile.</p>
          </div>
          <div className="ml-auto hidden items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-amber-100 sm:inline-flex">
            <Sparkles className="h-3.5 w-3.5" />
            Reward ready
          </div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Score" value={result.score} />
        <Metric label="Correct" value={`${result.correct}/${result.total}`} />
        <Metric label="Accuracy" value={`${result.accuracy}%`} />
        <Metric label="Best streak" value={result.maxStreak} />
      </div>
      {status ? <p className="mt-4 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-bold text-slate-200">{status}</p> : null}
      {isFirstSave ? (
        <div className="mt-4 relative overflow-hidden rounded-[24px] border border-emerald-400/20 bg-[linear-gradient(135deg,rgba(16,185,129,0.14),rgba(34,211,238,0.08))] p-5">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-emerald-400/10 blur-3xl" />
          <p className="relative text-xs font-black uppercase tracking-[0.14em] text-emerald-100">First win unlocked</p>
          <h3 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">Nice. Your first score is saved.</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">
            Your first saved run just unlocked real progress. Check what changed, then take the next recommended challenge while the momentum is fresh.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="XP gained" value={`+${insights?.xpGained ?? 0}`} />
            <Metric label="First badge" value={firstBadge?.label ?? "Unlocked"} />
            <Metric label="Leaderboard" value={insights?.rankAfter ? `#${insights.rankAfter}` : "Next up"} />
            <Metric label="Next unlock" value={insights?.recommendedNextChallenge.title ?? "Ready"} />
          </div>
          <p className="mt-4 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-semibold text-slate-100">
            {leaderboardUnlockMessage}
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/dashboard">See your progress</Link>
            </Button>
            {insights ? (
              <Button asChild variant="secondary">
                <Link href={insights.recommendedNextChallenge.href as Route<string>}>Play the next challenge</Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
      {insights ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-3 sm:grid-cols-2">
            <Metric label="XP gained" value={`+${insights.xpGained}`} />
            <Metric label="Level" value={`${insights.levelBefore} -> ${insights.levelAfter}`} />
            <Metric
              label="Vs last run"
              value={
                insights.improvement === null ? "First save" : `${insights.improvement >= 0 ? "+" : ""}${insights.improvement}`
              }
            />
            <Metric
              label="Rank move"
              value={
                insights.rankAfter === null
                  ? "Unranked"
                  : insights.rankBefore === null
                    ? `#${insights.rankAfter}`
                    : `#${insights.rankBefore} -> #${insights.rankAfter}`
              }
            />
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/6 p-4">
            <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Next challenge</p>
                <p className="mt-2 font-[var(--font-sora)] text-xl font-extrabold text-white">{insights.recommendedNextChallenge.title}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100">
                <Crown className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-300">{insights.recommendedNextChallenge.reason}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {insights.personalBest ? <Tag>New personal best</Tag> : null}
              <Tag>{insights.currentStreak}-day streak</Tag>
              {insights.newlyEarnedBadges.map((badge) => (
                <Tag key={badge.id}>{badge.label}</Tag>
              ))}
            </div>
            <Button asChild className="mt-4" variant="secondary">
              <Link href={insights.recommendedNextChallenge.href as Route<string>}>Play recommended challenge</Link>
            </Button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button disabled={saving || saved} onClick={save}>
          {saving ? "Saving..." : saved ? "Score saved" : "Save score"}
        </Button>
        <Button onClick={onRestart} variant="secondary">
          Play again
        </Button>
        {!saved ? (
          <p className="self-center text-sm font-semibold text-slate-400">Save this first run to unlock XP, your first badge, leaderboard placement, and the next challenge path.</p>
        ) : null}
      </div>
    </section>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-cyan-100">
      {children}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
    </div>
  );
}
