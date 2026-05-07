"use client";

import { BarChart3, Trophy, Users } from "lucide-react";
import { useLocale } from "@/lib/i18n/useLocale";
import type { LeaderboardEntry } from "@/lib/types";

type LeaderboardSummaryCardProps = {
  entries: LeaderboardEntry[];
};

export function LeaderboardSummaryCard({ entries }: LeaderboardSummaryCardProps) {
  const { t } = useLocale();
  const leader = entries[0];

  if (!leader) {
    return (
      <div className="panel rounded-[30px] p-5">
        <p className="surface-label text-violet/80">{t("leaderboard.summaryTitle")}</p>
        <div className="mt-4 rounded-[26px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.78),rgba(30,41,59,0.58))] p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100">
            <Trophy className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-[var(--font-sora)] text-2xl font-extrabold text-white">{t("leaderboard.lowDataTitle")}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">{t("leaderboard.lowDataBody")}</p>
          <p className="mt-4 text-sm font-bold text-cyan-100">{t("leaderboard.summaryFirstSave")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel rounded-[30px] p-5">
      <p className="surface-label text-violet/80">{t("leaderboard.summaryTitle")}</p>
      <div className="mt-4 rounded-[26px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.78),rgba(30,41,59,0.58))] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{t("leaderboard.summaryLeader")}</p>
            <h3 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">
              {leader.display_name || t("leaderboard.anonymous")}
            </h3>
          </div>
          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm font-black text-amber-100">
            #{leader.rank}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <SummaryStat icon={Trophy} label={t("leaderboard.bestScore")} value={leader.best_score.toLocaleString()} />
          <SummaryStat icon={Users} label={t("leaderboard.summaryPlayers")} value={entries.length.toLocaleString()} />
        </div>

        <p className="mt-5 text-sm leading-6 text-slate-300">{t("leaderboard.summaryClimb")}</p>

        {entries.length < 3 ? (
          <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4">
            <div className="flex items-center gap-2 text-slate-100">
              <BarChart3 className="h-4 w-4 text-cyan-200" />
              <p className="text-sm font-bold">{t("leaderboard.lowDataTitle")}</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-300">{t("leaderboard.lowDataBody")}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SummaryStat({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-slate-950/35 px-4 py-4">
      <div className="flex items-center gap-2 text-slate-300">
        <Icon className="h-4 w-4 text-cyan-200" />
        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-black text-white">{value}</p>
    </div>
  );
}
