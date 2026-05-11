"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { GraduationCap, Sparkles } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLocale } from "@/lib/i18n/useLocale";
import { Button } from "@/shared/components/ui/Button";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";
import { loginWithEmail, registerWithEmail, signInWithGoogle } from "@/lib/supabase/auth";
import { getCurrentProfile } from "@/lib/supabase/profileRepository";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading: authLoading, user } = useAuth();
  const { t } = useLocale();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [handlingConfirmation, setHandlingConfirmation] = useState(false);

  const isRegister = mode === "register";
  const confirmationCode = searchParams.get("code");
  const isConfirmedRedirect = searchParams.get("confirmed") === "1";

  async function redirectForRole(userId: string, learnerFallback: "/dashboard" | "/games/quick-math-duel" = "/dashboard") {
    const profile = await getCurrentProfile(userId);
    const destination = profile?.role === "teacher" ? "/teacher" : learnerFallback;
    router.replace(destination);
    router.refresh();
  }

  useEffect(() => {
    if (authLoading || !user?.id) {
      return;
    }

    redirectForRole(user.id).catch(() => {
      router.replace("/dashboard");
      router.refresh();
    });
  }, [authLoading, router, user?.id]);

  useEffect(() => {
    if (isRegister || !isConfirmedRedirect) {
      return;
    }

    if (!confirmationCode) {
      setMessage(t("auth.form.confirmed"));
      return;
    }

    const supabaseClient = createClient();
    if (!supabaseClient) {
      setMessage(t("auth.form.confirmed"));
      return;
    }
    const client = supabaseClient;

    const code = confirmationCode;
    if (!code) {
      setMessage(t("auth.form.confirmed"));
      return;
    }

    let cancelled = false;

    async function handleConfirmation() {
      setHandlingConfirmation(true);

      const { error: exchangeError } = await client.auth.exchangeCodeForSession(code);

      if (cancelled) {
        return;
      }

      setHandlingConfirmation(false);

      if (exchangeError) {
        if (process.env.NODE_ENV !== "production") {
          console.error("[auth form] confirmation exchange failed", exchangeError);
        }

        setMessage(t("auth.form.confirmed"));
        return;
      }

      const {
        data: { user: confirmedUser }
      } = await client.auth.getUser();

      if (!confirmedUser?.id) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      redirectForRole(confirmedUser.id).catch(() => {
        router.replace("/dashboard");
        router.refresh();
      });
    }

    handleConfirmation();

    return () => {
      cancelled = true;
    };
  }, [confirmationCode, isConfirmedRedirect, isRegister, router, t]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");


    setLoading(true);
    let response;

    try {
      response = isRegister
        ? await registerWithEmail(email, password, displayName)
        : await loginWithEmail(email, password);
    } catch (error) {
      const authError = error instanceof Error ? error : new Error("Unknown auth error");

      if (process.env.NODE_ENV !== "production") {
        console.error("[auth form] submit failed", authError);
      }

      setLoading(false);
      setError(authError.message);
      return;
    }

    setLoading(false);

    if (response.error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[auth form] Supabase auth error", response.error);
      }

      setError(response.error.message);
      return;
    }

    if (isRegister && !response.data.session) {
      setMessage(t("auth.form.createdNeedsConfirm"));
      return;
    }

    if (response.data.user?.id) {
      redirectForRole(response.data.user.id, isRegister ? "/games/quick-math-duel" : "/dashboard").catch(() => {
        router.push(isRegister ? "/games/quick-math-duel" : "/dashboard");
        router.refresh();
      });
      return;
    }

    router.push(isRegister ? "/games/quick-math-duel" : "/dashboard");
    router.refresh();
  }

  async function onGoogleSignIn() {
    setError("");
    setMessage("");

    setOauthLoading(true);
    const response = await signInWithGoogle();
    setOauthLoading(false);

    if (response.error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[auth form] Google OAuth failed", response.error);
      }

      setError(response.error.message);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      {isRegister ? (
        <>
          <div className="grid gap-3">
            <p className="text-sm font-bold text-slate-200">{t("auth.form.accountType")}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] border border-cyan-300/18 bg-cyan-400/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/18 bg-cyan-400/10 text-cyan-100">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-cyan-300/18 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100">
                    {t("auth.form.studentDefault")}
                  </span>
                </div>
                <p className="mt-4 font-[var(--font-sora)] text-lg font-extrabold text-white">{t("auth.form.student")}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{t("auth.form.studentDescription")}</p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-slate-100">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-amber-300/16 bg-amber-300/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-100">
                    {t("auth.form.teacherSetupRequired")}
                  </span>
                </div>
                <p className="mt-4 font-[var(--font-sora)] text-lg font-extrabold text-white">{t("auth.form.teacher")}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{t("auth.form.teacherDescription")}</p>
              </div>
            </div>
          </div>

          <label className="grid gap-2 text-sm font-bold text-slate-200">
            {t("auth.form.displayName")}
            <input
              className="focus-ring h-12 rounded-2xl border border-white/10 bg-white/6 px-4 font-medium text-white outline-none transition placeholder:text-slate-500"
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder={t("auth.form.displayNamePlaceholder")}
              type="text"
              value={displayName}
            />
          </label>
        </>
      ) : null}
      <label className="grid gap-2 text-sm font-bold text-slate-200">
        {t("auth.form.email")}
        <input
          className="focus-ring h-12 rounded-2xl border border-white/10 bg-white/6 px-4 font-medium text-white outline-none transition placeholder:text-slate-500"
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t("auth.form.emailPlaceholder")}
          required
          type="email"
          value={email}
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-slate-200">
        {t("auth.form.password")}
        <input
          className="focus-ring h-12 rounded-2xl border border-white/10 bg-white/6 px-4 font-medium text-white outline-none transition placeholder:text-slate-500"
          minLength={6}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={t("auth.form.passwordPlaceholder")}
          required
          type="password"
          value={password}
        />
      </label>
      {error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-400/12 px-4 py-3 text-sm font-bold text-rose-200">{error}</p> : null}
      {message ? <p className="rounded-2xl border border-emerald-400/20 bg-emerald-400/12 px-4 py-3 text-sm font-bold text-emerald-100">{message}</p> : null}
      {isRegister && message && !error ? (
        <Button asChild size="lg" variant="secondary">
          <Link href="/login">{t("auth.form.goToLogin")}</Link>
        </Button>
      ) : null}
      <Button
        disabled={loading || oauthLoading || handlingConfirmation || authLoading}
        onClick={onGoogleSignIn}
        size="lg"
        type="button"
        variant="secondary"
      >
        {oauthLoading ? t("auth.form.working") : t("auth.form.continueGoogle")}
      </Button>
      <Button disabled={loading || handlingConfirmation || authLoading} size="lg" type="submit">
        {loading ? t("auth.form.working") : isRegister ? t("auth.form.createAccount") : t("auth.form.logIn")}
      </Button>
      <p className="text-center text-sm font-semibold text-slate-400">
        {isRegister ? t("auth.form.alreadyRegistered") : t("auth.form.newHere")}{" "}
        <Link className="text-cyan-200 hover:text-cyan-100 hover:underline" href={isRegister ? "/login" : "/register"}>
          {isRegister ? t("auth.form.logIn") : t("auth.form.createAccountLink")}
        </Link>
      </p>
    </form>
  );
}
