import type { GameConfig, GameProgress } from "@/lib/games/engine";

export type QuickQuestion = {
  answer: number;
  difficulty: number;
  expression: string;
  options: number[];
};

const operations = ["+", "-", "x"] as const;

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export function createQuickQuestion(progress: Pick<GameProgress, "difficulty" | "totalAnswered">): QuickQuestion {
  const difficulty = getQuickDifficulty(progress);
  const availableOperations = difficulty === 1 ? operations.slice(0, 2) : operations;
  const operation = availableOperations[Math.floor(Math.random() * availableOperations.length)];
  const addMax = difficulty === 1 ? 35 : difficulty === 2 ? 70 : 120;
  const multiplyMax = difficulty === 1 ? 6 : difficulty === 2 ? 10 : 12;
  const left = operation === "x" ? randomInt(2, multiplyMax) : randomInt(6, addMax);
  const right = operation === "x" ? randomInt(2, multiplyMax) : randomInt(3, Math.floor(addMax / 2));
  const answer = operation === "+" ? left + right : operation === "-" ? left - right : left * right;
  const distractors = new Set<number>();

  while (distractors.size < 3) {
    const offset = randomInt(-8 - difficulty * 4, 8 + difficulty * 4) || difficulty + 2;
    if (answer + offset !== answer) distractors.add(answer + offset);
  }

  return {
    answer,
    difficulty,
    expression: `${left} ${operation} ${right}`,
    options: shuffle([answer, ...distractors])
  };
}

export function scoreQuickAnswer(correct: boolean, streak: number) {
  if (!correct) return 0;
  return 100 + Math.min(streak, 8) * 15;
}

export const quickMathDuel: GameConfig<QuickQuestion, number, undefined> = {
  createQuestion: createQuickQuestion,
  getDifficulty: getQuickDifficulty,
  isCorrectAnswer: (question, answer) => answer === question.answer,
  scoreAnswer: ({ isCorrect, nextStreak }) => scoreQuickAnswer(isCorrect, nextStreak),
  slug: "quick-math-duel"
};

function getQuickDifficulty(progress: Pick<GameProgress, "totalAnswered">) {
  return Math.min(3, 1 + Math.floor(progress.totalAnswered / 8));
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
