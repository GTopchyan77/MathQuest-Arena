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
      <div className="rounded-3xl border border-ink/8 bg-white p-6 shadow-soft">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-mint">Grid {game.round} of {game.totalRounds}</p>
            <h1 className="mt-2 text-3xl font-black text-ink">Complete the row rule</h1>
          </div>
          <p className="rounded-2xl bg-mist px-4 py-3 text-sm font-black text-ink/62">Score {game.score}</p>
        </div>
        <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
          {game.question.grid.map((value, index) => (
            <div
              className={`flex aspect-square items-center justify-center rounded-3xl text-3xl font-black sm:text-5xl ${
                value === null ? "border-2 border-dashed border-mint bg-mint/10 text-mint" : "bg-mist text-ink"
              }`}
              key={`${value}-${index}`}
            >
              {value ?? "?"}
            </div>
          ))}
        </div>
      </div>
      <aside className="rounded-3xl border border-ink/8 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-3 gap-2">
          <Metric label="Streak" value={game.streak} />
          <Metric label="Correct" value={game.correct} />
          <Metric label="Left" value={(game.totalRounds ?? 0) - game.round + 1} />
        </div>
        <button
          className="focus-ring mt-5 w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 text-sm font-black text-ink transition hover:bg-lemon/24"
          onClick={() => setHintVisible(true)}
          type="button"
        >
          Reveal hint
        </button>
        {hintVisible ? <p className="mt-4 rounded-2xl bg-mint/10 p-4 text-sm font-bold leading-6 text-ink/70">{game.question.rule}</p> : null}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {game.question.options.map((option) => (
            <button
              className="focus-ring min-h-20 rounded-3xl border border-ink/8 bg-white text-2xl font-black shadow-sm transition hover:-translate-y-1 hover:bg-mint/12"
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
    <div className="rounded-2xl bg-mist px-3 py-3 text-center">
      <p className="text-xl font-black">{value}</p>
      <p className="text-[0.66rem] font-black uppercase tracking-[0.12em] text-ink/45">{label}</p>
    </div>
  );
}
