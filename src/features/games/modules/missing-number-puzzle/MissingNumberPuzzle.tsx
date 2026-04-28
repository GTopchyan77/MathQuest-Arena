"use client";

import { useMemo, useState } from "react";
import { ResultPanel } from "@/features/games/components/ResultPanel";
import { createGameState, getGameResult, submitGameAnswer } from "@/lib/games/engine";
import { missingNumberPuzzle } from "@/lib/games/missingNumber";
import type { GameResult } from "@/lib/types";

export function MissingNumberPuzzle() {
  const [game, setGame] = useState(() => createGameState(missingNumberPuzzle));

  const result = useMemo<GameResult>(() => getGameResult(missingNumberPuzzle, game), [game]);

  function answer(value: number) {
    setGame((current) => submitGameAnswer(missingNumberPuzzle, current, value, undefined).state);
  }

  function restart() {
    setGame(createGameState(missingNumberPuzzle));
  }

  if (game.completed) return <ResultPanel onRestart={restart} result={result} />;

  return (
    <section className="panel-strong rounded-[30px] p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="surface-label">Round {game.round} of {game.totalRounds}</p>
          <h1 className="mt-2 font-[var(--font-sora)] text-3xl font-extrabold text-white">Find the missing number</h1>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Pill label="Score" value={game.score} />
          <Pill label="Streak" value={game.streak} />
          <Pill label="Level" value={game.question.difficulty} />
        </div>
      </div>
      <div className="mt-8 grid grid-cols-5 gap-2 sm:gap-4">
        {game.question.sequence.map((value, index) => (
          <div
            className={`flex aspect-square items-center justify-center rounded-3xl text-2xl font-black sm:text-4xl ${
              value === null ? "border-2 border-dashed border-[rgba(196,181,253,0.45)] bg-[rgba(167,139,250,0.14)] text-[rgb(237,233,254)]" : "border border-white/10 bg-white/6 text-white"
            }`}
            key={`${value}-${index}`}
          >
            {value ?? "?"}
          </div>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {game.question.options.map((option) => (
          <button
            className="focus-ring min-h-20 rounded-3xl border border-white/10 bg-white/6 text-2xl font-black text-white shadow-[0_16px_35px_rgba(2,8,23,0.25)] transition hover:-translate-y-1 hover:border-[rgba(196,181,253,0.28)] hover:bg-[rgba(167,139,250,0.12)]"
            key={option}
            onClick={() => answer(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
    </section>
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
