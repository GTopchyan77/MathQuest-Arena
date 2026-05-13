"use client";

import { Gem, Sparkles, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ResultPanel } from "@/features/games/components/ResultPanel";
import { createGameState, getGameResult, submitGameAnswer } from "@/lib/games/engine";
import { missingNumberPuzzle } from "@/lib/games/missingNumber";
import type { GameResult } from "@/lib/types";

type MascotMood = "cheer" | "oops" | "reward" | "ready";
type AnswerFeedback = { option: number; type: "correct" | "wrong" } | null;

export function MissingNumberPuzzle() {
  const [game, setGame] = useState(() => createGameState(missingNumberPuzzle));
  const [feedback, setFeedback] = useState<string>("Let's build the pattern treasure trail.");
  const [mood, setMood] = useState<MascotMood>("ready");
  const [answerFeedback, setAnswerFeedback] = useState<AnswerFeedback>(null);
  const [rewardCount, setRewardCount] = useState(0);

  const result = useMemo<GameResult>(() => getGameResult(missingNumberPuzzle, game), [game]);

  useEffect(() => {
    if (!answerFeedback) {
      return;
    }

    const timeout = window.setTimeout(() => setAnswerFeedback(null), 650);
    return () => window.clearTimeout(timeout);
  }, [answerFeedback]);

  function answer(value: number) {
    setGame((current) => {
      const feedbackResult = submitGameAnswer(missingNumberPuzzle, current, value, undefined);
      const rewardTriggered = feedbackResult.isCorrect && feedbackResult.state.streak > 0 && feedbackResult.state.streak % 3 === 0;

      setAnswerFeedback({ option: value, type: feedbackResult.isCorrect ? "correct" : "wrong" });

      if (rewardTriggered) {
        setMood("reward");
        setRewardCount((count) => count + 1);
        setFeedback(`Treasure unlocked! ${feedbackResult.state.streak} in a row earns a shiny pattern gem.`);
      } else if (feedbackResult.isCorrect) {
        setMood("cheer");
        setFeedback(`Nice! ${feedbackResult.state.question.patternLabel.toLowerCase()} is becoming your superpower.`);
      } else {
        setMood("oops");
        setFeedback(`Good try. Gentle hint: ${feedbackResult.state.question.hint}`);
      }

      return feedbackResult.state;
    });
  }

  function restart() {
    setGame(createGameState(missingNumberPuzzle));
    setFeedback("Let's build the pattern treasure trail.");
    setMood("ready");
    setRewardCount(0);
  }

  if (game.completed) return <ResultPanel onRestart={restart} result={result} />;

  return (
    <section className="panel-strong rounded-[30px] p-6">
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="surface-label">Round {game.round} of {game.totalRounds}</p>
              <h1 className="mt-2 font-[var(--font-sora)] text-3xl font-extrabold text-white">Find the missing number</h1>
              <p className="mt-2 text-sm font-semibold text-slate-300">Follow the pattern path and help Nova open tiny treasure locks.</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <Pill label="Score" value={game.score} />
              <Pill label="Streak" value={game.streak} />
              <Pill label="Level" value={game.question.difficulty} />
            </div>
          </div>

          <div className="mt-5 rounded-[26px] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.08),rgba(167,139,250,0.12))] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="violet">{game.question.patternLabel}</Badge>
              <Badge tone="cyan">Treasure gems {rewardCount}</Badge>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-5">
              {game.question.sequence.map((value, index) => (
                <SequenceCard key={`${value}-${index}`} value={value} />
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {game.question.options.map((option) => (
              <button
                className={`focus-ring min-h-24 rounded-3xl border border-white/10 bg-white/6 px-3 py-4 text-left text-white shadow-[0_16px_35px_rgba(2,8,23,0.25)] transition hover:-translate-y-1 hover:border-[rgba(196,181,253,0.28)] hover:bg-[rgba(167,139,250,0.12)] ${
                  answerFeedback?.option === option && answerFeedback.type === "correct"
                    ? "[animation:token-pop_520ms_ease-out]"
                    : ""
                } ${answerFeedback?.option === option && answerFeedback.type === "wrong" ? "[animation:gentle-shake_420ms_ease-in-out]" : ""}`}
                key={option}
                onClick={() => answer(option)}
                type="button"
              >
                <div className="text-4xl font-black">{option}</div>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Pattern choice</p>
              </button>
            ))}
          </div>
        </div>

        <aside className="rounded-[26px] border border-white/10 bg-white/[0.05] p-4">
          <MascotCard feedback={feedback} mood={mood} />

          {mood === "reward" ? (
            <div className="mt-4 relative overflow-hidden rounded-[22px] border border-amber-300/20 bg-[linear-gradient(135deg,rgba(251,191,36,0.14),rgba(34,211,238,0.08))] p-4">
              <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-amber-300/12 blur-3xl" />
              <div className="absolute left-4 top-4 h-10 w-10 rounded-full bg-cyan-300/8 blur-2xl" />
              <div className="flex items-center gap-2 text-amber-100">
                <Gem className="h-5 w-5 [animation:treasure-sparkle_1.1s_ease-in-out_infinite]" />
                <p className="text-sm font-black uppercase tracking-[0.14em]">Mini reward</p>
              </div>
              <h2 className="mt-2 font-[var(--font-sora)] text-xl font-extrabold text-white">Treasure lock popped open</h2>
              <p className="mt-2 text-sm leading-6 text-slate-200">Three correct answers in a row earned a gem for Nova's collection.</p>
              <div className="mt-4 flex gap-2">
                {Array.from({ length: Math.min(rewardCount, 5) }, (_, index) => (
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200/20 bg-amber-300/12 shadow-[0_0_18px_rgba(251,191,36,0.16)]" key={index}>
                    <Star className="h-4 w-4 text-amber-100 [animation:treasure-sparkle_1s_ease-in-out_infinite]" style={{ animationDelay: `${index * 90}ms` }} />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-4 rounded-[22px] border border-white/10 bg-white/6 p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">How to spot it</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{game.question.hint}</p>
          </div>

          <div className="mt-4 rounded-[22px] border border-white/10 bg-white/6 p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Treasure trail</p>
            <div className="mt-3 flex gap-2">
              {Array.from({ length: 3 }, (_, index) => {
                const unlocked = game.streak > index;
                return (
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                      unlocked ? "border-emerald-300/30 bg-emerald-400/12 text-emerald-100" : "border-white/10 bg-white/5 text-slate-500"
                    }`}
                    key={index}
                  >
                    {unlocked ? <Gem className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">Fill all three to trigger a tiny celebration.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "cyan" | "violet" }) {
  const toneClass =
    tone === "violet"
      ? "border-violet-300/20 bg-violet-400/12 text-violet-100"
      : "border-cyan-300/20 bg-cyan-400/10 text-cyan-100";

  return <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${toneClass}`}>{children}</span>;
}

function SequenceCard({ value }: { value: number | null }) {
  return (
    <div
      className={`rounded-[26px] border p-4 ${
        value === null ? "border-[rgba(196,181,253,0.45)] bg-[rgba(167,139,250,0.14)] text-[rgb(237,233,254)]" : "border-white/10 bg-white/6 text-white"
      }`}
    >
      <div className="flex min-h-[108px] flex-col items-center justify-center rounded-[20px] border border-white/8 bg-black/10 px-3 py-4 text-center">
        <div className="text-4xl font-black">{value ?? "?"}</div>
        <p className="mt-3 text-[0.68rem] font-black uppercase tracking-[0.14em] text-slate-400">
          {value === null ? "Missing value" : "Sequence value"}
        </p>
      </div>
    </div>
  );
}

function MascotCard({ feedback, mood }: { feedback: string; mood: MascotMood }) {
  const toneClass =
    mood === "reward"
      ? "border-amber-300/20 bg-amber-300/10"
      : mood === "cheer"
        ? "border-emerald-300/20 bg-emerald-400/10"
        : mood === "oops"
          ? "border-rose-300/20 bg-rose-400/10"
          : "border-cyan-300/20 bg-cyan-400/10";

  return (
    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(160deg,rgba(15,23,42,0.4),rgba(30,41,59,0.28))] p-4">
      <div className="flex items-start gap-4">
        <div className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] border ${toneClass}`}>
          <div className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.45),rgba(125,211,252,0.16))] text-lg font-black text-white ${mood === "cheer" ? "[animation:nova-bob_1.8s_ease-in-out_infinite]" : mood === "reward" ? "[animation:nova-bob_1.4s_ease-in-out_infinite]" : "animate-pulse"}`}>
            <div className="absolute inset-x-0 top-[18px] flex justify-center gap-3">
              <span className="h-2 w-2 rounded-full bg-slate-950 [animation:nova-blink_3.4s_ease-in-out_infinite]" />
              <span className="h-2 w-2 rounded-full bg-slate-950 [animation:nova-blink_3.4s_ease-in-out_infinite]" />
            </div>
            <span className="mt-6 text-base">{mood === "reward" ? "◡" : mood === "cheer" ? "‿" : mood === "oops" ? "﹏" : "◠"}</span>
            {mood === "reward" ? <Sparkles className="absolute -right-2 -top-2 h-5 w-5 text-amber-100 [animation:treasure-sparkle_1s_ease-in-out_infinite]" /> : null}
          </div>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Nova the guide</p>
          <h2 className="mt-2 font-[var(--font-sora)] text-xl font-extrabold text-white">
            {mood === "reward" ? "Treasure time!" : mood === "cheer" ? "You got it!" : mood === "oops" ? "Almost there!" : "Ready to play?"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-200">{feedback}</p>
        </div>
      </div>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
      <p className="text-lg font-black text-white">{value}</p>
      <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
    </div>
  );
}

