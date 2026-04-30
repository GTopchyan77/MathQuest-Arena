"use client";

import Link from "next/link";
import { Compass, Sparkles, Swords, TimerReset } from "lucide-react";
import { DailyChallengeCard } from "@/features/games/components/DailyChallengeCard";
import { GameCard } from "@/features/games/components/GameCard";
import { useLocale } from "@/lib/i18n/useLocale";
import { Button } from "@/shared/components/ui/Button";
import { games } from "@/lib/games/catalog";

export default function GamesPage() {
  const { t } = useLocale();

  return (
    <main className="mx-auto max-w-[1440px] p-4 sm:p-6">
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="panel-strong rounded-[30px] p-6">
          <p className="surface-label">{t("games.page.label")}</p>
          <h1 className="mt-3 font-[var(--font-sora)] text-3xl font-extrabold text-white sm:text-4xl">{t("games.page.title")}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">{t("games.page.body")}</p>
          <div className="mt-5 rounded-[24px] border border-cyan-300/16 bg-cyan-400/8 p-4">
            <p className="text-sm font-black text-white">{t("games.page.newHereTitle")}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{t("games.page.newHereBody")}</p>
            <Button asChild className="mt-4">
              <Link href="/games/quick-math-duel">{t("games.page.newHereCta")}</Link>
            </Button>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <SurfaceStat icon={Compass} label={t("games.page.statModes")} value={games.length} />
            <SurfaceStat icon={TimerReset} label={t("games.page.statFastestLoop")} value={t("games.page.statFastestLoopValue")} />
            <SurfaceStat icon={Swords} label={t("games.page.statDailyFocus")} value={t("games.page.statDailyFocusValue")} />
          </div>
        </div>

        <div className="panel rounded-[30px] p-5">
          <p className="surface-label text-emerald-200/80">{t("games.page.queueLabel")}</p>
          <div className="mt-4">
            <DailyChallengeCard compact />
          </div>
        </div>
      </section>

      <section className="mt-4 panel rounded-[30px] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="surface-label">{t("games.page.libraryLabel")}</p>
            <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">{t("games.page.libraryTitle")}</h2>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
            <Sparkles className="h-4 w-4 text-cyan-200" />
            {t("games.page.libraryBadge")}
          </div>
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {games.map((game) => (
            <GameCard game={game} key={game.slug} />
          ))}
        </div>
      </section>
    </main>
  );
}

function SurfaceStat({ icon: Icon, label, value }: { icon: typeof Compass; label: string; value: number | string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100">
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-4 text-2xl font-black text-white">{value}</p>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
    </div>
  );
}
