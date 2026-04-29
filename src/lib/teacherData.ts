import { getGame } from "@/lib/games/catalog";
import type { GameSlug, ScoreRow } from "@/lib/types";

export type TeacherStudent = {
  averageAccuracy: number;
  bestScore: number;
  displayName: string;
  gamesPlayed: number;
  id: string;
  lastPlayedAt: string;
  struggling: boolean;
  timePlayedMinutes: number;
  totalXp: number;
};

export type TeacherClassSummary = {
  activeToday: number;
  averageAccuracy: number;
  averageMastery: number;
  id: string;
  leaderboard: Array<{
    displayName: string;
    rank: number;
    totalXp: number;
  }>;
  masteryOverview: Array<{
    gameSlug: GameSlug;
    mastery: number;
    title: string;
  }>;
  name: string;
  roster: TeacherStudent[];
  strugglingStudents: TeacherStudent[];
  whoPlayedToday: TeacherStudent[];
};

type StudentSeed = {
  displayName: string;
  games: Array<{
    accuracy: number;
    daysAgo: number;
    gameSlug: GameSlug;
    score: number;
  }>;
  id: string;
};

const seeds: StudentSeed[] = [
  {
    displayName: "Mira Matrix",
    id: "student-1",
    games: [
      { accuracy: 93, daysAgo: 0, gameSlug: "quick-math-duel", score: 1880 },
      { accuracy: 88, daysAgo: 1, gameSlug: "missing-number-puzzle", score: 1540 },
      { accuracy: 86, daysAgo: 3, gameSlug: "math-grid-puzzle", score: 1410 }
    ]
  },
  {
    displayName: "Leo Logic",
    id: "student-2",
    games: [
      { accuracy: 89, daysAgo: 0, gameSlug: "missing-number-puzzle", score: 1640 },
      { accuracy: 84, daysAgo: 2, gameSlug: "quick-math-duel", score: 1495 },
      { accuracy: 82, daysAgo: 4, gameSlug: "boss-round-battle", score: 1380 }
    ]
  },
  {
    displayName: "Ada Spark",
    id: "student-3",
    games: [
      { accuracy: 78, daysAgo: 0, gameSlug: "math-grid-puzzle", score: 1320 },
      { accuracy: 76, daysAgo: 1, gameSlug: "missing-number-puzzle", score: 1280 },
      { accuracy: 81, daysAgo: 5, gameSlug: "quick-math-duel", score: 1405 }
    ]
  },
  {
    displayName: "Nia Numbers",
    id: "student-4",
    games: [
      { accuracy: 67, daysAgo: 0, gameSlug: "quick-math-duel", score: 990 },
      { accuracy: 71, daysAgo: 2, gameSlug: "missing-number-puzzle", score: 1105 },
      { accuracy: 73, daysAgo: 6, gameSlug: "math-grid-puzzle", score: 1160 }
    ]
  },
  {
    displayName: "Kai Quest",
    id: "student-5",
    games: [
      { accuracy: 84, daysAgo: 1, gameSlug: "boss-round-battle", score: 1520 },
      { accuracy: 80, daysAgo: 3, gameSlug: "quick-math-duel", score: 1440 },
      { accuracy: 83, daysAgo: 7, gameSlug: "missing-number-puzzle", score: 1505 }
    ]
  },
  {
    displayName: "Sam Solver",
    id: "student-6",
    games: [
      { accuracy: 62, daysAgo: 0, gameSlug: "missing-number-puzzle", score: 910 },
      { accuracy: 68, daysAgo: 1, gameSlug: "math-grid-puzzle", score: 1040 },
      { accuracy: 70, daysAgo: 4, gameSlug: "quick-math-duel", score: 1115 }
    ]
  }
];

const teacherClasses: TeacherClassSummary[] = [buildClassSummary("class-alpha", "MathQuest Pilot A", seeds)];

export function getTeacherClasses() {
  return teacherClasses;
}

export function getTeacherClassById(id: string) {
  return teacherClasses.find((item) => item.id === id);
}

