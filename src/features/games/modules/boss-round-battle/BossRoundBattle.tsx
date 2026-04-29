"use client";

import { Heart, ShieldAlert, Sparkles, Star, Swords, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { createGameState, finishGame, submitGameAnswer } from "@/lib/games/engine";
import { bossRoundBattle } from "@/lib/games/bossRound";
import { saveGameResult } from "@/lib/supabase/scores";
import type { GameResult } from "@/lib/types";
import { Button } from "@/shared/components/ui/Button";

type AttackTone = "hit" | "idle" | "miss" | "victory";
type BattleOutcome = "lose" | "win" | null;

const bossMaxHp = 100;
const playerMaxHearts = 3;
const damagePerHit = 34;

export function BossRoundBattle() {
  const [game, setGame] = useState(() => createGameState(bossRoundBattle));
  const [bossHp, setBossHp] = useState(bossMaxHp);
  const [hearts, setHearts] = useState(playerMaxHearts);
  const [attackTone, setAttackTone] = useState<AttackTone>("idle");
  const [attackFeedback, setAttackFeedback] = useState("Solve to charge your next attack.");
  const [outcome, setOutcome] = useState<BattleOutcome>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const result = useMemo<GameResult>(() => {
    const answered = Math.max(game.totalAnswered, 1);

    return {
      accuracy: Math.round((game.correct / answered) * 100),
      correct: game.correct,
      gameSlug: "boss-round-battle",
      maxStreak: game.maxStreak,
      score: game.score,
      total: answered
    };
  }, [game]);

  async function save() {
    setSaving(true);
    const response = await saveGameResult(result);
    setSaving(false);
    setSaved(response.ok);
    setStatus(response.message);
  }

  function answer(value: number) {
    if (game.completed || outcome) {
      return;
    }

    const attackLabel = game.question.attackLabel;
    const feedback = submitGameAnswer(bossRoundBattle, game, value, undefined);
    const nextBossHp = feedback.isCorrect ? Math.max(0, bossHp - damagePerHit) : bossHp;
    const nextHearts = feedback.isCorrect ? hearts : Math.max(0, hearts - 1);
    const won = nextBossHp === 0;
    const lost = nextHearts === 0 || (feedback.completed && nextBossHp > 0);

    setBossHp(nextBossHp);
    setHearts(nextHearts);
    setAttackTone(won ? "victory" : feedback.isCorrect ? "hit" : "miss");
    setAttackFeedback(
      won
        ? `${attackLabel} lands the final blow. Treasure burst unlocked.`
        : feedback.isCorrect
          ? `${attackLabel} hits the monster for big damage.`
          : "Oof. The monster blocks that one. Try the next spell and protect your hearts."
    );

    if (won) {
      setOutcome("win");
      setGame(finishGame(feedback.state));
      return;
    }

    if (lost) {
      setOutcome("lose");
      setAttackFeedback("The monster is still standing, but you learned its pattern. Take a breath and try again.");
      setGame(finishGame(feedback.state));
      return;
    }

    setGame(feedback.state);
  }

  function restart() {
    setGame(createGameState(bossRoundBattle));
    setBossHp(bossMaxHp);
    setHearts(playerMaxHearts);
    setAttackTone("idle");
    setAttackFeedback("Solve to charge your next attack.");
    setOutcome(null);
    setStatus("");
    setSaving(false);
    setSaved(false);
  }

  if (game.completed && outcome) {
    return (
      <BossEndPanel
        onRestart={restart}
        onSave={outcome === "win" ? save : undefined}
        outcome={outcome}
        result={result}
        saved={saved}
        saving={saving}
        status={status}
      />
    );
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="panel-strong rounded-[30px] p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="surface-label text-rose-200/80">Boss Round</p>
            <h1 className="mt-2 font-[var(--font-sora)] text-3xl font-extrabold text-white">Battle the math monster</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Five questions. Land enough correct hits to knock out Umbra before your hearts run dry.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Metric label="Question" value={`${game.totalAnswered + 1}/5`} />
            <Metric label="Score" value={game.score} />
            <Metric label="Streak" value={game.streak} />
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(15,23,42,0.6),rgba(30,41,59,0.35))] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Boss HP</p>
              <h2 className="mt-1 font-[var(--font-sora)] text-2xl font-extrabold text-white">Umbra Crunch</h2>
            </div>
            <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-sm font-black text-rose-100">
              {bossHp} HP
            </div>
          </div>
          <div className="mt-4 h-4 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,rgba(251,113,133,0.95),rgba(244,114,182,0.9),rgba(250,204,21,0.9))] transition-[width] duration-500"
              style={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
            />
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
            <div className="relative mx-auto flex h-44 w-44 items-center justify-center rounded-full border border-violet/20 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.32),rgba(15,23,42,0.1)_60%)]">
              <div className="absolute inset-5 rounded-full border border-cyan-300/12 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),rgba(2,8,23,0))]" />
              <div className={`relative flex h-28 w-28 items-center justify-center rounded-[34px] border text-white transition duration-300 ${
                attackTone === "miss"
                  ? "rotate-3 border-amber-300/20 bg-amber-300/10"
                  : attackTone === "victory"
                    ? "scale-105 border-emerald-300/20 bg-emerald-400/12 shadow-[0_0_40px_rgba(52,211,153,0.18)]"
                    : "border-rose-300/20 bg-rose-400/10"
              }`}>
                <MonsterFace tone={attackTone} />
              </div>
              {attackTone === "hit" || attackTone === "victory" ? (
                <>
                  <Sparkles className="absolute -right-1 top-8 h-5 w-5 text-cyan-200" />
                  <Sparkles className="absolute left-2 top-14 h-4 w-4 text-amber-100" />
                </>
              ) : null}
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                  attackTone === "miss"
                    ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
                    : attackTone === "victory"
                      ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
                      : "border-cyan-300/20 bg-cyan-400/10 text-cyan-100"
                }`}>
                  {attackTone === "miss" ? <ShieldAlert className="h-5 w-5" /> : attackTone === "victory" ? <Trophy className="h-5 w-5" /> : <Swords className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Attack feedback</p>
                  <p className="mt-1 font-[var(--font-sora)] text-xl font-extrabold text-white">
                    {attackTone === "miss" ? "Blocked strike" : attackTone === "victory" ? "Boss defeated" : attackTone === "hit" ? "Direct hit" : "Battle ready"}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">{attackFeedback}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Charge attack</p>
          <h2 className="mt-2 font-[var(--font-sora)] text-5xl font-extrabold text-white">{game.question.expression}</h2>
          <p className="mt-2 text-sm font-bold text-cyan-100">{game.question.attackLabel}</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {game.question.options.map((option) => (
              <button
                className="focus-ring min-h-24 rounded-3xl border border-white/10 bg-white/6 text-3xl font-black text-white transition duration-200 hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(139,92,246,0.12))] hover:shadow-[0_20px_50px_rgba(8,15,38,0.45)]"
                key={option}
                onClick={() => answer(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <aside className="panel rounded-[30px] p-6">
        <p className="surface-label text-emerald-200/80">Player hearts</p>
        <div className="mt-4 flex gap-3">
          {Array.from({ length: playerMaxHearts }, (_, index) => {
            const active = index < hearts;

            return (
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${
                  active ? "border-rose-300/20 bg-rose-400/12 text-rose-100" : "border-white/10 bg-white/5 text-slate-500"
                }`}
                key={index}
              >
                <Heart className={`h-6 w-6 ${active ? "fill-current" : ""}`} />
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-[24px] border border-white/10 bg-white/6 p-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Round rules</p>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-300">
            <li>Correct answers blast the boss HP bar.</li>
            <li>Wrong answers cost one heart.</li>
            <li>You get up to 5 questions to finish the fight.</li>
          </ul>
        </div>

        <div className="mt-4 rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.08),rgba(139,92,246,0.1))] p-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Victory reward</p>
          <h3 className="mt-2 font-[var(--font-sora)] text-xl font-extrabold text-white">Mini treasure burst</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">Defeat the boss and you’ll trigger a shiny reward moment before you decide whether to save the run.</p>
          <div className="mt-4 flex gap-2">
            <RewardGem />
            <RewardGem />
            <RewardGem />
          </div>
        </div>
      </aside>
    </section>
  );
}

