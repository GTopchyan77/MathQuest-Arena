export type GameSlug = "quick-math-duel" | "missing-number-puzzle" | "math-grid-puzzle";

export type Profile = {
  avatar_url: string | null;
  average_accuracy: number;
  best_score: number;
  created_at: string;
  display_name: string | null;
  games_played: number;
  id: string;
  total_xp: number;
  updated_at: string;
};

export type ScoreRow = {
  accuracy: number;
  created_at: string;
  game_session_id?: string | null;
  game_slug: GameSlug;
  id: string;
  max_streak: number;
  score: number;
  user_id: string;
};

export type GameSessionRow = {
  correct_answers: number;
  created_at: string;
  duration_seconds: number | null;
  ended_at: string;
  game_slug: GameSlug;
  id: string;
  score: number;
  started_at: string;
  total_questions: number;
  user_id: string;
};

export type LeaderboardEntry = {
  best_score: number;
  display_name: string;
  games_played: number;
  rank: number;
  total_score: number;
  user_id: string;
};

export type GameResult = {
  accuracy: number;
  correct: number;
  gameSlug: GameSlug;
  maxStreak: number;
  score: number;
  total: number;
};

export type UserStats = {
  averageAccuracy: number;
  bestScore: number;
  gamesPlayed: number;
  maxStreak: number;
  totalScore: number;
};
