"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface AboutRevealProps {
  children: ReactNode;
}

/** Inline properties GSAP owns during the reveal, handed back to CSS after. */
const HANDOFF = "transform,translate,rotate,scale,opacity";

/**
 * Reveals the link cards on /about once, as their group scrolls in: each card
 * rises, its top rule draws, and its icon settles a beat later.
 *
 * Anything marked `data-reveal` inside takes part. End values are written
 * explicitly (`set` then `to`) rather than read back from the DOM, so the CSS
 * hover transitions on `translate`/`scale` cannot leak into the tween. On
 * completion the inline transform is cleared and hover returns to CSS.
 */
export function AboutReveal({ children }: AboutRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const cards = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      const rules = gsap.utils.toArray<HTMLElement>("[data-reveal-rule]");
      const icons = gsap.utils.toArray<HTMLElement>("[data-reveal-icon]");
      if (!cards.length) {
        return;
      }

      gsap.set(cards, { y: 24, opacity: 0 });
      if (rules.length) {
        gsap.set(rules, { scaleX: 0 });
      }
      if (icons.length) {
        gsap.set(icons, { scale: 0.6, opacity: 0 });
      }

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          ref.current?.setAttribute("data-reveal-ready", "");
          gsap.set([...cards, ...rules, ...icons], { clearProps: HANDOFF });
        },
        scrollTrigger: {
          trigger: ref.current,
          start: "top 82%",
          once: true,
        },
      });

      tl.to(cards, { y: 0, opacity: 1, duration: 0.6, stagger: 0.09 }, 0);

      if (rules.length) {
        tl.to(
          rules,
          {
            scaleX: 1,
            duration: 0.55,
            ease: "power2.inOut",
            stagger: 0.09,
          },
          0.08
        );
      }

      if (icons.length) {
        tl.to(
          icons,
          {
            scale: 1,
            opacity: 1,
            duration: 0.45,
            ease: "back.out(2)",
            stagger: 0.09,
          },
          0.16
        );
      }
    },
    { scope: ref }
  );

  return (
    <div ref={ref} data-reveal-group>
      {children}
    </div>
  );
}
