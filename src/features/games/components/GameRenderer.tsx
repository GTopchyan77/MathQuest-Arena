import type { GameSlug } from "@/lib/types";
import { gameRegistry } from "@/lib/games/registry";

export function GameRenderer({ slug }: { slug: GameSlug }) {
  const GameComponent = gameRegistry[slug];

  if (!GameComponent) {
    return null;
  }

  return <GameComponent />;
}
