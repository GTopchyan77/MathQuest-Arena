import type { LucideIcon } from "lucide-react";

type FeatureCardProps = {
  body: string;
  icon: LucideIcon;
  title: string;
};

export function FeatureCard({ body, icon: Icon, title }: FeatureCardProps) {
  return (
    <article className="panel rounded-[28px] p-6 transition duration-300 hover:-translate-y-1.5 hover:border-cyan-300/25 hover:bg-white/8 hover:shadow-[0_28px_80px_rgba(8,15,38,0.55)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-cyan-400/18 to-violet-500/18 text-cyan-200">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-5 font-[var(--font-sora)] text-xl font-extrabold text-white">{title}</h3>
      <p className="surface-copy mt-2 leading-7">{body}</p>
    </article>
  );
}
