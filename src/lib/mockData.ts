import type { GameSlug, LeaderboardEntry, ScoreRow } from "@/lib/types";

export const mockLeaderboard: LeaderboardEntry[] = [
  { best_score: 9420, display_name: "Mira Matrix", games_played: 38, rank: 1, total_score: 84280, user_id: "mock-1" },
  { best_score: 9180, display_name: "Leo Logic", games_played: 34, rank: 2, total_score: 80110, user_id: "mock-2" },
  { best_score: 8870, display_name: "Ada Spark", games_played: 31, rank: 3, total_score: 76340, user_id: "mock-3" },
  { best_score: 8510, display_name: "Nia Numbers", games_played: 29, rank: 4, total_score: 71920, user_id: "mock-4" },
  { best_score: 8225, display_name: "Kai Quest", games_played: 27, rank: 5, total_score: 68450, user_id: "mock-5" },
  { best_score: 7940, display_name: "Sam Solver", games_played: 24, rank: 6, total_score: 63270, user_id: "mock-6" }
];

export const mockScores: ScoreRow[] = [
  score("quick-math-duel", 6420, 92, 13, 1),
  score("missing-number-puzzle", 5310, 90, 7, 2),
  score("math-grid-puzzle", 4880, 88, 5, 3),
  score("quick-math-duel", 5960, 86, 10, 5),
  score("missing-number-puzzle", 4720, 80, 4, 8)
];

function score(game_slug: GameSlug, value: number, accuracy: number, max_streak: number, daysAgo: number): ScoreRow {
  const created = new Date();
  created.setDate(created.getDate() - daysAgo);

  return {
    accuracy,
    created_at: created.toISOString(),
    game_slug,
    id: `mock-score-${game_slug}-${daysAgo}`,
    max_streak,
    score: value,
    user_id: "mock-user"
  };
}
