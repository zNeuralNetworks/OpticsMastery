import { useId, useState, type ReactNode } from "react";
import clsx from "clsx";

type DisclosureProps = {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

export function Disclosure({ label, children, defaultOpen = false, className }: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className={clsx("space-y-3", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="disclosure-button"
      >
        <span>{open ? "Hide" : "Show"}</span>
        <span>{label}</span>
      </button>
      {open ? (
        <div id={panelId} className="card-subtle p-4 text-sm leading-6 text-muted">
          {children}
        </div>
      ) : null}
    </div>
  );
}
