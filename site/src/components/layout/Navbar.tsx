"use client";

import { useState } from "react";
import Link from "next/link";
import { RollingLink } from "@/components/ui/RollingLink";
import { MobileMenu } from "@/components/layout/MobileMenu";

interface NavItem {
  label: string;
  href: string;
  alignment: "left" | "center" | "right";
}

const NAV_ITEMS: NavItem[] = [
  { label: "HOME", href: "/", alignment: "left" },
  { label: "ABOUT", href: "/about", alignment: "center" },
  { label: "GALLERY", href: "/gallery", alignment: "center" },
  { label: "ARTICLES", href: "/articles", alignment: "center" },
  { label: "ENQUIRE", href: "/enquire", alignment: "right" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Full-Width Frosted Glass Navbar Header */}
      <header
        className="fixed top-0 inset-x-0 z-40 w-full select-none border-b border-neutral-200/80 transition-all duration-300"
        style={{
          background: "rgba(255, 255, 255, 0.75)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="w-full px-6 sm:px-8 md:px-12 py-3 sm:py-3.5">
          {/* Desktop 5-Column Navigation Spanning Full Width */}
          <nav className="hidden md:grid grid-cols-5 items-center w-full">
            {NAV_ITEMS.map((item) => {
              const alignClass =
                item.alignment === "left"
                  ? "text-left"
                  : item.alignment === "right"
                  ? "text-right"
                  : "text-center";

              return (
                <div key={item.label} className={alignClass}>
                  <RollingLink
                    href={item.href}
                    label={item.label}
                    className="text-xs md:text-sm font-semibold tracking-[0.2em] text-neutral-900 hover:text-black transition-colors"
                  />
                </div>
              );
            })}
          </nav>

          {/* Mobile Navigation Header (< md) */}
          <div className="flex md:hidden items-center justify-between">
            <Link
              href="/"
              className="text-xs font-semibold tracking-[0.2em] text-neutral-900"
            >
              HOME
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center text-xs font-semibold tracking-[0.2em] text-neutral-900 hover:text-black"
            >
              MENU
            </button>
          </div>
        </div>
      </header>

      {/* Animated GSAP Mobile Drawer */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        items={NAV_ITEMS}
      />
    </>
  );
}
