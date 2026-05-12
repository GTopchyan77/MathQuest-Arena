"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { getDailyChallenge } from "@/lib/games/dailyChallenge";
import { useLocale } from "@/lib/i18n/useLocale";

type DailyChallengeCardProps = {
  compact?: boolean;
};

const promptKeys = {
  "boss-round-battle": "daily.prompt.boss-round-battle",
  "math-grid-puzzle": "daily.prompt.math-grid-puzzle",
  "missing-number-puzzle": "daily.prompt.missing-number-puzzle",
  "quick-math-duel": "daily.prompt.quick-math-duel"
} as const;

const skillKeys = {
  addition: "gameCard.skill.addition",
  "battle math": "gameCard.skill.battle-math",
  deduction: "gameCard.skill.deduction",
  focus: "gameCard.skill.focus",
  logic: "gameCard.skill.logic",
  "mental math": "gameCard.skill.mental-math",
  multiplication: "gameCard.skill.multiplication",
  "number sense": "gameCard.skill.number-sense",
  patterns: "gameCard.skill.patterns",
  reasoning: "gameCard.skill.reasoning",
  subtraction: "gameCard.skill.subtraction"
} as const;

export function DailyChallengeCard({ compact = false }: DailyChallengeCardProps) {
  const { t } = useLocale();
  const challenge = getDailyChallenge();

  return (
    <Link
      className="group block rounded-[30px] border border-cyan-300/12 bg-[linear-gradient(135deg,rgba(17,106,117,0.22),rgba(56,80,126,0.32),rgba(84,58,145,0.22))] p-6 transition duration-300 hover:border-cyan-300/20 hover:shadow-[0_24px_60px_rgba(8,15,38,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:p-7"
      href={challenge.href}
    >
      <div className={`flex items-start justify-between gap-4 ${compact ? "flex-col md:flex-row md:items-start" : "flex-col lg:flex-row lg:items-start"}`}>
        <div className="min-w-0 flex-1">
          <h3 className="text-balance font-[var(--font-sora)] text-2xl font-extrabold text-white">{challenge.game.title}</h3>
          <p className={`mt-2 max-w-none text-sm leading-7 text-slate-300 ${compact ? "md:max-w-xl" : "lg:max-w-2xl"}`}>{t(promptKeys[challenge.game.slug])}</p>
        </div>
        <div className={`flex w-full shrink-0 items-center gap-3 ${compact ? "md:w-auto" : "lg:w-auto"} self-start`}>
          <div className="rounded-2xl bg-emerald-400/12 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-emerald-100">
            {t("daily.rewardBonus").replace("{xp}", String(challenge.rewardXp))}
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/8 text-cyan-200 transition group-hover:rotate-6">
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>
      </div>
      <div className={`mt-5 grid gap-3 ${compact ? "sm:grid-cols-2" : "lg:grid-cols-2"}`}>
        <div className="rounded-2xl bg-[rgba(8,14,29,0.34)] px-4 py-3">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{t("daily.focus")}</p>
          <p className="mt-1 text-sm font-semibold text-white">
            {challenge.game.skills.map((skill) => t(skillKeys[skill as keyof typeof skillKeys])).join(" / ")}
          </p>
        </div>
        <div className="rounded-2xl bg-[rgba(8,14,29,0.34)] px-4 py-3">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{t("daily.resets")}</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-white">
            <CalendarDays className="h-4 w-4 text-cyan-200" />
            {challenge.dateKey}
          </p>
        </div>
      </div>
    </Link>
  );
}
