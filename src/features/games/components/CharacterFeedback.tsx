"use client";

import { CheckCircle2, Sparkles, Stars } from "lucide-react";

type CharacterFeedbackProps = {
  streak?: number;
  tone: "complete" | "correct" | "idle" | "wrong";
};

const feedbackMap = {
  idle: {
    accent: "border-cyan-300/16 bg-cyan-400/10 text-cyan-100",
    body: "Pick the answer that feels right and keep the rhythm going.",
    icon: Sparkles,
    label: "Ready",
    shell: "border-white/10 bg-white/6"
  },
  correct: {
    accent: "border-emerald-300/20 bg-emerald-400/14 text-emerald-100",
    body: "Nice one. Keep moving while the pattern is warm.",
    icon: CheckCircle2,
    label: "Correct",
    shell: "border-emerald-300/18 bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(34,211,238,0.08))]"
  },
  wrong: {
    accent: "border-amber-300/20 bg-amber-300/12 text-amber-100",
    body: "Not quite. Take a breath and try the next one.",
    icon: Sparkles,
    label: "Try again",
    shell: "border-amber-300/16 bg-[linear-gradient(135deg,rgba(251,191,36,0.1),rgba(255,255,255,0.04))]"
  },
  complete: {
    accent: "border-violet/20 bg-violet/16 text-[rgb(237,233,254)]",
    body: "Round complete. You built real momentum all the way to the finish.",
    icon: Stars,
    label: "Complete",
    shell: "border-violet/20 bg-[linear-gradient(135deg,rgba(139,92,246,0.16),rgba(34,211,238,0.08))]"
  }
} as const;

export function CharacterFeedback({ streak = 0, tone }: CharacterFeedbackProps) {
  const config = feedbackMap[tone];
  const isCelebrating = tone === "complete" || streak >= 3 || tone === "correct";
  const Icon = config.icon;

  return (
    <div className={`relative overflow-hidden rounded-[28px] border p-5 transition duration-300 ${config.shell}`}>
      <div className={`absolute right-0 top-0 h-24 w-24 rounded-full blur-3xl ${tone === "wrong" ? "bg-amber-300/12" : tone === "complete" ? "bg-violet/18" : "bg-cyan-400/12"}`} />
      <div className="relative flex items-center gap-4">
        <div className="relative">
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-[26px] border transition duration-300 ${config.accent} ${
              isCelebrating ? "scale-105 shadow-[0_0_26px_rgba(34,211,238,0.16)]" : ""
            } ${tone === "wrong" ? "-rotate-3" : "rotate-0"} ${isCelebrating ? "animate-[floatY_1.6s_ease-in-out_infinite]" : ""}`}
          >
            <div className="relative h-11 w-11">
              <span className="absolute left-1/2 top-2 h-2 w-2 -translate-x-[10px] rounded-full bg-current" />
              <span className="absolute left-1/2 top-2 h-2 w-2 translate-x-[2px] rounded-full bg-current" />
              <span
                className={`absolute left-1/2 top-6 h-5 w-8 -translate-x-1/2 border-current ${
                  tone === "wrong"
                    ? "rounded-t-full border-t-2"
                    : "rounded-b-full border-b-2"
                }`}
              />
            </div>
          </div>
          {isCelebrating ? (
            <>
              <span className="absolute -right-1 top-1 text-cyan-200 animate-[ping_1.6s_ease-in-out_infinite]">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="absolute -left-1 bottom-2 text-emerald-200 animate-[floatY_1.8s_ease-in-out_infinite]">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
            </>
          ) : null}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${config.accent}`}>
              <Icon className="h-3.5 w-3.5" />
              {config.label}
            </span>
            {streak >= 3 ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-emerald-100">
                {streak} streak
              </span>
            ) : null}
          </div>
          <p className="mt-3 font-[var(--font-sora)] text-xl font-extrabold text-white">
            {tone === "complete"
              ? "You finished strong."
              : tone === "wrong"
                ? "Gentle reset."
                : streak >= 3
                  ? "Big streak energy."
                  : tone === "correct"
                    ? "That landed."
                    : "Arena buddy ready."}
          </p>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">{config.body}</p>
        </div>
      </div>
    </div>
  );
}
