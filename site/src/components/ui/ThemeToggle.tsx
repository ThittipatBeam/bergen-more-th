"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { useLanguage } from "@/hooks/use-language";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { language } = useLanguage();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

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

  const handleToggle = useCallback(() => {
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    const nextIsDark = !isCurrentlyDark;

    if (nextIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    }

    // GSAP 360-degree flip and elastic scale on the theme icon
    if (iconRef.current) {
      gsap.fromTo(
        iconRef.current,
        { rotation: 0, scale: 0.7 },
        {
          rotation: 360,
          scale: 1,
          duration: 0.45,
          ease: "back.out(1.8)",
        }
      );
    }

    // Gentle bounce on the text label
    if (textRef.current) {
      gsap.fromTo(
        textRef.current,
        { y: 3, opacity: 0.6 },
        { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
      );
    }
  }, []);

  const handleHoverIn = useCallback(() => {
    if (!buttonRef.current) return;
    gsap.to(buttonRef.current, {
      y: -1.5,
      boxShadow: "0 4px 12px rgba(7, 149, 207, 0.12)",
      borderColor: "#73B7DC",
      duration: 0.2,
      ease: "power2.out",
    });
  }, []);

  const handleHoverOut = useCallback(() => {
    if (!buttonRef.current) return;
    gsap.to(buttonRef.current, {
      y: 0,
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
      borderColor: "var(--border-default, #DCEAF1)",
      duration: 0.25,
      ease: "power2.out",
    });
  }, []);

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
      className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#DCEAF1] dark:border-[#1e3344] bg-white/90 dark:bg-[#111a22]/90 backdrop-blur-xs text-[#102A3A] dark:text-[#f0f7fb] text-xs font-sans font-medium shadow-xs select-none transition-colors min-h-[38px] cursor-pointer ${className}`}
    >
      {/* Icon: Crescent Moon for Dark / Sun for Light */}
      <span ref={iconRef} className="inline-flex items-center text-sm will-change-transform">
        {isDark ? (
          <span className="text-amber-400">☀️</span>
        ) : (
          <span className="text-[#0795CF]">🌙</span>
        )}
      </span>

      {/* Label: Dynamic based on active language ("Dark"/"Light" for EN, "มืด"/"สว่าง" for TH) */}
      <span ref={textRef} className="text-xs font-sans will-change-transform">
        {label}
      </span>
    </button>
  );
}
