import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { GameMeta } from "@/lib/games/catalog";

const accentClasses = {
  coral: "border-rose-400/25 bg-rose-400/12 text-rose-200",
  lemon: "border-amber-300/30 bg-amber-300/12 text-amber-100",
  mint: "border-emerald-400/25 bg-emerald-400/12 text-emerald-200",
  violet: "border-violet-400/25 bg-violet-400/12 text-violet-200"
};

export function GameCard({ game }: { game: GameMeta }) {
  return (
    <Link
      className="panel group rounded-[28px] p-6 transition duration-300 hover:-translate-y-1.5 hover:border-cyan-300/25 hover:bg-white/8 hover:shadow-[0_28px_80px_rgba(8,15,38,0.58)]"
      href={`/games/${game.slug}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className={`rounded-2xl border px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] ${accentClasses[game.accent]}`}>
          {game.duration}
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-cyan-400/16 to-violet-500/18 text-cyan-100 transition group-hover:rotate-6 group-hover:scale-105">
          <ArrowUpRight className="h-5 w-5" />
        </span>
      </div>
      <h3 className="mt-7 font-[var(--font-sora)] text-2xl font-extrabold text-white">{game.title}</h3>
      <p className="mt-3 min-h-[84px] leading-7 text-slate-300">{game.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {game.skills.map((skill) => (
          <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-bold text-slate-300" key={skill}>
            {skill}
          </span>
        ))}
      </div>
    </Link>
  );
}
