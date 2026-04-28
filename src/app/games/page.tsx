import { GameCard } from "@/features/games/components/GameCard";
import { games } from "@/lib/games/catalog";

export default function GamesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="mb-8">
        <p className="surface-label">Game selection</p>
        <h1 className="mt-3 font-[var(--font-sora)] text-4xl font-extrabold text-white sm:text-5xl">Pick a math challenge</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">Each game targets a different kind of math confidence, from quick recall to slower pattern reasoning.</p>
      </section>
      <section className="grid gap-5 md:grid-cols-3">
        {games.map((game) => (
          <GameCard game={game} key={game.slug} />
        ))}
      </section>
    </main>
  );
}
