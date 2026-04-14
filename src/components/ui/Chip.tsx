import clsx from "clsx";
import type { ReactNode } from "react";

type ChipProps = {
  children: ReactNode;
  active?: boolean;
  tone?: "default" | "sapphire" | "ember" | "emerald" | "amethyst" | "indigo" | "cyan";
  onClick?: () => void;
};

const toneClasses = {
  default: "",
  sapphire: "border-sapphire/45 bg-sapphire/10 text-ink",
  ember: "border-ember/45 bg-ember/10 text-ink",
  emerald: "border-emerald/45 bg-emerald/10 text-ink",
  amethyst: "border-amethyst/45 bg-amethyst/10 text-ink",
  indigo: "border-indigo/45 bg-indigo/10 text-ink",
  cyan: "border-cyan/45 bg-cyan/10 text-ink",
} as const;

export function Chip({ children, active = false, tone = "default", onClick }: ChipProps) {
  const Component = onClick ? "button" : "span";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={clsx("info-chip", (active || tone !== "default") && toneClasses[tone], active && "info-chip--active")}
    >
      {children}
    </Component>
  );
}
