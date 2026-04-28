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
    "border border-cyan-300/30 bg-[linear-gradient(90deg,#67e8f9_0%,#22d3ee_18%,#0ea5e9_52%,#8b5cf6_100%)] text-slate-950 shadow-[0_18px_45px_rgba(34,211,238,0.26)] hover:-translate-y-1 hover:scale-[1.01] hover:brightness-105 hover:shadow-[0_26px_70px_rgba(139,92,246,0.34)]",
  secondary:
    "border border-white/12 bg-white/6 text-white shadow-[0_14px_34px_rgba(2,8,23,0.25)] backdrop-blur-xl hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/10 hover:shadow-[0_20px_50px_rgba(8,15,38,0.35)]",
  ghost: "text-slate-200 hover:bg-white/8 hover:text-white",
  danger: "border border-rose-400/30 bg-rose-500/85 text-white hover:bg-rose-500"
};

const sizes = {
  md: "h-11 px-4 text-sm",
  lg: "h-13 px-6 text-base"
};

export function Button({ asChild, children, className, href, size = "md", variant = "primary", ...props }: ButtonProps) {
  const classes = cx(
    "focus-ring inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60",
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
