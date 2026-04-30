"use client";

import { getGame } from "@/lib/games/catalog";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";
import type { GameSlug, TeacherInterventionStudent } from "@/lib/types";

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
  createdAt: string;
  id: string;
  leaderboard: Array<{
    displayName: string;
    rank: number;
    totalXp: number;
  }>;
  name: string;
  participatingStudents: number;
  practicePerformanceOverview: Array<{
    gameSlug: GameSlug;
    participantCount: number;
    performance: number;
    title: string;
  }>;
  roster: TeacherStudent[];
  studentsInactive: TeacherInterventionStudent[];
  studentsNeedingAttention: TeacherInterventionStudent[];
  studentsReadyToAdvance: TeacherInterventionStudent[];
  updatedAt: string;
  whoPlayedToday: TeacherStudent[];
};

export type TeacherClassOption = {
  createdAt: string;
  id: string;
  name: string;
  studentCount: number;
  updatedAt: string;
};

type TeacherClassRow = {
  created_at: string;
  id: string;
  name: string;
  student_count: number;
  updated_at: string;
};

type TeacherClassSummaryRow = {
  active_today: number;
  average_accuracy: number;
  average_practice_performance: number;
  created_at: string;
  id: string;
  name: string;
  participating_students: number;
  roster_count: number;
  updated_at: string;
};

type TeacherRosterAnalyticsRow = {
  average_accuracy: number;
  best_score: number;
  display_name: string;
  games_played: number;
  has_historical_struggle: boolean;
  last3_accuracy: number | null;
  last5_accuracy: number | null;
  last_played_at: string | null;
  latest_game_slug: GameSlug | null;
  low_accuracy_count_recent: number;
  recent_active_days: number;
  recent_session_count: number;
  recent_trend: number | null;
  student_id: string;
  total_xp: number;
};

type TeacherClassGamePerformanceRow = {
  game_slug: GameSlug;
  participant_count: number;
  performance: number;
};

export async function getTeacherClassesLive() {
  const rows = await callRpc<TeacherClassRow>("get_teacher_classes");

  return rows.map((row) => ({
    createdAt: row.created_at,
    id: row.id,
    name: row.name,
    studentCount: Number(row.student_count ?? 0),
    updatedAt: row.updated_at
  })) as TeacherClassOption[];
}

export async function getTeacherClassLive(classId: string) {
  const teacherTimezone = getTeacherTimezone();
  const [summaryRows, rosterRows, performanceRows] = await Promise.all([
    callRpc<TeacherClassSummaryRow>("get_teacher_class_summary", {
      class_id: classId,
      teacher_timezone: teacherTimezone
    }),
    callRpc<TeacherRosterAnalyticsRow>("get_teacher_class_roster_analytics", {
      class_id: classId,
      teacher_timezone: teacherTimezone
    }),
    callRpc<TeacherClassGamePerformanceRow>("get_teacher_class_game_performance", {
      class_id: classId
    })
  ]);

  const summary = summaryRows[0];
  if (!summary) {
    return null;
  }

  const roster = rosterRows.map(toTeacherStudent);
  const leaderboard = [...roster]
    .filter((student) => student.gamesPlayed > 0)
    .sort((left, right) => right.totalXp - left.totalXp || left.displayName.localeCompare(right.displayName))
    .map((student, index) => ({
      displayName: student.displayName,
      rank: index + 1,
      totalXp: student.totalXp
    }));
  const whoPlayedToday = roster
    .filter((student) => sameDay(student.lastPlayedAt, new Date(), teacherTimezone))
    .sort((left, right) => right.totalXp - left.totalXp || left.displayName.localeCompare(right.displayName));

  return {
    activeToday: Number(summary.active_today ?? 0),
    averageAccuracy: Number(summary.average_accuracy ?? 0),
    averagePracticePerformance: Number(summary.average_practice_performance ?? 0),
    createdAt: summary.created_at,
    id: summary.id,
    leaderboard,
    name: summary.name,
    participatingStudents: Number(summary.participating_students ?? 0),
    practicePerformanceOverview: performanceRows.map((item) => ({
      gameSlug: item.game_slug,
      participantCount: Number(item.participant_count ?? 0),
      performance: Number(item.performance ?? 0),
      title: getGame(item.game_slug)?.title ?? item.game_slug
    })),
    roster,
    studentsInactive: roster.map(toInactiveIntervention).filter(isInterventionStudent).sort(sortInterventions),
    studentsNeedingAttention: roster.map(toAttentionIntervention).filter(isInterventionStudent).sort(sortInterventions),
    studentsReadyToAdvance: roster.map(toAdvanceIntervention).filter(isInterventionStudent).sort(sortInterventions),
    updatedAt: summary.updated_at,
    whoPlayedToday
  } satisfies TeacherClassSummary;
}

function getTeacherTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

async function callRpc<T>(name: string, params?: Record<string, string>) {
  if (!hasSupabaseConfig()) {
    throw new Error("Teacher insights are not available until Supabase is configured.");
  }

  const supabase = createClient();
  if (!supabase) {
    throw new Error("Teacher insights are not available until Supabase is configured.");
  }

  const { data, error } = await supabase.rpc(name, params ?? {});
  if (error) {
    console.error(`[teacher rpc] ${name} failed`, error);
    throw new Error(getTeacherErrorMessage(error.message, name));
  }

  return (data ?? []) as T[];
}

function getTeacherErrorMessage(message: string, rpcName: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("not authenticated")) {
    return "Please log in to view teacher insights.";
  }

  if (normalized.includes("teacher access required") || normalized.includes("teacher does not own this class")) {
    return "You do not have access to this teacher view.";
  }

  if (normalized.includes("invalid timezone")) {
    return "Teacher insights could not be loaded because the classroom timezone is invalid.";
  }

  if (normalized.includes("invalid input syntax for type uuid")) {
    return "This class link is invalid.";
  }

  if (normalized.includes("permission denied")) {
    return "Teacher insights are unavailable for this account.";
  }

  return rpcName === "get_teacher_classes"
    ? "Unable to load teacher classes right now."
    : "Unable to load teacher insights right now.";
}

function toTeacherStudent(row: TeacherRosterAnalyticsRow): TeacherStudent {
  return {
    averageAccuracy: Number(row.average_accuracy ?? 0),
    bestScore: Number(row.best_score ?? 0),
    displayName: row.display_name,
    gamesPlayed: Number(row.games_played ?? 0),
    hasHistoricalStruggle: Boolean(row.has_historical_struggle),
    id: row.student_id,
    last3Accuracy: row.last3_accuracy,
    last5Accuracy: row.last5_accuracy,
    lastPlayedAt: row.last_played_at ?? "",
    latestGameTitle: row.latest_game_slug ? (getGame(row.latest_game_slug)?.title ?? row.latest_game_slug) : null,
    lowAccuracyCountRecent: Number(row.low_accuracy_count_recent ?? 0),
    recentActiveDays: Number(row.recent_active_days ?? 0),
    recentSessionCount: Number(row.recent_session_count ?? 0),
    recentTrend: row.recent_trend,
    struggling: Boolean(row.last5_accuracy !== null && row.last5_accuracy < 72),
    totalXp: Number(row.total_xp ?? 0)
  };
}

function sameDay(leftIso: string, rightDate: Date, timeZone: string) {
  if (!leftIso) {
    return false;
  }

  return getLocalDateKey(leftIso, timeZone) === getLocalDateKey(rightDate, timeZone);
}

function getLocalDateKey(value: Date | string, timeZone: string) {
  const date = typeof value === "string" ? new Date(value) : value;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric"
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
}

function daysSince(iso: string) {
  if (!iso) {
    return Number.POSITIVE_INFINITY;
  }

  const now = new Date();
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();

  return Math.max(0, Math.floor(diffMs / 86400000));
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
      { label: "Prior evidence", value: `Last 5 avg ${student.last5Accuracy ?? "?"}%` }
    ],
    id: student.id,
    priority: previouslyStruggled || idleDays >= 7 ? "high" : "medium",
    reason: previouslyStruggled
      ? "Inactive - previously struggled. Re-entry should include support because the last usable evidence was below target."
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

function isInterventionStudent(value: TeacherInterventionStudent | null): value is TeacherInterventionStudent {
  return value !== null;
}

function sortInterventions(left: TeacherInterventionStudent, right: TeacherInterventionStudent) {
  const priorityOrder = { high: 0, low: 2, medium: 1 };

  return priorityOrder[left.priority] - priorityOrder[right.priority] || left.displayName.localeCompare(right.displayName);
}
