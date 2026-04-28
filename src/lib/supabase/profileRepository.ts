"use client";

import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export async function getCurrentProfile(userId: string) {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) return null;

  return data as Profile | null;
}

export async function updateCurrentProfile(userId: string, displayName: string) {
  const supabase = createClient();

  if (!supabase) {
    return { ok: false, message: "Supabase is not configured yet." };
  }

  const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("id", userId);

  return { ok: !error, message: error?.message ?? "Profile updated." };
}
