"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";
import { useLanguage } from "@/hooks/use-language";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/** Ripple length. Long enough to read as a sweep, short enough not to wait. */
const RIPPLE_MS = 480;

/** Rapid clicks skip the running transition; the muting must outlive that skip,
 *  so it is reference-counted rather than toggled per click. */
let activeSwaps = 0;

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { language } = useLanguage();
  const reducedMotion = useReducedMotion();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved === "dark" || (!saved && prefersDark);

    if (isDark) {
      document.documentElement.classList.add("dark");
      queueMicrotask(() => setTheme("dark"));
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const applyTheme = useCallback((nextIsDark: boolean) => {
    const root = document.documentElement;
    if (nextIsDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    }
  }, []);

  const handleToggle = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const nextIsDark = !document.documentElement.classList.contains("dark");
      const root = document.documentElement;
      const rect = buttonRef.current?.getBoundingClientRect();
      // Keyboard activation reports 0,0: start the sweep from the control
      // itself instead of the top-left corner of the page.
      const fromKeyboard =
        event.detail === 0 || (event.clientX === 0 && event.clientY === 0);
      const originX =
        fromKeyboard && rect ? rect.left + rect.width / 2 : event.clientX;
      const originY =
        fromKeyboard && rect ? rect.top + rect.height / 2 : event.clientY;

      if (
        reducedMotion ||
        typeof document.startViewTransition !== "function"
      ) {
        applyTheme(nextIsDark);
        return;
      }

      // Colour transitions would be captured mid-fade, so they are muted for
      // the duration of the swap; the ripple itself carries the transition.
      activeSwaps += 1;
      root.classList.add("theme-swap");
      const transition = document.startViewTransition(() => {
        // React has to paint the new label/icon before the snapshot is taken.
        flushSync(() => applyTheme(nextIsDark));
      });

      transition.ready
        .then(() => {
          const radius = Math.hypot(
            Math.max(originX, window.innerWidth - originX),
            Math.max(originY, window.innerHeight - originY)
          );
          root.animate(
            {
              clipPath: [
                `circle(0px at ${originX}px ${originY}px)`,
                `circle(${radius}px at ${originX}px ${originY}px)`,
              ],
            },
            {
              duration: RIPPLE_MS,
              // Ease in and out: an ease-out curve spends most of its time at
              // full radius, so the sweep would read as an instant flip.
              easing: "cubic-bezier(0.65, 0, 0.35, 1)",
              pseudoElement: "::view-transition-new(root)",
            }
          );
        })
        .catch(() => {
          /* A skipped transition leaves the applied theme in place. */
        })
        .finally(() => {
          transition.finished.finally(() => {
            activeSwaps -= 1;
            if (activeSwaps === 0) root.classList.remove("theme-swap");
          });
        });
    },
    [applyTheme, reducedMotion]
  );

  const handleHoverIn = useCallback(() => {
    if (!buttonRef.current || reducedMotion) return;
    gsap.to(buttonRef.current, {
      y: -1.5,
      boxShadow: "0 4px 12px var(--shadow-glow)",
      borderColor: "var(--border-strong)",
      duration: 0.2,
      ease: "power2.out",
    });
  }, [reducedMotion]);

  const handleHoverOut = useCallback(() => {
    if (!buttonRef.current || reducedMotion) return;
    gsap.to(buttonRef.current, {
      y: 0,
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
      borderColor: "var(--border-default)",
      duration: 0.25,
      ease: "power2.out",
    });
  }, [reducedMotion]);

  const isDark = theme === "dark";
  const label = language === "EN" ? (isDark ? "Light" : "Dark") : (isDark ? "สว่าง" : "มืด");

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleToggle}
      onMouseEnter={handleHoverIn}
      onMouseLeave={handleHoverOut}
      aria-label={
        language === "EN"
          ? `Switch to ${isDark ? "light" : "dark"} mode`
          : `สลับเป็นโหมด${isDark ? "สว่าง" : "มืด"}`
      }
      aria-pressed={isDark}
      className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border-default)] bg-[var(--background-primary)]/90 text-[var(--text-primary)] text-xs font-sans font-medium shadow-xs select-none transition-colors min-h-[44px] cursor-pointer ${className}`}
    >
      {/* Icon names the mode you switch to: sun while dark, moon while light. */}
      <span className="inline-flex items-center text-sm text-[var(--brand-text)]">
        {isDark ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="size-4"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
            aria-hidden="true"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </span>

      {/* Label: Dynamic based on active language ("Dark"/"Light" for EN, "มืด"/"สว่าง" for TH).
          The slot is fixed so changing language or theme never resizes the
          navbar cluster — the toggle must not move under the pointer. */}
      <span className="inline-block w-8 whitespace-nowrap text-center text-xs font-sans">
        {label}
      </span>
    </button>
  );
}
