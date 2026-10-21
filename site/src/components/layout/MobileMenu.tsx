"use client";

import { useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

gsap.registerPlugin(useGSAP);

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: { label: string; href: string }[];
}

export function MobileMenu({ isOpen, onClose, items }: MobileMenuProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const isClosingRef = useRef(false);

  // Handle smooth closing animation before unmounting
  const handleAnimatedClose = useCallback(
    (callback?: () => void) => {
      if (isClosingRef.current || !drawerRef.current) return;
      isClosingRef.current = true;

      const tl = gsap.timeline({
        onComplete: () => {
          isClosingRef.current = false;
          if (callback) callback();
          onClose();
        },
      });

      // Animate items out quickly in reverse
      tl.to(".mobile-nav-item", {
        autoAlpha: 0,
        y: -15,
        duration: 0.18,
        stagger: 0.03,
        ease: "power2.in",
      });

      tl.to(
        drawerRef.current,
        {
          autoAlpha: 0,
          yPercent: -4,
          duration: 0.25,
          ease: "power2.in",
        },
        "-=0.1"
      );
    },
    [onClose]
  );

  // Entrance animation when drawer opens
  useGSAP(
    () => {
      if (!isOpen || !drawerRef.current) return;
      isClosingRef.current = false;

      const tl = gsap.timeline();

      // 1. Drawer background appears with subtle drop
      tl.fromTo(
        drawerRef.current,
        { autoAlpha: 0, yPercent: -5 },
        { autoAlpha: 1, yPercent: 0, duration: 0.35, ease: "power3.out" }
      );

      // 2. Top header bar fades in
      tl.fromTo(
        ".mobile-header-bar",
        { autoAlpha: 0, y: -10 },
        { autoAlpha: 1, y: 0, duration: 0.25, ease: "power2.out" },
        "-=0.15"
      );

      // 3. Staggered cascade: Each menu item appears sequentially from top to bottom
      tl.fromTo(
        ".mobile-nav-item",
        { autoAlpha: 0, y: -24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.42,
          stagger: 0.08, // Cascade from top to bottom
          ease: "power3.out",
        },
        "-=0.1"
      );

      // 4. Bottom footer fades in
      tl.fromTo(
        ".mobile-footer-bar",
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" },
        "-=0.2"
      );
    },
    { dependencies: [isOpen], scope: drawerRef }
  );

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleAnimatedClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleAnimatedClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={drawerRef}
      role="dialog"
      aria-modal="true"
      className="pointer-events-auto fixed inset-0 z-50 flex flex-col justify-between px-6 py-6 sm:px-8 text-[var(--text-primary)] bg-[var(--background-canvas)]/96 backdrop-blur-2xl select-none opacity-0 transition-colors"
    >
      {/* Top Header Bar */}
      <div className="mobile-header-bar flex items-center justify-between w-full">
        <span className="text-xs font-semibold tracking-[0.2em] text-[#607786] uppercase">
          SIAM.AI
        </span>
        <button
          type="button"
          onClick={() => handleAnimatedClose()}
          aria-label="Close navigation menu"
          className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center text-xs font-semibold tracking-[0.2em] text-[#102A3A] hover:text-[#0795CF] transition-colors"
        >
          CLOSE
        </button>
      </div>

      {/* Cascading Navigation Links (Top to Bottom) */}
      <nav className="flex flex-col gap-5 my-auto">
        {items.map((item, idx) => (
          <div key={item.label} className="mobile-nav-item">
            <Link
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                handleAnimatedClose(() => {
                  window.location.href = item.href;
                });
              }}
              className="group min-h-[48px] py-2 flex items-center justify-between border-b border-[#DCEAF1] transition-colors"
            >
              <span className="text-3xl sm:text-4xl font-light tracking-[0.15em] text-[#102A3A] group-hover:text-[#0795CF] transition-colors">
                {item.label}
              </span>
              <span className="text-xs tracking-normal text-[#607786] font-mono">
                0{idx + 1}
              </span>
            </Link>
          </div>
        ))}
      </nav>

      {/* Mobile Drawer Language & Theme Switches */}
      <div className="mobile-actions-bar py-4 border-t border-[#DCEAF1] dark:border-[#1e3344] flex items-center justify-between">
        <span className="text-xs font-mono tracking-wider text-[#607786]">PREFERENCES</span>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="mobile-footer-bar pt-4 border-t border-[#DCEAF1] dark:border-[#1e3344] flex items-center justify-between text-[11px] tracking-widest text-[#607786]">
        <span>SIAM.AI &copy; {new Date().getFullYear()}</span>
        <span className="font-mono text-[#0795CF]">CLOUD BENCHMARK</span>
      </div>
    </div>
  );
}
