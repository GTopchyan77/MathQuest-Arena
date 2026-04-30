import type { Route } from "next";
import { games } from "@/lib/games/catalog";
import type { GameMeta } from "@/lib/games/catalog";

export type DailyChallenge = {
  dateKey: string;
  game: GameMeta;
  href: Route<string>;
  rewardXp: number;
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
    dateKey,
    game,
    href: `/games/${game.slug}` as Route<string>,
    rewardXp
  };
}
