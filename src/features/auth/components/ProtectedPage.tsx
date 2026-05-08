"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/shared/components/ui/Button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLocale } from "@/lib/i18n/useLocale";

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { configured, loading, user } = useAuth();
  const { t } = useLocale();
  const pathname = usePathname();

  if (loading) {
    return (
      <main className="px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8 lg:pt-16">
        <div className="mx-auto flex min-h-[calc(100dvh-7rem)] max-w-2xl items-start justify-center">
          <div className="w-full rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.84),rgba(15,23,42,0.68))] px-5 py-6 text-base font-bold text-slate-300 shadow-[0_20px_50px_rgba(2,6,23,0.28)] backdrop-blur-xl sm:px-7 sm:py-7">
            {t("protected.loading")}
          </div>
        </div>
      </main>
    );
  }

  if (!configured) {
    return (
      <main className="px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8 lg:pt-16">
        <div className="mx-auto flex min-h-[calc(100dvh-7rem)] max-w-2xl items-start justify-center">
          <div className="w-full rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(17,24,39,0.82))] px-5 py-6 shadow-[0_24px_60px_rgba(2,6,23,0.32)] backdrop-blur-xl sm:px-8 sm:py-8">
            <h1 className="font-[var(--font-sora)] text-2xl font-extrabold text-white sm:text-[2rem]">{t("protected.setupTitle")}</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">{t("protected.setupBody")}</p>
            <Button className="mt-6 w-full sm:w-auto" href="/games" variant="secondary">
              {t("protected.setupCta")}
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8 lg:pt-16">
        <div className="mx-auto flex min-h-[calc(100dvh-7rem)] max-w-2xl items-start justify-center">
          <div className="w-full rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(17,24,39,0.82))] px-5 py-6 shadow-[0_24px_60px_rgba(2,6,23,0.32)] backdrop-blur-xl sm:px-8 sm:py-8">
            <h1 className="font-[var(--font-sora)] text-2xl font-extrabold text-white sm:text-[2rem]">{t("protected.loginTitle")}</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">{t("protected.loginBody")}</p>
            <Button asChild className="mt-6 w-full sm:w-auto">
            <Link href={`/login?next=${encodeURIComponent(pathname)}`}>{t("protected.loginCta")}</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
