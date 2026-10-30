import Link from "next/link";
import {
  BODY,
  BUTTON_PRIMARY,
  H2,
  KICKER,
  PAGE_GUTTER,
} from "@/lib/design";

export default function NotFound() {
  return (
    <main
      className={`flex min-h-[60vh] flex-col items-center justify-center text-center ${PAGE_GUTTER}`}
    >
      <div className="flex max-w-md flex-col items-center gap-4">
        <span className={`${KICKER} text-[var(--brand-text)]`}>
          404 • Not Found
        </span>
        <h1 className={`${H2} text-[var(--text-primary)]`}>Page Not Found</h1>
        <p className={`${BODY} text-[var(--text-secondary)]`}>
          The requested page could not be found. Please check the URL or return
          to the leaderboard.
        </p>
        <Link href="/" className={`mt-2 ${BUTTON_PRIMARY}`}>
          Back to Leaderboard
        </Link>
      </div>
    </main>
  );
}
