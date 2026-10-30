"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { ABOUT_LINKS } from "@/lib/about-data";
import { EMPTY_REQUEST_FORM } from "@/types/request";
import type { RequestFormState } from "@/types/request";
import { RequestForm } from "@/components/sections/RequestForm";
import { RequestReveal } from "@/components/sections/RequestReveal";
import { RequestSuccessCard } from "@/components/sections/RequestSuccessCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { useLanguage } from "@/hooks/use-language";
import { I18N } from "@/lib/i18n/translations";
import { BODY, BUTTON_PRIMARY, H2, MEASURE_NOTE, PAGE_SHELL } from "@/lib/design";

type SubmitStatus = "idle" | "sending" | "success" | "error" | "unconfigured";

export function RequestSection() {
  const [form, setForm] = useState<RequestFormState>(EMPTY_REQUEST_FORM);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const { language } = useLanguage();
  const t = I18N[language].request;

  const handleFieldChange = (key: keyof RequestFormState, value: string) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    try {
      const response = await fetch("/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (response.ok) {
        setStatus("success");
        return;
      }
      // 503 means no delivery provider is configured on the server: say so
      // instead of pretending the request went somewhere.
      setStatus(response.status === 503 ? "unconfigured" : "error");
    } catch {
      // Network failure: the form keeps its values so nothing is lost.
      setStatus("error");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setForm(EMPTY_REQUEST_FORM);
  };

  if (status === "success") {
    return (
      <div className={PAGE_SHELL}>
        <RequestSuccessCard
          generator={form.generatorName}
          embedding={form.embeddingName}
          reranker={form.rerankerName}
          email={form.email}
          onReset={handleReset}
        />
      </div>
    );
  }

  if (status === "unconfigured") {
    return (
      <div className={PAGE_SHELL}>
        <div
          role="status"
          className="flex flex-col items-start gap-4 rounded-3xl border border-[var(--border-strong)] bg-[var(--surface-brand)]/60 p-6 sm:p-8"
        >
          <h2 className={`${H2} text-[var(--text-primary)]`}>
            {t.unconfiguredTitle}
          </h2>
          <p className={`${BODY} ${MEASURE_NOTE} text-[var(--text-secondary)]`}>
            {t.unconfiguredBody}
          </p>
          <a
            href={ABOUT_LINKS.code}
            target="_blank"
            rel="noopener noreferrer"
            className={BUTTON_PRIMARY}
          >
            GitHub ↗
          </a>
        </div>
      </div>
    );
  }

  return (
    <RequestReveal>
      <div className={PAGE_SHELL}>
        <div data-form-reveal>
          <PageHeader title={t.title} lead={t.lead} />
        </div>

        <RequestForm
          form={form}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          status={status}
        />
      </div>
    </RequestReveal>
  );
}
