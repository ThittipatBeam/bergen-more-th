"use client";

import {
  createContext,
  useContext,
  useRef,
  useCallback,
  useEffect,
  useState,
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
  contentRef: RefObject<HTMLDivElement | null>;
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

  const [isTransitioning, setIsTransitioning] = useState(false);
  const isTransitioningRef = useRef(false);
  const setTransitioning = useCallback((val: boolean) => {
    isTransitioningRef.current = val;
    setIsTransitioning(val);
  }, []);
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

      // GSAP Exit Timeline: the current page lifts slightly and fades.
      const exitTl = gsap.timeline({
        onComplete: () => {
          router.push(href);
        },
      });

      if (contentRef.current) {
        exitTl.to(
          contentRef.current,
          {
            y: -12,
            opacity: 0,
            duration: 0.2,
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
          setTransitioning(false);
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

        // GSAP Entrance Timeline: the new page settles into place.
        const enterTl = gsap.timeline({
          onComplete: () => {
            setTransitioning(false);
            if (contentRef.current) {
              gsap.set(contentRef.current, { clearProps: "transform,filter" });
            }
            ScrollTrigger.refresh();
          },
        });

        if (contentRef.current) {
          enterTl.fromTo(
            contentRef.current,
            { y: 14, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.32,
              ease: "power2.out",
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
        setTransitioning(false);
        if (contentRef.current) {
          gsap.set(contentRef.current, {
            opacity: 1,
            y: 0,
            filter: "none",
            clearProps: "all",
          });
        }
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [pathname, setTransitioning]);

  return (
    <PageTransitionContext.Provider
      value={{
        navigateTo,
        isTransitioning,
        contentRef,
      }}
    >
      {children}
    </PageTransitionContext.Provider>
  );
}

export function PageTransitionView({ children }: { children: ReactNode }) {
  const { contentRef } = usePageTransition();

  return (
    // Main page content wrapper with GSAP animation targets
    <div
      ref={contentRef}
      className="flex-1 flex flex-col w-full will-change-[transform,opacity]"
    >
      {children}
    </div>
  );
}
