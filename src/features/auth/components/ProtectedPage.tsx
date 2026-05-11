"use client";

import { ArrowRight, LockKeyhole, Save, TrendingUp, Trophy } from "lucide-react";
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
      <main className="px-4 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-8 lg:px-8 lg:pt-10">
        <div className="mx-auto flex max-w-2xl items-start justify-center">
          <div className="w-full rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.84),rgba(15,23,42,0.68))] px-5 py-6 text-base font-bold text-slate-300 shadow-[0_20px_50px_rgba(2,6,23,0.28)] backdrop-blur-xl sm:px-7 sm:py-7">
            {t("protected.loading")}
          </div>
        </div>
      </main>
    );
  }

  if (!configured) {
    return (
      <main className="px-4 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-8 lg:px-8 lg:pt-10">
        <div className="mx-auto flex max-w-2xl items-start justify-center">
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
      <main className="px-4 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-8 lg:px-8 lg:pt-10">
        <div className="mx-auto flex max-w-5xl items-start justify-center">
          <div className="grid w-full gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-5">
            <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(17,24,39,0.84))] px-5 py-6 shadow-[0_24px_60px_rgba(2,6,23,0.32)] backdrop-blur-xl sm:px-8 sm:py-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-cyan-300/16 bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(99,102,241,0.12))] text-cyan-100 shadow-[0_14px_32px_rgba(34,211,238,0.12)]">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <h1 className="font-[var(--font-sora)] text-2xl font-extrabold text-white sm:text-[2rem]">{t("protected.loginTitle")}</h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">{t("protected.loginBody")}</p>
              <Button asChild className="mt-6 w-full justify-center">
                <Link href={`/login?next=${encodeURIComponent(pathname)}`}>{t("protected.loginCta")}</Link>
              </Button>
            </div>

            <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,13,33,0.95),rgba(12,20,40,0.88))] px-5 py-6 shadow-[0_24px_60px_rgba(2,6,23,0.26)] backdrop-blur-xl sm:px-6 sm:py-6">
              <h2 className="font-[var(--font-sora)] text-xl font-extrabold text-white">{t("protected.unlockTitle")}</h2>
              <div className="mt-4 grid gap-3">
                <UnlockPreviewCard icon={Save} title={t("protected.saveProgressTitle")} body={t("protected.saveProgressBody")} />
                <UnlockPreviewCard icon={TrendingUp} title={t("protected.trackImprovementTitle")} body={t("protected.trackImprovementBody")} />
                <UnlockPreviewCard icon={Trophy} title={t("protected.joinLeaderboardTitle")} body={t("protected.joinLeaderboardBody")} />
              </div>
            </section>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}

function UnlockPreviewCard({
  body,
  icon: Icon,
  title,
}: {
  body: string;
  icon: typeof Save;
  title: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/14 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(59,130,246,0.08))] text-cyan-100">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-black text-white sm:text-base">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-300">{body}</p>
        </div>
        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
      </div>
    </div>
  );
}
