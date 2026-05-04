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
import type { MessageKey } from "@/lib/i18n/messages";
import { useLocale } from "@/lib/i18n/useLocale";
import type { TeacherInterventionStudent } from "@/lib/types";

type Translate = (key: MessageKey) => string;

type LocalizedTeacherInterventionStudent = TeacherInterventionStudent & {
  evidence: Array<{
    label: string;
    value: string;
  }>;
  localizedPriority: string;
};

const actionKeyMap: Record<string, MessageKey> = {
  "Assign targeted practice": "teacher.action.assignTargetedPractice",
  "Invite to first session": "teacher.action.inviteFirstSession",
  "Promote to stretch work": "teacher.action.promoteToStretchWork",
  "Re-engage student": "teacher.action.reengageStudent",
  "Re-engage with support": "teacher.action.reengageWithSupport"
};

const reasonKeyMap: Record<string, MessageKey> = {
  "Inactive - previously struggled. Re-entry should include support because the last usable evidence was below target.":
    "teacher.reason.inactivePreviouslyStruggled",
  "Inactive with no recent evidence. The next move is to re-establish participation before making a performance judgment.":
    "teacher.reason.inactiveNoRecentEvidence",
  "No play data yet, so the teacher should first confirm access before judging performance.": "teacher.reason.noPlayData",
  "Student has enough recent evidence across multiple attempts to justify harder work instead of more repetition.":
    "teacher.reason.advance",
  "Student has recent participation, and the latest 3-5 session evidence suggests instruction should shift before disengagement follows.":
    "teacher.reason.practiceSupport"
};

const evidenceLabelKeyMap: Record<string, MessageKey> = {
  "Data status": "teacher.evidence.dataStatus",
  "Last 5 accuracy": "teacher.evidence.last5Accuracy",
  "Last played": "teacher.evidence.lastPlayed",
  "Low recent runs": "teacher.evidence.lowRecentRuns",
  "Play history": "teacher.evidence.playHistory",
  "Prior evidence": "teacher.evidence.priorEvidence",
  "Prior sessions": "teacher.evidence.priorSessions",
  "Recent evidence": "teacher.evidence.recentEvidence",
  "Recent game": "teacher.evidence.recentGame",
  "Recommended move": "teacher.evidence.recommendedMove",
  Trend: "teacher.evidence.trend"
};

const evidenceValueKeyMap: Record<string, MessageKey> = {
  Flat: "teacher.value.flat",
  "Insufficient baseline": "teacher.value.insufficientBaseline",
  "Insufficient data": "teacher.value.insufficientData",
  "No recent game": "teacher.value.noRecentGame",
  "No saved sessions": "teacher.value.noSavedSessions",
  "Verify access and launch support": "teacher.value.verifyAccess"
};

function localizeActionLabel(actionLabel: string, t: Translate) {
  const key = actionKeyMap[actionLabel];
  return key ? t(key) : actionLabel;
}

function localizeReason(reason: string, t: Translate) {
  const key = reasonKeyMap[reason];
  return key ? t(key) : reason;
}

function localizeEvidenceLabel(label: string, t: Translate) {
  const key = evidenceLabelKeyMap[label];
  return key ? t(key) : label;
}

function localizeEvidenceValue(value: string, t: Translate) {
  const key = evidenceValueKeyMap[value];
  if (key) {
    return t(key);
  }

  const daysAgoMatch = value.match(/^(\d+) days ago$/);
  if (daysAgoMatch) {
    return t("teacher.value.daysAgo").replace("{count}", daysAgoMatch[1]);
  }

  const savedMatch = value.match(/^(\d+) saved$/);
  if (savedMatch) {
    return t("teacher.value.savedCount").replace("{count}", savedMatch[1]);
  }

  const last5Match = value.match(/^Last 5 avg (.+)$/);
  if (last5Match) {
    return t("teacher.value.last5Avg").replace("{value}", last5Match[1]);
  }

  const trendMatch = value.match(/^([+-]?\d+) pts$/);
  if (trendMatch) {
    return t("teacher.value.trendPoints").replace("{count}", trendMatch[1]);
  }

  const recentEvidenceMatch = value.match(/^(\d+) sessions across (\d+) day(?:s)?$/);
  if (recentEvidenceMatch) {
    return t("teacher.value.recentEvidence")
      .replace("{sessions}", recentEvidenceMatch[1])
      .replace("{days}", recentEvidenceMatch[2]);
  }

  return value;
}

