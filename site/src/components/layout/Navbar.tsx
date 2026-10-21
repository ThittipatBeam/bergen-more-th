"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { RollingLink } from "@/components/ui/RollingLink";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MobileMenu } from "@/components/layout/MobileMenu";

export interface NavItem {
  label: string;
  href: string;
  description?: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "LEADERBOARD",
    href: "#leaderboard",
    description: "Thai RAG & LLM rankings",
  },
  {
    label: "MODELS",
    href: "#leaderboard",
    description: "Evaluated dense & hybrid models",
  },
  {
    label: "METHODOLOGY",
    href: "#",
    description: "Evaluation corpus & metrics",
  },
  {
    label: "CLOUD",
    href: "https://siam.ai",
    description: "SIAM.AI GPU infrastructure",
  },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cloudIconRef = useRef<HTMLDivElement>(null);

  // Playful spring hover on the cloud logo emblem
  const handleLogoHover = useCallback(() => {
    if (!cloudIconRef.current) return;
    gsap.fromTo(
      cloudIconRef.current,
      { scale: 0.95, rotation: -4 },
      {
        scale: 1.08,
        rotation: 0,
        y: -2,
        duration: 0.4,
        ease: "back.out(2.2)",
      }
    );
  }, []);

  const handleLogoLeave = useCallback(() => {
    if (!cloudIconRef.current) return;
    gsap.to(cloudIconRef.current, {
      scale: 1,
      rotation: 0,
      y: 0,
      duration: 0.3,
      ease: "power2.out",
    });
  }, []);

  return (
    <>
      {/* Full-Width Frosted Glass Navbar Header */}
      <header className="fixed top-0 inset-x-0 z-40 w-full select-none border-b border-[#DCEAF1] dark:border-[#1e3344] bg-[#F7FBFD]/85 dark:bg-[#0c1218]/85 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-2.5 sm:py-3 flex items-center justify-between">
          {/* Left: Brand with Official Cloud Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              onMouseEnter={handleLogoHover}
              onMouseLeave={handleLogoLeave}
              className="group inline-flex items-center gap-2.5 min-h-[44px] cursor-pointer"
            >
              <div
                ref={cloudIconRef}
                className="relative w-8 h-5 sm:w-9 sm:h-5.5 flex items-center justify-center will-change-transform"
              >
                <Image
                  src="/logo.png"
                  alt="SIAM Logo"
                  width={36}
                  height={22}
                  className="w-full h-auto object-contain"
                  priority
                />
              </div>

              <div className="flex items-baseline gap-1">
                <span className="font-sans font-bold text-base sm:text-lg tracking-tight text-[#102A3A] dark:text-[#f0f7fb] group-hover:text-[#0795CF] transition-colors">
                  SIAM
                </span>
                <span className="font-sans font-bold text-base sm:text-lg text-[#0795CF]">
                  .AI
                </span>
                <span className="hidden lg:inline-block text-[10px] font-mono uppercase tracking-widest text-[#607786] dark:text-[#94abbc] border-l border-[#DCEAF1] dark:border-[#1e3344] pl-2 ml-1">
                  BENCHMARK
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {NAV_ITEMS.map((item) => (
              <RollingLink
                key={item.label}
                href={item.href}
                label={item.label}
                className="text-xs font-semibold tracking-[0.16em] text-[#102A3A] dark:text-[#f0f7fb] hover:text-[#0795CF] transition-colors"
              />
            ))}
          </nav>

          {/* Right: Operational Controls & Switches */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher with GSAP Animation */}
            <LanguageToggle />

            {/* Theme Toggle with GSAP Animation */}
            <ThemeToggle />

            {/* Mobile Menu Trigger (< md) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="md:hidden min-h-[44px] min-w-[44px] -mr-1 flex items-center justify-center text-xs font-semibold tracking-[0.18em] text-[#102A3A] dark:text-[#f0f7fb] hover:text-[#0795CF]"
            >
              MENU
            </button>
          </div>
        </div>
      </header>

      {/* Animated GSAP Mobile Drawer */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        items={NAV_ITEMS}
      />
    </>
  );
}
