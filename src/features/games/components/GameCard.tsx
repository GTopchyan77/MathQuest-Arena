"use client";

import Link from "next/link";
import { Brain, Calculator, Clock3, Grid3X3, Medal, Puzzle, Target, Trophy, Zap } from "lucide-react";
import type { GameMeta } from "@/lib/games/catalog";
import { Button } from "@/shared/components/ui/Button";
import { useLocale } from "@/lib/i18n/useLocale";

type DemoGameCard = {
  count?: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  duration: string;
  href?: string;
  icon: "algebra" | "brain" | "fraction" | "geometry" | "sprint" | "zap";
  title: string;
};

const accentClasses = {
  coral: "border-rose-400/25 bg-rose-400/12 text-rose-200",
  lemon: "border-amber-300/30 bg-amber-300/12 text-amber-100",
  mint: "border-emerald-400/25 bg-emerald-400/12 text-emerald-200",
  violet: "border-[rgba(167,139,250,0.25)] bg-[rgba(167,139,250,0.12)] text-[rgb(221,214,254)]"
};

const difficultyClasses: Record<DemoGameCard["difficulty"], string> = {
  Easy: "border-emerald-400/20 bg-emerald-400/12 text-emerald-200",
  Hard: "border-violet-400/20 bg-violet-400/14 text-violet-200",
  Medium: "border-cyan-400/20 bg-cyan-400/12 text-cyan-200"
};

const durationKeys: Record<GameMeta["duration"], "gameCard.duration.5-rounds" | "gameCard.duration.60-sec" | "gameCard.duration.10-puzzles" | "gameCard.duration.8-grids"> = {
  "10 puzzles": "gameCard.duration.10-puzzles",
  "5 rounds": "gameCard.duration.5-rounds",
  "60 sec": "gameCard.duration.60-sec",
  "8 grids": "gameCard.duration.8-grids"
};

const descriptionKeys: Record<
  GameMeta["slug"],
  | "gameCard.description.boss-round-battle"
  | "gameCard.description.quick-math-duel"
  | "gameCard.description.missing-number-puzzle"
  | "gameCard.description.math-grid-puzzle"
> = {
  "boss-round-battle": "gameCard.description.boss-round-battle",
  "math-grid-puzzle": "gameCard.description.math-grid-puzzle",
  "missing-number-puzzle": "gameCard.description.missing-number-puzzle",
  "quick-math-duel": "gameCard.description.quick-math-duel"
};

const skillKeys: Record<
  GameMeta["skills"][number],
  | "gameCard.skill.addition"
  | "gameCard.skill.battle-math"
  | "gameCard.skill.deduction"
  | "gameCard.skill.focus"
  | "gameCard.skill.logic"
  | "gameCard.skill.mental-math"
  | "gameCard.skill.multiplication"
  | "gameCard.skill.number-sense"
  | "gameCard.skill.patterns"
  | "gameCard.skill.reasoning"
  | "gameCard.skill.subtraction"
> = {
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
};

