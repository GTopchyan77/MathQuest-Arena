import type { LucideIcon } from "lucide-react";
import { cx } from "@/lib/utils";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  tone?: "coral" | "lemon" | "mint" | "violet";
  value: number | string;
};

const tones = {
  coral: "bg-rose-400/12 text-rose-200",
  lemon: "bg-amber-300/14 text-amber-100",
  mint: "bg-emerald-400/12 text-emerald-200",
  violet: "bg-[rgba(167,139,250,0.12)] text-[rgb(221,214,254)]"
};

export function StatCard({ icon: Icon, label, tone = "violet", value }: StatCardProps) {
  return (
    <div className="rounded-[28px] border border-white/6 bg-[rgba(18,24,46,0.88)] p-6 shadow-[0_14px_34px_rgba(2,8,23,0.12)]">
      <div className={cx("flex h-12 w-12 items-center justify-center rounded-[16px]", tones[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-6 text-[2.15rem] font-black text-white">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-400">{label}</p>
    </div>
  );
}
