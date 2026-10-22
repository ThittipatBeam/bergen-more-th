"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { RollingLink } from "@/components/ui/RollingLink";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { NAV_ITEMS_EN } from "@/lib/i18n/translations";

export interface NavItem {
  label: string;
  href: string;
  description?: string;
}

export const NAV_ITEMS: NavItem[] = NAV_ITEMS_EN;

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cloudIconRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
  // Nav bar remains strictly in English across all language toggles
  const navItems = NAV_ITEMS_EN;

  // Playful spring hover on the cloud logo emblem
  const handleLogoHover = useCallback(() => {
    if (!cloudIconRef.current || reducedMotion) return;
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
  }, [reducedMotion]);

  const handleLogoLeave = useCallback(() => {
    if (!cloudIconRef.current || reducedMotion) return;
    gsap.to(cloudIconRef.current, {
      scale: 1,
      rotation: 0,
      y: 0,
      duration: 0.3,
      ease: "power2.out",
    });
  }, [reducedMotion]);

  return (
    <>
      {/* Full-Width Frosted Glass Navbar Header */}
      <header className="fixed top-0 inset-x-0 z-40 w-full select-none border-b border-[var(--border-default)] bg-[var(--background-canvas)]/85 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-2.5 sm:py-3 flex items-center justify-between">
          {/* Left: Brand with Official Cloud Logo */}
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <Link
              href="/"
              aria-label="SIAM.AI home"
              onMouseEnter={handleLogoHover}
              onMouseLeave={handleLogoLeave}
              className="group inline-flex shrink-0 items-center gap-2.5 min-h-[44px] cursor-pointer"
            >
              <div
                ref={cloudIconRef}
                className="relative flex items-center justify-center"
              >
                {/* Small screens: compact cloud mark */}
                <span className="flex shrink-0 items-center lg:hidden">
                  <Image
                    src="/brand-mark.png"
                    alt="SIAM.AI"
                    width={279}
                    height={140}
                    unoptimized
                    priority
                    className="h-6 w-auto dark:hidden"
                  />
                  <Image
                    src="/brand-mark-white.png"
                    alt=""
                    aria-hidden="true"
                    width={279}
                    height={140}
                    unoptimized
                    priority
                    className="hidden h-6 w-auto dark:block"
                  />
                </span>

                {/* ≥ lg: full horizontal lockup */}
                <span className="hidden shrink-0 items-center lg:flex">
                  <Image
                    src="/logo-horizontal.png"
                    alt="SIAMGPT"
                    width={758}
                    height={140}
                    unoptimized
                    priority
                    className="h-6 w-auto dark:hidden md:h-7"
                  />
                  <Image
                    src="/logo-horizontal-white.png"
                    alt=""
                    aria-hidden="true"
                    width={758}
                    height={140}
                    unoptimized
                    priority
                    className="hidden h-6 w-auto dark:block md:h-7"
                  />
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-3 lg:gap-7">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <div key={item.label} className="relative py-2">
                  <RollingLink
                    href={item.href}
                    label={item.label}
                    className={`text-xs font-semibold tracking-[0.16em] transition-colors ${
                      isActive
                        ? "text-[var(--brand-text)] font-bold"
                        : "text-[var(--text-primary)] hover:text-[var(--brand-text)]"
                    }`}
                  />
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-0 h-0.5 rounded-full bg-[var(--brand-sky-blue)]" />
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right: Operational Controls & Switches */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher with GSAP Animation */}
            <LanguageToggle />

            {/* Theme Toggle with GSAP Animation */}
            <ThemeToggle />

            {/* Mobile Menu Trigger (< md) - Strictly English */}
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu-drawer"
              className="md:hidden min-h-[44px] min-w-[44px] -mr-1 flex items-center justify-center text-xs font-semibold tracking-[0.18em] text-[var(--text-primary)] hover:text-[var(--brand-text)]"
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
        items={navItems}
        returnFocusRef={menuButtonRef}
      />
    </>
  );
}
