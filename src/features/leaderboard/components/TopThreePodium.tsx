"use client";

import { Award, Crown, Medal, Trophy } from "lucide-react";
import { useLocale } from "@/lib/i18n/useLocale";
import { cx } from "@/lib/utils";
import type { LeaderboardEntry } from "@/lib/types";

type TopThreePodiumProps = {
  entries: LeaderboardEntry[];
};

const podiumStyles = {
  1: {
    badgeClass: "border-amber-300/30 bg-amber-300/14 text-amber-100 shadow-[0_0_32px_rgba(252,211,77,0.18)]",
    cardClass:
      "md:order-2 md:-translate-y-4 border-amber-300/25 bg-[linear-gradient(180deg,rgba(250,204,21,0.16),rgba(15,23,42,0.92))] shadow-[0_24px_60px_rgba(250,204,21,0.14)]",
    icon: Crown,
    labelKey: "leaderboard.champion" as const,
    nameClass: "text-2xl"
  },
  2: {
    badgeClass: "border-slate-300/20 bg-slate-200/10 text-slate-100",
    cardClass: "md:order-1 border-slate-300/16 bg-[linear-gradient(180deg,rgba(148,163,184,0.12),rgba(15,23,42,0.88))]",
    icon: Medal,
    labelKey: "leaderboard.runnerUp" as const,
    nameClass: "text-xl"
  },
  3: {
    badgeClass: "border-orange-300/24 bg-orange-300/10 text-orange-100",
    cardClass: "md:order-3 border-orange-300/20 bg-[linear-gradient(180deg,rgba(251,146,60,0.12),rgba(15,23,42,0.88))]",
    icon: Award,
    labelKey: "leaderboard.thirdPlace" as const,
    nameClass: "text-xl"
  }
} as const;

export function TopThreePodium({ entries }: TopThreePodiumProps) {
  const { t } = useLocale();

  if (!entries.length) {
    return null;
  }

  return (
    <section className="panel-strong mt-4 rounded-[30px] p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="surface-label text-amber-200/80">{t("leaderboard.topThreeTitle")}</p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">{t("leaderboard.topThreeBody")}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-bold text-slate-200">
          <Trophy className="h-4 w-4 text-amber-200" />
          {entries.length}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3 md:items-end">
        {entries.map((entry) => {
          const style = podiumStyles[entry.rank as 1 | 2 | 3];
          const Icon = style.icon;

          return (
            <article
              className={cx(
                "overflow-hidden rounded-[28px] border p-5 backdrop-blur-xl transition",
                style.cardClass
              )}
              key={entry.user_id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className={cx("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.14em]", style.badgeClass)}>
                  <Icon className="h-4 w-4" />
                  {t(style.labelKey)}
                </div>
                <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-sm font-black text-white">#{entry.rank}</span>
              </div>

              <div className="mt-5">
                <p className={cx("font-[var(--font-sora)] font-extrabold text-white", style.nameClass)}>
                  {entry.display_name || t("leaderboard.anonymous")}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-300">{t("leaderboard.mobileStats")}</p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <PodiumStat label={t("leaderboard.bestScore")} value={entry.best_score} />
                <PodiumStat label={t("leaderboard.totalScore")} value={entry.total_score} />
                <PodiumStat label={t("leaderboard.gamesPlayed")} value={entry.games_played} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function PodiumStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-slate-950/30 px-3 py-3">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-black text-white">{value.toLocaleString()}</p>
    </div>
  );
}
