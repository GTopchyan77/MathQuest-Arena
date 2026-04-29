import { getGame } from "@/lib/games/catalog";
import type { GameSlug, ScoreRow, TeacherInterventionStudent } from "@/lib/types";

export type TeacherStudent = {
  averageAccuracy: number;
  bestScore: number;
  displayName: string;
  gamesPlayed: number;
  hasHistoricalStruggle: boolean;
  id: string;
  last3Accuracy: number | null;
  last5Accuracy: number | null;
  lastPlayedAt: string;
  latestGameTitle: string | null;
  lowAccuracyCountRecent: number;
  recentActiveDays: number;
  recentSessionCount: number;
  recentTrend: number | null;
  struggling: boolean;
  totalXp: number;
};

export type TeacherClassSummary = {
  activeToday: number;
  averageAccuracy: number;
  averagePracticePerformance: number;
  id: string;
  leaderboard: Array<{
    displayName: string;
    rank: number;
    totalXp: number;
  }>;
  participatingStudents: number;
  practicePerformanceOverview: Array<{
    gameSlug: GameSlug;
    performance: number;
    title: string;
  }>;
  name: string;
  roster: TeacherStudent[];
  studentsInactive: TeacherInterventionStudent[];
  studentsNeedingAttention: TeacherInterventionStudent[];
  studentsReadyToAdvance: TeacherInterventionStudent[];
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
      { accuracy: 91, daysAgo: 0, gameSlug: "boss-round-battle", score: 1740 },
      { accuracy: 88, daysAgo: 1, gameSlug: "missing-number-puzzle", score: 1540 },
      { accuracy: 90, daysAgo: 2, gameSlug: "quick-math-duel", score: 1680 },
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
      { accuracy: 69, daysAgo: 6, gameSlug: "boss-round-battle", score: 1180 },
      { accuracy: 64, daysAgo: 8, gameSlug: "quick-math-duel", score: 1025 },
      { accuracy: 61, daysAgo: 10, gameSlug: "missing-number-puzzle", score: 980 }
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
  },
  {
    displayName: "Rory Reset",
    id: "student-7",
    games: []
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
  const activeToday = roster.filter((student) => sameDay(student.lastPlayedAt, new Date())).length;
  const measurableRoster = roster.filter((student) => student.gamesPlayed > 0);
  const participatingStudents = measurableRoster.length;
  const averageAccuracy = measurableRoster.length
    ? Math.round(measurableRoster.reduce((sum, student) => sum + student.averageAccuracy, 0) / measurableRoster.length)
    : 0;
  const averagePracticePerformance = measurableRoster.length
    ? Math.round(
        measurableRoster.reduce((sum, student) => sum + (student.last5Accuracy ?? student.averageAccuracy), 0) / measurableRoster.length
      )
    : 0;
  const whoPlayedToday = roster
    .filter((student) => sameDay(student.lastPlayedAt, new Date()))
    .sort((left, right) => right.totalXp - left.totalXp);
  const practicePerformanceOverview = buildPracticePerformanceOverview(studentSeeds);
  const leaderboard = [...roster]
    .filter((student) => student.gamesPlayed > 0)
    .sort((left, right) => right.totalXp - left.totalXp)
    .map((student, index) => ({
      displayName: student.displayName,
      rank: index + 1,
      totalXp: student.totalXp
    }));
  const studentsInactive = roster
    .map(toInactiveIntervention)
    .filter(isInterventionStudent)
    .sort(sortInterventions);
  const studentsNeedingAttention = roster
    .map(toAttentionIntervention)
    .filter(isInterventionStudent)
    .sort(sortInterventions);
  const studentsReadyToAdvance = roster
    .map(toAdvanceIntervention)
    .filter(isInterventionStudent)
    .sort(sortInterventions);

  return {
    activeToday,
    averageAccuracy,
    averagePracticePerformance,
    id,
    leaderboard,
    participatingStudents,
    practicePerformanceOverview,
    name,
    roster,
    studentsInactive,
    studentsNeedingAttention,
    studentsReadyToAdvance,
    whoPlayedToday
  };
}

