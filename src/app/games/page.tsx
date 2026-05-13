"use client";

import Link from "next/link";
import { BarChart3, Trophy, TrendingUp } from "lucide-react";
import { DemoGameCard } from "@/features/games/components/GameCard";
import { useLocale } from "@/lib/i18n/useLocale";
import { Button } from "@/shared/components/ui/Button";

const games = [
  {
    count: undefined,
    descriptionKey: "games.card.quickMathDuel.description",
    difficulty: "Easy" as const,
    durationCount: "5",
    durationUnitKey: "games.meta.min",
    href: "/games/quick-math-duel",
    icon: "zap" as const,
    titleKey: "games.card.quickMathDuel.title"
  },
  {
    count: undefined,
    descriptionKey: "games.card.bossRoundBattle.description",
    difficulty: "Easy" as const,
    durationCount: "5",
    durationUnitKey: "games.meta.rounds",
    href: "/games/boss-round-battle",
    icon: "algebra" as const,
    titleKey: "games.card.bossRoundBattle.title"
  },
  {
    count: undefined,
    descriptionKey: "games.card.missingNumberPuzzle.description",
    difficulty: "Medium" as const,
    durationCount: "10",
    durationUnitKey: "games.meta.puzzles",
    href: "/games/missing-number-puzzle",
    icon: "fraction" as const,
    titleKey: "games.card.missingNumberPuzzle.title"
  },
  {
    count: undefined,
    descriptionKey: "games.card.mathGridPuzzle.description",
    difficulty: "Medium" as const,
    durationCount: "8",
    durationUnitKey: "games.meta.grids",
    href: "/games/math-grid-puzzle",
    icon: "geometry" as const,
    titleKey: "games.card.mathGridPuzzle.title"
  },
  {
    count: undefined,
    descriptionKey: "games.card.riddleRealms.description",
    difficulty: "Medium" as const,
    durationCount: "15",
    durationUnitKey: "games.meta.riddles",
    href: "/games/riddle-realms",
    icon: "fraction" as const,
    titleKey: "games.card.riddleRealms.title"
  }
];

const howItWorks: Array<{
  bodyKey: "games.howItWorks.step1.body" | "games.howItWorks.step2.body" | "games.howItWorks.step3.body";
  icon: typeof Trophy;
  step: string;
  titleKey: "games.howItWorks.step1.title" | "games.howItWorks.step2.title" | "games.howItWorks.step3.title";
  tone: "amber" | "cyan" | "violet";
}> = [
  {
    bodyKey: "games.howItWorks.step1.body",
    icon: TrendingUp,
    step: "1",
    titleKey: "games.howItWorks.step1.title",
    tone: "cyan" as const
  },
  {
    bodyKey: "games.howItWorks.step2.body",
    icon: BarChart3,
    step: "2",
    titleKey: "games.howItWorks.step2.title",
    tone: "violet" as const
  },
  {
    bodyKey: "games.howItWorks.step3.body",
    icon: Trophy,
    step: "3",
    titleKey: "games.howItWorks.step3.title",
    tone: "amber" as const
  }
];

export default function GamesPage() {
  const { t } = useLocale();

  return (
    <main className="mx-auto max-w-[1260px] px-5 py-7 sm:px-6 sm:py-9 lg:px-8">
      <section>
        <h1 className="font-[var(--font-sora)] text-[2.9rem] font-extrabold leading-none text-white sm:text-[3.35rem]">
          {t("games.page.allGamesTitle")}
        </h1>
        <p className="mt-4 text-base leading-8 text-slate-300 sm:text-lg">{t("games.page.allGamesSubtitle")}</p>
      </section>

      <section className="mt-8 rounded-[24px] border border-cyan-300/24 bg-[linear-gradient(90deg,rgba(23,40,68,0.98),rgba(34,42,76,0.96))] px-6 py-7 shadow-[0_22px_56px_rgba(4,8,22,0.26)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-[var(--font-sora)] text-[1.9rem] font-extrabold leading-tight text-white">
              {t("games.page.featuredQuickMathDuelTitle")}
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
              {t("games.page.featuredQuickMathDuelBody")}
            </p>
          </div>
          <Button asChild className="h-12 w-full px-7 text-base lg:w-auto" size="lg">
            <Link href="/games/quick-math-duel">{t("games.page.playNow")}</Link>
          </Button>
        </div>
      </section>

      <section className="mt-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {games.map((game) => (
            <DemoGameCard card={game} key={game.titleKey} />
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-[28px] border border-[rgba(42,62,107,0.95)] bg-[linear-gradient(180deg,rgba(16,23,42,0.98),rgba(15,22,39,0.98))] px-6 py-9 shadow-[0_22px_56px_rgba(4,8,22,0.24)] sm:px-8 sm:py-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-[var(--font-sora)] text-[2rem] font-extrabold text-white sm:text-[2.35rem]">{t("games.howItWorks.title")}</h2>
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl gap-6 md:grid-cols-3">
          {howItWorks.map((item) => (
            <HowItWorksCard key={item.titleKey} {...item} />
          ))}
        </div>
      </section>
    </main>
  );
}

function HowItWorksCard({
  bodyKey,
  icon: Icon,
  step,
  titleKey,
  tone
}: {
  bodyKey:
    | "games.howItWorks.step1.body"
    | "games.howItWorks.step2.body"
    | "games.howItWorks.step3.body";
  icon: typeof Trophy;
  step: string;
  titleKey:
    | "games.howItWorks.step1.title"
    | "games.howItWorks.step2.title"
    | "games.howItWorks.step3.title";
  tone: "amber" | "cyan" | "violet";
}) {
  const { t } = useLocale();
  const tones = {
    amber: "border-amber-300/18 bg-amber-300/12 text-amber-100",
    cyan: "border-cyan-300/18 bg-cyan-400/10 text-cyan-100",
    violet: "border-violet-300/18 bg-violet-400/10 text-violet-100"
  } as const;

  return (
    <div className="text-center">
      <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-[14px] border text-2xl font-black ${tones[tone]}`}>{step}</div>
      <div className="mt-5 flex justify-center">
        <Icon className={`h-5 w-5 ${tone === "amber" ? "text-amber-100" : tone === "cyan" ? "text-cyan-100" : "text-violet-100"}`} />
      </div>
      <h3 className="mt-4 font-[var(--font-sora)] text-[1.55rem] font-extrabold text-white">{t(titleKey)}</h3>
      <p className="mt-2 text-[0.98rem] leading-8 text-slate-400">{t(bodyKey)}</p>
    </div>
  );
}
