"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { JUDGE_NAME, JUDGE_N } from "@/lib/benchmark-data";
import { EMPTY_REQUEST_FORM } from "@/types/request";
import type { RequestFormState } from "@/types/request";
import { RequestForm } from "@/components/sections/RequestForm";
import { RequestSuccessCard } from "@/components/sections/RequestSuccessCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { useLanguage } from "@/hooks/use-language";
import { I18N } from "@/lib/i18n/translations";

export function RequestSection() {
  const [form, setForm] = useState<RequestFormState>(EMPTY_REQUEST_FORM);
  const [submitted, setSubmitted] = useState(false);
  const { language } = useLanguage();
  const t = I18N[language].request;

  const handleFieldChange = (key: keyof RequestFormState, value: string) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setForm(EMPTY_REQUEST_FORM);
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 pt-28 pb-20 sm:gap-12 sm:px-8 md:px-12">
      <PageHeader
        kicker={t.kicker}
        title={t.title}
        lead={t.lead}
        meta={t.meta(JUDGE_N, JUDGE_NAME)}
      />

      {submitted ? (
        <RequestSuccessCard
          generator={form.generatorName}
          embedding={form.embeddingName}
          reranker={form.rerankerName}
          email={form.email}
          onReset={handleReset}
        />
      ) : (
        <RequestForm
          form={form}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
