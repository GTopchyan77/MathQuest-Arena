"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  Bell,
  Calculator,
  ChevronRight,
  GraduationCap,
  Gamepad2,
  LayoutGrid,
  LogOut,
  Menu,
  Search,
  Sparkles,
  Trophy,
  UserRound,
  X
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLocale } from "@/lib/i18n/useLocale";
import { logout as logoutUser } from "@/lib/supabase/auth";
import { cx } from "@/lib/utils";
import { Button } from "@/shared/components/ui/Button";
import { SiteHeader } from "@/shared/components/layout/SiteHeader";

type AppShellProps = {
  children: ReactNode;
};

type LearnerNavItem = {
  detailKey: "shell.openSection" | "shell.comingSoon";
  href?: Route<string>;
  icon: typeof LayoutGrid;
  key: "shell.nav.overview" | "shell.nav.games" | "shell.nav.dailyChallenge" | "shell.nav.leaderboard" | "shell.nav.profile" | "shell.nav.achievements";
};

type TeacherNavItem = {
  href?: Route<string>;
  icon: typeof LayoutGrid;
  label: string;
};

const shellPrefixes = ["/dashboard", "/games", "/leaderboard", "/profile", "/teacher"];

const navItems: LearnerNavItem[] = [
  { detailKey: "shell.openSection", href: "/dashboard", icon: LayoutGrid, key: "shell.nav.overview" },
  { detailKey: "shell.openSection", href: "/games", icon: Gamepad2, key: "shell.nav.games" },
  { detailKey: "shell.comingSoon", icon: Sparkles, key: "shell.nav.dailyChallenge" },
  { detailKey: "shell.openSection", href: "/leaderboard", icon: Trophy, key: "shell.nav.leaderboard" },
  { detailKey: "shell.openSection", href: "/profile", icon: UserRound, key: "shell.nav.profile" },
  { detailKey: "shell.comingSoon", icon: Award, key: "shell.nav.achievements" }
];