function buildStudent(seed: StudentSeed): TeacherStudent {
  const scoreRows = seed.games.map((game, index) => createScore(seed.id, game.gameSlug, game.score, game.accuracy, game.daysAgo, index));
  const orderedScores = [...scoreRows].sort((left, right) => right.created_at.localeCompare(left.created_at));
  const totalXp = scoreRows.reduce((sum, score) => sum + score.score, 0);
  const averageAccuracy = scoreRows.length ? Math.round(scoreRows.reduce((sum, score) => sum + score.accuracy, 0) / scoreRows.length) : 0;
  const bestScore = scoreRows.reduce((max, score) => Math.max(max, score.score), 0);
  const lastPlayedAt = orderedScores[0]?.created_at ?? "";
  const last3Scores = orderedScores.slice(0, 3);
  const last5Scores = orderedScores.slice(0, 5);
  const recentScores = orderedScores.filter((score) => daysSince(score.created_at) <= 14);
  const recentTrend = last3Scores.length >= 2 ? last3Scores[0].accuracy - last3Scores[last3Scores.length - 1].accuracy : null;
  const last3Accuracy = last3Scores.length ? Math.round(last3Scores.reduce((sum, score) => sum + score.accuracy, 0) / last3Scores.length) : null;
  const last5Accuracy = last5Scores.length ? Math.round(last5Scores.reduce((sum, score) => sum + score.accuracy, 0) / last5Scores.length) : null;
  const lowAccuracyCountRecent = last5Scores.filter((score) => score.accuracy <= 65).length;
  const latestGameTitle = orderedScores[0] ? getGame(orderedScores[0].game_slug)?.title ?? orderedScores[0].game_slug : null;
  const recentActiveDays = new Set(recentScores.map((score) => getLocalDateKey(score.created_at))).size;
  const recentSessionCount = recentScores.length;
  const hasHistoricalStruggle = (last5Accuracy !== null && last5Accuracy < 72) || lowAccuracyCountRecent >= 2;

  return {
    averageAccuracy,
    bestScore,
    displayName: seed.displayName,
    gamesPlayed: scoreRows.length,
    hasHistoricalStruggle,
    id: seed.id,
    last3Accuracy,
    last5Accuracy,
    lastPlayedAt,
    latestGameTitle,
    lowAccuracyCountRecent,
    recentActiveDays,
    recentSessionCount,
    recentTrend,
    struggling: Boolean(last5Accuracy !== null && last5Accuracy < 72),
    totalXp
  };
}

