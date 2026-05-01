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
    return <main className="mx-auto max-w-7xl px-4 py-16 text-lg font-bold text-ink/70">{t("protected.loading")}</main>;
  }

  if (!configured) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-3xl border border-ink/8 bg-white p-8 shadow-soft">
          <h1 className="text-3xl font-black text-ink">{t("protected.setupTitle")}</h1>
          <p className="mt-3 leading-7 text-ink/64">{t("protected.setupBody")}</p>
          <Button className="mt-6" href="/games" variant="secondary">
            {t("protected.setupCta")}
          </Button>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-3xl border border-ink/8 bg-white p-8 shadow-soft">
          <h1 className="text-3xl font-black text-ink">{t("protected.loginTitle")}</h1>
          <p className="mt-3 leading-7 text-ink/64">{t("protected.loginBody")}</p>
          <Button asChild className="mt-6">
            <Link href={`/login?next=${encodeURIComponent(pathname)}`}>{t("protected.loginCta")}</Link>
          </Button>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
