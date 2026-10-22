"use client";

import { useId, useState } from "react";
import { MetricIcon } from "@/components/ui/MetricIcon";

interface MetricDisclosureProps {
  /** The metric name, so the control is unambiguous out of context. */
  label: string;
  /** Server-rendered formula, legend and notes. */
  children: React.ReactNode;
}

/**
 * The per-card "Show the math" row. Height animates with grid-template-rows,
 * so no JavaScript is needed to measure the content. Collapsed content stays
 * mounted (the animation needs it) but is `inert`: out of the tab order and
 * out of the accessibility tree.
 */
export function MetricDisclosure({ label, children }: MetricDisclosureProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="mt-1 flex min-h-[44px] w-full items-center justify-between gap-2 border-t border-[var(--border-default)] pt-2 font-sans text-sm font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
      >
        <span>
          <span className="sr-only">{label}: </span>
          {open ? "Hide the math" : "Show the math"}
        </span>
        <MetricIcon
          name="expand_more"
          className={`size-5 shrink-0 transition-transform duration-300 motion-reduce:transition-none ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        id={panelId}
        className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden" inert={!open}>
          <div className="flex flex-col gap-3 pb-1 pt-3">{children}</div>
        </div>
      </div>
    </>
  );
}
