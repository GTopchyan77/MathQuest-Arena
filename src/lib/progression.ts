import { games, getGame } from "@/lib/games/catalog";
import type {
  Badge,
  GameResult,
  GameSlug,
  ProgressionSnapshot,
  RecommendedChallenge,
  ScoreRow
} from "@/lib/types";

const LEVEL_STEP = 1000;

type BadgeSpec = {
  description: string;
  id: string;
  label: string;
  metric: "bestScore" | "currentStreak" | "gamesPlayed" | "totalXp";
  target: number;
};

const badgeSpecs: BadgeSpec[] = [
  {
    description: "Save your first run.",
    id: "first-run",
    label: "First Run",
    metric: "gamesPlayed",
    target: 1
  },
  {
    description: "Build a three-day play streak.",
    id: "streak-starter",
    label: "Streak Starter",
    metric: "currentStreak",
    target: 3
  },
  {
    description: "Save five runs.",
    id: "five-runs",
    label: "Arena Regular",
    metric: "gamesPlayed",
    target: 5
  },
  {
    description: "Reach 5,000 total XP.",
    id: "xp-climber",
    label: "XP Climber",
    metric: "totalXp",
    target: 5000
  },
  {
    description: "Reach 10,000 total XP.",
    id: "xp-veteran",
    label: "XP Veteran",
    metric: "totalXp",
    target: 10000
  },
  {
    description: "Post a 2,500+ score in one run.",
    id: "high-scorer",
    label: "High Scorer",
    metric: "bestScore",
    target: 2500
  },
  {
    description: "Hold a seven-day play streak.",
    id: "weekly-streak",
    label: "Weekly Streak",
    metric: "currentStreak",
    target: 7
  }
];

export function getLevelFromXp(totalXp: number) {
  return Math.max(1, Math.floor(totalXp / LEVEL_STEP) + 1);
}

export function getLevelFloor(level: number) {
  return Math.max(0, (level - 1) * LEVEL_STEP);
}

export function getLevelCeiling(level: number) {
  return level * LEVEL_STEP;
}

export function getCurrentStreak(scores: ScoreRow[]) {
  const uniqueDays = [...new Set(scores.map((score) => getLocalDateKey(score.created_at)))].sort((a, b) => b.localeCompare(a));

  if (!uniqueDays.length) {
    return 0;
  }

  const today = getLocalDateKey();
  const yesterday = getLocalDateKey(getDateDaysAgo(1));
  if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) {
    return 0;
  }

  let streak = 1;

  for (let index = 1; index < uniqueDays.length; index += 1) {
    const previous = new Date(`${uniqueDays[index - 1]}T00:00:00.000Z`);
    const current = new Date(`${uniqueDays[index]}T00:00:00.000Z`);
    const diffDays = Math.round((previous.getTime() - current.getTime()) / 86400000);

    if (diffDays === 1) {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
}

export function getLongestDailyStreak(scores: ScoreRow[]) {
  const uniqueDays = [...new Set(scores.map((score) => getLocalDateKey(score.created_at)))].sort();

  if (!uniqueDays.length) {
    return 0;
  }

  let longest = 1;
  let current = 1;

  for (let index = 1; index < uniqueDays.length; index += 1) {
    const previous = new Date(`${uniqueDays[index - 1]}T00:00:00.000Z`);
    const next = new Date(`${uniqueDays[index]}T00:00:00.000Z`);
    const diffDays = Math.round((next.getTime() - previous.getTime()) / 86400000);

    if (diffDays === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

export function getProgressionSnapshot(totalXp: number, scores: ScoreRow[]): ProgressionSnapshot {
  const currentStreak = getCurrentStreak(scores);
  const longestStreak = getLongestDailyStreak(scores);
  const level = getLevelFromXp(totalXp);
  const nextLevelXp = getLevelCeiling(level);
  const xpIntoLevel = totalXp - getLevelFloor(level);
  const bestScore = scores.reduce((max, score) => Math.max(max, score.score), 0);
  const gamesPlayed = scores.length;

  const metrics = {
    bestScore,
    currentStreak,
    gamesPlayed,
    totalXp
  };

  const badges = badgeSpecs.map((badge): Badge => {
    const progress = Math.min(metrics[badge.metric], badge.target);

    return {
      description: badge.description,
      earned: metrics[badge.metric] >= badge.target,
      id: badge.id,
      label: badge.label,
      progress,
      target: badge.target
    };
  });

  return {
    badges,
    currentStreak,
    level,
    longestStreak,
    nextLevelXp,
    totalXp,
    xpIntoLevel,
    xpToNextLevel: Math.max(nextLevelXp - totalXp, 0)
  };
}

export function getNewlyEarnedBadges(previous: Badge[], next: Badge[]) {
  const previousEarned = new Set(previous.filter((badge) => badge.earned).map((badge) => badge.id));
  return next.filter((badge) => badge.earned && !previousEarned.has(badge.id));
}

export function getRecommendedNextChallenge(
  result: GameResult,
  recentScores: ScoreRow[] = []
): RecommendedChallenge {
  if (result.accuracy < 70) {
    const currentGame = getGame(result.gameSlug);

    return {
      href: `/games/${result.gameSlug}`,
      reason: "Run it again while the pattern is fresh and push accuracy above 70%.",
      slug: result.gameSlug,
      title: currentGame?.title ?? "Run it back"
    };
  }

  const candidateGames = games.filter((game) => game.slug !== result.gameSlug);
  const unseenGame = candidateGames.find((game) => !recentScores.some((score) => score.game_slug === game.slug));

  if (unseenGame) {
    return {
      href: `/games/${unseenGame.slug}`,
      reason: "You have not saved a run here yet, so this is the clearest way to broaden your progress.",
      slug: unseenGame.slug,
      title: unseenGame.title
    };
  }

  const averageByGame = new Map<GameSlug, number>();

  for (const game of candidateGames) {
    const gameScores = recentScores.filter((score) => score.game_slug === game.slug);
    const average = gameScores.length
      ? gameScores.reduce((sum, score) => sum + score.accuracy, 0) / gameScores.length
      : 0;

    averageByGame.set(game.slug, average);
  }

  const recommended =
    candidateGames.sort((left, right) => (averageByGame.get(left.slug) ?? 0) - (averageByGame.get(right.slug) ?? 0))[0] ??
    games[0];

  return {
    href: `/games/${recommended.slug}`,
    reason: "This is your weakest recent lane based on saved performance, so it has the biggest upside.",
    slug: recommended.slug,
    title: recommended.title
  };
}

function getLocalDateKey(dateInput?: string | Date) {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput ?? new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
}

function getDateDaysAgo(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}
