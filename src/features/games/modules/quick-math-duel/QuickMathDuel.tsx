"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CharacterFeedback } from "@/features/games/components/CharacterFeedback";
import { ResultPanel } from "@/features/games/components/ResultPanel";
import { createGameState, finishGame, getGameResult, submitGameAnswer } from "@/lib/games/engine";
import { quickMathDuel } from "@/lib/games/quickMath";
import type { GameResult } from "@/lib/types";

const duration = 60;
type FeedbackTone = "complete" | "correct" | "idle" | "wrong";

export function QuickMathDuel() {
  const [game, setGame] = useState(() => createGameState(quickMathDuel));
  const [timeLeft, setTimeLeft] = useState(duration);
  const [feedbackTone, setFeedbackTone] = useState<FeedbackTone>("idle");
  const feedbackTimer = useRef<number | null>(null);

  useEffect(() => {
    if (game.completed) return;
    const timer = window.setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          setGame((current) => finishGame(current));
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [game.completed]);

  useEffect(() => {
    return () => {
      if (feedbackTimer.current) {
        window.clearTimeout(feedbackTimer.current);
      }
    };
  }, []);

  const result = useMemo<GameResult>(() => getGameResult(quickMathDuel, game), [game]);

  function answer(value: number) {
    setGame((current) => {
      const feedback = submitGameAnswer(quickMathDuel, current, value, undefined);

      if (feedbackTimer.current) {
        window.clearTimeout(feedbackTimer.current);
      }

      const nextTone: FeedbackTone = feedback.completed ? "complete" : feedback.isCorrect ? "correct" : "wrong";
      setFeedbackTone(nextTone);
      feedbackTimer.current = window.setTimeout(() => {
        setFeedbackTone("idle");
      }, feedback.completed ? 2200 : 1200);

      return feedback.state;
    });
  }

  function restart() {
    setGame(createGameState(quickMathDuel));
    setTimeLeft(duration);
    setFeedbackTone("idle");
  }

  if (game.completed) return <ResultPanel onRestart={restart} result={result} />;

  return (
    <section className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
      <aside className="panel rounded-[28px] p-6">
        <p className="surface-label text-rose-200/80">Quick Math Duel</p>
        <div className="mt-5">
          <CharacterFeedback streak={game.streak} tone={feedbackTone} />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Metric label="Time" value={`${timeLeft}s`} />
          <Metric label="Score" value={game.score} />
          <Metric label="Streak" value={game.streak} />
          <Metric label="Correct" value={game.correct} />
        </div>
      </aside>
      <div className="panel-strong rounded-[30px] p-6">
        <p className="text-sm font-bold text-slate-400">Solve before the arena clock runs out.</p>
        <h1 className="mt-5 text-center font-[var(--font-sora)] text-6xl font-extrabold text-white sm:text-7xl">{game.question.expression}</h1>
        <div className="mt-8 grid grid-cols-2 gap-3">
          {game.question.options.map((option) => (
            <button
              className="focus-ring min-h-24 rounded-3xl border border-white/10 bg-white/6 text-3xl font-black text-white transition duration-200 hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(139,92,246,0.12))] hover:shadow-[0_20px_50px_rgba(8,15,38,0.45)]"
              key={option}
              onClick={() => answer(option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </section>
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