function buildPracticePerformanceOverview(studentSeeds: StudentSeed[]) {
  const allScores = studentSeeds.flatMap((student) =>
    student.games.map((game, index) => createScore(student.id, game.gameSlug, game.score, game.accuracy, game.daysAgo, index))
  );

  const groups = new Map<GameSlug, ScoreRow[]>();
  for (const score of allScores) {
    groups.set(score.game_slug, [...(groups.get(score.game_slug) ?? []), score]);
  }

  return [...groups.entries()].map(([gameSlug, scores]) => ({
    gameSlug,
    performance: Math.round(scores.reduce((sum, score) => sum + score.accuracy, 0) / scores.length),
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

function sameDay(leftIso: string, rightDate: Date) {
  if (!leftIso) {
    return false;
  }

  return getLocalDateKey(leftIso) === getLocalDateKey(rightDate);
}

function daysSince(iso: string) {
  if (!iso) {
    return Number.POSITIVE_INFINITY;
  }

  const now = new Date();
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();

  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function toInactiveIntervention(student: TeacherStudent): TeacherInterventionStudent | null {
  const idleDays = daysSince(student.lastPlayedAt);

  if (student.gamesPlayed === 0) {
    return {
      actionLabel: "Invite to first session",
      category: "inactive",
      displayName: student.displayName,
      evidence: [
        { label: "Play history", value: "No saved sessions" },
        { label: "Data status", value: "Insufficient baseline" },
        { label: "Recommended move", value: "Verify access and launch support" }
      ],
      id: student.id,
      priority: "medium",
      reason: "No play data yet, so the teacher should first confirm access before judging performance."
    };
  }

  if (idleDays < 5) {
    return null;
  }

  const previouslyStruggled = student.hasHistoricalStruggle;

  return {
    actionLabel: previouslyStruggled ? "Re-engage with support" : "Re-engage student",
    category: "inactive",
    displayName: student.displayName,
    evidence: [
      { label: "Last played", value: `${idleDays} days ago` },
      { label: "Prior sessions", value: `${student.gamesPlayed} saved` },
      {
        label: "Prior evidence",
        value: previouslyStruggled ? `Last 5 avg ${student.last5Accuracy ?? "?"}%` : `Last 5 avg ${student.last5Accuracy ?? "?"}%`
      }
    ],
    id: student.id,
    priority: previouslyStruggled || idleDays >= 7 ? "high" : "medium",
    reason: previouslyStruggled
      ? "Inactive — previously struggled. Re-entry should include support because the last usable evidence was below target."
      : "Inactive with no recent evidence. The next move is to re-establish participation before making a performance judgment."
  };
}

function toAttentionIntervention(student: TeacherStudent): TeacherInterventionStudent | null {
  if (!student.gamesPlayed || daysSince(student.lastPlayedAt) > 3) {
    return null;
  }

  const lowRecentAccuracy = student.last5Accuracy !== null && student.last5Accuracy < 72;
  const repeatedLowRuns = student.lowAccuracyCountRecent >= 2;
  const negativeTrend = student.recentTrend !== null && student.recentTrend <= -10;

  if (!lowRecentAccuracy && !repeatedLowRuns && !negativeTrend) {
    return null;
  }

  return {
    actionLabel: "Assign targeted practice",
    category: "attention",
    displayName: student.displayName,
    evidence: [
      { label: "Last 5 accuracy", value: student.last5Accuracy !== null ? `${student.last5Accuracy}%` : "Insufficient data" },
      { label: "Low recent runs", value: `${student.lowAccuracyCountRecent}` },
      { label: "Trend", value: student.recentTrend !== null ? `${student.recentTrend > 0 ? "+" : ""}${student.recentTrend} pts` : "Flat" }
    ],
    id: student.id,
    priority: repeatedLowRuns || (student.last5Accuracy !== null && student.last5Accuracy < 65) ? "high" : "medium",
    reason: "Student has recent participation, and the latest 3-5 session evidence suggests instruction should shift before disengagement follows."
  };
}

function toAdvanceIntervention(student: TeacherStudent): TeacherInterventionStudent | null {
  if (!student.gamesPlayed || daysSince(student.lastPlayedAt) > 3) {
    return null;
  }

  const readyAccuracy = student.last5Accuracy !== null && student.last5Accuracy >= 85;
  const nonNegativeTrend = student.recentTrend === null || student.recentTrend >= -4;
  const enoughRecentEvidence = student.recentSessionCount >= 5 || (student.recentSessionCount >= 4 && student.recentActiveDays >= 2);

  if (!readyAccuracy || !nonNegativeTrend || !enoughRecentEvidence) {
    return null;
  }

  return {
    actionLabel: "Promote to stretch work",
    category: "advance",
    displayName: student.displayName,
    evidence: [
      { label: "Last 5 accuracy", value: `${student.last5Accuracy}%` },
      { label: "Recent evidence", value: `${student.recentSessionCount} sessions across ${student.recentActiveDays} day${student.recentActiveDays === 1 ? "" : "s"}` },
      { label: "Recent game", value: student.latestGameTitle ?? "No recent game" }
    ],
    id: student.id,
    priority: student.last5Accuracy !== null && student.last5Accuracy >= 90 ? "high" : "medium",
    reason: "Student has enough recent evidence across multiple attempts to justify harder work instead of more repetition."
  };
}

function getLocalDateKey(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isInterventionStudent(value: TeacherInterventionStudent | null): value is TeacherInterventionStudent {
  return value !== null;
}

function sortInterventions(left: TeacherInterventionStudent, right: TeacherInterventionStudent) {
  const priorityOrder = { high: 0, medium: 1, low: 2 };

  return priorityOrder[left.priority] - priorityOrder[right.priority] || left.displayName.localeCompare(right.displayName);
}
