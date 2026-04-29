"use client";

import type { Route } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, BarChart3, CheckCircle2, Clock3, Target, Trophy, Users } from "lucide-react";
import { getTeacherClasses } from "@/lib/teacherData";
import type { TeacherInterventionStudent } from "@/lib/types";

export function TeacherDashboardClient() {
  const teacherClass = getTeacherClasses()[0];
  const classDetailHref = "/teacher/class/1" as Route<string>;

  return (
    <main className="mx-auto max-w-[1440px] p-4 sm:p-6">
      <div className="mb-4 rounded-[24px] border border-amber-300/20 bg-[linear-gradient(135deg,rgba(245,158,11,0.12),rgba(239,68,68,0.08))] px-5 py-4">
        <p className="text-sm font-black uppercase tracking-[0.14em] text-amber-100">Internal Preview</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-200">
          Internal Preview — using demo classroom data. Not for live pilot decisions yet.
        </p>
      </div>

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
            <SummaryCard icon={Target} label="Avg accuracy (participants)" value={`${teacherClass.averageAccuracy}%`} />
            <SummaryCard icon={BarChart3} label="Participation" value={`${teacherClass.participatingStudents}/${teacherClass.roster.length}`} />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-400">
            Participation is shown separately so roster averages do not hide students with no recent evidence.
          </p>
        </div>

        <div className="panel rounded-[30px] p-5">
          <p className="surface-label text-cyan-200/80">Class Actions</p>
          <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">Intervention queue</h2>
          <div className="mt-5 grid gap-3">
            <TeacherLink href={classDetailHref} subtitle="Open roster, mastery, and leaderboard views" title="View class detail" />
            <TeacherInfo title="Inactive students" value={`${teacherClass.studentsInactive.length}`} />
            <TeacherInfo title="Need attention" value={`${teacherClass.studentsNeedingAttention.length}`} />
            <TeacherInfo title="Ready to advance" value={`${teacherClass.studentsReadyToAdvance.length}`} />
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-3">
        <InterventionPanel
          emptyState="No students need a re-engagement nudge right now."
          helper="Students who are not participating enough to generate useful instructional evidence."
          icon={Clock3}
          students={teacherClass.studentsInactive}
          title="Students Inactive"
          tone="cyan"
        />
        <InterventionPanel
          emptyState="No students are signaling immediate practice support needs."
          helper="Students who are playing, but whose recent evidence suggests the teacher should step in."
          icon={AlertTriangle}
          students={teacherClass.studentsNeedingAttention}
          title="Students Needing Attention"
          tone="amber"
        />
        <InterventionPanel
          emptyState="No students have a strong enough signal for stretch work yet."
          helper="Students whose recent results suggest they should move to more demanding work instead of repetition."
          icon={CheckCircle2}
          students={teacherClass.studentsReadyToAdvance}
          title="Students Ready To Advance"
          tone="emerald"
        />
      </section>

      <section className="mt-4 panel rounded-[30px] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="surface-label">Practice Performance</p>
            <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">Game-level recent practice performance</h2>
          </div>
          <BarChart3 className="h-5 w-5 text-cyan-200" />
        </div>
        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          {teacherClass.practicePerformanceOverview.map((item) => (
            <div className="rounded-[24px] border border-white/10 bg-white/6 p-4" key={item.gameSlug}>
              <div className="flex items-center justify-between gap-4">
                <p className="font-black text-white">{item.title}</p>
                <p className="text-sm font-black text-cyan-200">{item.performance}%</p>
              </div>
              <div className="mt-4 h-2.5 rounded-full bg-white/8">
                <div className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee_0%,#0ea5e9_50%,#8b5cf6_100%)]" style={{ width: `${item.performance}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function InterventionPanel({
  emptyState,
  helper,
  icon: Icon,
  students,
  title,
  tone
}: {
  emptyState: string;
  helper: string;
  icon: typeof Users;
  students: TeacherInterventionStudent[];
  title: string;
  tone: "amber" | "cyan" | "emerald";
}) {
  const panelTone = {
    amber: {
      card: "border-amber-300/14 bg-[linear-gradient(135deg,rgba(245,158,11,0.08),rgba(239,68,68,0.06))]",
      icon: "text-amber-200",
      label: "text-amber-200/80"
    },
    cyan: {
      card: "border-cyan-300/14 bg-[linear-gradient(135deg,rgba(34,211,238,0.08),rgba(14,165,233,0.05))]",
      icon: "text-cyan-200",
      label: "text-cyan-200/80"
    },
    emerald: {
      card: "border-emerald-300/14 bg-[linear-gradient(135deg,rgba(16,185,129,0.08),rgba(34,197,94,0.05))]",
      icon: "text-emerald-200",
      label: "text-emerald-200/80"
    }
  };

  return (
    <div className="panel rounded-[30px] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={`surface-label ${panelTone[tone].label}`}>Teacher Action Panel</p>
          <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">{helper}</p>
        </div>
        <Icon className={`h-5 w-5 ${panelTone[tone].icon}`} />
      </div>
      <div className="mt-5 grid gap-3">
        {students.length ? (
          students.map((student) => (
            <div className={`rounded-[24px] border p-4 ${panelTone[tone].card}`} key={student.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-black text-white">{student.displayName}</p>
                    <span className="rounded-full border border-white/10 bg-slate-950/45 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.14em] text-slate-300">
                      {student.priority} priority
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{student.reason}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-3 py-2 text-right">
                  <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-slate-500">Teacher move</p>
                  <p className="mt-1 font-black text-white">{student.actionLabel}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {student.evidence.map((item) => (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-3 py-3" key={item.label}>
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
                    <p className="mt-1 font-black text-white">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 text-sm font-semibold text-slate-300">
                <span>Use this evidence before assigning the next step.</span>
                <Link className="inline-flex items-center gap-2 text-cyan-200 transition hover:text-cyan-100" href="/teacher/class/1">
                  Open class detail <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[24px] border border-white/10 bg-white/6 p-4 text-sm font-semibold text-slate-300">{emptyState}</div>
        )}
      </div>
      <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-slate-500">Derived from demo play evidence</p>
    </div>
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
