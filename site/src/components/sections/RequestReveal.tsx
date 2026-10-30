"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/** Staggers the request form's top-level blocks into view on first mount. */
export function RequestReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }
      const items = gsap.utils.toArray<HTMLElement>(
        ref.current?.querySelectorAll("[data-form-reveal]") ?? []
      );
      if (!items.length) return;
      gsap.set(items, { autoAlpha: 0, y: 14 });
      gsap.to(items, {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.09,
        ease: "power2.out",
        clearProps: "all",
      });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  );
}
