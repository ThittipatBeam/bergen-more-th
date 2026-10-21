"use client";

import Image from "next/image";

interface MobileMenuHeaderProps {
  onClose: () => void;
}

export function MobileMenuHeader({ onClose }: MobileMenuHeaderProps) {
  return (
    <div className="mobile-header-bar flex items-center justify-between w-full pb-4 border-b border-[var(--border-default)]">
      <div className="inline-flex items-center gap-2.5">
        <Image
          src="/logo.png"
          alt="SIAM Logo"
          width={32}
          height={20}
          className="w-7 h-auto object-contain"
          priority
        />
        <div className="flex items-baseline gap-1">
          <span className="font-sans font-bold text-base tracking-tight text-[var(--text-primary)]">
            SIAM
          </span>
          <span className="font-sans font-bold text-base text-[#0795CF]">
            .AI
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] border-l border-[var(--border-default)] pl-2 ml-1">
            BENCHMARK
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close navigation menu"
        className="min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border-default)] bg-[var(--background-primary)]/80 text-xs font-semibold tracking-wider text-[var(--text-primary)] hover:text-[#0795CF] hover:border-[#73B7DC] transition-all cursor-pointer shadow-xs"
      >
        <span>CLOSE</span>
        <span aria-hidden="true" className="text-sm font-bold leading-none">
          &times;
        </span>
      </button>
    </div>
  );
}
