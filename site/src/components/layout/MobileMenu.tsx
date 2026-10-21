"use client";

import { useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MobileMenuItem } from "@/components/layout/MobileMenuItem";
import { MobileMenuHeader } from "@/components/layout/MobileMenuHeader";
import { NavItem } from "@/components/layout/Navbar";

gsap.registerPlugin(useGSAP);

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavItem[];
}

export function MobileMenu({ isOpen, onClose, items }: MobileMenuProps) {
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);
  const isClosingRef = useRef(false);

  // Smooth closing animation before triggering onClose
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

      tl.to(".mobile-nav-item", {
        autoAlpha: 0,
        y: -12,
        duration: 0.16,
        stagger: 0.02,
        ease: "power2.in",
      });

      tl.to(
        drawerRef.current,
        {
          autoAlpha: 0,
          yPercent: -3,
          duration: 0.22,
          ease: "power2.in",
        },
        "-=0.08"
      );
    },
    [onClose]
  );

  const handleItemSelect = useCallback(
    (href: string) => {
      handleAnimatedClose(() => {
        router.push(href);
      });
    },
    [handleAnimatedClose, router]
  );

  // Entrance animation when drawer opens
  useGSAP(
    () => {
      if (!isOpen || !drawerRef.current) return;
      isClosingRef.current = false;

      const tl = gsap.timeline();

      // 1. Drawer background appears
      tl.fromTo(
        drawerRef.current,
        { autoAlpha: 0, yPercent: -4 },
        { autoAlpha: 1, yPercent: 0, duration: 0.32, ease: "power3.out" }
      );

      // 2. Top header bar fades in
      tl.fromTo(
        ".mobile-header-bar",
        { autoAlpha: 0, y: -8 },
        { autoAlpha: 1, y: 0, duration: 0.22, ease: "power2.out" },
        "-=0.15"
      );

      // 3. Staggered cascade: Each menu item appears sequentially
      tl.fromTo(
        ".mobile-nav-item",
        { autoAlpha: 0, y: -20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.38,
          stagger: 0.07,
          ease: "power3.out",
        },
        "-=0.1"
      );

      // 4. Preferences & footer fade in
      tl.fromTo(
        ".mobile-footer-group",
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.28, ease: "power2.out" },
        "-=0.15"
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
      aria-label="Navigation Menu"
      className="pointer-events-auto fixed inset-0 z-50 flex flex-col justify-between px-5 sm:px-8 pt-4 pb-12 sm:pb-8 text-[var(--text-primary)] bg-[var(--background-canvas)]/98 backdrop-blur-2xl select-none opacity-0 transition-colors overflow-y-auto"
    >
      {/* Top Header Bar */}
      <MobileMenuHeader onClose={() => handleAnimatedClose()} />

      {/* Center Navigation Links */}
      <nav className="flex flex-col gap-2.5 my-auto py-6">
        {items.map((item, idx) => (
          <MobileMenuItem
            key={item.label}
            item={item}
            index={idx}
            onSelect={handleItemSelect}
          />
        ))}
      </nav>

      {/* Preferences & System Bar (Bottom Group) */}
      <div className="mobile-footer-group flex flex-col gap-4 pt-4 border-t border-[var(--border-default)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SIAM.AI BENCHMARK</span>
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-[var(--text-muted)]">
          <span>&copy; {new Date().getFullYear()} SIAM.AI</span>
          <span className="text-[#0795CF]">THAI RAG CORPUS</span>
        </div>
      </div>
    </div>
  );
}
