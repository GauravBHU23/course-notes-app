import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "brand" | "success" | "warning" | "danger" | "neutral";

const toneClasses: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700",
  success: "bg-tone-success-bg text-tone-success-text",
  warning: "bg-tone-warning-bg text-tone-warning-text",
  danger: "bg-tone-danger-bg text-tone-danger-text",
  neutral: "bg-tone-neutral-bg text-tone-neutral-text",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
