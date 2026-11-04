"use client";

import React, { useRef, useCallback } from "react";
import gsap from "gsap";
import { useDataset } from "@/hooks/use-dataset";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface DatasetToggleProps {
  className?: string;
}

/** Benchmark switch — same pill choreography as the language toggle; the
 *  labels stay neutral (Wiki / Niti) in both languages, like the navbar. */
export function DatasetToggle({ className = "" }: DatasetToggleProps) {
  const { dataset, setDataset } = useDataset();
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleHoverIn = useCallback(() => {
    if (!containerRef.current || reducedMotion) return;
    gsap.to(containerRef.current, {
      y: -1.5,
      boxShadow: "0 4px 12px var(--shadow-glow)",
      borderColor: "var(--border-strong)",
      duration: 0.2,
      ease: "power2.out",
    });
  }, [reducedMotion]);

  const handleHoverOut = useCallback(() => {
    if (!containerRef.current || reducedMotion) return;
    gsap.to(containerRef.current, {
      y: 0,
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
      borderColor: "var(--border-default)",
      duration: 0.25,
      ease: "power2.out",
    });
  }, [reducedMotion]);

  const isNiti = dataset === "nitibench";

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label="Benchmark dataset"
      onMouseEnter={handleHoverIn}
      onMouseLeave={handleHoverOut}
      className={`relative inline-grid grid-cols-2 w-[104px] h-[50px] p-0.5 rounded-full border border-[var(--border-default)] bg-[var(--background-primary)]/95 select-none shadow-xs overflow-hidden transition-colors ${className}`}
    >
      {/* Sliding Active Background Indicator Pill — Niti slides right */}
      <span
        aria-hidden="true"
        className={`absolute top-[2px] bottom-[2px] left-[2px] w-[48px] rounded-full bg-[var(--brand-cta)] shadow-xs transition-transform duration-200 ease-out pointer-events-none ${
          isNiti ? "translate-x-[50px]" : "translate-x-0"
        }`}
      />

      {/* Wikipedia V4 Option Button */}
      <button
        type="button"
        onClick={() => setDataset("wikipedia")}
        aria-label="Show the Wikipedia V4 benchmark"
        aria-pressed={!isNiti}
        className="relative z-10 w-full h-full min-h-[44px] flex items-center justify-center text-xs font-semibold rounded-full cursor-pointer"
      >
        <span
          className={`inline-block transition-colors duration-150 ${
            !isNiti
              ? "text-white font-bold"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Wiki
        </span>
      </button>

      {/* NitiBench+ Option Button */}
      <button
        type="button"
        onClick={() => setDataset("nitibench")}
        aria-label="Show the NitiBench+ benchmark"
        aria-pressed={isNiti}
        className="relative z-10 w-full h-full min-h-[44px] flex items-center justify-center text-xs font-semibold rounded-full cursor-pointer"
      >
        <span
          className={`inline-block font-sans font-bold transition-colors duration-150 ${
            isNiti
              ? "text-white font-bold"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Niti
        </span>
      </button>
    </div>
  );
}