export function GameCard({ game }: { game: GameMeta }) {
  const { t } = useLocale();
  const isRecommendedFirst = game.slug === "quick-math-duel";
  const iconMap = {
    "boss-round-battle": Trophy,
    "math-grid-puzzle": Grid3X3,
    "missing-number-puzzle": Puzzle,
    "quick-math-duel": Brain
  } as const;
  const Icon = iconMap[game.slug];

  return (
    <div className="panel group relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-[28px] p-6 transition duration-300 hover:-translate-y-1.5 hover:scale-[1.01] hover:border-cyan-300/20 hover:bg-white/[0.07] hover:shadow-[0_26px_64px_rgba(8,15,38,0.48)]">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
        <div className="absolute -right-8 top-6 h-24 w-24 rounded-full bg-cyan-400/12 blur-2xl" />
        <div className="absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-violet/10 blur-2xl" />
      </div>
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-cyan-300/18 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(99,102,241,0.16))] text-cyan-100">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {isRecommendedFirst ? (
            <div className="rounded-full border border-emerald-300/18 bg-emerald-400/10 px-3 py-1.5 text-xs font-black text-emerald-100">
              {t("gameCard.recommendedFirst")}
            </div>
          ) : null}
          <div className={`rounded-full border px-3 py-1.5 text-xs font-black ${accentClasses[game.accent]}`}>
            {t(durationKeys[game.duration])}
          </div>
        </div>
      </div>
      <Link className="absolute inset-0 z-0" href={`/games/${game.slug}`} aria-label={game.title} />
      <div className="relative z-10 flex h-full flex-col">
        <h3 className="mt-6 font-[var(--font-sora)] text-[1.9rem] font-extrabold text-white transition group-hover:text-cyan-50">{game.title}</h3>
        <p className="mt-3 min-h-[76px] text-[0.98rem] leading-7 text-slate-300">{t(descriptionKeys[game.slug])}</p>
        <div className="mt-4 flex items-center gap-5 text-sm font-semibold text-slate-400">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4" />
            {t(durationKeys[game.duration])}
          </div>
          <div className="truncate">{t(skillKeys[game.skills[0]])}</div>
        </div>
        <Button asChild className="mt-auto h-12 w-full justify-center" variant="secondary">
          <Link href={`/games/${game.slug}`}>{t("gameCard.start")}</Link>
        </Button>
      </div>
    </div>
  );
}

const demoIconMap = {
  algebra: Medal,
  brain: Brain,
  fraction: Calculator,
  geometry: Puzzle,
  sprint: Target,
  zap: Zap
} as const;

const demoIconTone = {
  algebra: "border-amber-300/20 bg-amber-300/16 text-amber-200",
  brain: "border-emerald-300/20 bg-emerald-400/12 text-emerald-200",
  fraction: "border-cyan-300/20 bg-cyan-400/12 text-cyan-200",
  geometry: "border-violet-300/20 bg-violet-400/12 text-violet-200",
  sprint: "border-violet-300/20 bg-violet-400/12 text-violet-200",
  zap: "border-cyan-300/20 bg-cyan-400/12 text-cyan-200"
} as const;

export function DemoGameCard({ card }: { card: DemoGameCard }) {
  const Icon = demoIconMap[card.icon];

  return (
    <div className="group relative flex h-full min-h-[282px] flex-col rounded-[24px] border border-[rgba(45,65,108,0.9)] bg-[linear-gradient(180deg,rgba(17,24,45,0.98),rgba(15,21,40,0.98))] p-6 shadow-[0_18px_46px_rgba(2,6,23,0.3)] transition duration-300 hover:border-cyan-300/28 hover:shadow-[0_24px_60px_rgba(2,6,23,0.4)]">
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-[14px] border ${demoIconTone[card.icon]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className={`rounded-full border px-3 py-1 text-xs font-bold ${difficultyClasses[card.difficulty]}`}>{card.difficulty}</div>
      </div>

      <div className="mt-6 flex h-full flex-col">
        <h3 className="font-[var(--font-sora)] text-[2rem] font-extrabold leading-tight text-white">{card.title}</h3>
        <p className="mt-3 min-h-[68px] text-[0.98rem] leading-7 text-slate-300">{card.description}</p>
        <div className="mt-4 flex items-center gap-5 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4" />
            <span>{card.duration}</span>
          </div>
          {card.count ? <span>{card.count}</span> : null}
        </div>
        <Button
          asChild={Boolean(card.href)}
          className="mt-auto h-12 w-full justify-center rounded-[14px] border border-[rgba(42,62,107,0.95)] bg-[rgba(14,22,44,0.92)] text-white shadow-none hover:border-cyan-300/34 hover:bg-[rgba(24,34,61,0.96)]"
          variant="secondary"
        >
          {card.href ? <Link href={card.href}>Start game</Link> : <span>Start game</span>}
        </Button>
      </div>
    </div>
  );
}
