"use client";

import { Suspense } from "react";
import { AuthForm } from "@/features/auth/components/AuthForm";
import { useLocale } from "@/lib/i18n/useLocale";

export default function LoginPage() {
  const { t } = useLocale();

  return (
    <main className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-md rounded-[30px] border border-white/12 bg-slate-950/72 p-7 shadow-[0_26px_80px_rgba(2,8,23,0.5)] backdrop-blur-2xl">
        <p className="surface-label">{t("auth.login.eyebrow")}</p>
        <h1 className="mt-3 font-[var(--font-sora)] text-3xl font-extrabold text-white">{t("auth.login.title")}</h1>
        <p className="mb-7 mt-3 leading-7 text-slate-300">{t("auth.login.subtitle")}</p>

        <Suspense fallback={<div className="text-slate-300">Loading...</div>}>
          <AuthForm mode="login" />
        </Suspense>
      </section>
    </main>
  );
}