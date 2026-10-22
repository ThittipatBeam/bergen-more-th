"use client";

import type { RequestFormState } from "@/types/request";
import { TextField } from "@/components/ui/TextField";
import { useLanguage } from "@/hooks/use-language";

interface RequestContactFieldsProps {
  form: RequestFormState;
  onFieldChange: (key: keyof RequestFormState, value: string) => void;
}

/** Reply-to details (required) and free-form notes (optional). */
export function RequestContactFields({
  form,
  onFieldChange,
}: RequestContactFieldsProps) {
  const { language } = useLanguage();
  const isTh = language === "TH";

  return (
    <>
      <section
        aria-labelledby="contact-title"
        className="flex flex-col gap-6 border-t border-[var(--border-default)] pt-8"
      >
        <div className="flex flex-col gap-2">
          <h2
            id="contact-title"
            className="font-sans text-xl font-bold text-[var(--text-primary)] sm:text-2xl"
          >
            {isTh ? "ข้อมูลผู้ติดต่อ" : "Who should we reply to?"}
          </h2>
          <p className="max-w-[58ch] font-sans text-base leading-7 text-[var(--text-secondary)]">
            {isTh
              ? "โปรดระบุชื่อผู้ติดต่อและอีเมลเพื่อให้ทีมงานติดต่อยืนยันก่อนเริ่มรันการทดสอบ"
              : "We need a contact and an email address to confirm the run with you."}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            id="contact"
            label={isTh ? "ชื่อผู้ติดต่อ หรือ องค์กร / ทีม" : "Contact or organization name"}
            required
            value={form.contact}
            onChange={(value) => onFieldChange("contact", value)}
            autoComplete="organization"
          />
          <TextField
            id="email"
            label={isTh ? "อีเมลสำหรับติดต่อ" : "Email"}
            type="email"
            inputMode="email"
            required
            value={form.email}
            onChange={(value) => onFieldChange("email", value)}
            autoComplete="email"
          />
        </div>
      </section>

      <section
        aria-labelledby="notes-title"
        className="flex flex-col gap-4 border-t border-[var(--border-default)] pt-8"
      >
        <div className="flex flex-col gap-2">
          <h2
            id="notes-title"
            className="font-sans text-xl font-bold text-[var(--text-primary)] sm:text-2xl"
          >
            {isTh ? "รายละเอียดเพิ่มเติม" : "Anything else?"}
          </h2>
          <p className="max-w-[58ch] font-sans text-base leading-7 text-[var(--text-secondary)]">
            {isTh
              ? "ไม่บังคับ สามารถระบุพารามิเตอร์เฉพาะ, Prompt template หรือเปเปอร์งานวิจัยที่ต้องการให้เราทดสอบซ้ำ"
              : "Optional. Tell us about parameters, prompts or a paper you want us to reproduce."}
          </p>
        </div>
        <label
          htmlFor="notes"
          className="font-sans text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]"
        >
          {isTh ? "หมายเหตุเพิ่มเติมหรือพารามิเตอร์การทดสอบ" : "Additional notes or evaluation parameters"}
        </label>
        <textarea
          id="notes"
          rows={5}
          value={form.notes}
          onChange={(event) => onFieldChange("notes", event.target.value)}
          placeholder={
            isTh
              ? "เช่น ต้องการทดสอบ Context window ขนาด 8k หรือใช้ Prompt พิเศษ..."
              : "e.g. prompt template, custom context window, paper link..."
          }
          className="min-h-[132px] resize-y rounded-xl border border-[var(--border-default)] bg-[var(--background-subtle)] p-4 font-sans text-base leading-relaxed text-[var(--text-primary)] transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none"
        />
      </section>
    </>
  );
}
