import Link from "next/link";
import { ArrowRight, Brain, Crown, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { FeatureCard } from "@/shared/components/ui/FeatureCard";
import { GameCard } from "@/features/games/components/GameCard";
import { games } from "@/lib/games/catalog";

export default function HomePage() {
  return (
    <main>
      <section className="premium-grid relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[8%] top-10 h-56 w-56 rounded-full bg-cyan-400/12 blur-3xl" />
          <div className="absolute right-[10%] top-16 h-64 w-64 rounded-full bg-violet-500/14 blur-3xl" />
        </div>
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="py-12 sm:py-16 lg:py-20">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-white/8 px-4 py-2 text-sm font-semibold text-cyan-100 shadow-[0_10px_30px_rgba(8,15,38,0.35)] backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Math practice that feels like play
            </div>
            <h1 className="text-gradient max-w-4xl font-[var(--font-sora)] text-5xl font-extrabold tracking-normal sm:text-6xl lg:text-7xl">
              MathQuest Arena
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              A premium learning arcade where students build fluency through fast duels, pattern puzzles, and logic grids.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/register">
                  Start playing <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/games">Explore games</Link>
              </Button>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              {[
                { label: "Weekly quests", value: "120+" },
                { label: "Average streak", value: "14 days" },
                { label: "Top rank climb", value: "92%" }
              ].map((item) => (
                <div className="panel rounded-[22px] px-4 py-4" key={item.label}>
                  <p className="text-xl font-black text-white sm:text-2xl">{item.value}</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="panel-strong relative min-h-[460px] overflow-hidden rounded-[2rem] p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,.24),transparent_36%),linear-gradient(145deg,rgba(8,17,35,.95),rgba(10,19,42,.74)_45%,rgba(17,24,39,.94))]" />
            <div className="relative grid h-full gap-4">
              <div className="rounded-[28px] border border-white/12 bg-slate-950/55 p-5 shadow-[0_28px_80px_rgba(2,8,23,0.45)] backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">Live Arena</p>
                    <p className="mt-2 font-[var(--font-sora)] text-3xl font-extrabold text-white">42 + 19 = ?</p>
                  </div>
                  <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4">
                    <Brain className="h-8 w-8 text-cyan-200" />
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {["61", "63", "59", "58"].map((answer, index) => (
                    <div
                      className={`rounded-2xl border px-4 py-3 text-center text-xl font-black transition ${
                        index === 0 ? "border-emerald-300/40 bg-emerald-400/14 text-emerald-100 shadow-[0_0_24px_rgba(52,211,153,0.18)]" : "border-white/10 bg-white/6 text-slate-100"
                      }`}
                      key={answer}
                    >
                      {answer}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-[26px] border border-white/10 bg-white/8 p-4 backdrop-blur-xl">
                  <Trophy className="h-6 w-6 text-cyan-200" />
                  <p className="mt-4 text-2xl font-black text-white">8,420</p>
                  <p className="text-sm font-semibold text-slate-400">XP earned</p>
                </div>
                <div className="rounded-[26px] border border-white/10 bg-white/8 p-4 backdrop-blur-xl">
                  <Crown className="h-6 w-6 text-amber-200" />
                  <p className="mt-4 text-2xl font-black text-white">#12</p>
                  <p className="text-sm font-semibold text-slate-400">Rank</p>
                </div>
                <div className="rounded-[26px] border border-white/10 bg-white/8 p-4 backdrop-blur-xl">
                  <Sparkles className="h-6 w-6 text-violet-200" />
                  <p className="mt-4 text-2xl font-black text-white">14</p>
                  <p className="text-sm font-semibold text-slate-400">Streak</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 md:grid-cols-3">
            <FeatureCard icon={Brain} title="Adaptive play" body="Games scale from quick recall to deeper pattern reasoning." />
            <FeatureCard icon={Trophy} title="Motivating progress" body="Every session can feed XP, streaks, and leaderboard momentum." />
            <FeatureCard icon={Sparkles} title="Premium feel" body="Clean responsive screens keep practice focused and rewarding." />
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex items-end justify-between gap-6">
            <div>
              <p className="surface-label">Mini-games</p>
              <h2 className="mt-2 font-[var(--font-sora)] text-3xl font-extrabold text-white sm:text-4xl">Choose your challenge</h2>
            </div>
            <Button asChild variant="ghost">
              <Link href="/games">View all</Link>
            </Button>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {games.map((game) => (
              <GameCard game={game} key={game.slug} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
