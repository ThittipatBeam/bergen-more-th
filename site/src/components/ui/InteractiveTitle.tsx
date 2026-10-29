"use client";

import React, { useRef, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(useGSAP);

/** Read a theme token at event time so hover colors follow the active theme. */
const readToken = (name: string): string => {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
};

interface InteractiveTitleProps {
  text: string;
  className?: string;
}

/** Display title: a quiet staggered entrance and a gentle per-letter lift on
 *  hover. No click handler — a heading click should do nothing, and it
 *  should not advertise otherwise with a pointer cursor. */
export function InteractiveTitle({ text, className = "" }: InteractiveTitleProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      // Reduced motion: title renders in final state, no entrance wave
      if (reducedMotion) return;

      gsap.fromTo(
        ".interactive-char",
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.02,
          ease: "power3.out",
        }
      );
    },
    { scope: containerRef, dependencies: [reducedMotion] }
  );

  // A small lift with a smooth settle; the brand tint is the only flourish.
  const handleCharHover = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      if (reducedMotion) return;
      gsap.to(e.currentTarget, {
        y: -4,
        color: readToken("--brand-text") || undefined,
        duration: 0.18,
        ease: "power2.out",
        overwrite: "auto",
      });
    },
    [reducedMotion]
  );

  const handleCharLeave = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      if (reducedMotion) return;
      gsap.to(e.currentTarget, {
        y: 0,
        color: "inherit",
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    },
    [reducedMotion]
  );

  // Split text into words to prevent breaking words across lines awkwardly
  const words = text.split(" ");

  return (
    <h1
      ref={containerRef}
      className={`font-sans font-bold sm:font-extrabold tracking-[-0.03em] leading-[1.08] select-none text-[var(--text-primary)] transition-colors duration-200 ${className}`}
    >
      {words.map((word, wordIndex) => (
        <span key={`word-${wordIndex}`} className="inline-block whitespace-nowrap">
          {word.split("").map((char, charIndex) => (
            <span
              key={`char-${wordIndex}-${charIndex}`}
              onMouseEnter={handleCharHover}
              onMouseLeave={handleCharLeave}
              className="interactive-char inline-block transform-gpu"
            >
              {char}
            </span>
          ))}
          {/* Space between words */}
          {wordIndex < words.length - 1 && (
            <span className="inline-block">&nbsp;</span>
          )}
        </span>
      ))}
    </h1>
  );
}
