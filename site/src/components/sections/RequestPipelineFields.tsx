"use client";

import type { RequestFormState } from "@/types/request";
import { TextField } from "@/components/ui/TextField";
import { useLanguage } from "@/hooks/use-language";
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
  const isTh = language === "TH";

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
