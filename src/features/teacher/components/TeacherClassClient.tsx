"use client";

import Link from "next/link";
import { BarChart3, Clock3, Medal, Target, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { getTeacherClassLive, type TeacherClassSummary } from "@/lib/supabase/teacher";

export function TeacherClassClient({ classId }: { classId: string }) {
  const [teacherClass, setTeacherClass] = useState<TeacherClassSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const currentClass = await getTeacherClassLive(classId);
        if (!active) return;
        setTeacherClass(currentClass);
      } catch (loadError) {
        console.error("[teacher class] Failed to load class detail.", loadError);
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load class details right now.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [classId]);

  return (
    <main className="mx-auto max-w-[1440px] p-4 sm:p-6">
      <div className="mb-4 rounded-[24px] border border-amber-300/20 bg-[linear-gradient(135deg,rgba(245,158,11,0.12),rgba(239,68,68,0.08))] px-5 py-4">
        <p className="text-sm font-black uppercase tracking-[0.14em] text-amber-100">Internal Preview</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-200">
          Internal Preview - using live classroom data in read-only pilot mode. Not for live pilot decisions yet.
        </p>
      </div>

      <div className="mb-4">
        <Link className="text-sm font-semibold text-cyan-200 transition hover:text-cyan-100" href="/teacher">
          Back to teacher dashboard
        </Link>
      </div>

      {loading ? (
        <TeacherStatePanel
          body="Loading live class roster, leaderboard, and practice performance."
          title="Loading class detail"
        />
      ) : error ? (
        <TeacherStatePanel body={error} title="Unable to load class detail" tone="amber" />
      ) : !teacherClass ? (
        <TeacherStatePanel
          body="This class was not found, or you do not have access to it in the current read-only pilot view."
          title="Class unavailable"
        />
      ) : (
        <>
          <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="panel-strong rounded-[30px] p-6">
              <p className="surface-label">Class Detail</p>
              <h1 className="mt-3 font-[var(--font-sora)] text-3xl font-extrabold text-white sm:text-4xl">{teacherClass.name}</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                Read-only pilot view for roster participation, recent accuracy evidence, and class-level practice performance.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <TopMetric icon={Users} label="Roster" value={teacherClass.roster.length} />
                <TopMetric icon={Target} label="Accuracy (participants)" value={`${teacherClass.averageAccuracy}%`} />
                <TopMetric icon={Clock3} label="Played today" value={teacherClass.activeToday} />
                <TopMetric icon={BarChart3} label="Participation" value={`${teacherClass.participatingStudents}/${teacherClass.roster.length}`} />
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-400">
                Accuracy is based on students with saved evidence. Participation is shown separately so non-participants stay visible.
              </p>
            </div>

            <div className="panel rounded-[30px] p-5">
              <p className="surface-label text-cyan-200/80">Class Leaderboard</p>
              <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">Top XP</h2>
              <div className="mt-5 grid gap-3">
                {teacherClass.leaderboard.length ? (
                  teacherClass.leaderboard.slice(0, 3).map((entry) => (
                    <div className="rounded-[24px] border border-white/10 bg-white/6 p-4" key={entry.displayName}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-amber-100">
                            <Medal className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-black text-white">{entry.displayName}</p>
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Rank #{entry.rank}</p>
                          </div>
                        </div>
                        <p className="font-black text-white">{entry.totalXp.toLocaleString()} XP</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-white/10 bg-white/6 p-4 text-sm font-semibold text-slate-300">
                    No saved student scores yet. The leaderboard will appear once the class starts playing.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="panel rounded-[30px] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="surface-label">Roster</p>
                  <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">Accuracy by student</h2>
                </div>
                <Users className="h-5 w-5 text-cyan-200" />
              </div>
              <div className="mt-5 grid gap-3">
                {teacherClass.roster.length ? (
                  teacherClass.roster.map((student) => {
                    const notStarted = student.gamesPlayed === 0;

                    return (
                      <div className="rounded-[24px] border border-white/10 bg-white/6 p-4" key={student.id}>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-black text-white">{student.displayName}</p>
                            <p className="text-sm font-semibold text-slate-400">
                              {notStarted ? "Not started" : `${student.gamesPlayed} runs saved`}
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-3 md:min-w-[340px]">
                            <Stat label="Accuracy" value={notStarted ? "No evidence yet" : `${student.averageAccuracy}%`} />
                            <Stat label="Duration" value="Not tracked yet" />
                            <Stat label="Best" value={notStarted ? "Not started" : student.bestScore.toLocaleString()} />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-[24px] border border-white/10 bg-white/6 p-4 text-sm font-semibold text-slate-300">
                    No students are enrolled in this class yet.
                  </div>
                )}
              </div>
            </div>

            <div className="panel rounded-[30px] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="surface-label text-emerald-200/80">Practice Performance</p>
                  <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">Recent practice performance by game</h2>
                </div>
                <BarChart3 className="h-5 w-5 text-cyan-200" />
              </div>
              <div className="mt-5 grid gap-4">
                {teacherClass.practicePerformanceOverview.length ? (
                  teacherClass.practicePerformanceOverview.map((item) => (
                    <div className="rounded-[24px] border border-white/10 bg-white/6 p-4" key={item.gameSlug}>
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-black text-white">{item.title}</p>
                        <p className="text-right font-black text-cyan-200">
                          {item.performance}%
                          <span className="block text-xs font-semibold text-slate-400">{item.participantCount} students</span>
                        </p>
                      </div>
                      <div className="mt-4 h-2.5 rounded-full bg-white/8">
                        <div className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee_0%,#0ea5e9_50%,#8b5cf6_100%)]" style={{ width: `${item.performance}%` }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-white/10 bg-white/6 p-4 text-sm font-semibold text-slate-300">
                    No saved game performance yet. This view will fill in once the class generates live play data.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="mt-4 panel rounded-[30px] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="surface-label text-amber-200/80">Class Leaderboard</p>
                <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">Read-only rank snapshot</h2>
              </div>
              <Trophy className="h-5 w-5 text-amber-200" />
            </div>
            <div className="mt-5 grid gap-3">
              {teacherClass.leaderboard.length ? (
                teacherClass.leaderboard.map((entry) => (
                  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-[24px] border border-white/10 bg-white/6 px-4 py-4" key={entry.displayName}>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/55 text-sm font-black text-white">
                      #{entry.rank}
                    </div>
                    <p className="font-black text-white">{entry.displayName}</p>
                    <p className="font-black text-cyan-100">{entry.totalXp.toLocaleString()} XP</p>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-white/10 bg-white/6 p-4 text-sm font-semibold text-slate-300">
                  No ranked students yet. Save data will populate this snapshot automatically.
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function TeacherStatePanel({
  body,
  title,
  tone = "cyan"
}: {
  body: string;
  title: string;
  tone?: "amber" | "cyan";
}) {
  const styles =
    tone === "amber"
      ? "border-amber-300/16 bg-[linear-gradient(135deg,rgba(245,158,11,0.10),rgba(239,68,68,0.06))]"
      : "border-cyan-300/16 bg-[linear-gradient(135deg,rgba(34,211,238,0.10),rgba(14,165,233,0.06))]";

  return (
    <section className={`rounded-[30px] border p-6 ${styles}`}>
      <p className="surface-label">Class Detail</p>
      <h1 className="mt-3 font-[var(--font-sora)] text-3xl font-extrabold text-white sm:text-4xl">{title}</h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">{body}</p>
    </section>
  );
}

function TopMetric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number | string }) {
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-3 py-3 text-center">
      <p className="font-black text-white">{value}</p>
      <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
    </div>
  );
}
