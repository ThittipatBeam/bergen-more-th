"use client";

import { useRef, useEffect, useCallback, type RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MobileMenuItem } from "@/components/layout/MobileMenuItem";
import { MobileMenuHeader } from "@/components/layout/MobileMenuHeader";
import { NavItem } from "@/components/layout/Navbar";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useLanguage } from "@/hooks/use-language";
import { I18N } from "@/lib/i18n/translations";
import { usePageTransition } from "@/components/providers/PageTransitionProvider";

gsap.registerPlugin(useGSAP);

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavItem[];
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}

export function MobileMenu({ isOpen, onClose, items, returnFocusRef }: MobileMenuProps) {
  const { navigateTo } = usePageTransition();
  const { language } = useLanguage();
  const drawerRef = useRef<HTMLDivElement>(null);
  const isClosingRef = useRef(false);
  const reducedMotion = useReducedMotion();

  // Smooth closing animation before triggering onClose
  const handleAnimatedClose = useCallback(
    (callback?: () => void) => {
      if (isClosingRef.current || !drawerRef.current) return;
      isClosingRef.current = true;

      // Reduced motion: close immediately, no exit choreography
      if (reducedMotion) {
        isClosingRef.current = false;
        if (callback) callback();
        onClose();
        returnFocusRef.current?.focus();
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          isClosingRef.current = false;
          if (callback) callback();
          onClose();
          returnFocusRef.current?.focus();
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
    [onClose, reducedMotion, returnFocusRef]
  );

  const handleItemSelect = useCallback(
    (href: string) => {
      handleAnimatedClose(() => {
        navigateTo(href, { skipExit: true });
      });
    },
    [handleAnimatedClose, navigateTo]
  );

  // Entrance animation when drawer opens
  useGSAP(
    () => {
      if (!isOpen || !drawerRef.current) return;
      isClosingRef.current = false;

      // Reduced motion: render final state instantly
      if (reducedMotion) {
        gsap.set(
          [
            drawerRef.current,
            ".mobile-header-bar",
            ".mobile-nav-item",
            ".mobile-footer-group",
          ],
          { autoAlpha: 1, y: 0, yPercent: 0 }
        );
        return;
      }

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
    { dependencies: [isOpen, reducedMotion], scope: drawerRef }
  );

  // Keyboard: Escape closes; Tab cycles inside the drawer
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleAnimatedClose();
        return;
      }
      if (e.key !== "Tab" || !drawerRef.current) return;
      const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleAnimatedClose]);

  // Move focus into the drawer on open
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;
    drawerRef.current.querySelector<HTMLElement>("button")?.focus();
  }, [isOpen]);

  // Lock page scroll while the drawer is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={drawerRef}
      id="mobile-menu-drawer"
      role="dialog"
      aria-modal="true"
      aria-label={I18N[language].nav.openMenuAria}
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
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--status-live)] animate-pulse motion-reduce:animate-none" />
            <span>SIAM.AI BENCHMARK</span>
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-mono tracking-wider text-[var(--text-muted)]">
          <span>&copy; {new Date().getFullYear()} SIAM.AI</span>
          <span className="text-[var(--brand-text)]">THAI RAG CORPUS</span>
        </div>
      </div>
    </div>
  );
}
