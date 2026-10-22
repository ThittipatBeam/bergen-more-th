"use client";

import Image from "next/image";

interface MobileMenuHeaderProps {
  onClose: () => void;
}

export function MobileMenuHeader({ onClose }: MobileMenuHeaderProps) {
  return (
    <div className="mobile-header-bar flex items-center justify-between w-full pb-4 border-b border-[var(--border-default)]">
      <div className="inline-flex items-center gap-2.5">
        <div className="relative flex h-6 w-12 items-center justify-center">
          <Image
            src="/brand-mark.png"
            alt="SIAM.AI"
            width={279}
            height={140}
            unoptimized
            className="h-full w-full object-contain dark:hidden"
          />
          <Image
            src="/brand-mark-white.png"
            alt=""
            aria-hidden="true"
            width={279}
            height={140}
            unoptimized
            className="hidden h-full w-full object-contain dark:block"
          />
        </div>
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--text-muted)] border-l border-[var(--border-default)] pl-2">
          BENCHMARK
        </span>
      </div>

      {/* Strictly English Close Button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close navigation menu"
        className="min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border-default)] bg-[var(--background-primary)]/80 text-xs font-semibold tracking-wider text-[var(--text-primary)] hover:text-[var(--brand-text)] hover:border-[var(--brand-sky-light)] transition-all cursor-pointer shadow-xs"
      >
        <span>CLOSE</span>
        <span aria-hidden="true" className="text-sm font-bold leading-none">
          &times;
        </span>
      </button>
    </div>
  );
}
