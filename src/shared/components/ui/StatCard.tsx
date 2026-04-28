import type { LucideIcon } from "lucide-react";
import { cx } from "@/lib/utils";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  tone?: "coral" | "lemon" | "mint" | "violet";
  value: number | string;
};

const tones = {
  coral: "border border-rose-400/20 bg-rose-400/12 text-rose-200",
  lemon: "border border-amber-300/24 bg-amber-300/14 text-amber-100",
  mint: "border border-emerald-400/24 bg-emerald-400/12 text-emerald-200",
  violet: "border border-violet-400/24 bg-violet-400/12 text-violet-200"
};

export function StatCard({ icon: Icon, label, tone = "violet", value }: StatCardProps) {
  return (
    <div className="panel rounded-[26px] p-5">
      <div className={cx("flex h-11 w-11 items-center justify-center rounded-2xl", tones[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-5 text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
    </div>
  );
}
