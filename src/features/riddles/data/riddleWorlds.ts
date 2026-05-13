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
  explanation: string;
  hint: string;
  id: string;
  prompt: string;
  type: RiddlePuzzleType;
  visual: GridLogicVisual | MissingNumberVisual | SymbolEquationVisual;
};

export type RiddleWorld = {
  description: string;
  icon: "forest" | "market" | "temple";
  id: RiddleWorldId;
  intro: string;
  puzzles: RiddlePuzzle[];
  title: string;
};

export const riddleWorlds: RiddleWorld[] = [
  {
    description: "Missing numbers, patterns, and circle riddles.",
    icon: "temple",
    id: "number-temple",
    intro: "Ancient number locks guard each chamber. Spot the hidden rule and open the path.",
    puzzles: [
      {
        choices: [
          { label: "11", value: "11" },
          { label: "12", value: "12" },
          { label: "13", value: "13" },
          { label: "14", value: "14" }
        ],
        correctAnswer: "13",
        explanation: "Each step increases by 3: 4, 7, 10, 13.",
        hint: "Look at the difference between each number.",
        id: "temple-1",
        prompt: "Which number completes the staircase pattern?",
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
        explanation: "The pattern doubles each time: 3, 6, 12, 24.",
        hint: "Each number is twice the one before it.",
        id: "temple-2",
        prompt: "The temple ring follows one repeating jump. What belongs in the final chamber?",
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
        explanation: "The pattern adds 2, then 4, then 6: 8, 10, 14, 20.",
        hint: "The step size grows each time.",
        id: "temple-3",
        prompt: "Find the missing value in the growing-step pattern.",
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
        explanation: "Go around the ring by adding 3 each time: 3, 6, 9, 12.",
        hint: "Each number around the ring is 3 more than the one before it.",
        id: "temple-4",
        prompt: "What number completes the final temple ring?",
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
        explanation: "Each number is 5 more than the one before it: 9, 14, 19, 24, 29, 34.",
        hint: "Add the same amount each time.",
        id: "temple-5",
        prompt: "Choose the final key number for the temple path.",
        type: "missing-number",
        visual: { cells: [9, 14, 19, 24, 29, null], shape: "row" }
      }
    ],
    title: "Number Temple"
  },
  {
    description: "Unknown values, box equations, and balanced math.",
    icon: "forest",
    id: "equation-forest",
    intro: "The forest gates open when each equation stays in balance. Solve the unknown and move on.",
    puzzles: [
      {
        choices: [
          { label: "4", value: "4" },
          { label: "5", value: "5" },
          { label: "6", value: "6" },
          { label: "7", value: "7" }
        ],
        correctAnswer: "6",
        explanation: "If x + 9 = 15, then x must be 6.",
        hint: "Think about what number plus 9 equals 15.",
        id: "forest-1",
        prompt: "What value belongs in the box?",
        type: "symbol-equation",
        visual: {
          equations: [[{ kind: "symbol", value: "x" }, { kind: "plus", value: "+" }, { kind: "symbol", value: "9" }, { kind: "equals", value: "=" }, { kind: "symbol", value: "15" }]]
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
        explanation: "Two boxes make 8, so one box is 4.",
        hint: "Split 8 into two equal parts.",
        id: "forest-2",
        prompt: "The balanced gate has two equal boxes. What is one box worth?",
        type: "symbol-equation",
        visual: {
          equations: [[{ kind: "symbol", value: "x" }, { kind: "plus", value: "+" }, { kind: "symbol", value: "x" }, { kind: "equals", value: "=" }, { kind: "symbol", value: "8" }]]
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
        explanation: "If x - 5 = 4, then x = 9.",
        hint: "Undo the subtraction.",
        id: "forest-3",
        prompt: "Which value keeps the forest equation balanced?",
        type: "symbol-equation",
        visual: {
          equations: [[{ kind: "symbol", value: "x" }, { kind: "minus", value: "-" }, { kind: "symbol", value: "5" }, { kind: "equals", value: "=" }, { kind: "symbol", value: "4" }]]
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
        explanation: "3 + x = 14, so x = 11.",
        hint: "What number added to 3 gives 14?",
        id: "forest-4",
        prompt: "Find the hidden number in the branch equation.",
        type: "symbol-equation",
        visual: {
          equations: [[{ kind: "symbol", value: "3" }, { kind: "plus", value: "+" }, { kind: "symbol", value: "x" }, { kind: "equals", value: "=" }, { kind: "symbol", value: "14" }]]
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
        explanation: "If x + 4 = 12, then x = 8.",
        hint: "What is 12 minus 4?",
        id: "forest-5",
        prompt: "Solve the final box to clear Equation Forest.",
        type: "symbol-equation",
        visual: {
          equations: [[{ kind: "symbol", value: "x" }, { kind: "plus", value: "+" }, { kind: "symbol", value: "4" }, { kind: "equals", value: "=" }, { kind: "symbol", value: "12" }]]
        }
      }
    ],
    title: "Equation Forest"
  },
  {
    description: "Fruit, icons, and symbol equation puzzles.",
    icon: "market",
    id: "symbol-market",
    intro: "Each market stall swaps numbers for symbols. Read the clues and solve the final trade.",
    puzzles: [
      {
        choices: [
          { label: "3", value: "3" },
          { label: "4", value: "4" },
          { label: "5", value: "5" },
          { label: "6", value: "6" }
        ],
        correctAnswer: "4",
        explanation: "If 🍎 + 🍎 = 8, then one 🍎 = 4.",
        hint: "Two matching symbols add to 8.",
        id: "market-1",
        prompt: "What number does 🍎 represent?",
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
        explanation: "🍐 + 2 = 9, so 🍐 = 7.",
        hint: "Undo the +2.",
        id: "market-2",
        prompt: "What is the value of 🍐?",
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
        explanation: "⭐ = 5 and 🌙 = 6, so together they make 11.",
        hint: "Solve each symbol separately, then combine them.",
        id: "market-3",
        prompt: "If ⭐ = 5 and 🌙 = 6, what is ⭐ + 🌙?",
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
        explanation: "Each row goes up by 1: 1, 2, 3 then 2, 3, 4 then 3, 4, 5, so the last row must be 4, 5, 6.",
        hint: "Look across each row and down each column. Both increase by 1.",
        id: "market-4",
        prompt: "Which total completes the market grid?",
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
        explanation: "In each row, the third number is the sum of the first two: 2 + 3 = 5, 4 + 5 = 9, so 4 + 6 = 10.",
        hint: "Add the first two numbers in each row.",
        id: "market-5",
        prompt: "Find the missing total in the final market stall.",
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
    title: "Symbol Market"
  }
];

export function getRiddleWorld(id: RiddleWorldId) {
  return riddleWorlds.find((world) => world.id === id) ?? null;
}
