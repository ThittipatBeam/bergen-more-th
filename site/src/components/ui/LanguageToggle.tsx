"use client";

import React, { useRef, useCallback } from "react";
import gsap from "gsap";
import { useLanguage, type Language } from "@/hooks/use-language";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className = "" }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const thTextRef = useRef<HTMLSpanElement>(null);
  const enTextRef = useRef<HTMLSpanElement>(null);

  const handleToggle = useCallback(
    (targetLang: Language) => {
      if (targetLang === language) return;

      setLanguage(targetLang);

      // Playful GSAP spring bounce on the selected text label
      const activeText = targetLang === "EN" ? enTextRef.current : thTextRef.current;
      if (activeText && !reducedMotion) {
        gsap.fromTo(
          activeText,
          { scale: 0.82, y: 1 },
          { scale: 1, y: 0, duration: 0.3, ease: "back.out(2.2)" }
        );
      }
    },
    [language, setLanguage, reducedMotion]
  );

  const handleHoverIn = useCallback(() => {
    if (!containerRef.current || reducedMotion) return;
    gsap.to(containerRef.current, {
      y: -1.5,
      boxShadow: "0 4px 12px rgba(7, 149, 207, 0.15)",
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
      borderColor: "var(--border-default, #DCEAF1)",
      duration: 0.25,
      ease: "power2.out",
    });
  }, [reducedMotion]);

  const isEn = language === "EN";

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label="Language"
      onMouseEnter={handleHoverIn}
      onMouseLeave={handleHoverOut}
      className={`relative inline-grid grid-cols-2 w-[104px] h-[50px] p-0.5 rounded-full border border-[var(--border-default)] bg-[var(--background-primary)]/95 select-none shadow-xs overflow-hidden transition-colors ${className}`}
    >
      {/* Sliding Active Background Indicator Pill */}
      <span
        aria-hidden="true"
        className={`absolute top-[2px] bottom-[2px] left-[2px] w-[48px] rounded-full bg-[var(--brand-sky-blue)] shadow-xs transition-transform duration-200 ease-out pointer-events-none ${
          isEn ? "translate-x-[50px]" : "translate-x-0"
        }`}
      />

      {/* Thai Option Button */}
      <button
        type="button"
        onClick={() => handleToggle("TH")}
        aria-label="Switch language to Thai"
        aria-pressed={!isEn}
        className="relative z-10 w-full h-full flex items-center justify-center text-xs font-semibold rounded-full cursor-pointer"
      >
        <span
          ref={thTextRef}
          className={`inline-block transition-colors duration-150 ${
            !isEn
              ? "text-white font-bold"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          ไทย
        </span>
      </button>

      {/* English Option Button */}
      <button
        type="button"
        onClick={() => handleToggle("EN")}
        aria-label="Switch language to English"
        aria-pressed={isEn}
        className="relative z-10 w-full h-full flex items-center justify-center text-xs font-semibold rounded-full cursor-pointer"
      >
        <span
          ref={enTextRef}
          className={`inline-block font-sans font-bold transition-colors duration-150 ${
            isEn
              ? "text-white font-bold"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          EN
        </span>
      </button>
    </div>
  );
}
