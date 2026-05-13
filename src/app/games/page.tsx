"use client";

import Link from "next/link";
import { BarChart3, Trophy, TrendingUp } from "lucide-react";
import { DemoGameCard } from "@/features/games/components/GameCard";
import { Button } from "@/shared/components/ui/Button";

const games = [
  {
    count: undefined,
    description: "Fast-paced arithmetic challenges to test your speed and accuracy",
    difficulty: "Easy" as const,
    duration: "5 min",
    href: "/games/quick-math-duel",
    icon: "zap" as const,
    title: "Quick Math Duel"
  },
  {
    count: undefined,
    description: "Battle a math monster across five attack turns and protect your hearts",
    difficulty: "Hard" as const,
    duration: "5 rounds",
    href: "/games/boss-round-battle",
    icon: "algebra" as const,
    title: "Boss Round Battle"
  },
  {
    count: undefined,
    description: "Spot sequence patterns, choose the missing value, and scale up difficulty",
    difficulty: "Medium" as const,
    duration: "10 puzzles",
    href: "/games/missing-number-puzzle",
    icon: "fraction" as const,
    title: "Missing Number Puzzle"
  },
  {
    count: undefined,
    description: "Solve a compact 3x3 grid by finding the hidden rule behind the rows",
    difficulty: "Medium" as const,
    duration: "8 grids",
    href: "/games/math-grid-puzzle",
    icon: "geometry" as const,
    title: "Math Grid Puzzle"
  },
  {
    count: undefined,
    description: "Choose a logic world and solve visual math riddles across premium puzzle realms",
    difficulty: "Medium" as const,
    duration: "15 riddles",
    href: "/games/riddle-realms",
    icon: "fraction" as const,
    title: "Riddle Realms"
  }
];

const howItWorks = [
  {
    body: "Pick a difficulty that matches your skill level",
    icon: TrendingUp,
    step: "1",
    title: "Choose a game",
    tone: "cyan" as const
  },
  {
    body: "Solve problems and improve your skills",
    icon: BarChart3,
    step: "2",
    title: "Play & learn",
    tone: "violet" as const
  },
  {
    body: "Log in to save scores and compete",
    icon: Trophy,
    step: "3",
    title: "Track progress",
    tone: "amber" as const
  }
];

export default function GamesPage() {
  return (
    <main className="mx-auto max-w-[1260px] px-5 py-7 sm:px-6 sm:py-9 lg:px-8">
      <section>
        <h1 className="font-[var(--font-sora)] text-[2.9rem] font-extrabold leading-none text-white sm:text-[3.35rem]">
          All Games
        </h1>
        <p className="mt-4 text-base leading-8 text-slate-300 sm:text-lg">Choose your challenge and start playing</p>
      </section>

      <section className="mt-8 rounded-[24px] border border-cyan-300/24 bg-[linear-gradient(90deg,rgba(23,40,68,0.98),rgba(34,42,76,0.96))] px-6 py-7 shadow-[0_22px_56px_rgba(4,8,22,0.26)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-[var(--font-sora)] text-[1.9rem] font-extrabold leading-tight text-white">
              Featured: Quick Math Duel
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
              Most popular game this week. Perfect for warming up your math skills!
            </p>
          </div>
          <Button asChild className="h-12 w-full px-7 text-base lg:w-auto" size="lg">
            <Link href="/games/quick-math-duel">Play now</Link>
          </Button>
        </div>
      </section>

      <section className="mt-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {games.map((game) => (
            <DemoGameCard card={game} key={game.title} />
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-[28px] border border-[rgba(42,62,107,0.95)] bg-[linear-gradient(180deg,rgba(16,23,42,0.98),rgba(15,22,39,0.98))] px-6 py-9 shadow-[0_22px_56px_rgba(4,8,22,0.24)] sm:px-8 sm:py-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-[var(--font-sora)] text-[2rem] font-extrabold text-white sm:text-[2.35rem]">How it works</h2>
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl gap-6 md:grid-cols-3">
          {howItWorks.map((item) => (
            <HowItWorksCard key={item.title} {...item} />
          ))}
        </div>
      </section>
    </main>
  );
}

function HowItWorksCard({
  body,
  icon: Icon,
  step,
  title,
  tone
}: {
  body: string;
  icon: typeof Trophy;
  step: string;
  title: string;
  tone: "amber" | "cyan" | "violet";
}) {
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
      <h3 className="mt-4 font-[var(--font-sora)] text-[1.55rem] font-extrabold text-white">{title}</h3>
      <p className="mt-2 text-[0.98rem] leading-8 text-slate-400">{body}</p>
    </div>
  );
}
