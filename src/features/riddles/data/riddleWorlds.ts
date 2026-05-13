export type RiddleWorldId = "equation-forest" | "number-temple" | "symbol-market";
export type RiddlePuzzleType = "grid-logic" | "missing-number" | "symbol-equation";

export type RiddleOption = {
  label: string;
  value: string;
};

export type MissingNumberVisual = {
  cells: (number | null)[];
  shape: "circle-ring" | "row";
};

export type SymbolEquationVisual = {
  equations: Array<Array<{ kind: "equals" | "minus" | "plus" | "symbol"; value: string }>>;
};

export type GridLogicVisual = {
  cells: (number | string | null)[][];
};

export type RiddlePuzzle = {
  choices: RiddleOption[];
  correctAnswer: string;
  explanationKey: string;
  hintKey: string;
  id: string;
  promptKey: string;
  type: RiddlePuzzleType;
  visual: GridLogicVisual | MissingNumberVisual | SymbolEquationVisual;
};

export type RiddleWorld = {
  descriptionKey: string;
  icon: "forest" | "market" | "temple";
  id: RiddleWorldId;
  introKey: string;
  puzzles: RiddlePuzzle[];
  titleKey: string;
};

export const riddleWorlds: RiddleWorld[] = [
  {
    descriptionKey: "riddles.world.numberTemple.description",
    icon: "temple",
    id: "number-temple",
    introKey: "riddles.world.numberTemple.intro",
    puzzles: [
      {
        choices: [
          { label: "11", value: "11" },
          { label: "12", value: "12" },
          { label: "13", value: "13" },
          { label: "14", value: "14" }
        ],
        correctAnswer: "13",
        explanationKey: "riddles.puzzle.temple1.explanation",
        hintKey: "riddles.puzzle.temple1.hint",
        id: "temple-1",
        promptKey: "riddles.puzzle.temple1.prompt",
        type: "missing-number",
        visual: { cells: [4, 7, 10, null], shape: "row" }
      },
      {
        choices: [
          { label: "18", value: "18" },
          { label: "24", value: "24" },
          { label: "27", value: "27" },
          { label: "30", value: "30" }
        ],
        correctAnswer: "24",
        explanationKey: "riddles.puzzle.temple2.explanation",
        hintKey: "riddles.puzzle.temple2.hint",
        id: "temple-2",
        promptKey: "riddles.puzzle.temple2.prompt",
        type: "missing-number",
        visual: { cells: [3, 6, 12, null], shape: "circle-ring" }
      },
      {
        choices: [
          { label: "16", value: "16" },
          { label: "18", value: "18" },
          { label: "20", value: "20" },
          { label: "22", value: "22" }
        ],
        correctAnswer: "20",
        explanationKey: "riddles.puzzle.temple3.explanation",
        hintKey: "riddles.puzzle.temple3.hint",
        id: "temple-3",
        promptKey: "riddles.puzzle.temple3.prompt",
        type: "missing-number",
        visual: { cells: [8, 10, 14, null], shape: "row" }
      },
      {
        choices: [
          { label: "10", value: "10" },
          { label: "11", value: "11" },
          { label: "12", value: "12" },
          { label: "13", value: "13" }
        ],
        correctAnswer: "12",
        explanationKey: "riddles.puzzle.temple4.explanation",
        hintKey: "riddles.puzzle.temple4.hint",
        id: "temple-4",
        promptKey: "riddles.puzzle.temple4.prompt",
        type: "missing-number",
        visual: { cells: [3, 6, 9, null], shape: "circle-ring" }
      },
      {
        choices: [
          { label: "31", value: "31" },
          { label: "34", value: "34" },
          { label: "37", value: "37" },
          { label: "40", value: "40" }
        ],
        correctAnswer: "34",
        explanationKey: "riddles.puzzle.temple5.explanation",
        hintKey: "riddles.puzzle.temple5.hint",
        id: "temple-5",
        promptKey: "riddles.puzzle.temple5.prompt",
        type: "missing-number",
        visual: { cells: [9, 14, 19, 24, 29, null], shape: "row" }
      }
    ],
    titleKey: "riddles.world.numberTemple.title"
  },
  {
    descriptionKey: "riddles.world.equationForest.description",
    icon: "forest",
    id: "equation-forest",
    introKey: "riddles.world.equationForest.intro",
    puzzles: [
      {
        choices: [
          { label: "4", value: "4" },
          { label: "5", value: "5" },
          { label: "6", value: "6" },
          { label: "7", value: "7" }
        ],
        correctAnswer: "6",
        explanationKey: "riddles.puzzle.forest1.explanation",
        hintKey: "riddles.puzzle.forest1.hint",
        id: "forest-1",
        promptKey: "riddles.puzzle.forest1.prompt",
        type: "symbol-equation",
        visual: {
          equations: [[{ kind: "symbol", value: "X" }, { kind: "plus", value: "+" }, { kind: "symbol", value: "9" }, { kind: "equals", value: "=" }, { kind: "symbol", value: "15" }]]
        }
      },
      {
        choices: [
          { label: "3", value: "3" },
          { label: "4", value: "4" },
          { label: "5", value: "5" },
          { label: "6", value: "6" }
        ],
        correctAnswer: "4",
        explanationKey: "riddles.puzzle.forest2.explanation",
        hintKey: "riddles.puzzle.forest2.hint",
        id: "forest-2",
        promptKey: "riddles.puzzle.forest2.prompt",
        type: "symbol-equation",
        visual: {
          equations: [[{ kind: "symbol", value: "X" }, { kind: "plus", value: "+" }, { kind: "symbol", value: "X" }, { kind: "equals", value: "=" }, { kind: "symbol", value: "8" }]]
        }
      },
      {
        choices: [
          { label: "7", value: "7" },
          { label: "8", value: "8" },
          { label: "9", value: "9" },
          { label: "10", value: "10" }
        ],
        correctAnswer: "9",
        explanationKey: "riddles.puzzle.forest3.explanation",
        hintKey: "riddles.puzzle.forest3.hint",
        id: "forest-3",
        promptKey: "riddles.puzzle.forest3.prompt",
        type: "symbol-equation",
        visual: {
          equations: [[{ kind: "symbol", value: "X" }, { kind: "minus", value: "-" }, { kind: "symbol", value: "5" }, { kind: "equals", value: "=" }, { kind: "symbol", value: "4" }]]
        }
      },
      {
        choices: [
          { label: "10", value: "10" },
          { label: "11", value: "11" },
          { label: "12", value: "12" },
          { label: "13", value: "13" }
        ],
        correctAnswer: "11",
        explanationKey: "riddles.puzzle.forest4.explanation",
        hintKey: "riddles.puzzle.forest4.hint",
        id: "forest-4",
        promptKey: "riddles.puzzle.forest4.prompt",
        type: "symbol-equation",
        visual: {
          equations: [[{ kind: "symbol", value: "3" }, { kind: "plus", value: "+" }, { kind: "symbol", value: "X" }, { kind: "equals", value: "=" }, { kind: "symbol", value: "14" }]]
        }
      },
      {
        choices: [
          { label: "6", value: "6" },
          { label: "8", value: "8" },
          { label: "9", value: "9" },
          { label: "12", value: "12" }
        ],
        correctAnswer: "8",
        explanationKey: "riddles.puzzle.forest5.explanation",
        hintKey: "riddles.puzzle.forest5.hint",
        id: "forest-5",
        promptKey: "riddles.puzzle.forest5.prompt",
        type: "symbol-equation",
        visual: {
          equations: [[{ kind: "symbol", value: "X" }, { kind: "plus", value: "+" }, { kind: "symbol", value: "4" }, { kind: "equals", value: "=" }, { kind: "symbol", value: "12" }]]
        }
      }
    ],
    titleKey: "riddles.world.equationForest.title"
  },
  {
    descriptionKey: "riddles.world.symbolMarket.description",
    icon: "market",
    id: "symbol-market",
    introKey: "riddles.world.symbolMarket.intro",
    puzzles: [
      {
        choices: [
          { label: "3", value: "3" },
          { label: "4", value: "4" },
          { label: "5", value: "5" },
          { label: "6", value: "6" }
        ],
        correctAnswer: "4",
        explanationKey: "riddles.puzzle.market1.explanation",
        hintKey: "riddles.puzzle.market1.hint",
        id: "market-1",
        promptKey: "riddles.puzzle.market1.prompt",
        type: "symbol-equation",
        visual: {
          equations: [[{ kind: "symbol", value: "🍎" }, { kind: "plus", value: "+" }, { kind: "symbol", value: "🍎" }, { kind: "equals", value: "=" }, { kind: "symbol", value: "8" }]]
        }
      },
      {
        choices: [
          { label: "5", value: "5" },
          { label: "6", value: "6" },
          { label: "7", value: "7" },
          { label: "8", value: "8" }
        ],
        correctAnswer: "7",
        explanationKey: "riddles.puzzle.market2.explanation",
        hintKey: "riddles.puzzle.market2.hint",
        id: "market-2",
        promptKey: "riddles.puzzle.market2.prompt",
        type: "symbol-equation",
        visual: {
          equations: [[{ kind: "symbol", value: "🍐" }, { kind: "plus", value: "+" }, { kind: "symbol", value: "2" }, { kind: "equals", value: "=" }, { kind: "symbol", value: "9" }]]
        }
      },
      {
        choices: [
          { label: "10", value: "10" },
          { label: "11", value: "11" },
          { label: "12", value: "12" },
          { label: "13", value: "13" }
        ],
        correctAnswer: "11",
        explanationKey: "riddles.puzzle.market3.explanation",
        hintKey: "riddles.puzzle.market3.hint",
        id: "market-3",
        promptKey: "riddles.puzzle.market3.prompt",
        type: "symbol-equation",
        visual: {
          equations: [
            [{ kind: "symbol", value: "⭐" }, { kind: "equals", value: "=" }, { kind: "symbol", value: "5" }],
            [{ kind: "symbol", value: "🌙" }, { kind: "equals", value: "=" }, { kind: "symbol", value: "6" }],
            [{ kind: "symbol", value: "⭐" }, { kind: "plus", value: "+" }, { kind: "symbol", value: "🌙" }, { kind: "equals", value: "=" }, { kind: "symbol", value: "?" }]
          ]
        }
      },
      {
        choices: [
          { label: "6", value: "6" },
          { label: "7", value: "7" },
          { label: "8", value: "8" },
          { label: "9", value: "9" }
        ],
        correctAnswer: "6",
        explanationKey: "riddles.puzzle.market4.explanation",
        hintKey: "riddles.puzzle.market4.hint",
        id: "market-4",
        promptKey: "riddles.puzzle.market4.prompt",
        type: "grid-logic",
        visual: {
          cells: [
            [1, 2, 3],
            [2, 3, 4],
            [3, 4, 5],
            [4, 5, null]
          ]
        }
      },
      {
        choices: [
          { label: "9", value: "9" },
          { label: "10", value: "10" },
          { label: "11", value: "11" },
          { label: "12", value: "12" }
        ],
        correctAnswer: "10",
        explanationKey: "riddles.puzzle.market5.explanation",
        hintKey: "riddles.puzzle.market5.hint",
        id: "market-5",
        promptKey: "riddles.puzzle.market5.prompt",
        type: "grid-logic",
        visual: {
          cells: [
            [2, 3, 5],
            [4, 5, 9],
            [4, 6, null]
          ]
        }
      }
    ],
    titleKey: "riddles.world.symbolMarket.title"
  }
];

export function getRiddleWorld(id: RiddleWorldId) {
  return riddleWorlds.find((world) => world.id === id) ?? null;
}
