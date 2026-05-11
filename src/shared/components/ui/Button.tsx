import type { Route } from "next";
import Link from "next/link";
import { cloneElement, isValidElement, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from "react";
import { cx } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  children: ReactNode;
  href?: Route<string>;
  size?: "md" | "lg";
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants = {
  primary:
    "border border-cyan-300/24 bg-[linear-gradient(135deg,#7dd3fc_0%,#22d3ee_30%,#2563eb_72%,#8b5cf6_100%)] text-slate-950 shadow-[0_18px_45px_rgba(34,211,238,0.22)] hover:-translate-y-0.5 hover:scale-[1.01] hover:brightness-105 hover:shadow-[0_24px_58px_rgba(59,130,246,0.28)]",
  secondary:
    "border border-white/12 bg-[rgba(255,255,255,0.045)] text-white shadow-[0_14px_34px_rgba(2,8,23,0.22)] backdrop-blur-xl hover:-translate-y-0.5 hover:border-cyan-300/24 hover:bg-white/[0.08] hover:shadow-[0_20px_44px_rgba(8,15,38,0.3)]",
  ghost: "text-slate-200 hover:bg-white/[0.06] hover:text-white",
  danger: "border border-rose-400/30 bg-rose-500/85 text-white hover:bg-rose-500"
};

const sizes = {
  md: "h-11 px-4 text-sm",
  lg: "h-13 px-6 text-base"
};

export function Button({ asChild, children, className, href, size = "md", variant = "primary", ...props }: ButtonProps) {
  const classes = cx(
    "focus-ring inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition duration-200 active:scale-[0.985] active:shadow-none disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    sizes[size],
    className
  );

  if (asChild && isValidElement<{ className?: string }>(children)) {
    const child = children as ReactElement<{ className?: string }>;

    return cloneElement(child, {
      className: cx(classes, child.props.className)
    });
  }

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
