import type { GameConfig, GameProgress } from "@/lib/games/engine";

export type SequencePuzzle = {
  answer: number;
  difficulty: number;
  hint: string;
  options: number[];
  patternLabel: string;
  sequence: Array<number | null>;
};

export const missingNumberRounds = 10;

type Pattern = {
  create: (start: number, length: number) => number[];
  difficulty: number;
  hint: string;
  label: string;
  startMax: number;
  startMin: number;
};

const patterns: Pattern[] = [
  {
    create: (start, length) => Array.from({ length }, (_, index) => start + index * 2),
    difficulty: 1,
    hint: "Try counting forward by 2 each time.",
    label: "Skip-count by 2",
    startMax: 8,
    startMin: 1
  },
  {
    create: (start, length) => Array.from({ length }, (_, index) => start + index * 3),
    difficulty: 1,
    hint: "These numbers hop forward by 3.",
    label: "Skip-count by 3",
    startMax: 7,
    startMin: 1
  },
  {
    create: (start, length) => Array.from({ length }, (_, index) => start + index * 5),
    difficulty: 2,
    hint: "Look for a bigger jump: each number grows by 5.",
    label: "Skip-count by 5",
    startMax: 5,
    startMin: 2
  },
  {
    create: (start, length) => Array.from({ length }, (_, index) => start + (index * (index + 1)) / 2),
    difficulty: 2,
    hint: "The jumps get bigger: +1, then +2, then +3...",
    label: "Growing steps",
    startMax: 6,
    startMin: 2
  },
  {
    create: (start, length) => Array.from({ length }, (_, index) => start * 2 ** index),
    difficulty: 3,
    hint: "Each number is double the one before it.",
    label: "Doubling trail",
    startMax: 4,
    startMin: 2
  }
];

export function createSequencePuzzle(progress: Pick<GameProgress, "round" | "difficulty"> | number): SequencePuzzle {
  const round = typeof progress === "number" ? progress : progress.round;
  const difficulty = typeof progress === "number" ? getSequenceDifficulty({ round }) : getSequenceDifficulty(progress);
  const available = patterns.filter((pattern) => pattern.difficulty <= difficulty);
  const pattern = available[Math.floor(Math.random() * available.length)];
  const values = pattern.create(randomInt(pattern.startMin, pattern.startMax), 5);
  const missingIndex = randomInt(1, 3);
  const answer = values[missingIndex];
  const sequence = values.map((value, index) => (index === missingIndex ? null : value));
  const options = createOptions(answer);

  return {
    answer,
    difficulty: pattern.difficulty,
    hint: pattern.hint,
    options,
    patternLabel: pattern.label,
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
    const candidate = Math.max(0, answer + randomInt(-6, 8));
    options.add(candidate);
  }
  return [...options].sort(() => Math.random() - 0.5);
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
