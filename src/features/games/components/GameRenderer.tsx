import type { GameSlug } from "@/lib/types";
import { gameRegistry } from "@/lib/games/registry";
import { RiddleRealmsGame } from "@/features/riddles/components/RiddleRealmsGame";

export function GameRenderer({ slug }: { slug: GameSlug | "riddle-realms" }) {
  if (slug === "riddle-realms") {
    return <RiddleRealmsGame />;
  }

  const GameComponent = gameRegistry[slug];

  if (!GameComponent) {
    return null;
  }

  return <GameComponent />;
}
