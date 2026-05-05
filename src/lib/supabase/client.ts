"use client";

import { createBrowserClient } from "@supabase/ssr";

let hasLoggedSupabaseEnv = false;

function readSupabaseConfig() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || null;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || null;

  if (process.env.NODE_ENV !== "production" && !hasLoggedSupabaseEnv) {
    hasLoggedSupabaseEnv = true;
    console.log("[supabase env]", {
      hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      hasKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    });
  }

  if (!rawUrl) {
    return { url: null, anonKey };
  }

  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return { url: rawUrl, anonKey };
  }

  return {
    url: `https://${rawUrl}`,
    anonKey,
  };
}

export function hasSupabaseConfig() {
  const { url, anonKey } = readSupabaseConfig();
  return Boolean(url && anonKey);
}

export function createClient() {
  const { url, anonKey } = readSupabaseConfig();

  if (!url || !anonKey) {
    return null;
  }

  return createBrowserClient(url, anonKey);
}
