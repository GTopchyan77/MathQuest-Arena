"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  Crown,
  GraduationCap,
  Grid3X3,
  Puzzle,
  Play,
  Sparkles,
  Trophy,
  TrendingUp,
  Users
} from "lucide-react";
import { games } from "@/lib/games/catalog";
import { useLocale } from "@/lib/i18n/useLocale";
import { Button } from "@/shared/components/ui/Button";

const sampleAnswers = ["720", "830", "920", "730"];
const homeGameSlugs = ["quick-math-duel", "boss-round-battle", "missing-number-puzzle", "math-grid-puzzle"] as const;
const homeGameDurationKeys = {
  "10 puzzles": "gameCard.duration.10-puzzles",
  "5 rounds": "gameCard.duration.5-rounds",
  "60 sec": "gameCard.duration.60-sec",
  "8 grids": "gameCard.duration.8-grids"
} as const;

export default function HomePage() {
  const { t } = useLocale();
  const homeGames = homeGameSlugs
    .map((slug) => games.find((game) => game.slug === slug))
    .filter((game): game is NonNullable<typeof game> => Boolean(game));

  return (
    <main className="pb-16">
      <section className="premium-grid relative overflow-hidden px-4 pb-14 pt-6 sm:px-6 sm:pb-16 lg:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[8%] top-12 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute right-[10%] top-10 h-64 w-64 rounded-full bg-[rgba(99,102,241,0.10)] blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1360px]">
          <div className="grid items-start gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
            <div className="pt-7 lg:pt-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-[rgba(10,22,40,0.66)] px-4 py-2 text-sm font-black text-cyan-100 shadow-[0_12px_30px_rgba(2,8,23,0.28)] backdrop-blur-xl">
                <Sparkles className="h-4 w-4 text-cyan-200" />
                {t("home.hero.badge")}
              </div>
              <h1 className="text-gradient mt-7 max-w-[9.1ch] font-[var(--font-sora)] text-[3.95rem] font-extrabold leading-[0.94] sm:text-[4.9rem] lg:text-[5.7rem]">
                {t("home.hero.title")}
              </h1>
              <p className="mt-6 max-w-[46rem] text-[1.08rem] leading-8 text-slate-300 sm:text-[1.28rem] sm:leading-9 lg:text-[1.48rem] lg:leading-10">
                {t("home.hero.subtitle")}
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <Button asChild className="h-14 px-7 text-base sm:min-w-[260px]" size="lg">
                  <Link href="/games/quick-math-duel">
                    <Play className="h-5 w-5" /> {t("home.paths.studentCta")}
                  </Link>
                </Button>
                <Button asChild className="h-14 px-7 text-base sm:min-w-[200px]" size="lg" variant="secondary">
                  <Link href="/games">{t("home.hero.explore")}</Link>
                </Button>
              </div>
              <div className="mt-7 inline-flex max-w-[40rem] rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm leading-7 text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:text-base">
                {t("home.hero.guestHelper")}
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <HeroStatCard label={t("home.hero.statGamesLabel")} value={t("home.stats.miniGames", { count: games.length })} />
                <HeroStatCard label={t("home.hero.statRoundsLabel")} value={t("home.hero.statRoundsValue")} />
                <HeroStatCard label={t("home.hero.statProgressLabel")} value={t("home.hero.statProgressValue")} />
              </div>
            </div>

            <div className="panel relative overflow-hidden rounded-[28px] p-6 lg:mt-0 lg:p-7">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_30%)]" />
              <div className="relative">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-200">{t("home.preview.roundLabel")}</p>
                  <div className="flex h-16 w-16 items-center justify-center rounded-[18px] border border-cyan-300/18 bg-[rgba(14,33,54,0.9)] text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <Brain className="h-8 w-8" />
                  </div>
                </div>

                <div className="mt-4 rounded-[24px] border border-white/10 bg-[rgba(8,14,28,0.74)] p-6 lg:p-7">
                  <p className="mt-5 font-[var(--font-sora)] text-[2rem] font-extrabold text-white">{t("home.sample.question")}</p>

                  <div className="mt-7 grid grid-cols-2 gap-4">
                    {sampleAnswers.map((answer) => (
                      <div
                        className={`flex h-[74px] items-center justify-center rounded-2xl border text-2xl font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${
                          answer === sampleAnswers[0]
                            ? "border-emerald-300/30 bg-[rgba(12,35,36,0.72)] text-emerald-50 shadow-[0_0_0_1px_rgba(52,211,153,0.12)]"
                            : "border-white/10 bg-[rgba(10,18,34,0.72)] text-white"
                        }`}
                        key={answer}
                      >
                        {answer}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <PreviewTile icon={Trophy} title={t("home.preview.shortRoundsValue")} subtitle={t("home.preview.shortRoundsLabel")} tone="cyan" />
                  <PreviewTile icon={Crown} title={t("home.preview.savedProgressValue")} subtitle={t("home.preview.savedProgressLabel")} tone="amber" />
                  <PreviewTile icon={Sparkles} title={t("home.preview.dailyValue")} subtitle={t("home.preview.dailyLabel")} tone="violet" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-11 grid gap-6 lg:grid-cols-2">
            <FeatureCard
              body={t("home.student.body")}
              bullets={[t("home.student.bullet1"), t("home.student.bullet2"), t("home.student.bullet3")]}
              cta={t("home.student.cta")}
              ctaHref="/dashboard"
              icon={Users}
              title={t("home.student.title")}
              tone="cyan"
            />
            <FeatureCard
              body={t("home.teacher.body")}
              bullets={[t("home.teacher.bullet1"), t("home.teacher.bullet2"), t("home.teacher.bullet3")]}
              cta={t("home.teacher.cta")}
              ctaHref="/teacher"
              icon={BookOpen}
              title={t("home.teacher.title")}
              tone="violet"
            />
          </div>

          <section className="mt-7 panel rounded-[30px] px-6 py-6 sm:px-7 sm:py-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="surface-label">{t("home.games.label")}</p>
                <h2 className="mt-2 font-[var(--font-sora)] text-[2rem] font-extrabold text-white sm:text-[2.2rem]">
                  {t("games.page.title")}
                </h2>
              </div>
              <Button asChild className="h-12 px-5 text-sm sm:w-auto" variant="secondary">
                <Link href="/games">{t("home.games.viewAll")}</Link>
              </Button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {homeGames.map((game) => (
                <HomeGameCard
                  description={t(`gameCard.description.${game.slug}` as const)}
                  duration={t(homeGameDurationKeys[game.duration as keyof typeof homeGameDurationKeys])}
                  gameHref={`/games/${game.slug}`}
                  key={game.slug}
                  slug={game.slug}
                  title={game.title}
                />
              ))}
            </div>
          </section>

          <section className="mt-4 panel rounded-[30px] px-6 py-7 sm:px-8 sm:py-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-[var(--font-sora)] text-[2rem] font-extrabold text-white sm:text-[2.3rem]">
                {t("games.page.newHereTitle")}
              </h2>
              <p className="mt-3 text-base leading-8 text-slate-400 sm:text-lg">
                {t("games.page.newHereBody")}
              </p>
            </div>

            <div className="mx-auto mt-7 grid max-w-4xl gap-4 md:grid-cols-3">
              <BenefitCard
                body={t("protected.saveProgressBody")}
                icon={TrendingUp}
                title={t("protected.saveProgressTitle")}
                tone="cyan"
              />
              <BenefitCard
                body={t("protected.trackImprovementBody")}
                icon={BarChart3}
                title={t("protected.trackImprovementTitle")}
                tone="violet"
              />
              <BenefitCard
                body={t("protected.joinLeaderboardBody")}
                icon={Trophy}
                title={t("protected.joinLeaderboardTitle")}
                tone="amber"
              />
            </div>

            <div className="mt-7 flex justify-center">
              <Button asChild className="h-14 px-7 text-base sm:min-w-[220px]" size="lg">
                <Link href="/register">{t("auth.form.createAccount")}</Link>
              </Button>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function HeroStatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.045)] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <p className="text-[2.15rem] font-black leading-none text-white sm:text-[2.45rem]">{value}</p>
      <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
    </div>
  );
}

