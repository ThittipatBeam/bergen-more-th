"use client";

import React, { useRef, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

interface InteractiveTitleProps {
  text: string;
  className?: string;
}

export function InteractiveTitle({ text, className = "" }: InteractiveTitleProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      // Gentle wave entrance animation on initial mount
      gsap.fromTo(
        ".interactive-char",
        {
          autoAlpha: 0,
          y: 35,
          scale: 0.9,
          rotation: () => (Math.random() - 0.5) * 12,
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          rotation: 0,
          duration: 0.65,
          stagger: 0.02,
          ease: "back.out(1.6)",
        }
      );
    },
    { scope: containerRef }
  );

  // Playful jelly bounce when mouse glides over a character
  const handleCharHover = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      const target = e.currentTarget;
      const randomTilt = (Math.random() - 0.5) * 22; // Random tilt between -11deg and +11deg

      gsap.timeline({ overwrite: "auto" })
        .to(target, {
          y: -22,
          scaleY: 1.26,
          scaleX: 0.88,
          rotation: randomTilt,
          color: "#0795CF", // SIAM.AI Sky Blue pulse on hover
          duration: 0.12,
          ease: "power2.out",
        })
        .to(target, {
          y: 0,
          scaleY: 1,
          scaleX: 1,
          rotation: 0,
          color: "inherit",
          duration: 0.75,
          ease: "elastic.out(1.25, 0.35)", // Bouncy jelly spring
        });
    },
    []
  );

  // Easter egg: 360-degree backflip when clicking a letter!
  const handleCharClick = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      const target = e.currentTarget;
      gsap.timeline({ overwrite: "auto" })
        .to(target, {
          y: -35,
          scale: 1.35,
          rotation: "+=360",
          color: "#01A9B1", // SIAM.AI Turquoise accent on click
          duration: 0.35,
          ease: "power2.out",
        })
        .to(target, {
          y: 0,
          scale: 1,
          color: "inherit",
          duration: 0.8,
          ease: "elastic.out(1.2, 0.4)",
        });
    },
    []
  );

  // Split text into words to prevent breaking words across lines awkwardly
  const words = text.split(" ");

  return (
    <h1
      ref={containerRef}
      className={`font-sans font-bold sm:font-extrabold tracking-[-0.03em] leading-[1.08] select-none text-[#102A3A] dark:text-[#f0f7fb] transition-colors duration-200 ${className}`}
    >
      {words.map((word, wordIndex) => (
        <span key={`word-${wordIndex}`} className="inline-block whitespace-nowrap">
          {word.split("").map((char, charIndex) => (
            <span
              key={`char-${wordIndex}-${charIndex}`}
              onMouseEnter={handleCharHover}
              onClick={handleCharClick}
              className="interactive-char inline-block cursor-pointer will-change-transform transform-gpu"
            >
              {char}
            </span>
          ))}
          {/* Space between words */}
          {wordIndex < words.length - 1 && (
            <span className="inline-block">&nbsp;</span>
          )}
        </span>
      ))}
    </h1>
  );
}
