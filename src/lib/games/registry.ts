import type { ComponentType } from "react";
import { MathGridPuzzle } from "@/features/games/modules/math-grid-puzzle/MathGridPuzzle";
import { MissingNumberPuzzle } from "@/features/games/modules/missing-number-puzzle/MissingNumberPuzzle";
import { QuickMathDuel } from "@/features/games/modules/quick-math-duel/QuickMathDuel";
import type { GameSlug } from "@/lib/types";

export const gameRegistry: Record<GameSlug, ComponentType> = {
  "math-grid-puzzle": MathGridPuzzle,
  "missing-number-puzzle": MissingNumberPuzzle,
  "quick-math-duel": QuickMathDuel
};
