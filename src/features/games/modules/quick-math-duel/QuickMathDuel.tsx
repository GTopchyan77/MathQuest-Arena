"use client";

import { useEffect, useMemo, useState } from "react";
import { ResultPanel } from "@/features/games/components/ResultPanel";
import { createGameState, finishGame, getGameResult, submitGameAnswer } from "@/lib/games/engine";
import { quickMathDuel } from "@/lib/games/quickMath";
import type { GameResult } from "@/lib/types";

const duration = 60;

export function QuickMathDuel() {
  const [game, setGame] = useState(() => createGameState(quickMathDuel));
  const [timeLeft, setTimeLeft] = useState(duration);

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

  const result = useMemo<GameResult>(() => getGameResult(quickMathDuel, game), [game]);

  function answer(value: number) {
    setGame((current) => submitGameAnswer(quickMathDuel, current, value, undefined).state);
  }

  function restart() {
    setGame(createGameState(quickMathDuel));
    setTimeLeft(duration);
  }

  if (game.completed) return <ResultPanel onRestart={restart} result={result} />;

  return (
    <section className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
      <aside className="panel rounded-[28px] p-6">
        <p className="surface-label text-rose-200/80">Quick Math Duel</p>
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
              className="focus-ring min-h-24 rounded-3xl border border-white/10 bg-white/6 text-3xl font-black text-white transition duration-200 hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-gradient-to-br hover:from-cyan-400/16 hover:to-violet-500/12 hover:shadow-[0_20px_50px_rgba(8,15,38,0.45)]"
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
