"use client";

import {
  createContext,
  useContext,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
  type RefObject,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface PageTransitionContextType {
  navigateTo: (href: string, options?: { skipExit?: boolean }) => void;
  isTransitioning: boolean;
  laserRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  ambientRef: RefObject<HTMLDivElement | null>;
}

const PageTransitionContext = createContext<PageTransitionContextType | null>(
  null
);

export function usePageTransition() {
  const context = useContext(PageTransitionContext);
  if (!context) {
    throw new Error(
      "usePageTransition must be used within a PageTransitionProvider"
    );
  }
  return context;
}

interface PageTransitionProviderProps {
  children: ReactNode;
}

export function PageTransitionProvider({
  children,
}: PageTransitionProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  const contentRef = useRef<HTMLDivElement>(null);
  const laserRef = useRef<HTMLDivElement>(null);
  const ambientRef = useRef<HTMLDivElement>(null);

  const isTransitioningRef = useRef(false);
  const lastPathnameRef = useRef(pathname);
  const isInitialMountRef = useRef(true);

  // Programmatic navigation with coordinated GSAP exit -> router.push -> entrance
  const navigateTo = useCallback(
    (href: string, options?: { skipExit?: boolean }) => {
      if (!href) return;

      const [targetPath, hash] = href.split("#");
      const currentPath = window.location.pathname;

      // In-page anchor: smooth-scroll to element directly
      if ((targetPath === "" || targetPath === currentPath) && hash) {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          return;
        }
      }

      // Same page without anchor: smooth-scroll to top
      if (targetPath === currentPath && !hash) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // Reduced motion: instant route push without animation
      if (reducedMotion) {
        router.push(href);
        return;
      }

      // Debounce: prevent duplicate triggers while already animating
      if (isTransitioningRef.current) return;
      isTransitioningRef.current = true;

      // If caller handles its own exit choreography (e.g. mobile drawer exit)
      if (options?.skipExit) {
        router.push(href);
        return;
      }

      // GSAP Exit Timeline
      const exitTl = gsap.timeline({
        onComplete: () => {
          router.push(href);
        },
      });

      // 1. Hairline laser sweeps across top directly below the frosted navbar
      if (laserRef.current) {
        exitTl.fromTo(
          laserRef.current,
          { scaleX: 0, opacity: 1 },
          { scaleX: 0.72, duration: 0.22, ease: "power2.inOut" },
          0
        );
      }

      // 2. Subtle ambient atmospheric glow illuminates top of viewport
      if (ambientRef.current) {
        exitTl.to(
          ambientRef.current,
          { opacity: 1, duration: 0.2, ease: "power2.out" },
          0
        );
      }

      // 3. Current page content smoothly floats upward and dissolves
      if (contentRef.current) {
        exitTl.to(
          contentRef.current,
          {
            y: -14,
            opacity: 0,
            filter: "blur(4px)",
            duration: 0.22,
            ease: "power2.in",
          },
          0
        );
      }
    },
    [reducedMotion, router]
  );

  // Entrance animation whenever pathname changes
  useGSAP(
    () => {
      // First mount: run subtle reveal on initial page load
      if (isInitialMountRef.current) {
        isInitialMountRef.current = false;
        lastPathnameRef.current = pathname;

        if (!reducedMotion && contentRef.current) {
          gsap.fromTo(
            contentRef.current,
            { opacity: 0, y: 16 },
            {
              opacity: 1,
              y: 0,
              duration: 0.35,
              ease: "power2.out",
              clearProps: "transform,filter",
            }
          );
        }
        return;
      }

      // Route has changed
      if (lastPathnameRef.current !== pathname) {
        lastPathnameRef.current = pathname;

        // Ensure user lands at top of the new page
        window.scrollTo(0, 0);

        if (reducedMotion) {
          isTransitioningRef.current = false;
          if (contentRef.current) {
            gsap.set(contentRef.current, {
              opacity: 1,
              y: 0,
              filter: "none",
              clearProps: "all",
            });
          }
          return;
        }

        // GSAP Entrance Timeline
        const enterTl = gsap.timeline({
          onComplete: () => {
            isTransitioningRef.current = false;
            if (contentRef.current) {
              gsap.set(contentRef.current, { clearProps: "transform,filter" });
            }
            ScrollTrigger.refresh();
          },
        });

        // 1. Finish laser beam sweep to 100% and fade away
        if (laserRef.current) {
          enterTl.to(
            laserRef.current,
            { scaleX: 1, duration: 0.18, ease: "power2.out" },
            0
          );
          enterTl.to(
            laserRef.current,
            { opacity: 0, duration: 0.16, ease: "power1.in" },
            0.12
          );
        }

        // 2. Ambient top glow fades back to zero
        if (ambientRef.current) {
          enterTl.to(
            ambientRef.current,
            { opacity: 0, duration: 0.32, ease: "power2.out" },
            0.05
          );
        }

        // 3. New page content glides in from bottom with blur resolve
        if (contentRef.current) {
          enterTl.fromTo(
            contentRef.current,
            {
              y: 20,
              opacity: 0,
              filter: "blur(6px)",
            },
            {
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
              duration: 0.4,
              ease: "power3.out",
            },
            0
          );
        }
      }
    },
    { dependencies: [pathname, reducedMotion] }
  );

  // Global click interceptor for internal links in capture phase
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Respect default prevented or non-primary mouse clicks
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      const anchor = (e.target as HTMLElement)?.closest<HTMLAnchorElement>(
        "a[href]"
      );
      if (!anchor) return;

      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        anchor.getAttribute("rel")?.includes("external")
      ) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Only handle internal relative routes
      if (!href.startsWith("/") || href.startsWith("//")) return;

      const [targetPath, hash] = href.split("#");
      const currentPath = window.location.pathname;

      // In-page hash jump: let default smooth scrolling handle it
      if ((targetPath === "" || targetPath === currentPath) && hash) {
        return;
      }

      // Same page without anchor: scroll smoothly to top
      if (targetPath === currentPath && !hash) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // Intercept internal route navigation to trigger GSAP exit first
      e.preventDefault();
      navigateTo(href);
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleDocumentClick, {
        capture: true,
      });
    };
  }, [navigateTo]);

  // Safety recovery timeout: prevent UI lockup if navigation fails or aborts
  useEffect(() => {
    if (!isTransitioningRef.current) return;
    const timer = setTimeout(() => {
      if (isTransitioningRef.current) {
        isTransitioningRef.current = false;
        if (contentRef.current) {
          gsap.set(contentRef.current, {
            opacity: 1,
            y: 0,
            filter: "none",
            clearProps: "all",
          });
        }
        if (laserRef.current) {
          gsap.set(laserRef.current, { opacity: 0, scaleX: 0 });
        }
        if (ambientRef.current) {
          gsap.set(ambientRef.current, { opacity: 0 });
        }
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <PageTransitionContext.Provider
      value={{
        navigateTo,
        isTransitioning: isTransitioningRef.current,
        laserRef,
        contentRef,
        ambientRef,
      }}
    >
      {children}
    </PageTransitionContext.Provider>
  );
}

export function PageTransitionView({ children }: { children: ReactNode }) {
  const { contentRef, ambientRef } = usePageTransition();

  return (
    <>
      {/* Subtle atmospheric glow during transitions */}
      <div
        ref={ambientRef}
        aria-hidden="true"
        className="fixed top-0 inset-x-0 h-48 pointer-events-none z-30 opacity-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(56,189,248,0.14),transparent_70%)]"
      />

      {/* Main page content wrapper with GSAP animation targets */}
      <div
        ref={contentRef}
        className="flex-1 flex flex-col w-full will-change-[transform,opacity,filter]"
      >
        {children}
      </div>
    </>
  );
}
