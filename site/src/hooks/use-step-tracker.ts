"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

interface StepTracker {
  /** Index of the step currently under the activation line. */
  active: number;
  /** Height of the progress fill in pixels. */
  fill: number;
}

/**
 * Watches a vertical list of `[data-step]` rows inside `containerRef` and
 * reports which one sits under the activation line (35% down the viewport),
 * plus how far the tracker line should fill. Scroll updates run through
 * requestAnimationFrame, never directly.
 */
export function useStepTracker(
  containerRef: RefObject<HTMLElement | null>
): StepTracker {
  const [active, setActive] = useState(0);
  const [fill, setFill] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const rows = Array.from(
        container.querySelectorAll<HTMLElement>("[data-step]")
      );
      const rect = container.getBoundingClientRect();
      const activation = window.innerHeight * 0.35 - rect.top;

      // Timelines that end near the page bottom never see the activation
      // line: complete them when the user reaches the end of the page.
      const atPageEnd =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;

      let index = 0;
      rows.forEach((row, i) => {
        if (activation >= row.offsetTop) index = i;
      });
      setActive(atPageEnd ? rows.length - 1 : index);

      const last = rows[rows.length - 1];
      const max = last ? last.offsetTop + 20 : rect.height;
      setFill(atPageEnd ? max : Math.max(0, Math.min(activation, max)));
    };

    const schedule = () => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [containerRef]);

  return { active, fill };
}
