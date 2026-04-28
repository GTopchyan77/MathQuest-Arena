"use client";

import { useMemo, useState } from "react";
import { ResultPanel } from "@/features/games/components/ResultPanel";
import { createGameState, getGameResult, submitGameAnswer } from "@/lib/games/engine";
import { mathGridPuzzle } from "@/lib/games/mathGrid";
import type { GameResult } from "@/lib/types";

export function MathGridPuzzle() {
  const [game, setGame] = useState(() => createGameState(mathGridPuzzle));
  const [hintVisible, setHintVisible] = useState(false);

  const result = useMemo<GameResult>(() => getGameResult(mathGridPuzzle, game), [game]);

  function answer(value: number) {
    setGame((current) => submitGameAnswer(mathGridPuzzle, current, value, { usedHint: hintVisible }).state);
    setHintVisible(false);
  }

  function restart() {
    setGame(createGameState(mathGridPuzzle));
    setHintVisible(false);
  }

  if (game.completed) return <ResultPanel onRestart={restart} result={result} />;

  return (
    <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="panel-strong rounded-[30px] p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="surface-label text-emerald-200/80">Grid {game.round} of {game.totalRounds}</p>
            <h1 className="mt-2 font-[var(--font-sora)] text-3xl font-extrabold text-white">Complete the row rule</h1>
          </div>
          <p className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-black text-slate-200">Score {game.score}</p>
        </div>
        <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
          {game.question.grid.map((value, index) => (
            <div
              className={`flex aspect-square items-center justify-center rounded-3xl text-3xl font-black sm:text-5xl ${
                value === null ? "border-2 border-dashed border-emerald-300/45 bg-emerald-400/12 text-emerald-100" : "border border-white/10 bg-white/6 text-white"
              }`}
              key={`${value}-${index}`}
            >
              {value ?? "?"}
            </div>
          ))}
        </div>
      </div>
      <aside className="panel rounded-[30px] p-6">
        <div className="grid grid-cols-3 gap-2">
          <Metric label="Streak" value={game.streak} />
          <Metric label="Correct" value={game.correct} />
          <Metric label="Left" value={(game.totalRounds ?? 0) - game.round + 1} />
        </div>
        <button
          className="focus-ring mt-5 w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-black text-white transition hover:border-cyan-300/24 hover:bg-white/10"
          onClick={() => setHintVisible(true)}
          type="button"
        >
          Reveal hint
        </button>
        {hintVisible ? <p className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm font-bold leading-6 text-emerald-100">{game.question.rule}</p> : null}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {game.question.options.map((option) => (
            <button
              className="focus-ring min-h-20 rounded-3xl border border-white/10 bg-white/6 text-2xl font-black text-white shadow-[0_16px_35px_rgba(2,8,23,0.25)] transition hover:-translate-y-1 hover:border-emerald-300/28 hover:bg-emerald-400/12"
              key={option}
              onClick={() => answer(option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      </aside>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 px-3 py-3 text-center">
      <p className="text-xl font-black text-white">{value}</p>
      <p className="text-[0.66rem] font-black uppercase tracking-[0.12em] text-slate-400">{label}</p>
    </div>
  );
}
