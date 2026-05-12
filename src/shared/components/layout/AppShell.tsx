"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, Bell, BookOpen, Calculator, CircleDot, GraduationCap, LayoutGrid, LogOut, Menu, Search, Settings, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLocale } from "@/lib/i18n/useLocale";
import { logout as logoutUser } from "@/lib/supabase/auth";
import { getCurrentProfile } from "@/lib/supabase/profileRepository";
import { cx } from "@/lib/utils";
import { Button } from "@/shared/components/ui/Button";
import { SiteHeader } from "@/shared/components/layout/SiteHeader";

type AppShellProps = {
  children: ReactNode;
};

type LearnerNavItem = {
  icon: typeof LayoutGrid;
  key: "nav.dashboard" | "shell.nav.achievements" | "shell.nav.learn" | "shell.nav.practice" | "shell.nav.profile";
  secondary?: "comingSoon" | "open";
  detailKey: "shell.openSection" | "shell.comingSoon";
  href?: Route<string>;
};

type TeacherNavItem = {
  href?: Route<string>;
  icon: typeof LayoutGrid;
  detailKey: "shell.openSection";
  key: "nav.teacherDashboard";
};

const shellPrefixes = ["/dashboard", "/games", "/leaderboard", "/profile", "/teacher"];

const navItems: LearnerNavItem[] = [
  { detailKey: "shell.openSection", href: "/dashboard", icon: LayoutGrid, key: "nav.dashboard" },
  { detailKey: "shell.openSection", href: "/profile", icon: UserRound, key: "shell.nav.profile" },
  { detailKey: "shell.comingSoon", icon: Award, key: "shell.nav.achievements" },
  { detailKey: "shell.openSection", href: "/games", icon: BookOpen, key: "shell.nav.learn" },
  { detailKey: "shell.openSection", href: "/games", icon: CircleDot, key: "shell.nav.practice" }
];

const teacherNavItems: TeacherNavItem[] = [{ detailKey: "shell.openSection", href: "/teacher", icon: GraduationCap, key: "nav.teacherDashboard" }];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { configured, loading, user } = useAuth();
  const { t } = useLocale();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTeacherUser, setIsTeacherUser] = useState(false);

  const isShellRoute = useMemo(
    () => shellPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)),
    [pathname]
  );

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

  if (loading || !configured || !user) {
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_22%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.08),transparent_24%),linear-gradient(180deg,rgba(8,13,26,0.98),rgba(5,9,18,1))]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[252px] shrink-0 border-r border-white/6 bg-[rgba(8,12,25,0.76)] px-4 py-5 backdrop-blur-2xl lg:flex lg:flex-col">
          <SidebarContent
            currentPath={pathname}
            displayName={displayName}
            initial={initial}
            isTeacherRoute={isTeacherRoute}
            isTeacherUser={isTeacherUser}
            onLogout={logout}
          />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-40 border-b border-white/8 bg-[rgba(6,10,21,0.78)] px-4 py-3 backdrop-blur-2xl sm:px-6 lg:hidden">
            <div className="mx-auto flex max-w-[1120px] items-center gap-3">
              <button
                className="focus-ring rounded-2xl border border-white/10 bg-white/6 p-2 text-slate-100 lg:hidden"
                onClick={() => setSidebarOpen(true)}
                type="button"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.045] px-4 py-3 shadow-[0_18px_45px_rgba(2,8,23,0.22)]">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="truncate text-sm font-medium text-slate-400">
                  {isTeacherRoute ? t("shell.searchTeacher") : t("shell.searchLearner")}
                </span>
                <span className="ml-auto hidden rounded-lg border border-white/10 bg-slate-950/65 px-2 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500 sm:inline-flex">
                  Cmd K
                </span>
              </div>
              <div className="hidden items-center gap-3 sm:flex">
                <div className="rounded-full border border-emerald-400/16 bg-emerald-400/10 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-emerald-100">
                  {isTeacherRoute ? t("shell.teacherModeBadge") : t("shell.dailyReady")}
                </div>
                <button className="focus-ring rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-slate-200 transition hover:bg-white/[0.08]" type="button">
                  <Bell className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(34,211,238,0.24),rgba(139,92,246,0.3))] text-sm font-black text-white">
                    {initial}
                  </div>
                  <div className="hidden text-left md:block">
                    <p className="text-sm font-black text-white">{displayName}</p>
                    <p className="text-xs font-semibold text-slate-400">{isTeacherRoute ? t("shell.teacherRole") : t("shell.playerRole")}</p>
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
          <div className="absolute inset-y-0 left-0 w-[272px] border-r border-white/8 bg-[rgba(6,10,21,0.95)] px-4 py-5">
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
              isTeacherUser={isTeacherUser}
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
  isTeacherUser,
  onItemClick,
  onLogout
}: {
  currentPath: string;
  displayName: string;
  initial: string;
  isTeacherRoute: boolean;
  isTeacherUser: boolean;
  onItemClick?: () => void;
  onLogout: () => void;
}) {
  const { t } = useLocale();
  const items = isTeacherUser ? [...navItems, ...teacherNavItems] : navItems;

  return (
    <>
      <Link className="flex items-center gap-3" href="/">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/18 bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(99,102,241,0.18))] text-cyan-100 shadow-[0_12px_28px_rgba(34,211,238,0.14)]">
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
            const content = (
              <>
                <span
                  className={cx(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition",
                    active
                      ? "border-cyan-300/22 bg-cyan-400/12 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.14)]"
                      : "border-white/8 bg-white/6 text-slate-400"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cx("text-[15px] font-bold", active ? "text-white" : "text-slate-200")}>{t(item.key)}</p>
                </div>
                {!item.href ? (
                  <span className="shrink-0 rounded-full bg-white/[0.05] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                    {t("shell.comingSoon")}
                  </span>
                ) : null}
              </>
            );

            if (item.href) {
              return (
                <Link
                  className={cx(
                    "box-border flex w-full min-w-0 max-w-full items-center gap-3 overflow-hidden rounded-2xl border px-3 py-3 transition",
                    active ? "border-transparent bg-white/[0.08]" : "border-transparent hover:bg-white/[0.045]"
                  )}
                  href={item.href}
                  key={item.key}
                  onClick={onItemClick}
                >
                  {content}
                </Link>
              );
            }

            return (
              <div
                aria-disabled="true"
                className="box-border flex w-full min-w-0 max-w-full cursor-default items-center gap-3 overflow-hidden rounded-2xl border border-transparent bg-white/[0.025] px-3 py-3 opacity-75"
                key={item.key}
              >
                {content}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto space-y-2 border-t border-white/8 pt-4">
        <div className="flex items-center gap-3 rounded-2xl px-2 py-2 text-slate-300">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] text-slate-300">
            <Settings className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{t("shell.settings")}</p>
            <p className="text-xs font-medium text-slate-500">{t("shell.comingSoon")}</p>
          </div>
        </div>
        <Button className="w-full" onClick={onLogout} variant="secondary">
          <LogOut className="h-4 w-4" /> {t("shell.signOut")}
        </Button>
      </div>
    </>
  );
}
