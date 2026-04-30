"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLocale } from "@/lib/i18n/useLocale";
import { Button } from "@/shared/components/ui/Button";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";
import { loginWithEmail, registerWithEmail } from "@/lib/supabase/auth";

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
  const [handlingConfirmation, setHandlingConfirmation] = useState(false);

  const isRegister = mode === "register";
  const confirmationCode = searchParams.get("code");
  const isConfirmedRedirect = searchParams.get("confirmed") === "1";

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, router, user]);

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

      router.replace("/dashboard");
      router.refresh();
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

    if (!hasSupabaseConfig()) {
      setError(t("auth.form.envMissing"));
      return;
    }

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

    router.push(isRegister ? "/games/quick-math-duel" : "/dashboard");
    router.refresh();
  }

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      {isRegister ? (
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