function PreviewTile({
  icon: Icon,
  subtitle,
  title,
  tone
}: {
  icon: typeof Trophy;
  subtitle: string;
  title: string;
  tone: "amber" | "cyan" | "violet";
}) {
  const tones = {
    amber: "text-amber-100",
    cyan: "text-cyan-100",
    violet: "text-violet-100"
  } satisfies Record<typeof tone, string>;

  return (
    <div className="rounded-[24px] border border-white/10 bg-[rgba(9,16,32,0.72)] px-5 py-5">
      <Icon className={`h-6 w-6 ${tones[tone]}`} />
      <p className="mt-5 font-[var(--font-sora)] text-[1.9rem] font-extrabold leading-none text-white">{title}</p>
      <p className="mt-2 text-base font-semibold text-slate-400">{subtitle}</p>
    </div>
  );
}

function FeatureCard({
  body,
  bullets,
  cta,
  ctaHref,
  icon: Icon,
  title,
  tone
}: {
  body: string;
  bullets: string[];
  cta: string;
  ctaHref: string;
  icon: typeof Users;
  title: string;
  tone: "cyan" | "violet";
}) {
  const iconTone =
    tone === "cyan"
      ? "border-cyan-300/18 bg-cyan-400/10 text-cyan-100"
      : "border-violet/18 bg-violet/12 text-[rgb(221,214,254)]";
  const ctaTone = tone === "cyan" ? "text-cyan-100" : "text-[rgb(221,214,254)]";
  const bulletIcons = tone === "cyan" ? [Sparkles, TrendingUp, Trophy] : [BarChart3, GraduationCap, Trophy];

  return (
    <div className="panel rounded-[28px] px-8 py-8">
      <div className={`flex h-14 w-14 items-center justify-center rounded-[18px] border ${iconTone}`}>
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="mt-6 font-[var(--font-sora)] text-[2rem] font-extrabold text-white">{title}</h2>
      <p className="mt-3 max-w-[34rem] text-lg leading-8 text-slate-400">{body}</p>

      <div className="mt-8 space-y-4">
        {bullets.map((bullet, index) => {
          const BulletIcon = bulletIcons[index];

          return (
            <div className="flex items-center gap-3 text-lg text-slate-300" key={bullet}>
              <BulletIcon className={`h-5 w-5 ${ctaTone}`} />
              <span>{bullet}</span>
            </div>
          );
        })}
      </div>

      <Button asChild className="mt-8 rounded-2xl px-5" variant="secondary">
        <Link className={ctaTone} href={ctaHref}>
          {cta}
        </Link>
      </Button>
    </div>
  );
}

