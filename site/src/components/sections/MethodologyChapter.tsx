import type { ReactNode } from "react";
import { NumberedChapter } from "@/components/ui/NumberedChapter";
import type { MethodologyChapterMeta } from "@/types/methodology";

interface MethodologyChapterProps {
  chapter: MethodologyChapterMeta;
  children: ReactNode;
}

/** One numbered chapter of the methodology story. */
export function MethodologyChapter({
  chapter,
  children,
}: MethodologyChapterProps) {
  return (
    <NumberedChapter
      id={chapter.id}
      kicker={`Chapter ${chapter.number}`}
      title={chapter.title}
      intro={chapter.intro}
      icon={chapter.icon}
      accent={chapter.accent}
      density="relaxed"
    >
      {children}
    </NumberedChapter>
  );
}
