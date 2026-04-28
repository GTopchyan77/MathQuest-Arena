import type { GameConfig, GameProgress } from "@/lib/games/engine";

export type SequencePuzzle = {
  answer: number;
  difficulty: number;
  options: number[];
  sequence: Array<number | null>;
};

export const missingNumberRounds = 10;

type Pattern = {
  create: (start: number, length: number) => number[];
  difficulty: number;
};

const patterns: Pattern[] = [
  { create: (start, length) => Array.from({ length }, (_, index) => start + index * 3), difficulty: 1 },
  { create: (start, length) => Array.from({ length }, (_, index) => start + index * 5), difficulty: 1 },
  { create: (start, length) => Array.from({ length }, (_, index) => start + index * index), difficulty: 2 },
  { create: (start, length) => Array.from({ length }, (_, index) => start * 2 ** index), difficulty: 3 }
];

export function createSequencePuzzle(progress: Pick<GameProgress, "round" | "difficulty"> | number): SequencePuzzle {
  const round = typeof progress === "number" ? progress : progress.round;
  const difficulty = typeof progress === "number" ? getSequenceDifficulty({ round }) : getSequenceDifficulty(progress);
  const available = patterns.filter((pattern) => pattern.difficulty <= difficulty);
  const pattern = available[Math.floor(Math.random() * available.length)];
  const values = pattern.create(randomInt(2, 9), 5);
  const missingIndex = randomInt(1, 3);
  const answer = values[missingIndex];
  const sequence = values.map((value, index) => (index === missingIndex ? null : value));
  const options = createOptions(answer);

  return {
    answer,
    difficulty: pattern.difficulty,
    options,
    sequence
  };
}

export function scoreSequenceAnswer(correct: boolean, difficulty: number, streak: number) {
  return correct ? 140 + difficulty * 30 + streak * 10 : 10;
}

export const missingNumberPuzzle: GameConfig<SequencePuzzle, number, undefined> = {
  createQuestion: createSequencePuzzle,
  getDifficulty: getSequenceDifficulty,
  isCorrectAnswer: (question, answer) => answer === question.answer,
  scoreAnswer: ({ isCorrect, nextStreak, question }) => scoreSequenceAnswer(isCorrect, question.difficulty, nextStreak),
  slug: "missing-number-puzzle",
  totalRounds: missingNumberRounds
};

function getSequenceDifficulty(progress: Pick<GameProgress, "round">) {
  return Math.min(3, 1 + Math.floor((progress.round - 1) / 3));
}

function createOptions(answer: number) {
  const options = new Set([answer]);
  while (options.size < 4) {
    options.add(answer + randomInt(-9, 12));
  }
  return [...options].sort(() => Math.random() - 0.5);
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