function localizePriority(priority: TeacherInterventionStudent["priority"], t: Translate) {
  const keyMap: Record<TeacherInterventionStudent["priority"], MessageKey> = {
    high: "teacher.priority.high",
    low: "teacher.priority.low",
    medium: "teacher.priority.medium"
  };

  return t(keyMap[priority]);
}

function localizeInterventionStudent(student: TeacherInterventionStudent, t: Translate): LocalizedTeacherInterventionStudent {
  return {
    ...student,
    actionLabel: localizeActionLabel(student.actionLabel, t),
    evidence: student.evidence.map((item) => ({
      label: localizeEvidenceLabel(item.label, t),
      value: localizeEvidenceValue(item.value, t)
    })),
    localizedPriority: localizePriority(student.priority, t),
    reason: localizeReason(student.reason, t)
  };
}

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
        setError(t("teacher.error.generic"));
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
        setError(t("teacher.error.classData"));
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
  const localizedInactiveStudents = useMemo(
    () => teacherClass?.studentsInactive.map((student) => localizeInterventionStudent(student, t)) ?? [],
    [teacherClass, t]
  );
  const localizedAttentionStudents = useMemo(
    () => teacherClass?.studentsNeedingAttention.map((student) => localizeInterventionStudent(student, t)) ?? [],
    [teacherClass, t]
  );
  const localizedAdvanceStudents = useMemo(
    () => teacherClass?.studentsReadyToAdvance.map((student) => localizeInterventionStudent(student, t)) ?? [],
    [teacherClass, t]
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
              <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">{t("teacher.panel.liveEvidenceFooter")}</p>
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
              helper={t("teacher.dashboard.inactiveHelper")}
              icon={Clock3}
              openClassDetail={t("teacher.panel.openClassDetail")}
              priorityLabel={t("teacher.panel.priority")}
              students={localizedInactiveStudents}
              teacherMoveLabel={t("teacher.panel.teacherMove")}
              title={t("teacher.dashboard.inactiveTitle")}
              tone="cyan"
            />
            <InterventionPanel
              classDetailHref={classDetailHref}
              actionPanelLabel={t("teacher.dashboard.actionPanelLabel")}
              emptyState={t("teacher.dashboard.attentionEmpty")}
              evidenceHint={t("teacher.panel.evidenceHint")}
              helper={t("teacher.dashboard.attentionHelper")}
              icon={AlertTriangle}
              openClassDetail={t("teacher.panel.openClassDetail")}
              priorityLabel={t("teacher.panel.priority")}
              students={localizedAttentionStudents}
              teacherMoveLabel={t("teacher.panel.teacherMove")}
              title={t("teacher.dashboard.attentionTitle")}
              tone="amber"
            />
            <InterventionPanel
              classDetailHref={classDetailHref}
              actionPanelLabel={t("teacher.dashboard.actionPanelLabel")}
              emptyState={t("teacher.dashboard.advanceEmpty")}
              evidenceHint={t("teacher.panel.evidenceHint")}
              helper={t("teacher.dashboard.advanceHelper")}
              icon={CheckCircle2}
              openClassDetail={t("teacher.panel.openClassDetail")}
              priorityLabel={t("teacher.panel.priority")}
              students={localizedAdvanceStudents}
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
  helper: string;
  icon: typeof Users;
  openClassDetail: string;
  priorityLabel: string;
  students: LocalizedTeacherInterventionStudent[];
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
            <div
              className={`rounded-[24px] border p-4 ${panelTone[tone].card} ${
                tone === "amber" || student.priority === "high"
                  ? "shadow-[0_0_0_1px_rgba(251,191,36,0.10),0_18px_50px_rgba(245,158,11,0.10)] animate-[pulse_1.4s_ease-out_2]"
                  : ""
              }`}
              key={student.id}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-black text-white">{student.displayName}</p>
                    <span className="rounded-full border border-white/10 bg-slate-950/45 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.14em] text-slate-300">
                      {priorityLabel.replace("{level}", student.localizedPriority)}
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
