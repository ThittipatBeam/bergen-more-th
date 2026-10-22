"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { HeroSection } from "@/components/sections/HeroSection";
import { LeaderboardSection } from "@/components/sections/LeaderboardSection";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const leaderboardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Reduced motion: static stacked layout, no pinned scrub
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      // Pin the hero and let the leaderboard sheet slide up and over it
      // As the leaderboard covers it, the hero smoothly recedes and fades away
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=500",
          scrub: 1, // Smooth scrub linked directly to scroll
          pin: heroRef.current,
          pinSpacing: false, // Allows leaderboard card to slide directly over the hero
        },
      });

      tl.to(heroRef.current, {
        autoAlpha: 0,
        scale: 0.93,
        yPercent: -14,
        ease: "none",
      });
    },
    { scope: containerRef }
  );

  return (
    <main
      ref={containerRef}
      className="relative min-h-screen bg-[var(--background-canvas)] text-[var(--text-primary)] transition-colors duration-300"
    >
      {/* Pinned Hero Section (Bottom Layer) */}
      <div ref={heroRef} className="relative z-10 w-full will-change-transform">
        <HeroSection />
      </div>

      {/* Leaderboard Section (Top Layer): Slides directly over hero on scroll */}
      <div
        id="leaderboard"
        ref={leaderboardRef}
        className="relative z-20 w-full bg-[var(--background-primary)] rounded-t-[32px] sm:rounded-t-[40px] sheet-shadow border-t border-[var(--border-default)] min-h-screen transition-colors duration-300"
      >
        <LeaderboardSection />
      </div>
    </main>
  );
}
