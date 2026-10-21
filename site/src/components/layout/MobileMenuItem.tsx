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
        className="group min-h-[56px] px-3.5 py-3 flex items-center justify-between rounded-xl border border-transparent hover:border-[var(--border-default)] hover:bg-[var(--surface-brand)]/70 active:scale-[0.99] transition-all cursor-pointer"
      >
        <div className="flex items-start gap-3.5">
          <span className="text-xs font-mono font-bold text-[var(--brand-text)] mt-1">
            {numberStr}
          </span>
          <div className="flex flex-col">
            <span className="font-sans font-bold text-2xl sm:text-3xl tracking-tight text-[var(--text-primary)] group-hover:text-[var(--brand-text)] transition-colors">
              {item.label}
            </span>
            {item.description && (
              <span className="text-xs text-[var(--text-muted)] mt-0.5 font-sans">
                {item.description}
              </span>
            )}
          </div>
        </div>

        <span
          aria-hidden="true"
          className="text-lg text-[var(--text-muted)] group-hover:text-[var(--brand-text)] group-hover:translate-x-1 transition-all"
        >
          &rarr;
        </span>
      </Link>
    </div>
  );
}
