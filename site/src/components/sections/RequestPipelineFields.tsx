"use client";

import type { RequestFormState } from "@/types/request";
import type { LeaderboardMode } from "@/types/benchmark";
import { TextField } from "@/components/ui/TextField";
import { useLanguage } from "@/hooks/use-language";
import { useDataset } from "@/hooks/use-dataset";
import { I18N } from "@/lib/i18n/translations";
import { H3 } from "@/lib/design";

interface RequestPipelineFieldsProps {
  form: RequestFormState;
  onFieldChange: (key: keyof RequestFormState, value: string) => void;
}

/**
 * Generator, embedding and optional reranker — one headed group per stage,
 * visible labels, name on its own row with the link under it.
 */
export function RequestPipelineFields({
  form,
  onFieldChange,
}: RequestPipelineFieldsProps) {
  const { language } = useLanguage();
  const t = I18N[language].request;
  const tBoard = I18N[language].leaderboard;
  const { dataset, setDataset } = useDataset();
  const isTh = language === "TH";

  const boardChoices: { key: LeaderboardMode; label: string }[] = [
    { key: "wikipedia", label: tBoard.modeWikipedia },
    { key: "nitibench", label: tBoard.modeNitibench },
  ];

  const stages = [
    {
      id: "generator",
      title: t.generatorLabel,
      required: true,
      name: form.generatorName,
      nameId: "generator-name",
      onName: (value: string) => onFieldChange("generatorName", value),
      link: form.generatorLink,
      linkId: "generator-link",
      onLink: (value: string) => onFieldChange("generatorLink", value),
      placeholder: t.generatorPlaceholder,
    },
    {
      id: "embedding",
      title: t.embeddingLabel,
      required: true,
      name: form.embeddingName,
      nameId: "embedding-name",
      onName: (value: string) => onFieldChange("embeddingName", value),
      link: form.embeddingLink,
      linkId: "embedding-link",
      onLink: (value: string) => onFieldChange("embeddingLink", value),
      placeholder: t.embeddingPlaceholder,
    },
    {
      id: "reranker",
      title: t.rerankerLabel,
      required: false,
      name: form.rerankerName,
      nameId: "reranker-name",
      onName: (value: string) => onFieldChange("rerankerName", value),
      link: form.rerankerLink,
      linkId: "reranker-link",
      onLink: (value: string) => onFieldChange("rerankerLink", value),
      placeholder: t.rerankerPlaceholder,
    },
  ];

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      <h2 className={`${H3} text-[var(--text-primary)]`}>
        {t.pipelineGroup}
      </h2>

      {/* Which board this run lands on — the same switch as the one in the
          navigation bar, so the form always matches the board the visitor saw. */}
      <fieldset className="flex min-w-0 flex-col gap-4">
        <legend className="font-sans text-sm font-bold text-[var(--text-primary)]">
          {isTh ? "ชุดทดสอบ" : "Benchmark"}
        </legend>
        <div
          role="group"
          aria-label={isTh ? "ชุดทดสอบ" : "Benchmark"}
          className="flex w-full rounded-xl border border-[var(--border-default)] p-1 sm:w-fit"
        >
          {boardChoices.map(({ key, label }) => {
            const active = dataset === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setDataset(key)}
                className={`min-h-[44px] flex-1 rounded-lg px-4 font-sans text-xs font-semibold transition-colors cursor-pointer sm:min-w-[140px] sm:flex-none ${
                  active
                    ? "bg-[var(--text-primary)] text-[var(--background-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--brand-text)]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {stages.map((stage) => (
        <fieldset key={stage.id} className="flex min-w-0 flex-col gap-4">
          <legend className="font-sans text-sm font-bold text-[var(--text-primary)]">
            {stage.title}
            {stage.required && (
              <>
                <span aria-hidden="true" className="ml-0.5 text-[var(--negative)]">
                  *
                </span>
                <span className="sr-only"> (required)</span>
              </>
            )}
          </legend>
          <TextField
            id={stage.nameId}
            label={isTh ? "ชื่อโมเดล" : "Model name"}
            required={stage.required}
            value={stage.name}
            onChange={stage.onName}
            placeholder={stage.placeholder}
            autoComplete="off"
            maxLength={200}
          />
          <TextField
            id={stage.linkId}
            label={isTh ? "ลิงก์ (ไม่บังคับ)" : "Link (optional)"}
            inputMode="url"
            value={stage.link}
            onChange={stage.onLink}
            placeholder="https://huggingface.co/…"
            autoComplete="off"
            maxLength={500}
          />
        </fieldset>
      ))}
    </div>
  );
}
