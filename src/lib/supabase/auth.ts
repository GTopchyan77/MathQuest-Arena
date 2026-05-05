"use client";

import { createClient } from "@/lib/supabase/client";

function logAuthError(action: string, error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.error(`[supabase auth] ${action} failed`, error);
  }
}

function toError(error: unknown) {
  if (error instanceof Error) {
    return error;
  }

  return new Error(typeof error === "string" ? error : "Unknown auth error");
}

export async function registerWithEmail(email: string, password: string, displayName: string) {
  const supabase = createClient();

  if (!supabase) {
    return { data: null, error: new Error("Add Supabase credentials to .env.local to enable authentication.") };
  }

  try {
    return await supabase.auth.signUp({
      email,
      options: {
        data: { display_name: displayName || email.split("@")[0] },
        emailRedirectTo: typeof window === "undefined" ? undefined : `${window.location.origin}/login?confirmed=1`
      },
      password
    });
  } catch (error) {
    logAuthError("signUp", error);
    return { data: null, error: toError(error) };
  }
}

export async function loginWithEmail(email: string, password: string) {
  const supabase = createClient();

  if (!supabase) {
    return { data: null, error: new Error("Add Supabase credentials to .env.local to enable authentication.") };
  }

  try {
    return await supabase.auth.signInWithPassword({ email, password });
  } catch (error) {
    logAuthError("signInWithPassword", error);
    return { data: null, error: toError(error) };
  }
}

export async function signInWithGoogle() {
  const supabase = createClient();

  if (!supabase) {
    return { data: null, error: new Error("Add Supabase credentials to .env.local to enable authentication.") };
  }

  try {
    return await supabase.auth.signInWithOAuth({
      options: {
        redirectTo: typeof window === "undefined" ? undefined : `${window.location.origin}/auth/callback`
      },
      provider: "google"
    });
  } catch (error) {
    logAuthError("signInWithOAuth(google)", error);
    return { data: null, error: toError(error) };
  }
}

export async function logout() {
  const supabase = createClient();
  if (!supabase) return;

  try {
    await supabase.auth.signOut();
  } catch (error) {
    logAuthError("signOut", error);
    throw toError(error);
  }
}
