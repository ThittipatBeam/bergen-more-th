"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  BODY,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  H2,
  KICKER,
  PAGE_GUTTER,
} from "@/lib/design";

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
    <main
      className={`flex min-h-[60vh] flex-col items-center justify-center text-center ${PAGE_GUTTER}`}
    >
      <div className="flex max-w-md flex-col items-center gap-4">
        <span className={`${KICKER} text-[var(--brand-text)]`}>
          Application Error
        </span>
        <h1 className={`${H2} text-[var(--text-primary)]`}>
          Something went wrong
        </h1>
        <p className={`${BODY} text-[var(--text-secondary)]`}>
          An unexpected error occurred while loading this page. You can attempt
          to reload or return home.
        </p>
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className={`cursor-pointer ${BUTTON_PRIMARY}`}
          >
            Try again
          </button>
          <Link href="/" className={BUTTON_SECONDARY}>
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