function buildClassSummary(id: string, name: string, studentSeeds: StudentSeed[]): TeacherClassSummary {
  const roster = studentSeeds.map(buildStudent);
  const activeToday = roster.filter((student) => sameDay(student.lastPlayedAt, new Date().toISOString())).length;
  const averageAccuracy = Math.round(roster.reduce((sum, student) => sum + student.averageAccuracy, 0) / roster.length);
  const averageMastery = Math.round(
    roster.reduce((sum, student) => sum + Math.min(100, 52 + student.averageAccuracy * 0.45), 0) / roster.length
  );
  const strugglingStudents = roster
    .filter((student) => student.struggling)
    .sort((left, right) => left.averageAccuracy - right.averageAccuracy)
    .slice(0, 3);
  const whoPlayedToday = roster
    .filter((student) => sameDay(student.lastPlayedAt, new Date().toISOString()))
    .sort((left, right) => right.totalXp - left.totalXp);
  const masteryOverview = buildMasteryOverview(studentSeeds);
  const leaderboard = [...roster]
    .sort((left, right) => right.totalXp - left.totalXp)
    .map((student, index) => ({
      displayName: student.displayName,
      rank: index + 1,
      totalXp: student.totalXp
    }));

  return {
    activeToday,
    averageAccuracy,
    averageMastery,
    id,
    leaderboard,
    masteryOverview,
    name,
    roster,
    strugglingStudents,
    whoPlayedToday
  };
}

function buildStudent(seed: StudentSeed): TeacherStudent {
  const scoreRows = seed.games.map((game, index) => createScore(seed.id, game.gameSlug, game.score, game.accuracy, game.daysAgo, index));
  const totalXp = scoreRows.reduce((sum, score) => sum + score.score, 0);
  const averageAccuracy = Math.round(scoreRows.reduce((sum, score) => sum + score.accuracy, 0) / scoreRows.length);
  const bestScore = scoreRows.reduce((max, score) => Math.max(max, score.score), 0);
  const lastPlayedAt = [...scoreRows].sort((left, right) => right.created_at.localeCompare(left.created_at))[0]?.created_at ?? new Date().toISOString();

  return {
    averageAccuracy,
    bestScore,
    displayName: seed.displayName,
    gamesPlayed: scoreRows.length,
    id: seed.id,
    lastPlayedAt,
    struggling: averageAccuracy < 75,
    timePlayedMinutes: 8 + scoreRows.length * 6 + Math.round(bestScore / 180),
    totalXp
  };
}

function buildMasteryOverview(studentSeeds: StudentSeed[]) {
  const allScores = studentSeeds.flatMap((student) =>
    student.games.map((game, index) => createScore(student.id, game.gameSlug, game.score, game.accuracy, game.daysAgo, index))
  );

  const groups = new Map<GameSlug, ScoreRow[]>();
  for (const score of allScores) {
    groups.set(score.game_slug, [...(groups.get(score.game_slug) ?? []), score]);
  }

  return [...groups.entries()].map(([gameSlug, scores]) => ({
    gameSlug,
    mastery: Math.round(scores.reduce((sum, score) => sum + score.accuracy, 0) / scores.length),
    title: getGame(gameSlug)?.title ?? gameSlug
  }));
}

function createScore(
  userId: string,
  gameSlug: GameSlug,
  score: number,
  accuracy: number,
  daysAgo: number,
  index: number
): ScoreRow {
  const created = new Date();
  created.setDate(created.getDate() - daysAgo);
  created.setHours(9 + index * 2, 15, 0, 0);

  return {
    accuracy,
    created_at: created.toISOString(),
    game_slug: gameSlug,
    id: `${userId}-${gameSlug}-${daysAgo}-${index}`,
    max_streak: Math.max(2, Math.round(accuracy / 12)),
    score,
    user_id: userId
  };
}

function sameDay(leftIso: string, rightIso: string) {
  return leftIso.slice(0, 10) === rightIso.slice(0, 10);
}
