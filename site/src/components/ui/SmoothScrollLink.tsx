"use client";

import type { ReactNode } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(ScrollToPlugin);

interface SmoothScrollLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
}

/**
 * In-page anchor that glides to its target with GSAP (runs on rAF, so it
 * matches the display refresh rate). Falls back to an instant jump when the
 * visitor prefers reduced motion.
 */
export function SmoothScrollLink({
  href,
  className = "",
  children,
}: SmoothScrollLinkProps) {
  const reducedMotion = useReducedMotion();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!href.startsWith("#")) return;

    const target = document.getElementById(href.slice(1));
    if (!target) return;

    event.preventDefault();

    if (reducedMotion) {
      target.scrollIntoView({ behavior: "auto", block: "start" });
      window.history.pushState(null, "", href);
      return;
    }

    gsap.to(window, {
      scrollTo: { y: target, autoKill: true },
      duration: 1.15,
      ease: "power3.inOut",
      onComplete: () => window.history.pushState(null, "", href),
      onInterrupt: () => window.history.pushState(null, "", href),
    });
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
