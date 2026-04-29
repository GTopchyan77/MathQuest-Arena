"use client";

import type { Route } from "next";
import Link from "next/link";
import { AlertTriangle, BarChart3, Clock3, Target, Trophy, Users } from "lucide-react";
import { getTeacherClasses } from "@/lib/teacherData";

export function TeacherDashboardClient() {
  const teacherClass = getTeacherClasses()[0];
  const classDetailHref = "/teacher/class/1" as Route<string>;

  return (
    <main className="mx-auto max-w-[1440px] p-4 sm:p-6">
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="panel-strong rounded-[30px] p-6">
          <p className="surface-label">Teacher Overview</p>
          <h1 className="mt-3 font-[var(--font-sora)] text-3xl font-extrabold text-white sm:text-4xl">{teacherClass.name}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            Pilot-ready class view for active play, early struggle signals, and mastery trends across the current math game set.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard icon={Users} label="Students" value={teacherClass.roster.length} />
            <SummaryCard icon={Clock3} label="Played today" value={teacherClass.activeToday} />
            <SummaryCard icon={Target} label="Avg accuracy" value={`${teacherClass.averageAccuracy}%`} />
            <SummaryCard icon={BarChart3} label="Avg mastery" value={`${teacherClass.averageMastery}%`} />
          </div>
        </div>

        <div className="panel rounded-[30px] p-5">
          <p className="surface-label text-cyan-200/80">Class Actions</p>
          <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">Pilot snapshot</h2>
          <div className="mt-5 grid gap-3">
            <TeacherLink href={classDetailHref} subtitle="Open roster, mastery, and leaderboard views" title="View class detail" />
            <TeacherInfo title="Most urgent follow-up" value={teacherClass.strugglingStudents[0]?.displayName ?? "No current flags"} />
            <TeacherInfo title="Highest momentum" value={teacherClass.leaderboard[0]?.displayName ?? "No activity yet"} />
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="panel rounded-[30px] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="surface-label">Who Played Today</p>
              <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">Today&apos;s activity</h2>
            </div>
            <Clock3 className="h-5 w-5 text-cyan-200" />
          </div>
          <div className="mt-5 grid gap-3">
            {teacherClass.whoPlayedToday.map((student) => (
              <div className="rounded-[24px] border border-white/10 bg-white/6 p-4" key={student.id}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-black text-white">{student.displayName}</p>
                    <p className="text-sm font-semibold text-slate-400">{student.gamesPlayed} runs today-ready</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-white">{student.totalXp.toLocaleString()} XP</p>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{student.averageAccuracy}% accuracy</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel rounded-[30px] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="surface-label text-amber-200/80">Struggling Students</p>
              <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">Needs support</h2>
            </div>
            <AlertTriangle className="h-5 w-5 text-amber-200" />
          </div>
          <div className="mt-5 grid gap-3">
            {teacherClass.strugglingStudents.map((student) => (
              <div className="rounded-[24px] border border-amber-300/14 bg-[linear-gradient(135deg,rgba(245,158,11,0.08),rgba(239,68,68,0.06))] p-4" key={student.id}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-black text-white">{student.displayName}</p>
                    <p className="text-sm font-semibold text-slate-300">Recent class average below target</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-white">{student.averageAccuracy}%</p>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{student.timePlayedMinutes} mins played</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-4 panel rounded-[30px] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="surface-label">Mastery Overview</p>
            <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">Game-level class mastery</h2>
          </div>
          <BarChart3 className="h-5 w-5 text-cyan-200" />
        </div>
        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          {teacherClass.masteryOverview.map((item) => (
            <div className="rounded-[24px] border border-white/10 bg-white/6 p-4" key={item.gameSlug}>
              <div className="flex items-center justify-between gap-4">
                <p className="font-black text-white">{item.title}</p>
                <p className="text-sm font-black text-cyan-200">{item.mastery}%</p>
              </div>
              <div className="mt-4 h-2.5 rounded-full bg-white/8">
                <div className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee_0%,#0ea5e9_50%,#8b5cf6_100%)]" style={{ width: `${item.mastery}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number | string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/45 p-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-2xl font-black text-white">{value}</p>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
    </div>
  );
}

function TeacherLink({ href, subtitle, title }: { href: Route<string>; subtitle: string; title: string }) {
  return (
    <Link className="rounded-[24px] border border-white/10 bg-white/6 p-4 transition hover:border-cyan-300/20 hover:bg-white/10" href={href}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-black text-white">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-400">{subtitle}</p>
        </div>
        <Trophy className="h-5 w-5 text-cyan-200" />
      </div>
    </Link>
  );
}

function TeacherInfo({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{title}</p>
      <p className="mt-2 font-black text-white">{value}</p>
    </div>
  );
}
