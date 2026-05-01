"use client";

import type { Route } from "next";
import Link from "next/link";
import { AlertTriangle, BarChart3, CheckCircle2, Clock3, Target, Trophy, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  getTeacherClassLive,
  getTeacherClassesLive,
  type TeacherClassOption,
  type TeacherClassSummary
} from "@/lib/supabase/teacher";
import { useLocale } from "@/lib/i18n/useLocale";
import type { TeacherInterventionStudent } from "@/lib/types";

export function TeacherDashboardClient() {
  const { t } = useLocale();
  const [teacherClass, setTeacherClass] = useState<TeacherClassSummary | null>(null);
  const [classes, setClasses] = useState<TeacherClassOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [classesLoading, setClassesLoading] = useState(true);
  const [classLoading, setClassLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadClasses() {
      try {
        setClassesLoading(true);
        setError("");

        const teacherClasses = await getTeacherClassesLive();
        if (!active) return;

        setClasses(teacherClasses);
        setSelectedClassId((currentSelectedId) => {
          if (currentSelectedId && teacherClasses.some((item) => item.id === currentSelectedId)) {
            return currentSelectedId;
          }

          return teacherClasses[0]?.id ?? "";
        });

        if (!teacherClasses.length) {
          setTeacherClass(null);
        }
      } catch (loadError) {
        console.error("[teacher dashboard] Failed to load teacher classes.", loadError);
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : t("teacher.dashboard.errorTitle"));
      } finally {
        if (active) {
          setClassesLoading(false);
        }
      }
    }

    loadClasses();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadSelectedClass() {
      if (!selectedClassId) {
        setTeacherClass(null);
        return;
      }

      try {
        setClassLoading(true);
        setError("");
        const currentClass = await getTeacherClassLive(selectedClassId);
        if (!active) return;

        setTeacherClass(currentClass);
      } catch (loadError) {
        console.error("[teacher dashboard] Failed to load selected class.", loadError);
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : t("teacher.dashboard.errorTitle"));
      } finally {
        if (active) {
          setClassLoading(false);
        }
      }
    }

    loadSelectedClass();

    return () => {
      active = false;
    };
  }, [selectedClassId, t]);

  const loading = classesLoading || classLoading;
  const classDetailHref = teacherClass ? (`/teacher/class/${teacherClass.id}` as Route<string>) : ("/teacher" as Route<string>);
  const selectedClassName = useMemo(
    () => classes.find((item) => item.id === selectedClassId)?.name ?? teacherClass?.name ?? t("teacher.dashboard.noClassSelected"),
    [classes, selectedClassId, teacherClass, t]
  );

  return (
    <main className="mx-auto max-w-[1440px] p-4 sm:p-6">
      <div className="mb-4 rounded-[24px] border border-amber-300/20 bg-[linear-gradient(135deg,rgba(245,158,11,0.12),rgba(239,68,68,0.08))] px-5 py-4">
        <p className="text-sm font-black uppercase tracking-[0.14em] text-amber-100">{t("teacher.preview.title")}</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-200">{t("teacher.preview.body")}</p>
      </div>

      {loading ? (
        <TeacherStatePanel
          body={t("teacher.dashboard.loadingBody")}
          label={t("teacher.dashboard.overviewLabel")}
          title={t("teacher.dashboard.loadingTitle")}
        />
      ) : error ? (
        <TeacherStatePanel body={error} label={t("teacher.dashboard.overviewLabel")} title={t("teacher.dashboard.errorTitle")} tone="amber" />
      ) : !classes.length || !teacherClass ? (
        <TeacherStatePanel
          body={t("teacher.dashboard.noClassesBody")}
          label={t("teacher.dashboard.overviewLabel")}
          title={t("teacher.dashboard.noClassesTitle")}
        />
      ) : (
        <>
          <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="panel-strong rounded-[30px] p-6">
              <p className="surface-label">{t("teacher.dashboard.overviewLabel")}</p>
              <h1 className="mt-3 font-[var(--font-sora)] text-3xl font-extrabold text-white sm:text-4xl">{teacherClass.name}</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">{t("teacher.dashboard.overviewBody")}</p>
              <div className="mt-5 rounded-[24px] border border-white/10 bg-slate-950/45 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{t("teacher.dashboard.selectedClass")}</p>
                <p className="mt-2 text-lg font-black text-white">{selectedClassName}</p>
                <p className="mt-1 text-sm font-semibold text-slate-400">
                  {t("teacher.dashboard.liveEvidenceCount").replace("{count}", String(classes.length))}
                </p>
                <div className="mt-4">
                  <Link
                    className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-400/12 px-4 py-2 text-sm font-black text-cyan-100 transition hover:border-cyan-200/35 hover:bg-cyan-400/18"
                    href={classDetailHref}
                  >
                    {t("teacher.panel.openClassDetail")}
                  </Link>
                </div>
                {classes.length > 1 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {classes.map((item) => {
                      const active = item.id === selectedClassId;

                      return (
                        <button
                          className={`rounded-2xl border px-3 py-2 text-sm font-black transition ${
                            active
                              ? "border-cyan-300/24 bg-cyan-400/12 text-cyan-100"
                              : "border-white/10 bg-white/6 text-slate-200 hover:border-cyan-300/20 hover:bg-white/10"
                          }`}
                          key={item.id}
                          onClick={() => setSelectedClassId(item.id)}
                          type="button"
                        >
                          {item.name}
                          <span className="ml-2 text-slate-400">{item.studentCount}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard icon={Users} label={t("teacher.dashboard.metricStudents")} value={teacherClass.roster.length} />
                <SummaryCard icon={Clock3} label={t("teacher.dashboard.metricPlayedToday")} value={teacherClass.activeToday} />
                <SummaryCard icon={Target} label={t("teacher.dashboard.metricAverageAccuracy")} value={`${teacherClass.averageAccuracy}%`} />
                <SummaryCard icon={BarChart3} label={t("teacher.dashboard.metricParticipation")} value={`${teacherClass.participatingStudents}/${teacherClass.roster.length}`} />
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-400">{t("teacher.dashboard.participationHelper")}</p>
            </div>

            <div className="panel rounded-[30px] p-5">
              <p className="surface-label text-cyan-200/80">{t("teacher.dashboard.actionsLabel")}</p>
              <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">{t("teacher.dashboard.actionsTitle")}</h2>
              <div className="mt-5 grid gap-3">
                <TeacherLink href={classDetailHref} subtitle={t("teacher.dashboard.viewClassSubtitle")} title={t("teacher.dashboard.viewClassTitle")} />
                <TeacherInfo title={t("teacher.dashboard.inactiveTitle")} value={`${teacherClass.studentsInactive.length}`} />
                <TeacherInfo title={t("teacher.dashboard.attentionTitle")} value={`${teacherClass.studentsNeedingAttention.length}`} />
                <TeacherInfo title={t("teacher.dashboard.advanceTitle")} value={`${teacherClass.studentsReadyToAdvance.length}`} />
              </div>
            </div>
          </section>

          <section className="mt-4 grid gap-4 xl:grid-cols-3">
            <InterventionPanel
              classDetailHref={classDetailHref}
              actionPanelLabel={t("teacher.dashboard.actionPanelLabel")}
              emptyState={t("teacher.dashboard.inactiveEmpty")}
              evidenceHint={t("teacher.panel.evidenceHint")}
              footer={t("teacher.panel.liveEvidenceFooter")}
              helper={t("teacher.dashboard.inactiveHelper")}
              icon={Clock3}
              openClassDetail={t("teacher.panel.openClassDetail")}
              priorityLabel={t("teacher.panel.priority")}
              students={teacherClass.studentsInactive}
              teacherMoveLabel={t("teacher.panel.teacherMove")}
              title={t("teacher.dashboard.inactiveTitle")}
              tone="cyan"
            />
            <InterventionPanel
              classDetailHref={classDetailHref}
              actionPanelLabel={t("teacher.dashboard.actionPanelLabel")}
              emptyState={t("teacher.dashboard.attentionEmpty")}
              evidenceHint={t("teacher.panel.evidenceHint")}
              footer={t("teacher.panel.liveEvidenceFooter")}
              helper={t("teacher.dashboard.attentionHelper")}
              icon={AlertTriangle}
              openClassDetail={t("teacher.panel.openClassDetail")}
              priorityLabel={t("teacher.panel.priority")}
              students={teacherClass.studentsNeedingAttention}
              teacherMoveLabel={t("teacher.panel.teacherMove")}
              title={t("teacher.dashboard.attentionTitle")}
              tone="amber"
            />
            <InterventionPanel
              classDetailHref={classDetailHref}
              actionPanelLabel={t("teacher.dashboard.actionPanelLabel")}
              emptyState={t("teacher.dashboard.advanceEmpty")}
              evidenceHint={t("teacher.panel.evidenceHint")}
              footer={t("teacher.panel.liveEvidenceFooter")}
              helper={t("teacher.dashboard.advanceHelper")}
              icon={CheckCircle2}
              openClassDetail={t("teacher.panel.openClassDetail")}
              priorityLabel={t("teacher.panel.priority")}
              students={teacherClass.studentsReadyToAdvance}
              teacherMoveLabel={t("teacher.panel.teacherMove")}
              title={t("teacher.dashboard.advanceTitle")}
              tone="emerald"
            />
          </section>

          <section className="mt-4 panel rounded-[30px] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="surface-label">{t("teacher.dashboard.performanceLabel")}</p>
                <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">{t("teacher.dashboard.performanceTitle")}</h2>
              </div>
              <BarChart3 className="h-5 w-5 text-cyan-200" />
            </div>
            <div className="mt-5 grid gap-4 xl:grid-cols-3">
              {teacherClass.practicePerformanceOverview.length ? (
                teacherClass.practicePerformanceOverview.map((item) => (
                  <div className="rounded-[24px] border border-white/10 bg-white/6 p-4" key={item.gameSlug}>
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-black text-white">{item.title}</p>
                      <p className="text-right text-sm font-black text-cyan-200">
                        {item.performance}%
                        <span className="block text-xs font-semibold text-slate-400">{t("teacher.dashboard.studentsCount").replace("{count}", String(item.participantCount))}</span>
                      </p>
                    </div>
                    <div className="mt-4 h-2.5 rounded-full bg-white/8">
                      <div className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee_0%,#0ea5e9_50%,#8b5cf6_100%)]" style={{ width: `${item.performance}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-white/10 bg-white/6 p-4 text-sm font-semibold text-slate-300">
                  {t("teacher.dashboard.performanceEmpty")}
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
  label,
  title,
  tone = "cyan"
}: {
  body: string;
  label: string;
  title: string;
  tone?: "amber" | "cyan";
}) {
  const styles =
    tone === "amber"
      ? "border-amber-300/16 bg-[linear-gradient(135deg,rgba(245,158,11,0.10),rgba(239,68,68,0.06))]"
      : "border-cyan-300/16 bg-[linear-gradient(135deg,rgba(34,211,238,0.10),rgba(14,165,233,0.06))]";

  return (
    <section className={`rounded-[30px] border p-6 ${styles}`}>
      <p className="surface-label">{label}</p>
      <h1 className="mt-3 font-[var(--font-sora)] text-3xl font-extrabold text-white sm:text-4xl">{title}</h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">{body}</p>
    </section>
  );
}

function InterventionPanel({
  actionPanelLabel,
  classDetailHref,
  emptyState,
  evidenceHint,
  footer,
  helper,
  icon: Icon,
  openClassDetail,
  priorityLabel,
  students,
  teacherMoveLabel,
  title,
  tone
}: {
  actionPanelLabel: string;
  classDetailHref: Route<string>;
  emptyState: string;
  evidenceHint: string;
  footer: string;
  helper: string;
  icon: typeof Users;
  openClassDetail: string;
  priorityLabel: string;
  students: TeacherInterventionStudent[];
  teacherMoveLabel: string;
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
          <p className={`surface-label ${panelTone[tone].label}`}>{actionPanelLabel}</p>
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
                      {priorityLabel.replace("{level}", student.priority)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{student.reason}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-3 py-2 text-right">
                  <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-slate-500">{teacherMoveLabel}</p>
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
                <span>{evidenceHint}</span>
                <Link className="inline-flex items-center gap-2 text-cyan-200 transition hover:text-cyan-100" href={classDetailHref}>
                  {openClassDetail}
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[24px] border border-white/10 bg-white/6 p-4 text-sm font-semibold text-slate-300">{emptyState}</div>
        )}
      </div>
      <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-slate-500">{footer}</p>
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
