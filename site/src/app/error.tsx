"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex max-w-md flex-col items-center gap-4">
        <span className="font-mono text-sm font-semibold tracking-widest text-[var(--brand-text)] uppercase">
          Application Error
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
          Something went wrong
        </h1>
        <p className="font-sans text-sm text-[var(--text-secondary)] leading-relaxed">
          An unexpected error occurred while loading this page. You can attempt to reload or return home.
        </p>
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-xl bg-[var(--brand-cta)] px-5 font-sans text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-cta-hover)]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[var(--border-default)] px-5 font-sans text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--background-subtle)]"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
