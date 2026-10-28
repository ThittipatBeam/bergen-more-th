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
            {isTh ? "ข้อมูลสำหรับติดต่อกลับ" : "Who should we reply to?"}
          </h2>
          <p className="max-w-[58ch] font-sans text-base leading-7 text-[var(--text-secondary)]">
            {isTh
              ? "เราต้องการชื่อและอีเมลเพื่อติดต่อยืนยันก่อนเริ่มรันการทดสอบ"
              : "We need a contact name and email address to confirm the run before scheduling."}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            id="contact"
            label={isTh ? "ชื่อผู้ติดต่อ หรือชื่อทีม" : "Contact or team name"}
            required
            value={form.contact}
            onChange={(value) => onFieldChange("contact", value)}
            autoComplete="organization"
          />
          <TextField
            id="email"
            label={isTh ? "อีเมล" : "Email"}
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
              ? "ระบุได้ตามต้องการ เช่น พารามิเตอร์เฉพาะ รูปแบบพรอมต์ หรือลิงก์เปเปอร์ที่ต้องการให้เราทดสอบซ้ำ"
              : "Optional. Share specific parameters, prompt templates, or a paper you would like us to reproduce."}
          </p>
        </div>
        <label
          htmlFor="notes"
          className="font-sans text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]"
        >
          {isTh ? "หมายเหตุเพิ่มเติมหรือพารามิเตอร์การทดสอบ" : "Additional notes or parameters"}
        </label>
        <textarea
          id="notes"
          rows={5}
          value={form.notes}
          onChange={(event) => onFieldChange("notes", event.target.value)}
          placeholder={
            isTh
              ? "เช่น ต้องการทดสอบ context window ขนาด 8k หรือใช้พรอมต์เฉพาะ..."
              : "e.g. custom prompt template, context window, or paper link..."
          }
          className="min-h-[132px] resize-y rounded-xl border border-[var(--border-default)] bg-[var(--background-subtle)] p-4 font-sans text-base leading-relaxed text-[var(--text-primary)] transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none"
        />
      </section>
    </>
  );
}
