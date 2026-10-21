"use client";

import Link from "next/link";
import { NavItem } from "@/components/layout/Navbar";

interface MobileMenuItemProps {
  item: NavItem;
  index: number;
  onSelect: (href: string) => void;
}

export function MobileMenuItem({ item, index, onSelect }: MobileMenuItemProps) {
  const numberStr = String(index + 1).padStart(2, "0");

  return (
    <div className="mobile-nav-item w-full">
      <Link
        href={item.href}
        onClick={(e) => {
          e.preventDefault();
          onSelect(item.href);
        }}
        className="group min-h-[56px] px-3.5 py-3 flex items-center justify-between rounded-xl border border-transparent hover:border-[#DCEAF1] dark:hover:border-[#1e3344] hover:bg-[#EAF6FB]/60 dark:hover:bg-[#16222c]/70 active:scale-[0.99] transition-all cursor-pointer"
      >
        <div className="flex items-start gap-3.5">
          <span className="text-xs font-mono font-bold text-[#0795CF] mt-1">
            {numberStr}
          </span>
          <div className="flex flex-col">
            <span className="font-sans font-bold text-2xl sm:text-3xl tracking-tight text-[#102A3A] dark:text-[#f0f7fb] group-hover:text-[#0795CF] dark:group-hover:text-[#0795CF] transition-colors">
              {item.label}
            </span>
            {item.description && (
              <span className="text-xs text-[#607786] dark:text-[#94abbc] mt-0.5 font-sans">
                {item.description}
              </span>
            )}
          </div>
        </div>

        <span
          aria-hidden="true"
          className="text-lg text-[#607786] dark:text-[#94abbc] group-hover:text-[#0795CF] group-hover:translate-x-1 transition-all"
        >
          &rarr;
        </span>
      </Link>
    </div>
  );
}
