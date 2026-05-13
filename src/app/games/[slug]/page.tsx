"use client";

import Link from "next/link";
import { use } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GameRenderer } from "@/features/games/components/GameRenderer";
import { getGame } from "@/lib/games/catalog";
import { useLocale } from "@/lib/i18n/useLocale";
import type { GameSlug } from "@/lib/types";
import { Button } from "@/shared/components/ui/Button";

const durationKeys = {
  "10-puzzles": "gameCard.duration.10-puzzles",
  "5-rounds": "gameCard.duration.5-rounds",
  "60-sec": "gameCard.duration.60-sec",
  "8-grids": "gameCard.duration.8-grids"
} as const;

const descriptionKeys = {
  "boss-round-battle": "gameCard.description.boss-round-battle",
  "math-grid-puzzle": "gameCard.description.math-grid-puzzle",
  "missing-number-puzzle": "gameCard.description.missing-number-puzzle",
  "quick-math-duel": "gameCard.description.quick-math-duel"
} as const;

const riddleRealmsMeta = {
  descriptionKey: "games.card.riddleRealms.description",
  duration: "15 riddles",
  slug: "riddle-realms" as const,
  titleKey: "games.card.riddleRealms.title"
};

export default function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { t } = useLocale();
  const game = getGame(slug) ?? (slug === "riddle-realms" ? riddleRealmsMeta : null);

  if (!game) {
    notFound();
  }

  const descriptionKey = descriptionKeys[game.slug as keyof typeof descriptionKeys];
  const durationKey = durationKeys[game.duration as keyof typeof durationKeys];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Button asChild variant="ghost">
            <Link href="/games">
              <ArrowLeft className="h-4 w-4" /> {t("games.page.backToAll")}
            </Link>
          </Button>
          <h1 className="mt-4 font-[var(--font-sora)] text-4xl font-extrabold text-white">
            {"titleKey" in game ? t(game.titleKey as never) : game.title}
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-300">
            {"descriptionKey" in game ? t(game.descriptionKey as never) : descriptionKey ? t(descriptionKey) : game.description}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-black text-slate-200 shadow-[0_14px_34px_rgba(2,8,23,0.24)] backdrop-blur-xl">
          {durationKey ? t(durationKey) : game.duration}
        </div>
      </div>
      <GameRenderer slug={game.slug as GameSlug | "riddle-realms"} />
    </main>
  );
}
