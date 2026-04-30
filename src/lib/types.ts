export type GameSlug = "quick-math-duel" | "missing-number-puzzle" | "math-grid-puzzle" | "boss-round-battle";

export type Profile = {
  avatar_url: string | null;
  average_accuracy: number;
  best_score: number;
  created_at: string;
  display_name: string | null;
  games_played: number;
  id: string;
  role?: "student" | "teacher";
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

export type Badge = {
  description: string;
  earned: boolean;
  id: string;
  label: string;
  progress: number;
  target: number;
};

export type GameResult = {
  accuracy: number;
  correct: number;
  gameSlug: GameSlug;
  maxStreak: number;
  score: number;
  total: number;
};

export type RecommendedChallenge = {
  href: string;
  reason: string;
  slug: GameSlug;
  title: string;
};

export type ProgressionSnapshot = {
  badges: Badge[];
  currentStreak: number;
  level: number;
  longestStreak: number;
  nextLevelXp: number;
  totalXp: number;
  xpIntoLevel: number;
  xpToNextLevel: number;
};

export type PostGameInsights = {
  currentStreak: number;
  improvement: number | null;
  levelAfter: number;
  levelBefore: number;
  newlyEarnedBadges: Badge[];
  personalBest: boolean;
  previousBestScore: number | null;
  previousRunScore: number | null;
  rankAfter: number | null;
  rankBefore: number | null;
  recommendedNextChallenge: RecommendedChallenge;
  xpGained: number;
};

export type SaveGameResultResponse = {
  insights?: PostGameInsights;
  message: string;
  ok: boolean;
};

export type UserStats = {
  averageAccuracy: number;
  bestScore: number;
  gamesPlayed: number;
  maxStreak: number;
  totalScore: number;
};

export type TeacherInterventionCategory = "inactive" | "attention" | "advance";

export type TeacherInterventionEvidence = {
  label: string;
  value: string;
};

export type TeacherInterventionStudent = {
  actionLabel: string;
  category: TeacherInterventionCategory;
  displayName: string;
  evidence: TeacherInterventionEvidence[];
  id: string;
  priority: "high" | "medium" | "low";
  reason: string;
};
