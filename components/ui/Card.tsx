import type { ComponentPropsWithoutRef } from "react";

type CardProps = ComponentPropsWithoutRef<"article">;

export function Card({ className = "", ...props }: CardProps) {
  return (
    <article
      className={`rounded-lg border border-[#eadfce] bg-white/82 shadow-[0_10px_30px_rgba(92,67,39,0.08)] ${className}`}
      {...props}
    />
  );
}
