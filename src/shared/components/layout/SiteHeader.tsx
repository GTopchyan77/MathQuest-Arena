"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, LogOut, Menu, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { logout as logoutUser } from "@/lib/supabase/auth";
import { locales, type Locale } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/useLocale";
import { getCurrentProfile } from "@/lib/supabase/profileRepository";
import { Button } from "@/shared/components/ui/Button";

const localeLabels: Record<Locale, string> = {
  en: "EN",
  hy: "\u0540\u0561\u0575",
  ru: "RU"
};

const baseLinks: Array<{ href: Route<string>; key: "nav.dashboard" | "nav.games" | "nav.leaderboard" | "nav.profile" }> = [
  { href: "/dashboard", key: "nav.dashboard" },
  { href: "/games", key: "nav.games" },
  { href: "/leaderboard", key: "nav.leaderboard" },
  { href: "/profile", key: "nav.profile" }
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const [isTeacherUser, setIsTeacherUser] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadRole() {
      if (!user?.id) {
        if (active) {
          setIsTeacherUser(false);
        }
        return;
      }

      const profile = await getCurrentProfile(user.id);
      if (active) {
        setIsTeacherUser(profile?.role === "teacher");
      }
    }

    loadRole();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const links = useMemo(
    () =>
      isTeacherUser
        ? [...baseLinks, { href: "/teacher" as Route<string>, key: "nav.teacherDashboard" as const }]
        : baseLinks,
    [isTeacherUser]
  );

  async function logout() {
    await logoutUser();
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(6,10,21,0.78)] backdrop-blur-2xl">
      <div className="mx-auto grid h-[78px] max-w-[1360px] grid-cols-[auto_1fr_auto] items-center gap-8 px-5 sm:gap-10 sm:px-6 lg:gap-12 lg:px-8">
        <Link className="flex items-center gap-3 font-black text-white" href="/">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/18 bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(99,102,241,0.18))] text-cyan-100 shadow-[0_12px_28px_rgba(34,211,238,0.14)]">
            <Calculator className="h-5 w-5" />
          </span>
          <span className="font-[var(--font-sora)] text-base tracking-wide sm:text-lg">MathQuest Arena</span>
        </Link>

        <nav className="hidden justify-self-center rounded-full border border-white/10 bg-white/[0.04] p-1.5 md:flex md:items-center md:gap-2">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                className={`rounded-full px-4 py-2 text-[15px] font-bold transition ${
                  active
                    ? "bg-white/[0.1] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                    : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                }`}
                href={link.href}
                key={link.href}
              >
                {t(link.key)}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center justify-self-end gap-4 lg:gap-5 md:flex">
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
            {locales.map((value) => (
              <button
                className={`rounded-full px-2.5 py-1.5 text-xs font-black transition ${
                  locale === value ? "bg-white/[0.12] text-white" : "text-slate-400 hover:bg-white/[0.08] hover:text-white"
                }`}
                key={value}
                onClick={() => setLocale(value)}
                type="button"
              >
                {localeLabels[value]}
              </button>
            ))}
          </div>
          {user ? (
            <Button onClick={logout} variant="secondary">
              <LogOut className="h-4 w-4" /> {t("nav.logout")}
            </Button>
          ) : (
            <>
              <Button href="/login" variant="ghost">
                {t("nav.login")}
              </Button>
              <Button className="min-w-[116px]" href="/register">{t("nav.register")}</Button>
            </>
          )}
        </div>

        <button className="focus-ring rounded-2xl border border-white/10 bg-white/[0.05] p-2 text-slate-100 md:hidden" onClick={() => setOpen((value) => !value)} type="button">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-[rgba(6,10,21,0.92)] px-4 py-4 backdrop-blur-2xl md:hidden">
          <nav className="grid gap-2">
            {links.map((link) => (
              <Link className="rounded-2xl px-4 py-3 font-bold text-slate-200 hover:bg-white/[0.08]" href={link.href} key={link.href} onClick={() => setOpen(false)}>
                {t(link.key)}
              </Link>
            ))}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400">{t("nav.language")}</p>
              <div className="grid grid-cols-3 gap-2">
                {locales.map((value) => (
                  <button
                    className={`rounded-2xl px-3 py-2 text-sm font-black transition ${
                      locale === value ? "bg-white/[0.12] text-white" : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white"
                    }`}
                    key={value}
                    onClick={() => setLocale(value)}
                    type="button"
                  >
                    {localeLabels[value]}
                  </button>
                ))}
              </div>
            </div>
            {user ? (
              <Button onClick={logout} variant="secondary">
                {t("nav.logout")}
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="secondary">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    {t("nav.login")}
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/register" onClick={() => setOpen(false)}>
                    {t("nav.register")}
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
