"use client";

import type { Route } from "next";
import Link from "next/link";
import { Calculator, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { logout as logoutUser } from "@/lib/supabase/auth";

const links: Array<{ href: Route<string>; label: string }> = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/games", label: "Games" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/profile", label: "Profile" }
];

export function SiteHeader() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  async function logout() {
    await logoutUser();
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/55 backdrop-blur-2xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3 font-black text-white" href="/">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.25),rgba(139,92,246,0.3))] text-cyan-100 shadow-[0_12px_40px_rgba(34,211,238,0.18)]">
            <Calculator className="h-6 w-6" />
          </span>
          <span className="font-[var(--font-sora)] text-base tracking-wide">MathQuest Arena</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link className="rounded-2xl px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/8 hover:text-white" href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Button onClick={logout} variant="secondary">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          ) : (
            <>
              <Button href="/login" variant="ghost">
                Login
              </Button>
              <Button href="/register">Register</Button>
            </>
          )}
        </div>
        <button className="focus-ring rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-100 md:hidden" onClick={() => setOpen((value) => !value)} type="button">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-white/10 bg-slate-950/90 px-4 py-4 md:hidden">
          <nav className="grid gap-2">
            {links.map((link) => (
              <Link className="rounded-2xl px-4 py-3 font-bold text-slate-200 hover:bg-white/8" href={link.href} key={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            {user ? (
              <Button onClick={logout} variant="secondary">
                Logout
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="secondary">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/register" onClick={() => setOpen(false)}>
                    Register
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
