"use client";

import type { GameResult, GameSlug, LeaderboardEntry, Profile, ScoreRow, UserStats } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

const emptyStats: UserStats = {
  averageAccuracy: 0,
  bestScore: 0,
  gamesPlayed: 0,
  maxStreak: 0,
  totalScore: 0
};

export async function saveGameResult(result: GameResult) {
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

  await ensureProfile();

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

  return { ok: true, message: "Score saved." };
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

  const { data } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(12);

  return (data ?? []) as ScoreRow[];
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
