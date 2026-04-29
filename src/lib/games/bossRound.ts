import type { GameConfig, GameProgress } from "@/lib/games/engine";

export type BossQuestion = {
  answer: number;
  attackLabel: string;
  difficulty: number;
  expression: string;
  options: number[];
};

export const bossRoundQuestions = 5;

const operations = ["+", "-", "x"] as const;
const attackLabels = ["Comet Zap", "Spark Sword", "Moon Blast", "Nova Pop"] as const;

export function createBossQuestion(progress: Pick<GameProgress, "round" | "difficulty">): BossQuestion {
  const difficulty = getBossDifficulty(progress);
  const operationPool = difficulty === 1 ? operations.slice(0, 2) : operations;
  const operation = operationPool[randomInt(0, operationPool.length - 1)];
  const addMax = difficulty === 1 ? 20 : difficulty === 2 ? 45 : 72;
  const multiplyMax = difficulty === 1 ? 5 : difficulty === 2 ? 8 : 10;
  const left = operation === "x" ? randomInt(2, multiplyMax) : randomInt(4, addMax);
  const right = operation === "x" ? randomInt(2, multiplyMax) : randomInt(2, Math.floor(addMax / 2));
  const answer = operation === "+" ? left + right : operation === "-" ? left - right : left * right;

  return {
    answer,
    attackLabel: attackLabels[randomInt(0, attackLabels.length - 1)],
    difficulty,
    expression: `${left} ${operation} ${right}`,
    options: createOptions(answer, difficulty)
  };
}

export function scoreBossAnswer(correct: boolean, difficulty: number, streak: number) {
  return correct ? 170 + difficulty * 30 + streak * 20 : 20;
}

export const bossRoundBattle: GameConfig<BossQuestion, number, undefined> = {
  createQuestion: createBossQuestion,
  getDifficulty: getBossDifficulty,
  isCorrectAnswer: (question, answer) => answer === question.answer,
  scoreAnswer: ({ isCorrect, nextStreak, question }) => scoreBossAnswer(isCorrect, question.difficulty, nextStreak),
  slug: "boss-round-battle",
  totalRounds: bossRoundQuestions
};

function getBossDifficulty(progress: Pick<GameProgress, "round">) {
  return Math.min(3, 1 + Math.floor((progress.round - 1) / 2));
}

function createOptions(answer: number, difficulty: number) {
  const options = new Set<number>([answer]);

  while (options.size < 4) {
    const candidate = Math.max(0, answer + randomInt(-5 - difficulty * 2, 6 + difficulty * 3));

    if (candidate !== answer) {
      options.add(candidate);
    }
  }

  return [...options].sort(() => Math.random() - 0.5);
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
