import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GameRenderer } from "@/features/games/components/GameRenderer";
import { Button } from "@/shared/components/ui/Button";
import { getGame } from "@/lib/games/catalog";
import type { GameSlug } from "@/lib/types";

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = getGame(slug);

  if (!game) notFound();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Button asChild variant="ghost">
            <Link href="/games">
              <ArrowLeft className="h-4 w-4" /> All games
            </Link>
          </Button>
          <h1 className="mt-4 font-[var(--font-sora)] text-4xl font-extrabold text-white">{game.title}</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-300">{game.description}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-black text-slate-200 shadow-[0_14px_34px_rgba(2,8,23,0.24)] backdrop-blur-xl">{game.duration}</div>
      </div>
      <GameRenderer slug={game.slug as GameSlug} />
    </main>
  );
}
