"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/useLocale";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfile } from "@/lib/supabase/profileRepository";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { t } = useLocale();

  useEffect(() => {
    let active = true;

    async function handleCallback() {
      const supabase = createClient();
      if (!supabase) {
        router.replace("/login");
        return;
      }

      const code = new URLSearchParams(window.location.search).get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error && process.env.NODE_ENV !== "production") {
          console.error("[auth callback] exchange failed", error);
        }
      }

      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!active) {
        return;
      }

      if (!user) {
        router.replace("/login");
        return;
      }

      const profile = await getCurrentProfile(user.id);

      if (!active) {
        return;
      }

      router.replace(profile?.role === "teacher" ? "/teacher" : "/dashboard");
      router.refresh();
    }

    handleCallback();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-7xl place-items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[30px] border border-white/12 bg-slate-950/72 px-6 py-5 text-sm font-bold text-slate-200 shadow-[0_26px_80px_rgba(2,8,23,0.5)] backdrop-blur-2xl">
        {t("auth.form.working")}
      </div>
    </main>
  );
}
