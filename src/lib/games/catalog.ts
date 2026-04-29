import type { GameSlug } from "@/lib/types";

export type GameMeta = {
  accent: "coral" | "lemon" | "mint" | "violet";
  description: string;
  duration: string;
  skills: string[];
  slug: GameSlug;
  title: string;
};

export const games: GameMeta[] = [
  {
    accent: "violet",
    description: "Battle a math monster across five attack turns and protect your hearts.",
    duration: "5 rounds",
    skills: ["battle math", "focus", "addition"],
    slug: "boss-round-battle",
    title: "Boss Round Battle"
  },
  {
    accent: "coral",
    description: "Race the clock through fast arithmetic rounds and build a streak.",
    duration: "60 sec",
    skills: ["addition", "subtraction", "multiplication"],
    slug: "quick-math-duel",
    title: "Quick Math Duel"
  },
  {
    accent: "lemon",
    description: "Spot sequence patterns, choose the missing value, and scale up difficulty.",
    duration: "10 puzzles",
    skills: ["patterns", "number sense", "reasoning"],
    slug: "missing-number-puzzle",
    title: "Missing Number Puzzle"
  },
  {
    accent: "mint",
    description: "Solve a compact 3x3 grid by finding the hidden rule behind the rows.",
    duration: "8 grids",
    skills: ["logic", "mental math", "deduction"],
    slug: "math-grid-puzzle",
    title: "Math Grid Puzzle"
  }
];

export function getGame(slug: string) {
  return games.find((game) => game.slug === slug);
}
