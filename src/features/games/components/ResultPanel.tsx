"use client";

import type { Route } from "next";
import Link from "next/link";
import { CheckCircle2, Crown, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/useLocale";
import { Button } from "@/shared/components/ui/Button";
import type { GameResult, PostGameInsights } from "@/lib/types";
import { saveGameResult } from "@/lib/supabase/scores";

type ResultPanelProps = {
  onRestart: () => void;
  result: GameResult;
};

function getBadgeLabel(id: string, t: (key: any) => string) {
  const labels = {
    "first-run": t("badge.first-run.label"),
    "five-runs": t("badge.five-runs.label"),
    "high-scorer": t("badge.high-scorer.label"),
    "streak-starter": t("badge.streak-starter.label"),
    "weekly-streak": t("badge.weekly-streak.label"),
    "xp-climber": t("badge.xp-climber.label"),
    "xp-veteran": t("badge.xp-veteran.label")
  } as const;

  return labels[id as keyof typeof labels] ?? id;
}

function localizeRecommendationReason(reason: string, t: (key: any) => string) {
  const reasons = {
    "Run it again while the pattern is fresh and push accuracy above 70%.": t("progression.reason.retryAccuracy"),
    "This is your weakest recent lane based on saved performance, so it has the biggest upside.": t("progression.reason.weakestLane"),
    "You have not saved a run here yet, so this is the clearest way to broaden your progress.": t("progression.reason.unseenGame")
  } as const;

  return reasons[reason as keyof typeof reasons] ?? reason;
}

function localizeSaveStatus(message: string, t: (key: any) => string) {
  if (!message) {
    return message;
  }

  if (message === "Supabase is not configured yet.") {
    return t("result.error.supabaseMissing");
  }

  if (message === "Log in to save your score.") {
    return t("result.error.loginToSave");
  }

  if (message === "Unable to save score right now.") {
    return t("result.error.unableToSave");
  }

  if (message.startsWith("Score saved.")) {
    return t("result.scoreSaved");
  }

  const rankShiftMatch = message.match(/^Rank shift: #(\d+) to #(\d+)\.$/);
  if (rankShiftMatch) {
    return t("result.error.rankShift")
      .replace("{before}", rankShiftMatch[1])
      .replace("{after}", rankShiftMatch[2]);
  }

  return message;
}

function useAnimatedNumber(value: number, durationMs = 420) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setAnimatedValue(Math.round(value * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    setAnimatedValue(0);
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [durationMs, value]);

  return animatedValue;
}

export function ResultPanel({ onRestart, result }: ResultPanelProps) {
  const { t } = useLocale();
  const [status, setStatus] = useState("");
  const [insights, setInsights] = useState<PostGameInsights | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const response = await saveGameResult(result);
    setSaving(false);
    setStatus(response.message);
    setInsights(response.insights ?? null);
    setSaved(response.ok);
  }

  const isFirstSave = insights?.newlyEarnedBadges.some((badge) => badge.id === "first-run") ?? false;
  const firstBadge = insights?.newlyEarnedBadges[0] ?? null;
  const hasRealXpGain = (insights?.xpGained ?? 0) > 0;
  const localizedStatus = localizeSaveStatus(status, t);
  const recommendedReason = insights ? localizeRecommendationReason(insights.recommendedNextChallenge.reason, t) : "";
  const animatedScore = useAnimatedNumber(result.score);
  const animatedAccuracy = useAnimatedNumber(result.accuracy);
  const leaderboardUnlockMessage =
    insights?.rankAfter !== null && insights?.rankAfter !== undefined
      ? insights.rankBefore === null
        ? t("result.enteredBoard").replace("{rank}", String(insights.rankAfter))
        : insights.rankAfter < insights.rankBefore
          ? t("result.movedUp").replace("{rank}", String(insights.rankAfter))
          : t("result.holdingRank").replace("{rank}", String(insights.rankAfter))
      : t("result.oneMoreRunBoard");

  return (
    <section className="panel-strong rounded-[30px] p-6">
      <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
        <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute left-0 top-0 h-20 w-20 rounded-full bg-violet/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/12 text-emerald-200">
          <CheckCircle2 className="h-7 w-7" />
          </span>
          <div>
            <h2 className="font-[var(--font-sora)] text-2xl font-extrabold text-white">{t("result.title")}</h2>
            <p className="text-sm font-bold text-slate-400">{t("result.subtitle")}</p>
          </div>
          <div className="ml-auto hidden items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-amber-100 sm:inline-flex">
            <Sparkles className="h-3.5 w-3.5" />
            {t("result.rewardReady")}
          </div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label={t("result.score")} value={animatedScore} />
        <Metric label={t("result.correct")} value={`${result.correct}/${result.total}`} />
        <Metric label={t("result.accuracy")} value={`${animatedAccuracy}%`} />
        <Metric label={t("result.bestStreak")} value={result.maxStreak} />
      </div>
      {localizedStatus ? <p className="mt-4 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-bold text-slate-200">{localizedStatus}</p> : null}
      {isFirstSave ? (
        <div className="mt-4 relative overflow-hidden rounded-[24px] border border-emerald-400/20 bg-[linear-gradient(135deg,rgba(16,185,129,0.14),rgba(34,211,238,0.08))] p-5">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-emerald-400/10 blur-3xl" />
          <p className="relative text-xs font-black uppercase tracking-[0.14em] text-emerald-100">{t("result.firstWin")}</p>
          <h3 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">{t("result.firstWinTitle")}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">
            {t("result.firstWinBody")}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label={hasRealXpGain ? t("result.xpGained") : t("result.saveStatus")} value={hasRealXpGain ? `+${insights?.xpGained ?? 0}` : t("result.scoreSaved")} />
            <Metric label={t("result.firstBadge")} value={firstBadge ? getBadgeLabel(firstBadge.id, t) : t("result.unlocked")} />
            <Metric label={t("result.leaderboard")} value={insights?.rankAfter ? `#${insights.rankAfter}` : t("result.nextUp")} />
            <Metric label={t("result.nextUnlock")} value={insights?.recommendedNextChallenge.title ?? t("result.ready")} />
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <RewardStep body={t("result.profileActivatedBody")} step="1" title={t("result.profileActivated")} />
            <RewardStep body={t("result.progressLiveBody")} step="2" title={t("result.progressLive")} />
            <RewardStep body={t("result.leaderboardPushBody")} step="3" title={t("result.leaderboardPush")} />
          </div>
          <p className="mt-4 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-semibold text-slate-100">
            {leaderboardUnlockMessage}
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/dashboard">{t("result.seeProgress")}</Link>
            </Button>
            {insights ? (
              <Button asChild variant="secondary">
                <Link href={insights.recommendedNextChallenge.href as Route<string>}>{t("result.playNext")}</Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
      {insights ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-3 sm:grid-cols-2">
            {hasRealXpGain ? <Metric label={t("result.xpGained")} value={`+${insights.xpGained}`} /> : <Metric label={t("result.saveStatus")} value={t("result.scoreSaved")} />}
            <Metric label={t("result.level")} value={`${insights.levelBefore} -> ${insights.levelAfter}`} />
            <Metric
              label={t("result.vsLastRun")}
              value={
                insights.improvement === null ? t("result.firstSave") : `${insights.improvement >= 0 ? "+" : ""}${insights.improvement}`
              }
            />
            <Metric
              label={t("result.rankMove")}
              value={
                insights.rankAfter === null
                  ? t("result.unranked")
                  : insights.rankBefore === null
                    ? `#${insights.rankAfter}`
                    : `#${insights.rankBefore} -> #${insights.rankAfter}`
              }
            />
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/6 p-4">
            <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{t("result.nextChallenge")}</p>
                <p className="mt-2 font-[var(--font-sora)] text-xl font-extrabold text-white">{insights.recommendedNextChallenge.title}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100">
                <Crown className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-300">{recommendedReason}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {insights.personalBest ? <Tag>{t("result.newPersonalBest")}</Tag> : null}
              <Tag>{t("result.streakDays").replace("{count}", String(insights.currentStreak))}</Tag>
              {insights.newlyEarnedBadges.map((badge) => (
                <Tag key={badge.id}>{getBadgeLabel(badge.id, t)}</Tag>
              ))}
            </div>
            <Button asChild className="mt-4" variant="secondary">
              <Link href={insights.recommendedNextChallenge.href as Route<string>}>{t("result.playNext")}</Link>
            </Button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button className={!saved ? "shadow-[0_24px_80px_rgba(34,211,238,0.34)]" : undefined} disabled={saving || saved} onClick={save} size="lg">
          {saving ? t("auth.form.working") : saved ? t("result.scoreSaved") : t("result.unlockSaveCta")}
        </Button>
        {saved ? (
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-emerald-100 [animation:fadeIn_220ms_ease-out] sm:self-center">
            <CheckCircle2 className="h-4 w-4" />
            {t("result.scoreSaved")}
          </div>
        ) : null}
        <Button onClick={onRestart} variant="secondary">
          {t("result.playAgain")}
        </Button>
        {!saved ? (
          <p className="self-center text-sm font-semibold text-slate-400">{t("result.firstSaveHelper")}</p>
        ) : null}
      </div>
    </section>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-cyan-100">
      {children}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
    </div>
  );
}

function RewardStep({ body, step, title }: { body: string; step: string; title: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/8 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-400/12 text-sm font-black text-emerald-100">
          {step}
        </div>
        <p className="font-black text-white">{title}</p>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{body}</p>
    </div>
  );
}