const teacherNavItems: TeacherNavItem[] = [{ href: "/teacher", icon: GraduationCap, label: "Class Overview" }];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLocale();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isShellRoute = useMemo(
    () => shellPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)),
    [pathname]
  );

  async function logout() {
    await logoutUser();
    window.location.href = "/";
  }

  if (!isShellRoute) {
    return (
      <>
        <SiteHeader />
        {children}
      </>
    );
  }

  const displayName = user?.user_metadata?.display_name ?? user?.email?.split("@")[0] ?? "Explorer";
  const initial = displayName.charAt(0).toUpperCase();
  const isTeacherRoute = pathname === "/teacher" || pathname.startsWith("/teacher/");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_24%),radial-gradient(circle_at_top_right,rgba(139,92,246,0.08),transparent_26%),linear-gradient(180deg,rgba(8,12,24,0.96),rgba(5,8,22,1))]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[280px] shrink-0 border-r border-white/8 bg-slate-950/70 px-5 py-5 backdrop-blur-2xl lg:flex lg:flex-col">
          <SidebarContent currentPath={pathname} displayName={displayName} initial={initial} isTeacherRoute={isTeacherRoute} onLogout={logout} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-40 border-b border-white/8 bg-slate-950/55 px-4 py-3 backdrop-blur-2xl sm:px-6">
            <div className="flex items-center gap-3">
              <button
                className="focus-ring rounded-2xl border border-white/10 bg-white/6 p-2 text-slate-100 lg:hidden"
                onClick={() => setSidebarOpen(true)}
                type="button"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[22px] border border-white/10 bg-white/6 px-4 py-3 shadow-[0_18px_45px_rgba(2,8,23,0.28)]">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="truncate text-sm font-medium text-slate-400">
                  {isTeacherRoute ? "Search classes, students, mastery" : t("shell.searchLearner")}
                </span>
                <span className="ml-auto hidden rounded-lg border border-white/10 bg-slate-950/65 px-2 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500 sm:inline-flex">
                  Cmd K
                </span>
              </div>
              <div className="hidden items-center gap-3 sm:flex">
                <div className="rounded-2xl border border-emerald-400/16 bg-emerald-400/10 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-emerald-100">
                  {isTeacherRoute ? "Pilot demo" : t("shell.dailyReady")}
                </div>
                <button className="focus-ring rounded-2xl border border-white/10 bg-white/6 p-3 text-slate-200 transition hover:bg-white/10" type="button">
                  <Bell className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-3 py-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(34,211,238,0.24),rgba(139,92,246,0.3))] text-sm font-black text-white">
                    {initial}
                  </div>
                  <div className="hidden text-left md:block">
                    <p className="text-sm font-black text-white">{displayName}</p>
                    <p className="text-xs font-semibold text-slate-400">{t("shell.playerRole")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm lg:hidden">
          <div className="absolute inset-y-0 left-0 w-[292px] border-r border-white/8 bg-slate-950/95 px-5 py-5">
            <div className="mb-4 flex justify-end">
              <button
                className="focus-ring rounded-2xl border border-white/10 bg-white/6 p-2 text-slate-100"
                onClick={() => setSidebarOpen(false)}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent
              currentPath={pathname}
              displayName={displayName}
              initial={initial}
              isTeacherRoute={isTeacherRoute}
              onItemClick={() => setSidebarOpen(false)}
              onLogout={logout}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SidebarContent({
  currentPath,
  displayName,
  initial,
  isTeacherRoute,
  onItemClick,
  onLogout
}: {
  currentPath: string;
  displayName: string;
  initial: string;
  isTeacherRoute: boolean;
  onItemClick?: () => void;
  onLogout: () => void;
}) {
  const { t } = useLocale();
  const items = isTeacherRoute ? teacherNavItems : navItems;

  return (
    <>
      <Link className="flex items-center gap-3" href="/">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.24),rgba(139,92,246,0.3))] text-cyan-100 shadow-[0_12px_34px_rgba(34,211,238,0.18)]">
          <Calculator className="h-5 w-5" />
        </span>
        <div>
          <p className="font-[var(--font-sora)] text-base font-extrabold text-white">MathQuest Arena</p>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{t("shell.learningOs")}</p>
        </div>
      </Link>

      <div className="mt-8">
        <p className="mb-3 px-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">{t("shell.workspace")}</p>
        <nav className="grid gap-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            const active = item.href ? currentPath === item.href || currentPath.startsWith(`${item.href}/`) : false;
            const isLearnerItem = "key" in item;
            const content = (
              <>
                <span
                  className={cx(
                    "flex h-10 w-10 items-center justify-center rounded-xl border transition",
                    active
                      ? "border-cyan-300/22 bg-cyan-400/12 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.14)]"
                      : "border-white/8 bg-white/6 text-slate-400"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cx("truncate text-sm font-black", active ? "text-white" : "text-slate-200")}>
                    {isLearnerItem ? t(item.key) : item.label}
                  </p>
                  <p className="text-xs font-semibold text-slate-500">
                    {isLearnerItem ? t(item.detailKey) : "Open section"}
                  </p>
                </div>
                <ChevronRight className={cx("h-4 w-4", active ? "text-cyan-200" : "text-slate-600")} />
              </>
            );

            if (item.href) {
              return (
                <Link
                  className={cx(
                    "flex items-center gap-3 rounded-2xl border px-3 py-3 transition",
                    active ? "border-white/12 bg-white/8" : "border-transparent hover:border-white/8 hover:bg-white/5"
                  )}
                  href={item.href}
                  key={isLearnerItem ? item.key : item.label}
                  onClick={onItemClick}
                >
                  {content}
                </Link>
              );
            }

            return (
              <div className="flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 opacity-80" key={isLearnerItem ? item.key : item.label}>
                {content}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="mt-8 rounded-[26px] border border-white/10 bg-white/6 p-4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200/80">{isTeacherRoute ? "Pilot Mode" : t("shell.dailyFocus")}</p>
        <p className="mt-2 font-[var(--font-sora)] text-lg font-extrabold text-white">
          {isTeacherRoute ? "Read-only class insight demo" : t("shell.dailyFocusTitle")}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {isTeacherRoute
            ? "Show class engagement, mastery, and student risk signals without write actions."
            : t("shell.dailyFocusBody")}
        </p>
        <Button className="mt-4 w-full" href={isTeacherRoute ? "/teacher" : "/dashboard"}>
          {isTeacherRoute ? "Open teacher dashboard" : t("shell.dailyFocusCta")}
        </Button>
      </div>

      <div className="mt-auto rounded-[26px] border border-white/10 bg-slate-950/55 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(34,211,238,0.24),rgba(139,92,246,0.3))] text-sm font-black text-white">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white">{displayName}</p>
            <p className="text-xs font-semibold text-slate-500">{t("shell.learnerRole")}</p>
          </div>
        </div>
        <Button className="mt-4 w-full" onClick={onLogout} variant="secondary">
          <LogOut className="h-4 w-4" /> {t("shell.signOut")}
        </Button>
      </div>
    </>
  );
}
