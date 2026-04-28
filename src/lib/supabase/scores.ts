"use client";

import { getLevelFromXp, getNewlyEarnedBadges, getProgressionSnapshot, getRecommendedNextChallenge } from "@/lib/progression";
import { createClient } from "@/lib/supabase/client";
import type {
  GameResult,
  GameSlug,
  LeaderboardEntry,
  Profile,
  SaveGameResultResponse,
  ScoreRow,
  UserStats
} from "@/lib/types";

const emptyStats: UserStats = {
  averageAccuracy: 0,
  bestScore: 0,
  gamesPlayed: 0,
  maxStreak: 0,
  totalScore: 0
};

export async function saveGameResult(result: GameResult): Promise<SaveGameResultResponse> {
  const supabase = createClient();

  if (!supabase) {
    return { ok: false, message: "Supabase is not configured yet." };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Log in to save your score." };
  }

  const [profileBefore, allScoresBefore, gameScoresBefore, leaderboardBefore] = await Promise.all([
    ensureProfile(),
    getUserScoresForUser(user.id),
    getUserScoresForUser(user.id, result.gameSlug),
    getLeaderboard()
  ]);

  const previousRunScore = gameScoresBefore[0]?.score ?? null;
  const previousBestScore = gameScoresBefore.reduce((max, score) => Math.max(max, score.score), 0) || null;
  const rankBefore = leaderboardBefore.find((entry) => entry.user_id === user.id)?.rank ?? null;
  const previousProgression = getProgressionSnapshot(profileBefore?.total_xp ?? 0, allScoresBefore);

  const { data: session, error: sessionError } = await supabase
    .from("game_sessions")
    .insert({
      correct_answers: result.correct,
      duration_seconds: null,
      game_slug: result.gameSlug,
      score: result.score,
      total_questions: result.total,
      user_id: user.id
    })
    .select("id")
    .single();

  if (sessionError) {
    return { ok: false, message: sessionError.message };
  }

  const { error } = await supabase.from("scores").insert({
    accuracy: result.accuracy,
    game_session_id: session.id,
    game_slug: result.gameSlug,
    max_streak: result.maxStreak,
    score: result.score,
    user_id: user.id
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  const [profileAfter, scoresAfter, leaderboardAfter] = await Promise.all([getUserProfile(), getUserScoresForUser(user.id), getLeaderboard()]);
  const totalXpAfter = profileAfter?.total_xp ?? profileBefore?.total_xp ?? 0;
  const xpGained =
    profileBefore && profileAfter ? Math.max(profileAfter.total_xp - profileBefore.total_xp, 0) : 0;
  const nextProgression = getProgressionSnapshot(totalXpAfter, scoresAfter);
  const rankAfter = leaderboardAfter.find((entry) => entry.user_id === user.id)?.rank ?? null;
  const rankMessage =
    rankBefore !== null && rankAfter !== null
      ? rankAfter < rankBefore
        ? ` Rank up: #${rankBefore} to #${rankAfter}.`
        : rankAfter > rankBefore
          ? ` Rank shift: #${rankBefore} to #${rankAfter}.`
          : ` Holding at rank #${rankAfter}.`
      : rankAfter !== null
        ? ` You entered the board at #${rankAfter}.`
        : "";

  return {
    insights: {
      currentStreak: nextProgression.currentStreak,
      improvement: previousRunScore !== null ? result.score - previousRunScore : null,
      levelAfter: nextProgression.level,
      levelBefore: getLevelFromXp(profileBefore?.total_xp ?? 0),
      newlyEarnedBadges: getNewlyEarnedBadges(previousProgression.badges, nextProgression.badges),
      personalBest: previousBestScore === null || result.score > previousBestScore,
      previousBestScore,
      previousRunScore,
      rankAfter,
      rankBefore,
      recommendedNextChallenge: getRecommendedNextChallenge(result, scoresAfter),
      xpGained
    },
    message: `Score saved.${rankMessage}`,
    ok: true
  };
}

export async function ensureProfile() {
  const supabase = createClient();
  if (!supabase) return null;

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const displayName = user.user_metadata?.display_name ?? user.email?.split("@")[0] ?? "MathQuest Player";
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        display_name: displayName,
        id: user.id,
        updated_at: new Date().toISOString()
      },
      { onConflict: "id" }
    )
    .select("*")
    .single();

  if (error) return null;
  return data as Profile;
}

export async function getUserProfile() {
  const supabase = createClient();
  if (!supabase) return null;

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return (data as Profile | null) ?? (await ensureProfile());
}

export async function getUserScores() {
  const supabase = createClient();
  if (!supabase) return [] as ScoreRow[];

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return [] as ScoreRow[];

  return getUserScoresForUser(user.id);
}

export async function getUserStats() {
  const supabase = createClient();
  if (!supabase) return emptyStats;

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return emptyStats;

  const { data } = await supabase
    .from("scores")
    .select("accuracy, max_streak, score")
    .eq("user_id", user.id);

  const rows = data ?? [];
  if (!rows.length) return emptyStats;

  return {
    averageAccuracy: Math.round(rows.reduce((sum, score) => sum + Number(score.accuracy ?? 0), 0) / rows.length),
    bestScore: rows.reduce((max, score) => Math.max(max, Number(score.score ?? 0)), 0),
    gamesPlayed: rows.length,
    maxStreak: rows.reduce((max, score) => Math.max(max, Number(score.max_streak ?? 0)), 0),
    totalScore: rows.reduce((sum, score) => sum + Number(score.score ?? 0), 0)
  };
}

export async function getLeaderboard(gameSlug?: GameSlug) {
  const supabase = createClient();
  if (!supabase) return [] as LeaderboardEntry[];

  const { data, error } = await supabase.rpc("get_leaderboard", {
    selected_game: gameSlug ?? null
  });

  if (error) return [] as LeaderboardEntry[];

  return (data ?? []) as LeaderboardEntry[];
}

async function getUserScoresForUser(userId: string, gameSlug?: GameSlug) {
  const supabase = createClient();
  if (!supabase) return [] as ScoreRow[];

  let query = supabase.from("scores").select("*").eq("user_id", userId);

  if (gameSlug) {
    query = query.eq("game_slug", gameSlug);
  }

  const { data } = await query.order("created_at", { ascending: false }).limit(50);

  return (data ?? []) as ScoreRow[];
}
