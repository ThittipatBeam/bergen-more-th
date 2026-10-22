"use client";

import { useRef, useMemo } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(useGSAP);

interface RollingLinkProps {
  href: string;
  label: string;
  className?: string;
  onClick?: () => void;
}

export function RollingLink({
  href,
  label,
  className = "",
  onClick,
}: RollingLinkProps) {
  const containerRef = useRef<HTMLAnchorElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const reducedMotion = useReducedMotion();
  const characters = useMemo(() => label.split(""), [label]);

  useGSAP(
    () => {
      if (reducedMotion || !containerRef.current) return;

      const q = gsap.utils.selector(containerRef);
      const primaryChars = q(".primary-char");
      const cloneChars = q(".clone-char");

      if (!primaryChars.length || !cloneChars.length) return;

      // Clean up any existing timeline
      if (tlRef.current) {
        tlRef.current.kill();
      }

      // Reset all letters to initial neutral position
      gsap.set([primaryChars, cloneChars], { yPercent: 0 });

      // Create a unified paused timeline for strictly synchronized forward/reverse scrubbing
      const tl = gsap.timeline({
        paused: true,
      });

      tl.to(
        primaryChars,
        {
          yPercent: -100,
          duration: 0.28,
          stagger: 0.015,
          ease: "power2.inOut",
        },
        0
      ).to(
        cloneChars,
        {
          yPercent: -100,
          duration: 0.28,
          stagger: 0.015,
          ease: "power2.inOut",
        },
        0
      );

      tlRef.current = tl;

      return () => {
        tl.kill();
      };
    },
    { scope: containerRef, dependencies: [label, reducedMotion] }
  );

  const handleMouseEnter = () => {
    if (reducedMotion || !tlRef.current) return;
    tlRef.current.timeScale(1).play();
  };

  const handleMouseLeave = () => {
    if (reducedMotion || !tlRef.current) return;
    tlRef.current.timeScale(1.3).reverse();
  };

  const handleClick = () => {
    if (tlRef.current) {
      tlRef.current.timeScale(2).reverse();
    }
    onClick?.();
  };

  return (
    <Link
      ref={containerRef}
      href={href}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      className={`inline-flex items-center min-h-[44px] select-none rounded-sm ${className}`}
    >
      {/* Clipping container: comfortably fits full uppercase ascenders without clipping letters like Y */}
      <span className="relative inline-block overflow-hidden h-[1.35em] leading-none py-0.5">
        {/* Primary visible characters */}
        <span className="inline-flex leading-none">
          {characters.map((char, index) => (
            <span
              key={`primary-${index}`}
              className="primary-char inline-block will-change-transform"
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>

        {/* Clone characters: positioned top-full so they are 100% hidden below in pure CSS */}
        <span
          aria-hidden="true"
          className="absolute top-full left-0 inline-flex leading-none pointer-events-none"
        >
          {characters.map((char, index) => (
            <span
              key={`clone-${index}`}
              className="clone-char inline-block will-change-transform"
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
      </span>
    </Link>
  );
}
