"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Brain, ChevronRight, Crown, Medal, Sparkles, Target, Trophy, Zap } from "lucide-react";
import { DailyChallengeCard } from "@/features/games/components/DailyChallengeCard";
import { GameCard } from "@/features/games/components/GameCard";
import { HomeFeatureCards } from "@/features/home/components/HomeFeatureCards";
import { PointerTrailOverlay } from "@/features/home/components/PointerTrailOverlay";
import { useLocale } from "@/lib/i18n/useLocale";
import { games } from "@/lib/games/catalog";
import { Button } from "@/shared/components/ui/Button";

export default function HomePage() {
  const { t } = useLocale();
  const heroSectionRef = useRef<HTMLElement>(null);

  return (
    <main>
      <section className="premium-grid relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 lg:px-8" ref={heroSectionRef}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[8%] top-10 h-56 w-56 rounded-full bg-cyan-400/12 blur-3xl [animation:floatY_10s_ease-in-out_infinite]" />
          <div className="absolute right-[10%] top-16 h-64 w-64 rounded-full bg-[rgba(139,92,246,0.14)] blur-3xl [animation:floatY_14s_ease-in-out_infinite_reverse]" />
        </div>
        <PointerTrailOverlay containerRef={heroSectionRef} enabled />
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="py-12 sm:py-16 lg:py-20">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-white/8 px-4 py-2 text-sm font-semibold text-cyan-100 shadow-[0_10px_30px_rgba(8,15,38,0.35)] backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              {t("home.hero.badge")}
            </div>
            <h1 className="text-gradient max-w-4xl font-[var(--font-sora)] text-5xl font-extrabold tracking-normal sm:text-6xl lg:text-7xl">
              {t("home.hero.title")}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">{t("home.hero.subtitle")}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="sm:min-w-[190px]" size="lg">
                <Link href="/games/quick-math-duel">
                  {t("home.paths.studentCta")} <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild className="sm:min-w-[190px]" size="lg" variant="secondary">
                <Link href="/games">{t("home.hero.explore")}</Link>
              </Button>
            </div>
            <div className="mt-4 max-w-2xl rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm leading-6 text-slate-300 backdrop-blur-xl">
              {t("home.hero.guestHelper")}
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              {[
                { label: t("home.hero.statGamesLabel"), value: t("home.stats.miniGames", { count: games.length }) },
                { label: t("home.hero.statRoundsLabel"), value: t("home.hero.statRoundsValue") },
                { label: t("home.hero.statProgressLabel"), value: t("home.hero.statProgressValue") }
              ].map((item) => (
                <div className="panel rounded-[22px] px-4 py-4" key={item.label}>
                  <p className="text-xl font-black text-white sm:text-2xl">{item.value}</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold text-slate-400">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-cyan-300" />
                {t("home.hero.instantRounds")}
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-violet" />
                {t("home.hero.skillProgression")}
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-200" />
                {t("home.hero.leaderboardEnergy")}
              </div>
            </div>
            <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-slate-950/40 px-4 py-4 backdrop-blur-xl">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">{t("home.paths.studentLabel")}</p>
                <p className="mt-2 font-[var(--font-sora)] text-lg font-extrabold text-white">{t("home.paths.studentTitle")}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{t("home.paths.studentDescription")}</p>
                <Button asChild className="mt-4" variant="secondary">
                  <Link href="/games/quick-math-duel">{t("home.paths.studentCta")}</Link>
                </Button>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-slate-950/40 px-4 py-4 backdrop-blur-xl">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-200">{t("home.paths.teacherLabel")}</p>
                <p className="mt-2 font-[var(--font-sora)] text-lg font-extrabold text-white">{t("home.paths.teacherTitle")}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{t("home.paths.teacherDescription")}</p>
                <Button asChild className="mt-4" variant="secondary">
                  <Link href="/teacher">{t("home.paths.teacherCta")}</Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="panel-strong relative min-h-[460px] overflow-hidden rounded-[2rem] p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,.24),transparent_36%),linear-gradient(145deg,rgba(8,17,35,.95),rgba(10,19,42,.74)_45%,rgba(17,24,39,.94))]" />
            <div className="relative grid h-full gap-4">
              <div className="rounded-[28px] border border-white/12 bg-slate-950/55 p-5 shadow-[0_28px_80px_rgba(2,8,23,0.45)] backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">{t("home.preview.roundLabel")}</p>
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
                <div className="rounded-[26px] border border-white/10 bg-white/8 p-4 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/10">
                  <Trophy className="h-6 w-6 text-cyan-200" />
                  <p className="mt-4 text-2xl font-black text-white">{t("home.preview.shortRoundsValue")}</p>
                  <p className="text-sm font-semibold text-slate-400">{t("home.preview.shortRoundsLabel")}</p>
                </div>
                <div className="rounded-[26px] border border-white/10 bg-white/8 p-4 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/10">
                  <Crown className="h-6 w-6 text-amber-200" />
                  <p className="mt-4 text-2xl font-black text-white">{t("home.preview.savedProgressValue")}</p>
                  <p className="text-sm font-semibold text-slate-400">{t("home.preview.savedProgressLabel")}</p>
                </div>
                <div className="rounded-[26px] border border-white/10 bg-white/8 p-4 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/10">
                  <Sparkles className="h-6 w-6 text-[rgb(221,214,254)]" />
                  <p className="mt-4 text-2xl font-black text-white">{t("home.preview.dailyValue")}</p>
                  <p className="text-sm font-semibold text-slate-400">{t("home.preview.dailyLabel")}</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[26px] border border-cyan-300/14 bg-white/[0.06] p-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200/80">{t("home.preview.whyLabel")}</p>
                      <p className="mt-2 font-[var(--font-sora)] text-xl font-extrabold text-white">{t("home.preview.whyTitle")}</p>
                    </div>
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-emerald-100">
                      {t("home.preview.whyBadge")}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-300">{t("home.preview.whyBody")}</p>
                </div>
                <div className="rounded-[26px] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{t("home.preview.whatYouCanDo")}</p>
                  <div className="mt-4 space-y-3">
                    {[
                      { label: t("home.preview.featureDuels"), tone: "text-cyan-200" },
                      { label: t("home.preview.featurePatterns"), tone: "text-violet" },
                      { label: t("home.preview.featureLogic"), tone: "text-amber-200" }
                    ].map((item) => (
                      <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-slate-950/35 px-3 py-2" key={item.label}>
                        <span className="text-sm font-bold text-white">{item.label}</span>
                        <ChevronRight className={`h-4 w-4 ${item.tone}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <HomeFeatureCards />
        </div>
      </section>

      <section className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div>
            <p className="surface-label text-emerald-200/80">{t("home.daily.label")}</p>
            <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white sm:text-3xl">{t("home.daily.title")}</h2>
            <div className="mt-4">
              <DailyChallengeCard compact />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8" id="mini-games">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex items-end justify-between gap-6">
            <div>
              <p className="surface-label">{t("home.games.label")}</p>
              <h2 className="mt-2 font-[var(--font-sora)] text-3xl font-extrabold text-white sm:text-4xl">{t("home.games.title")}</h2>
            </div>
            <Button asChild variant="ghost">
              <Link href="/games">{t("home.games.viewAll")}</Link>
            </Button>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {games.map((game) => (
              <GameCard game={game} key={game.slug} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="panel-strong relative overflow-hidden rounded-[30px] p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,.12),transparent_34%)]" />
            <div className="relative">
              <p className="surface-label text-amber-200/80">{t("home.leaderboard.label")}</p>
              <h2 className="mt-2 font-[var(--font-sora)] text-3xl font-extrabold text-white sm:text-4xl">{t("home.leaderboard.title")}</h2>
              <p className="mt-4 max-w-xl text-lg leading-8 text-slate-300">{t("home.leaderboard.body")}</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link href="/leaderboard">{t("home.leaderboard.view")}</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/register">{t("home.leaderboard.createProfile")}</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="panel rounded-[30px] p-4 sm:p-5">
            <div className="rounded-[24px] border border-white/10 bg-slate-950/50 p-4 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{t("home.leaderboardExperience.label")}</p>
                  <p className="mt-1 font-[var(--font-sora)] text-2xl font-extrabold text-white">{t("home.leaderboardExperience.title")}</p>
                </div>
                <div className="rounded-2xl border border-cyan-300/16 bg-cyan-400/10 px-3 py-2 text-sm font-black text-cyan-100">
                  {t("home.leaderboardExperience.badge")}
                </div>
              </div>
              <div className="space-y-3">
                {[
                  {
                    badge: t("home.leaderboardExperience.bestScoreBadge"),
                    name: t("home.leaderboardExperience.bestScoreName"),
                    rank: "1",
                    score: t("home.leaderboardExperience.tracked"),
                    tone: "from-amber-300/20 to-amber-100/5"
                  },
                  {
                    badge: t("home.leaderboardExperience.totalXpBadge"),
                    name: t("home.leaderboardExperience.totalXpName"),
                    rank: "2",
                    score: t("home.leaderboardExperience.tracked"),
                    tone: "from-cyan-400/16 to-sky-500/5"
                  },
                  {
                    badge: t("home.leaderboardExperience.gamesCompletedBadge"),
                    name: t("home.leaderboardExperience.gamesCompletedName"),
                    rank: "3",
                    score: t("home.leaderboardExperience.tracked"),
                    tone: "from-[rgba(139,92,246,0.18)] to-transparent"
                  },
                  {
                    badge: t("home.leaderboardExperience.positionBadge"),
                    name: t("home.leaderboardExperience.positionName"),
                    rank: "4",
                    score: t("home.leaderboardExperience.visible"),
                    tone: "from-white/8 to-transparent"
                  }
                ].map((entry, index) => (
                  <div
                    className={`group grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[22px] border border-white/10 bg-[linear-gradient(135deg,var(--tw-gradient-from),var(--tw-gradient-to))] px-4 py-4 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/20 hover:bg-white/8 ${entry.tone}`}
                    key={entry.name}
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-sm font-black ${
                        index === 0
                          ? "border-amber-300/30 bg-amber-300/14 text-amber-100"
                          : index === 1
                            ? "border-cyan-300/24 bg-cyan-400/10 text-cyan-100"
                            : index === 2
                              ? "border-violet/30 bg-violet/12 text-[rgb(237,233,254)]"
                              : "border-white/10 bg-white/8 text-white"
                      }`}
                    >
                      {index < 3 ? <Medal className="h-5 w-5" /> : `#${entry.rank}`}
                    </div>
                    <div>
                      <p className="font-black text-white">{entry.name}</p>
                      <p className="text-sm font-semibold text-slate-400">{entry.badge}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-white">{entry.score}</p>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{t("home.leaderboardExperience.status")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
