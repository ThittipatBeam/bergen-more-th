import type { ReactNode } from "react";
import { NumberedChapter } from "@/components/ui/NumberedChapter";
import type { MethodologyChapterMeta } from "@/types/methodology";

interface MethodologyChapterProps {
  chapter: MethodologyChapterMeta;
  /** Localized chapter kicker; /metrics and /about already localize theirs. */
  kicker: string;
  children: ReactNode;
}

/** One numbered chapter of the methodology story. */
export function MethodologyChapter({
  chapter,
  kicker,
  children,
}: MethodologyChapterProps) {
  return (
    <NumberedChapter
      id={chapter.id}
      kicker={kicker}
      title={chapter.title}
      intro={chapter.intro}
      icon={chapter.icon}
      accent={chapter.accent}
    >
      {children}
    </NumberedChapter>
  );
}
