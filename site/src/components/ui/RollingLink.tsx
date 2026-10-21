"use client";

import { useRef } from "react";
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
  const reducedMotion = useReducedMotion();
  const characters = label.split("");

  const { contextSafe } = useGSAP({ scope: containerRef });

  const handleMouseEnter = contextSafe(() => {
    if (reducedMotion) return;
    gsap.to(".primary-char", {
      yPercent: -100,
      duration: 0.34,
      stagger: 0.02,
      ease: "power3.out",
      overwrite: "auto",
    });

    gsap.to(".clone-char", {
      yPercent: -100,
      duration: 0.34,
      stagger: 0.02,
      ease: "power3.out",
      overwrite: "auto",
    });
  });

  const handleMouseLeave = contextSafe(() => {
    if (reducedMotion) return;
    gsap.to(".primary-char", {
      yPercent: 0,
      duration: 0.3,
      stagger: 0.018,
      ease: "power3.out",
      overwrite: "auto",
    });

    gsap.to(".clone-char", {
      yPercent: 0,
      duration: 0.3,
      stagger: 0.018,
      ease: "power3.out",
      overwrite: "auto",
    });
  });

  return (
    <Link
      ref={containerRef}
      href={href}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`inline-flex items-center min-h-[44px] select-none rounded-sm ${className}`}
    >
      {/* Clipping container: comfortably fits full uppercase ascenders without clipping letters like Y */}
      <span className="relative inline-block overflow-hidden h-[1.35em] leading-none py-0.5">
        {/* Primary visible characters */}
        <span className="inline-flex leading-none">
          {characters.map((char, index) => (
            <span
              key={`primary-${index}`}
              className="primary-char inline-block"
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
              className="clone-char inline-block opacity-75"
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
      </span>
    </Link>
  );
}
