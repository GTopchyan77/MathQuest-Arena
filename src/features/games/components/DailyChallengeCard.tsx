import Link from "next/link";
import { ArrowUpRight, CalendarDays, Sparkles } from "lucide-react";
import { getDailyChallenge } from "@/lib/games/dailyChallenge";

type DailyChallengeCardProps = {
  compact?: boolean;
};

export function DailyChallengeCard({ compact = false }: DailyChallengeCardProps) {
  const challenge = getDailyChallenge();

  return (
    <Link
      className="panel group block rounded-[28px] p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-white/8 hover:shadow-[0_28px_80px_rgba(8,15,38,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      href={challenge.href}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-cyan-100">
            <Sparkles className="h-3.5 w-3.5" />
            {challenge.badge}
          </div>
          <h3 className="mt-4 font-[var(--font-sora)] text-2xl font-extrabold text-white">{challenge.game.title}</h3>
          <p className="mt-2 max-w-xl text-sm leading-7 text-slate-300">{challenge.prompt}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-emerald-100">
            {challenge.rewardLabel}
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-cyan-200 transition group-hover:rotate-6">
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>
      </div>
      <div className={`mt-5 ${compact ? "grid gap-3 sm:grid-cols-2" : "grid gap-3 sm:grid-cols-[1fr_auto]"}`}>
        <div className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Challenge focus</p>
          <p className="mt-1 text-sm font-semibold text-white">{challenge.game.skills.join(" / ")}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Resets</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-white">
            <CalendarDays className="h-4 w-4 text-cyan-200" />
            {challenge.dateKey}
          </p>
        </div>
      </div>
    </Link>
  );
}
