"use client";

import React, { useState, useRef, useCallback } from "react";
import gsap from "gsap";

interface LanguageToggleProps {
  className?: string;
  initialLang?: "TH" | "EN";
  onChange?: (lang: "TH" | "EN") => void;
}

export function LanguageToggle({
  className = "",
  initialLang = "TH",
  onChange,
}: LanguageToggleProps) {
  const [lang, setLang] = useState<"TH" | "EN">(initialLang);
  const containerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const thTextRef = useRef<HTMLSpanElement>(null);
  const enTextRef = useRef<HTMLSpanElement>(null);

  const handleToggle = useCallback(
    (targetLang: "TH" | "EN") => {
      if (targetLang === lang) return;

      setLang(targetLang);
      if (onChange) onChange(targetLang);

      // GSAP animated slide for indicator pill
      if (indicatorRef.current) {
        gsap.to(indicatorRef.current, {
          xPercent: targetLang === "EN" ? 100 : 0,
          duration: 0.28,
          ease: "power2.out",
        });
      }

      // Gentle bounce & color emphasis on selected label
      const activeText = targetLang === "EN" ? enTextRef.current : thTextRef.current;
      if (activeText) {
        gsap.fromTo(
          activeText,
          { scale: 0.9, y: 1 },
          { scale: 1, y: 0, duration: 0.25, ease: "back.out(2)" }
        );
      }
    },
    [lang, onChange]
  );

  const handleHoverIn = useCallback(() => {
    if (!containerRef.current) return;
    gsap.to(containerRef.current, {
      y: -1.5,
      boxShadow: "0 4px 12px rgba(7, 149, 207, 0.12)",
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

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleHoverIn}
      onMouseLeave={handleHoverOut}
      className={`relative inline-flex items-center p-0.5 rounded-full border border-[#DCEAF1] dark:border-[#1e3344] bg-white/90 dark:bg-[#111a22]/90 backdrop-blur-xs select-none shadow-xs transition-colors min-h-[38px] ${className}`}
    >
      {/* Sliding Active Background Indicator */}
      <span
        ref={indicatorRef}
        aria-hidden="true"
        className="absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-[#0795CF] shadow-xs will-change-transform"
        style={{
          transform: lang === "EN" ? "translateX(100%)" : "translateX(0%)",
        }}
      />

      {/* Thai Option */}
      <button
        type="button"
        onClick={() => handleToggle("TH")}
        aria-label="Switch language to Thai"
        className="relative z-10 min-w-[34px] px-2.5 py-1 text-xs font-semibold rounded-full transition-colors text-center"
      >
        <span
          ref={thTextRef}
          className={`inline-block transition-colors ${
            lang === "TH"
              ? "text-white font-bold"
              : "text-[#496273] dark:text-[#94abbc] hover:text-[#102A3A]"
          }`}
        >
          ไทย
        </span>
      </button>

      {/* English Option */}
      <button
        type="button"
        onClick={() => handleToggle("EN")}
        aria-label="Switch language to English"
        className="relative z-10 min-w-[34px] px-2.5 py-1 text-xs font-semibold rounded-full transition-colors text-center"
      >
        <span
          ref={enTextRef}
          className={`inline-block font-mono transition-colors ${
            lang === "EN"
              ? "text-white font-bold"
              : "text-[#496273] dark:text-[#94abbc] hover:text-[#102A3A]"
          }`}
        >
          EN
        </span>
      </button>
    </div>
  );
}
