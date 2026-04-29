import type { Route } from "next";
import { games } from "@/lib/games/catalog";
import type { GameMeta } from "@/lib/games/catalog";

export type DailyChallenge = {
  badge: string;
  dateKey: string;
  game: GameMeta;
  href: Route<string>;
  prompt: string;
  rewardLabel: string;
};

const prompts: Record<GameMeta["slug"], string> = {
  "boss-round-battle": "Take down today's boss with clean hits and keep enough hearts to finish the fight.",
  "math-grid-puzzle": "Complete today's logic grid and keep your hint use low for the cleanest finish.",
  "missing-number-puzzle": "Spot the pattern quickly and clear the sequence ladder before your streak drops.",
  "quick-math-duel": "Push your speed and accuracy in today's featured duel before the timer runs out."
};

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function hashDateKey(dateKey: string) {
  return dateKey.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function getDailyChallenge(date = new Date()): DailyChallenge {
  const dateKey = getDateKey(date);
  const seed = hashDateKey(dateKey);
  const game = games[seed % games.length];
  const rewardXp = 250 + (seed % 4) * 50;

  return {
    badge: "Daily challenge",
    dateKey,
    game,
    href: `/games/${game.slug}` as Route<string>,
    prompt: prompts[game.slug],
    rewardLabel: `+${rewardXp} XP bonus`
  };
}
