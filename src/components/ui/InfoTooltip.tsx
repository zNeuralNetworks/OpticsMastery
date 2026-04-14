import type { ReactNode } from "react";

type InfoTooltipProps = {
  label: string;
  children: ReactNode;
};

export function InfoTooltip({ label, children }: InfoTooltipProps) {
  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-border bg-space text-[11px] text-label transition hover:border-sapphire/60 hover:text-ink"
      >
        i
      </button>
      <span className="tooltip-panel left-1/2 top-[calc(100%+10px)] -translate-x-1/2 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
        <span className="block font-medium text-ink">{label}</span>
        <span className="mt-1 block">{children}</span>
      </span>
    </span>
  );
}