function BossEndPanel({
  onRestart,
  onSave,
  outcome,
  result,
  saved,
  saving,
  status
}: {
  onRestart: () => void;
  onSave?: () => Promise<void>;
  outcome: "lose" | "win";
  result: GameResult;
  saved: boolean;
  saving: boolean;
  status: string;
}) {
  const isWin = outcome === "win";

  return (
    <section className="panel-strong rounded-[30px] p-6">
      <div className={`relative overflow-hidden rounded-[28px] border p-6 ${
        isWin
          ? "border-emerald-300/20 bg-[linear-gradient(135deg,rgba(16,185,129,0.14),rgba(34,211,238,0.08))]"
          : "border-amber-300/20 bg-[linear-gradient(135deg,rgba(251,191,36,0.12),rgba(255,255,255,0.04))]"
      }`}>
        <div className={`absolute right-0 top-0 h-28 w-28 rounded-full blur-3xl ${isWin ? "bg-emerald-400/10" : "bg-amber-300/10"}`} />
        <div className="relative flex items-start gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${
            isWin ? "border-emerald-300/20 bg-emerald-400/12 text-emerald-100" : "border-amber-300/20 bg-amber-300/12 text-amber-100"
          }`}>
            {isWin ? <Trophy className="h-6 w-6" /> : <Heart className="h-6 w-6" />}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-300">{isWin ? "Victory reward" : "Retry ready"}</p>
            <h2 className="mt-2 font-[var(--font-sora)] text-3xl font-extrabold text-white">
              {isWin ? "Boss defeated." : "Nice try. You can beat this one."}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
              {isWin
                ? "Your final strike cracked the monster shield and popped open a tiny treasure burst."
                : "You chipped away at the boss and learned the rhythm. Jump back in and land a few more clean hits."}
            </p>
            {isWin ? (
              <div className="mt-4 flex gap-2">
                <RewardGem />
                <RewardGem />
                <RewardGem />
                <RewardGem />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Score" value={result.score} />
        <Metric label="Correct" value={`${result.correct}/${result.total}`} />
        <Metric label="Accuracy" value={`${result.accuracy}%`} />
        <Metric label="Best streak" value={result.maxStreak} />
      </div>

      {status ? <p className="mt-4 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-bold text-slate-200">{status}</p> : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {isWin && onSave ? (
          <Button disabled={saving || saved} onClick={onSave}>
            {saving ? "Saving..." : saved ? "Score saved" : "Save score"}
          </Button>
        ) : null}
        <Button onClick={onRestart} variant="secondary">
          {isWin ? "Battle again" : "Retry battle"}
        </Button>
      </div>
    </section>
  );
}

function MonsterFace({ tone }: { tone: AttackTone }) {
  return (
    <div className="relative h-14 w-14">
      <span className="absolute left-1/2 top-2 h-2.5 w-2.5 -translate-x-[13px] rounded-full bg-current" />
      <span className="absolute left-1/2 top-2 h-2.5 w-2.5 translate-x-[4px] rounded-full bg-current" />
      <span className={`absolute left-1/2 top-7 h-5 w-9 -translate-x-1/2 border-current ${
        tone === "miss" ? "rounded-t-full border-t-2" : "rounded-b-full border-b-2"
      }`} />
      <span className="absolute -left-1 top-5 h-3 w-3 rotate-45 rounded-sm border border-current/70" />
      <span className="absolute -right-1 top-5 h-3 w-3 rotate-45 rounded-sm border border-current/70" />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
    </div>
  );
}

function RewardGem() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100">
      <Star className="h-4 w-4 fill-current" />
    </div>
  );
}
