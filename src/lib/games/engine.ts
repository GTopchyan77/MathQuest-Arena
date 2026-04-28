import type { GameResult, GameSlug } from "@/lib/types";

export type GameProgress = {
  correct: number;
  difficulty: number;
  maxStreak: number;
  round: number;
  score: number;
  streak: number;
  totalAnswered: number;
  totalRounds?: number;
};

export type GameState<TQuestion> = GameProgress & {
  completed: boolean;
  question: TQuestion;
};

export type ScoreInput<TQuestion, TAnswer, TMeta> = {
  answer: TAnswer;
  isCorrect: boolean;
  meta: TMeta;
  nextStreak: number;
  progress: GameProgress;
  question: TQuestion;
};

export type GameConfig<TQuestion, TAnswer, TMeta = undefined> = {
  createQuestion: (progress: GameProgress) => TQuestion;
  getDifficulty?: (progress: GameProgress) => number;
  isCorrectAnswer: (question: TQuestion, answer: TAnswer) => boolean;
  scoreAnswer: (input: ScoreInput<TQuestion, TAnswer, TMeta>) => number;
  slug: GameSlug;
  totalRounds?: number;
};

export type AnswerFeedback<TQuestion> = {
  completed: boolean;
  isCorrect: boolean;
  points: number;
  state: GameState<TQuestion>;
};

export function createGameState<TQuestion, TAnswer, TMeta>(
  config: GameConfig<TQuestion, TAnswer, TMeta>
): GameState<TQuestion> {
  const progress: GameProgress = {
    correct: 0,
    difficulty: 1,
    maxStreak: 0,
    round: 1,
    score: 0,
    streak: 0,
    totalAnswered: 0,
    totalRounds: config.totalRounds
  };

  const difficulty = getNextDifficulty(config, progress);
  const hydratedProgress = { ...progress, difficulty };

  return {
    ...hydratedProgress,
    completed: false,
    question: config.createQuestion(hydratedProgress)
  };
}

export function submitGameAnswer<TQuestion, TAnswer, TMeta>(
  config: GameConfig<TQuestion, TAnswer, TMeta>,
  state: GameState<TQuestion>,
  answer: TAnswer,
  meta: TMeta
): AnswerFeedback<TQuestion> {
  if (state.completed) {
    return { completed: true, isCorrect: false, points: 0, state };
  }

  const isCorrect = config.isCorrectAnswer(state.question, answer);
  const nextStreak = isCorrect ? state.streak + 1 : 0;
  const points = config.scoreAnswer({
    answer,
    isCorrect,
    meta,
    nextStreak,
    progress: state,
    question: state.question
  });
  const totalAnswered = state.totalAnswered + 1;
  const completed = Boolean(config.totalRounds && totalAnswered >= config.totalRounds);
  const nextRound = config.totalRounds ? Math.min(state.round + 1, config.totalRounds) : state.round + 1;
  const progress: GameProgress = {
    correct: state.correct + (isCorrect ? 1 : 0),
    difficulty: state.difficulty,
    maxStreak: Math.max(state.maxStreak, nextStreak),
    round: nextRound,
    score: state.score + points,
    streak: nextStreak,
    totalAnswered,
    totalRounds: config.totalRounds
  };
  const difficulty = getNextDifficulty(config, progress);
  const nextProgress = { ...progress, difficulty };

  return {
    completed,
    isCorrect,
    points,
    state: {
      ...nextProgress,
      completed,
      question: completed ? state.question : config.createQuestion(nextProgress)
    }
  };
}

export function finishGame<TQuestion>(state: GameState<TQuestion>): GameState<TQuestion> {
  return { ...state, completed: true };
}

export function getGameResult<TQuestion, TAnswer, TMeta>(
  config: GameConfig<TQuestion, TAnswer, TMeta>,
  state: GameState<TQuestion>
): GameResult {
  const total = config.totalRounds ?? state.totalAnswered;

  return {
    accuracy: total ? Math.round((state.correct / total) * 100) : 0,
    correct: state.correct,
    gameSlug: config.slug,
    maxStreak: state.maxStreak,
    score: state.score,
    total
  };
}

function getNextDifficulty<TQuestion, TAnswer, TMeta>(
  config: GameConfig<TQuestion, TAnswer, TMeta>,
  progress: GameProgress
) {
  return config.getDifficulty ? config.getDifficulty(progress) : 1;
}
