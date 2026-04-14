import type { PropsWithChildren, ReactNode } from "react";
import clsx from "clsx";
import type { AccentTone } from "@/styles/designTokens";

type ArchitectureCardProps = PropsWithChildren<{
  title?: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
  accent?: AccentTone;
  elevated?: boolean;
  active?: boolean;
}>;

const accentClasses: Record<AccentTone, string> = {
  sapphire: "before:bg-sapphire after:shadow-glow-sapphire",
  amethyst: "before:bg-amethyst after:shadow-glow-amethyst",
  indigo: "before:bg-indigo after:shadow-glow-indigo",
  ember: "before:bg-ember after:shadow-glow-ember",
  cyan: "before:bg-cyan after:shadow-glow-cyan",
  emerald: "before:bg-emerald after:shadow-glow-emerald",
};

export function ArchitectureCard({
  title,
  eyebrow,
  actions,
  className,
  accent,
  elevated = false,
  active = false,
  children,
}: ArchitectureCardProps) {
  return (
    <section
      className={clsx(
        "architecture-card relative overflow-hidden p-6 lg:p-7",
        elevated && "architecture-card--elevated",
        active && "architecture-card--active",
        accent && [
          "before:absolute before:inset-x-0 before:top-0 before:h-px before:content-['']",
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-[24px] after:opacity-65 after:content-['']",
          accentClasses[accent],
        ],
        className,
      )}
    >
      {(title || eyebrow || actions) && (
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            {eyebrow ? <p className={clsx("section-kicker", accent && accentTextClass(accent))}>{eyebrow}</p> : null}
            {title ? <h2 className="mt-2 text-[18px] font-semibold tracking-[-0.02em] text-ink lg:text-[20px]">{title}</h2> : null}
          </div>
          {actions}
        </div>
      )}
      <div className="relative z-[1]">{children}</div>
    </section>
  );
}

function accentTextClass(accent: AccentTone) {
  return {
    sapphire: "text-sapphire",
    amethyst: "text-amethyst",
    indigo: "text-indigo",
    ember: "text-ember",
    cyan: "text-cyan",
    emerald: "text-emerald",
  }[accent];
}