function HomeGameCard({
  description,
  duration,
  gameHref,
  slug,
  title
}: {
  description: string;
  duration: string;
  gameHref: string;
  slug: (typeof homeGameSlugs)[number];
  title: string;
}) {
  const { t } = useLocale();

  const iconMap = {
    "boss-round-battle": Trophy,
    "math-grid-puzzle": Grid3X3,
    "missing-number-puzzle": Puzzle,
    "quick-math-duel": Brain
  } satisfies Record<(typeof homeGameSlugs)[number], typeof Trophy>;

  const badgeMap = {
    "boss-round-battle": "border-amber-300/18 bg-amber-300/12 text-amber-100",
    "math-grid-puzzle": "border-emerald-300/18 bg-emerald-400/10 text-emerald-100",
    "missing-number-puzzle": "border-violet-300/18 bg-violet-400/10 text-violet-100",
    "quick-math-duel": "border-cyan-300/18 bg-cyan-400/10 text-cyan-100"
  } satisfies Record<(typeof homeGameSlugs)[number], string>;

  const Icon = iconMap[slug];

  return (
    <div className="flex h-full flex-col rounded-[26px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-[18px] border ${badgeMap[slug]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className={`rounded-full border px-3 py-1 text-xs font-black ${badgeMap[slug]}`}>{duration}</div>
      </div>

      <h3 className="mt-5 font-[var(--font-sora)] text-[1.55rem] font-extrabold text-white">{title}</h3>
      <p className="mt-3 min-h-[72px] text-sm leading-7 text-slate-400">{description}</p>

      <Button asChild className="mt-auto h-12 w-full justify-center text-sm" variant="secondary">
        <Link href={gameHref}>{t("gameCard.start")}</Link>
      </Button>
    </div>
  );
}

function BenefitCard({
  body,
  icon: Icon,
  title,
  tone
}: {
  body: string;
  icon: typeof Trophy;
  title: string;
  tone: "amber" | "cyan" | "violet";
}) {
  const tones = {
    amber: "border-amber-300/18 bg-amber-300/12 text-amber-100",
    cyan: "border-cyan-300/18 bg-cyan-400/10 text-cyan-100",
    violet: "border-violet-300/18 bg-violet-400/10 text-violet-100"
  } satisfies Record<typeof tone, string>;

  return (
    <div className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.025)] px-5 py-5 text-center">
      <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-[18px] border ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-[var(--font-sora)] text-xl font-extrabold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-400">{body}</p>
    </div>
  );
}
