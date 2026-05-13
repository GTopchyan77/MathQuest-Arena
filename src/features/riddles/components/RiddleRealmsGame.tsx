"use client";

import { Brain, CheckCircle2, Compass, HelpCircle, Landmark, Map, MoveRight, Shapes, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import { getRiddleWorld, riddleWorlds, type RiddlePuzzle, type RiddleWorld, type RiddleWorldId } from "@/features/riddles/data/riddleWorlds";
import { cx } from "@/lib/utils";

const worldIcons = {
  "equation-forest": Brain,
  "number-temple": Landmark,
  "symbol-market": Shapes
} as const;

const worldAccents = {
  "equation-forest": "border-emerald-300/18 bg-emerald-400/10 text-emerald-100",
  "number-temple": "border-amber-300/18 bg-amber-300/12 text-amber-100",
  "symbol-market": "border-violet-300/18 bg-violet-400/12 text-violet-100"
} as const;

export function RiddleRealmsGame() {
  const [selectedWorldId, setSelectedWorldId] = useState<RiddleWorldId | null>(null);
  const [puzzleIndexByWorld, setPuzzleIndexByWorld] = useState<Record<RiddleWorldId, number>>({
    "equation-forest": 0,
    "number-temple": 0,
    "symbol-market": 0
  });
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [revealedHint, setRevealedHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedWorld = useMemo(() => (selectedWorldId ? getRiddleWorld(selectedWorldId) : null), [selectedWorldId]);
  const currentPuzzle = selectedWorld ? selectedWorld.puzzles[puzzleIndexByWorld[selectedWorld.id]] : null;
  const isCorrect = submitted && currentPuzzle ? selectedAnswer === currentPuzzle.correctAnswer : false;

  const selectWorld = (worldId: RiddleWorldId) => {
    setSelectedWorldId(worldId);
    setSelectedAnswer(null);
    setRevealedHint(false);
    setSubmitted(false);
  };

  const handleSubmit = () => {
    if (!selectedAnswer || !currentPuzzle) {
      return;
    }

    setSubmitted(true);
  };

  const handleNextPuzzle = () => {
    if (!selectedWorld) {
      return;
    }

    setPuzzleIndexByWorld((current) => ({
      ...current,
      [selectedWorld.id]: Math.min(current[selectedWorld.id] + 1, selectedWorld.puzzles.length - 1)
    }));
    setSelectedAnswer(null);
    setRevealedHint(false);
    setSubmitted(false);
  };

  const restartWorld = () => {
    if (!selectedWorld) {
      return;
    }

    setPuzzleIndexByWorld((current) => ({
      ...current,
      [selectedWorld.id]: 0
    }));
    setSelectedAnswer(null);
    setRevealedHint(false);
    setSubmitted(false);
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(14,25,48,0.98),rgba(16,24,44,0.92))] p-6 shadow-[0_18px_46px_rgba(2,6,23,0.26)] sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/16 bg-cyan-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-cyan-100">
              <Sparkles className="h-4 w-4" />
              Logic worlds
            </div>
            <h2 className="mt-4 font-[var(--font-sora)] text-[2.15rem] font-extrabold text-white sm:text-[2.5rem]">Riddle Realms</h2>
            <p className="mt-3 max-w-3xl text-base leading-8 text-slate-300">
              Choose a logic world, solve visual riddles, and clear each realm one puzzle at a time.
            </p>
          </div>
          {selectedWorld ? (
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setSelectedWorldId(null)} variant="secondary">
                <Map className="h-4 w-4" /> Change world
              </Button>
              <Button onClick={restartWorld} variant="ghost">
                Restart world
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {!selectedWorld || !currentPuzzle ? (
        <div className="grid gap-5 lg:grid-cols-3">
          {riddleWorlds.map((world) => (
            <WorldCard key={world.id} onSelect={() => selectWorld(world.id)} world={world} />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
          <aside className="rounded-[30px] border border-white/10 bg-[rgba(16,23,42,0.92)] p-6 shadow-[0_16px_40px_rgba(2,6,23,0.24)]">
            <div className="flex items-start gap-4">
              <div className={cx("flex h-14 w-14 items-center justify-center rounded-[18px] border", worldAccents[selectedWorld.id])}>
                {(() => {
                  const Icon = worldIcons[selectedWorld.id];
                  return <Icon className="h-6 w-6" />;
                })()}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">World selected</p>
                <h3 className="mt-2 font-[var(--font-sora)] text-2xl font-extrabold text-white">{selectedWorld.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">{selectedWorld.intro}</p>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] bg-white/[0.04] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Progress</p>
                  <p className="mt-2 text-lg font-black text-white">
                    Puzzle {puzzleIndexByWorld[selectedWorld.id] + 1} of {selectedWorld.puzzles.length}
                  </p>
                </div>
                <Compass className="h-5 w-5 text-cyan-200" />
              </div>
              <div className="mt-4 h-2.5 rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee_0%,#0ea5e9_52%,#8b5cf6_100%)]"
                  style={{ width: `${((puzzleIndexByWorld[selectedWorld.id] + 1) / selectedWorld.puzzles.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="mt-5 rounded-[24px] bg-white/[0.04] p-5">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Riddle type</p>
              <p className="mt-2 text-lg font-black capitalize text-white">{currentPuzzle.type.replace("-", " ")}</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">{selectedWorld.description}</p>
            </div>
          </aside>

          <div className="rounded-[30px] border border-white/10 bg-[rgba(16,23,42,0.92)] p-6 shadow-[0_16px_40px_rgba(2,6,23,0.24)] sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-200">Puzzle prompt</p>
                <h3 className="mt-3 font-[var(--font-sora)] text-[1.9rem] font-extrabold leading-tight text-white">{currentPuzzle.prompt}</h3>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-slate-300">
                {selectedWorld.title}
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,14,28,0.9),rgba(11,18,35,0.86))] p-5 sm:p-6">
              <PuzzleVisual puzzle={currentPuzzle} />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {currentPuzzle.choices.map((choice) => {
                const picked = selectedAnswer === choice.value;
                const revealCorrect = submitted && currentPuzzle.correctAnswer === choice.value;
                const revealWrong = submitted && picked && currentPuzzle.correctAnswer !== choice.value;

                return (
                  <button
                    className={cx(
                      "rounded-[20px] border px-4 py-4 text-left text-base font-bold transition",
                      revealCorrect
                        ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-50"
                        : revealWrong
                          ? "border-rose-300/28 bg-rose-400/10 text-rose-50"
                          : picked
                            ? "border-cyan-300/28 bg-cyan-400/10 text-white"
                            : "border-white/10 bg-white/[0.04] text-slate-100 hover:border-white/16 hover:bg-white/[0.06]"
                    )}
                    disabled={submitted}
                    key={choice.value}
                    onClick={() => setSelectedAnswer(choice.value)}
                    type="button"
                  >
                    {choice.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button className="sm:min-w-[160px]" disabled={!selectedAnswer || submitted} onClick={handleSubmit}>
                Submit
              </Button>
              <Button className="sm:min-w-[140px]" onClick={() => setRevealedHint((current) => !current)} variant="secondary">
                <HelpCircle className="h-4 w-4" /> {revealedHint ? "Hide hint" : "Show hint"}
              </Button>
            </div>

            {revealedHint ? (
              <div className="mt-5 rounded-[22px] bg-cyan-400/10 px-4 py-4 text-sm leading-7 text-cyan-50">
                <span className="font-black text-cyan-100">Hint:</span> {currentPuzzle.hint}
              </div>
            ) : null}

            {submitted ? (
              <div className={cx("mt-5 rounded-[24px] px-5 py-5", isCorrect ? "bg-emerald-400/10 text-emerald-50" : "bg-rose-400/10 text-rose-50")}>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className={cx("mt-0.5 h-5 w-5 shrink-0", isCorrect ? "text-emerald-200" : "text-rose-200")} />
                  <div>
                    <p className="font-[var(--font-sora)] text-xl font-extrabold">{isCorrect ? "Correct!" : "Not quite"}</p>
                    <p className="mt-2 text-sm leading-7">{currentPuzzle.explanation}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <Button disabled={puzzleIndexByWorld[selectedWorld.id] === selectedWorld.puzzles.length - 1} onClick={handleNextPuzzle}>
                    Next puzzle <MoveRight className="h-4 w-4" />
                  </Button>
                  {puzzleIndexByWorld[selectedWorld.id] === selectedWorld.puzzles.length - 1 ? (
                    <p className="mt-3 text-sm font-medium text-slate-200">You cleared every sample puzzle in this world. Pick another realm or restart this one.</p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}

function WorldCard({ onSelect, world }: { onSelect: () => void; world: RiddleWorld }) {
  const Icon = worldIcons[world.id];

  return (
    <button
      className="group rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,23,42,0.94),rgba(13,20,38,0.92))] p-6 text-left shadow-[0_16px_40px_rgba(2,6,23,0.24)] transition hover:-translate-y-0.5 hover:border-cyan-300/18"
      onClick={onSelect}
      type="button"
    >
      <div className={cx("flex h-14 w-14 items-center justify-center rounded-[18px] border", worldAccents[world.id])}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-6 font-[var(--font-sora)] text-[1.8rem] font-extrabold text-white">{world.title}</h3>
      <p className="mt-3 text-base leading-7 text-slate-300">{world.description}</p>
      <div className="mt-5 flex items-center justify-between text-sm font-semibold text-slate-400">
        <span>{world.puzzles.length} sample puzzles</span>
        <span className="text-cyan-100">Enter realm</span>
      </div>
    </button>
  );
}

function PuzzleVisual({ puzzle }: { puzzle: RiddlePuzzle }) {
  if (puzzle.type === "missing-number") {
    const visual = puzzle.visual as { cells: (number | null)[]; shape: "circle-ring" | "row" };

    if ("shape" in visual && visual.shape === "circle-ring") {
      return (
        <div className="flex justify-center py-3">
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            {visual.cells.map((cell, index) => (
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-2xl font-black text-white sm:h-24 sm:w-24"
                key={`${String(cell)}-${index}`}
              >
                {cell ?? "?"}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {visual.cells.map((cell, index) => (
          <div
            className="flex h-18 min-h-[74px] items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.04] text-2xl font-black text-white"
            key={`${String(cell)}-${index}`}
          >
            {cell ?? "?"}
          </div>
        ))}
      </div>
    );
  }

  if (puzzle.type === "symbol-equation") {
    const visual = puzzle.visual as { equations: Array<Array<{ kind: "equals" | "minus" | "plus" | "symbol"; value: string }>> };

    return (
      <div className="grid gap-4">
        {visual.equations.map((equation, index) => (
          <div className="flex flex-wrap items-center justify-center gap-3" key={index}>
            {equation.map((token, tokenIndex) => (
              <div
                className={cx(
                  "flex min-w-[56px] items-center justify-center rounded-[16px] px-4 py-3 text-2xl font-black",
                  token.kind === "symbol" ? "bg-white/[0.05] text-white" : "text-cyan-100"
                )}
                key={`${token.value}-${tokenIndex}`}
              >
                {token.value}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  const visual = puzzle.visual as { cells: (number | string | null)[][] };
  return (
    <div className="grid gap-3">
      {visual.cells.map((row, rowIndex) => (
        <div className="grid grid-cols-3 gap-3" key={rowIndex}>
          {row.map((cell, cellIndex) => (
            <div
              className="flex min-h-[72px] items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.04] text-xl font-black text-white"
              key={`${String(cell)}-${cellIndex}`}
            >
              {cell ?? "?"}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
