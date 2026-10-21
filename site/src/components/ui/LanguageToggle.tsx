"use client";

import React, { useRef, useCallback } from "react";
import gsap from "gsap";
import { useLanguage, type Language } from "@/hooks/use-language";

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className = "" }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const thTextRef = useRef<HTMLSpanElement>(null);
  const enTextRef = useRef<HTMLSpanElement>(null);

  const handleToggle = useCallback(
    (targetLang: Language) => {
      if (targetLang === language) return;

      setLanguage(targetLang);

      // Playful GSAP spring bounce on the selected text label
      const activeText = targetLang === "EN" ? enTextRef.current : thTextRef.current;
      if (activeText) {
        gsap.fromTo(
          activeText,
          { scale: 0.82, y: 1 },
          { scale: 1, y: 0, duration: 0.3, ease: "back.out(2.2)" }
        );
      }
    },
    [language, setLanguage]
  );

  const handleHoverIn = useCallback(() => {
    if (!containerRef.current) return;
    gsap.to(containerRef.current, {
      y: -1.5,
      boxShadow: "0 4px 12px rgba(7, 149, 207, 0.15)",
      borderColor: "#73B7DC",
      duration: 0.2,
      ease: "power2.out",
    });
  }, []);

  const handleHoverOut = useCallback(() => {
    if (!containerRef.current) return;
    gsap.to(containerRef.current, {
      y: 0,
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
      borderColor: "var(--border-default, #DCEAF1)",
      duration: 0.25,
      ease: "power2.out",
    });
  }, []);

  const isEn = language === "EN";

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleHoverIn}
      onMouseLeave={handleHoverOut}
      className={`relative inline-grid grid-cols-2 w-[82px] h-[34px] p-0.5 rounded-full border border-[#DCEAF1] dark:border-[#1e3344] bg-white/95 dark:bg-[#111a22]/95 backdrop-blur-xs select-none shadow-xs overflow-hidden transition-colors ${className}`}
    >
      {/* Sliding Active Background Indicator Pill */}
      <span
        aria-hidden="true"
        className={`absolute top-[2px] bottom-[2px] left-[2px] w-[37px] rounded-full bg-[#0795CF] shadow-xs transition-transform duration-200 ease-out will-change-transform pointer-events-none ${
          isEn ? "translate-x-[39px]" : "translate-x-0"
        }`}
      />

      {/* Thai Option Button */}
      <button
        type="button"
        onClick={() => handleToggle("TH")}
        aria-label="Switch language to Thai"
        className="relative z-10 w-full h-full flex items-center justify-center text-xs font-semibold rounded-full cursor-pointer"
      >
        <span
          ref={thTextRef}
          className={`inline-block transition-colors duration-150 ${
            !isEn
              ? "text-white font-bold"
              : "text-[#496273] dark:text-[#94abbc] hover:text-[#102A3A] dark:hover:text-white"
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
        className="relative z-10 w-full h-full flex items-center justify-center text-xs font-semibold rounded-full cursor-pointer"
      >
        <span
          ref={enTextRef}
          className={`inline-block font-sans font-bold transition-colors duration-150 ${
            isEn
              ? "text-white font-bold"
              : "text-[#496273] dark:text-[#94abbc] hover:text-[#102A3A] dark:hover:text-white"
          }`}
        >
          EN
        </span>
      </button>
    </div>
  );
}
