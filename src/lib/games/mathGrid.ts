import type { GameConfig, GameProgress } from "@/lib/games/engine";

export type GridPuzzle = {
  answer: number;
  difficulty: number;
  grid: Array<number | null>;
  options: number[];
  rule: string;
};

export type GridAnswerMeta = {
  usedHint: boolean;
};

export const mathGridRounds = 8;

export function createGridPuzzle(progress: Pick<GameProgress, "round" | "difficulty"> | number): GridPuzzle {
  const round = typeof progress === "number" ? progress : progress.round;
  const difficulty = typeof progress === "number" ? getGridDifficulty({ round }) : getGridDifficulty(progress);
  const useMultiplication = difficulty > 1 && Math.random() > 0.45;
  const rows = Array.from({ length: 3 }, () => {
    const a = randomInt(2, useMultiplication ? 6 + difficulty * 2 : 12 + difficulty * 6);
    const b = randomInt(2, useMultiplication ? 6 + difficulty * 2 : 12 + difficulty * 6);
    return [a, b, useMultiplication ? a * b : a + b];
  });
  const missingRow = randomInt(0, 2);
  const answer = rows[missingRow][2];
  const grid = rows.flat() as Array<number | null>;
  grid[missingRow * 3 + 2] = null;

  return {
    answer,
    difficulty,
    grid,
    options: createOptions(answer),
    rule: useMultiplication ? "Each row multiplies the first two values." : "Each row adds the first two values."
  };
}

export function scoreGridAnswer(correct: boolean, streak: number, usedHint: boolean) {
  return correct ? Math.max(80, 180 + streak * 20 - (usedHint ? 40 : 0)) : 15;
}

export const mathGridPuzzle: GameConfig<GridPuzzle, number, GridAnswerMeta> = {
  createQuestion: createGridPuzzle,
  getDifficulty: getGridDifficulty,
  isCorrectAnswer: (question, answer) => answer === question.answer,
  scoreAnswer: ({ isCorrect, nextStreak, meta }) => scoreGridAnswer(isCorrect, nextStreak, meta.usedHint),
  slug: "math-grid-puzzle",
  totalRounds: mathGridRounds
};

function getGridDifficulty(progress: Pick<GameProgress, "round">) {
  return Math.min(3, 1 + Math.floor((progress.round - 1) / 3));
}

function createOptions(answer: number) {
  const options = new Set([answer]);
  while (options.size < 4) {
    options.add(Math.max(1, answer + randomInt(-10, 14)));
  }
  return [...options].sort(() => Math.random() - 0.5);
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
