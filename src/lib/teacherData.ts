import { getGame } from "@/lib/games/catalog";
import type { GameSlug, ScoreRow, TeacherInterventionStudent } from "@/lib/types";

export type TeacherStudent = {
  averageAccuracy: number;
  bestScore: number;
  displayName: string;
  gamesPlayed: number;
  id: string;
  last3Accuracy: number | null;
  lastPlayedAt: string;
  latestGameTitle: string | null;
  lowAccuracyCountLast7Days: number;
  masteryBand: "developing" | "emerging" | "proficient" | "unknown";
  recentTrend: number | null;
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
      { accuracy: 84, daysAgo: 6, gameSlug: "boss-round-battle", score: 1520 },
      { accuracy: 80, daysAgo: 8, gameSlug: "quick-math-duel", score: 1440 },
      { accuracy: 83, daysAgo: 10, gameSlug: "missing-number-puzzle", score: 1505 }
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
  const activeToday = roster.filter((student) => sameDay(student.lastPlayedAt, new Date().toISOString())).length;
  const measurableRoster = roster.filter((student) => student.gamesPlayed > 0);
  const averageAccuracy = measurableRoster.length
    ? Math.round(measurableRoster.reduce((sum, student) => sum + student.averageAccuracy, 0) / measurableRoster.length)
    : 0;
  const averageMastery = Math.round(
    (measurableRoster.length
      ? measurableRoster.reduce((sum, student) => sum + Math.min(100, 52 + student.averageAccuracy * 0.45), 0) / measurableRoster.length
      : 0)
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
    averageMastery,
    id,
    leaderboard,
    masteryOverview,
    name,
    roster,
    strugglingStudents,
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
  const last7Scores = orderedScores.filter((score) => daysSince(score.created_at) <= 7);
  const recentTrend = last3Scores.length >= 2 ? last3Scores[0].accuracy - last3Scores[last3Scores.length - 1].accuracy : null;
  const last3Accuracy = last3Scores.length ? Math.round(last3Scores.reduce((sum, score) => sum + score.accuracy, 0) / last3Scores.length) : null;
  const lowAccuracyCountLast7Days = last7Scores.filter((score) => score.accuracy <= 65).length;
  const latestGameTitle = orderedScores[0] ? getGame(orderedScores[0].game_slug)?.title ?? orderedScores[0].game_slug : null;
  const masteryBand = !scoreRows.length ? "unknown" : averageAccuracy >= 85 ? "proficient" : averageAccuracy >= 70 ? "developing" : "emerging";

  return {
    averageAccuracy,
    bestScore,
    displayName: seed.displayName,
    gamesPlayed: scoreRows.length,
    id: seed.id,
    last3Accuracy,
    lastPlayedAt,
    latestGameTitle,
    lowAccuracyCountLast7Days,
    masteryBand,
    recentTrend,
    struggling: scoreRows.length > 0 && averageAccuracy < 75,
    timePlayedMinutes: scoreRows.length ? 8 + scoreRows.length * 6 + Math.round(bestScore / 180) : 0,
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
  if (!leftIso || !rightIso) {
    return false;
  }

  return leftIso.slice(0, 10) === rightIso.slice(0, 10);
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

  return {
    actionLabel: "Re-engage student",
    category: "inactive",
    displayName: student.displayName,
    evidence: [
      { label: "Last played", value: `${idleDays} days ago` },
      { label: "Prior sessions", value: `${student.gamesPlayed} saved` },
      { label: "Last seen in", value: student.latestGameTitle ?? "No recent game" }
    ],
    id: student.id,
    priority: idleDays >= 7 ? "high" : "medium",
    reason: "Student has prior activity but no recent play, so the best intervention is re-entry rather than remediation."
  };
}

function toAttentionIntervention(student: TeacherStudent): TeacherInterventionStudent | null {
  if (!student.gamesPlayed || daysSince(student.lastPlayedAt) > 3) {
    return null;
  }

  const lowRecentAccuracy = student.last3Accuracy !== null && student.last3Accuracy < 72;
  const repeatedLowRuns = student.lowAccuracyCountLast7Days >= 2;
  const negativeTrend = student.recentTrend !== null && student.recentTrend <= -10;

  if (!lowRecentAccuracy && !repeatedLowRuns && !negativeTrend) {
    return null;
  }

  return {
    actionLabel: "Assign targeted practice",
    category: "attention",
    displayName: student.displayName,
    evidence: [
      { label: "Last 3 accuracy", value: student.last3Accuracy !== null ? `${student.last3Accuracy}%` : "Insufficient data" },
      { label: "Low runs in 7d", value: `${student.lowAccuracyCountLast7Days}` },
      { label: "Trend", value: student.recentTrend !== null ? `${student.recentTrend > 0 ? "+" : ""}${student.recentTrend} pts` : "Flat" }
    ],
    id: student.id,
    priority: repeatedLowRuns || (student.last3Accuracy !== null && student.last3Accuracy < 65) ? "high" : "medium",
    reason: "Student is still engaging, but recent accuracy signals suggest support should be targeted before the habit breaks."
  };
}

function toAdvanceIntervention(student: TeacherStudent): TeacherInterventionStudent | null {
  if (!student.gamesPlayed || daysSince(student.lastPlayedAt) > 3) {
    return null;
  }

  const readyAccuracy = student.last3Accuracy !== null && student.last3Accuracy >= 85;
  const stableMastery = student.masteryBand === "proficient";
  const nonNegativeTrend = student.recentTrend === null || student.recentTrend >= -4;

  if (!readyAccuracy || !stableMastery || !nonNegativeTrend || student.gamesPlayed < 3) {
    return null;
  }

  return {
    actionLabel: "Promote to stretch work",
    category: "advance",
    displayName: student.displayName,
    evidence: [
      { label: "Last 3 accuracy", value: `${student.last3Accuracy}%` },
      { label: "Mastery band", value: student.masteryBand },
      { label: "Recent game", value: student.latestGameTitle ?? "No recent game" }
    ],
    id: student.id,
    priority: student.last3Accuracy !== null && student.last3Accuracy >= 90 ? "high" : "medium",
    reason: "Student is showing stable recent success, so the intervention should increase challenge instead of repeating practice."
  };
}

function isInterventionStudent(value: TeacherInterventionStudent | null): value is TeacherInterventionStudent {
  return value !== null;
}

function sortInterventions(left: TeacherInterventionStudent, right: TeacherInterventionStudent) {
  const priorityOrder = { high: 0, medium: 1, low: 2 };

  return priorityOrder[left.priority] - priorityOrder[right.priority] || left.displayName.localeCompare(right.displayName);
}
