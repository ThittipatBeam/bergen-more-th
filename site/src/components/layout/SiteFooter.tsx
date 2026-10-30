"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/hooks/use-language";
import { I18N, NAV_ITEMS_EN } from "@/lib/i18n/translations";
import { RollingLink } from "@/components/ui/RollingLink";
import { WIDE_SHELL } from "@/lib/design";

export function SiteFooter() {
  const { language } = useLanguage();
  const t = I18N[language].footer;
  const pathname = usePathname();

  return (
    <footer className="w-full border-t border-[var(--border-default)] bg-[var(--background-primary)] transition-colors">
      <div className={`${WIDE_SHELL} py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-4`}>
        <div className="flex items-start gap-3 sm:gap-4">
          <Image
            src="/brand-mark.png"
            alt="SIAM.AI"
            width={279}
            height={140}
            unoptimized
            className="h-7 w-auto shrink-0 self-center dark:hidden"
          />
          <Image
            src="/brand-mark-white.png"
            alt=""
            aria-hidden="true"
            width={279}
            height={140}
            unoptimized
            className="hidden h-7 w-auto shrink-0 self-center dark:block"
          />
          <span
            aria-hidden="true"
            className="h-7 w-px shrink-0 self-center bg-[var(--border-default)]"
          />
          <p className="text-sm font-sans text-[var(--text-muted)] max-w-md leading-relaxed">
            {t.tagline}
          </p>
        </div>

        <nav
          aria-label="Footer"
          className="grid w-full grid-cols-2 gap-x-4 gap-y-1 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2 lg:gap-x-7"
        >
          {NAV_ITEMS_EN.map((item) => {
            const href = item.href === "/" ? "/#leaderboard" : item.href;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <div key={item.label} className="relative w-fit py-1 sm:py-2">
                <RollingLink
                  href={href}
                  label={item.label}
                  className={`text-xs font-semibold tracking-[0.16em] transition-colors ${
                    isActive
                      ? "text-[var(--brand-text)] font-bold"
                      : "text-[var(--text-primary)] hover:text-[var(--brand-text)]"
                  }`}
                />
                {isActive && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 rounded-full bg-[var(--brand-sky-blue)]" />
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </footer>
  );
}
