"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
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

  return (
    <section className="panel-strong rounded-[30px] p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/12 text-emerald-200">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <div>
          <h2 className="font-[var(--font-sora)] text-2xl font-extrabold text-white">Round complete</h2>
          <p className="text-sm font-bold text-slate-400">Save your score to climb the leaderboard.</p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Score" value={result.score} />
        <Metric label="Correct" value={`${result.correct}/${result.total}`} />
        <Metric label="Accuracy" value={`${result.accuracy}%`} />
        <Metric label="Best streak" value={result.maxStreak} />
      </div>
      {status ? <p className="mt-4 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-bold text-slate-200">{status}</p> : null}
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
          <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Next challenge</p>
            <p className="mt-2 font-[var(--font-sora)] text-xl font-extrabold text-white">{insights.recommendedNextChallenge.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{insights.recommendedNextChallenge.reason}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {insights.personalBest ? <Tag>New personal best</Tag> : null}
              <Tag>{insights.currentStreak}-day streak</Tag>
              {insights.newlyEarnedBadges.map((badge) => (
                <Tag key={badge.id}>{badge.label}</Tag>
              ))}
            </div>
            <Button asChild className="mt-4" variant="secondary">
              <Link href={insights.recommendedNextChallenge.href}>Play recommended challenge</Link>
            </Button>
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
