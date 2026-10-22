"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrandIcon } from "@/components/ui/BrandIcon";

interface BenchmarkModelFilterProps {
  generators: string[];
  value: string;
  onChange: (generator: string) => void;
}

const ALL = "all";

/** Stacked-layers glyph for the "All models" option. */
function AllModelsIcon() {
  return (
    <svg
      className="w-4 h-4 shrink-0 text-[var(--brand-text)]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </svg>
  );
}

export function BenchmarkModelFilter({
  generators,
  value,
  onChange,
}: BenchmarkModelFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const options = [ALL, ...generators];
  const selectedIndex = Math.max(0, options.indexOf(value));
  const label = value === ALL ? "All models" : value;

  const close = useCallback((restoreFocus: boolean) => {
    setIsOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  const select = useCallback(
    (next: string) => {
      onChange(next);
      close(true);
    },
    [close, onChange]
  );

  // Close when clicking outside the filter
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, close]);

  const openMenu = useCallback(() => {
    setActiveIndex(selectedIndex);
    setIsOpen(true);
  }, [selectedIndex]);

  // Move focus to the active option when the menu opens
  useEffect(() => {
    if (isOpen) listboxRef.current?.focus();
  }, [isOpen]);

  const handleListKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close(true);
      return;
    }
    if (e.key === "Tab") {
      close(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % options.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + options.length) % options.length);
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(options.length - 1);
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select(options[activeIndex]);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full sm:w-auto text-left">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? close(true) : openMenu())}
        onKeyDown={(e) => {
          if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            openMenu();
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Filter by model: ${label}`}
        className="w-full sm:w-auto min-w-[180px] min-h-[44px] px-3.5 inline-flex items-center justify-between gap-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-subtle)] hover:border-[var(--brand-sky-light)] text-base font-sans font-medium text-[var(--text-primary)] cursor-pointer focus:outline-none focus-visible:border-[var(--border-focus)] transition-colors"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          {value === ALL ? (
            <AllModelsIcon />
          ) : (
            <BrandIcon name={value} size={16} />
          )}
          <span className="truncate">{label}</span>
        </span>
        <svg
          className={`w-3.5 h-3.5 shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={listboxRef}
          role="listbox"
          aria-label="Generator models"
          aria-activedescendant={`model-option-${activeIndex}`}
          tabIndex={-1}
          onKeyDown={handleListKeyDown}
          className="absolute left-0 top-full mt-2 z-30 w-full sm:w-64 min-w-[15rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] p-1.5 shadow-xl focus:outline-none transition-colors"
        >
          <p className="px-2.5 pt-1.5 pb-1.5 text-xs font-mono font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Generator model
          </p>

          <div className="flex flex-col gap-0.5">
            {options.map((option, index) => {
              const isSelected = option === value;
              const isActive = index === activeIndex;
              return (
                <button
                  key={option}
                  id={`model-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={-1}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => select(option)}
                  className={`w-full min-h-[44px] px-2.5 rounded-lg flex items-center gap-2.5 text-left text-sm font-sans transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[var(--surface-brand)] text-[var(--brand-text)] font-semibold"
                      : isActive
                        ? "bg-[var(--background-subtle)] text-[var(--text-primary)]"
                        : "text-[var(--text-primary)]"
                  }`}
                >
                  {option === ALL ? (
                    <AllModelsIcon />
                  ) : (
                    <BrandIcon name={option} size={16} />
                  )}
                  <span className="flex-1 truncate">{option === ALL ? "All models" : option}</span>
                  {isSelected && (
                    <svg
                      className="w-4 h-4 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m5 12 5 5L20 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
