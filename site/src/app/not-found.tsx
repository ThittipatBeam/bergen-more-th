import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex max-w-md flex-col items-center gap-4">
        <span className="font-mono text-sm font-semibold tracking-widest text-[var(--brand-text)] uppercase">
          404 • Not Found
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
          Page Not Found
        </h1>
        <p className="font-sans text-sm text-[var(--text-secondary)] leading-relaxed">
          The requested page could not be found. Please check the URL or return to the leaderboard.
        </p>
        <Link
          href="/"
          className="mt-2 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[var(--brand-cta)] px-6 font-sans text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-cta-hover)]"
        >
          Back to Leaderboard
        </Link>
      </div>
    </main>
  );
}
