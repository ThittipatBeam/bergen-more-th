// POST /api/request — real submission endpoint for the "Request a run" form.
//
// The form used to fake its success state. This route makes the promise true:
// it validates server-side, then delivers the request through the first
// configured provider:
//
//   1. REQUEST_WEBHOOK_URL            — any HTTP endpoint (n8n, Zapier,
//                                        Slack/Discord webhook, Apps Script)
//   2. REQUEST_SMTP_HOST +
//      REQUEST_SMTP_USER +
//      REQUEST_SMTP_PASS +
//      REQUEST_INBOX_EMAIL            — SMTP (Microsoft 365 / Outlook, Gmail…)
//   3. RESEND_API_KEY +
//      REQUEST_INBOX_EMAIL            — email to a real inbox
//   4. NOTION_TOKEN +
//      NOTION_REQUESTS_DATABASE_ID     — a row in a Notion database
//
// With no provider configured the route answers 503 { reason: "not_configured" }
// and the form shows an honest fallback (open a GitHub issue) instead of a
// green checkmark that was never true.

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Best-effort in-memory rate limit: 5 submissions per IP per 10 minutes.
 *  Single-instance only; the outer spam barrier is provider-side validation. */
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const hitsByIp = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hitsByIp.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (recent.length >= RATE_LIMIT_MAX) return true;
  recent.push(now);
  hitsByIp.set(ip, recent);
  return false;
}

interface RequestPayload {
  generatorName: string;
  generatorLink?: string;
  embeddingName: string;
  embeddingLink?: string;
  rerankerName?: string;
  rerankerLink?: string;
  contact: string;
  email: string;
  notes?: string;
}

/** Trim, cap length, drop control characters. One helper for every field. */
function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim()
    .slice(0, max);
}

function validate(body: unknown): { errors: Record<string, string>; payload: RequestPayload } {
  const raw = (body ?? {}) as Record<string, unknown>;
  const payload: RequestPayload = {
    generatorName: clean(raw.generatorName, 200),
    generatorLink: clean(raw.generatorLink, 500),
    embeddingName: clean(raw.embeddingName, 200),
    embeddingLink: clean(raw.embeddingLink, 500),
    rerankerName: clean(raw.rerankerName, 200),
    rerankerLink: clean(raw.rerankerLink, 500),
    contact: clean(raw.contact, 200),
    email: clean(raw.email, 254),
    notes: clean(raw.notes, 2000),
  };

  const errors: Record<string, string> = {};
  if (!payload.generatorName) errors.generatorName = "required";
  if (!payload.embeddingName) errors.embeddingName = "required";
  if (!payload.contact) errors.contact = "required";
  if (!EMAIL_RE.test(payload.email)) errors.email = "invalid";
  return { errors, payload };
}

function formatBody(payload: RequestPayload): string {
  return [
    `Generator: ${payload.generatorName}`,
    payload.generatorLink && `Generator link: ${payload.generatorLink}`,
    `Embedding: ${payload.embeddingName}`,
    payload.embeddingLink && `Embedding link: ${payload.embeddingLink}`,
    `Reranker: ${payload.rerankerName || "(dense only)"}`,
    payload.rerankerLink && `Reranker link: ${payload.rerankerLink}`,
    `Contact: ${payload.contact}`,
    `Email: ${payload.email}`,
    payload.notes && `Notes: ${payload.notes}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function subjectFor(payload: RequestPayload): string {
  return `Benchmark run request: ${payload.generatorName} + ${payload.embeddingName}`;
}

async function deliverViaWebhook(payload: RequestPayload): Promise<void> {
  const url = process.env.REQUEST_WEBHOOK_URL;
  const response = await fetch(url!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source: "thai-rag-benchmark", ...payload }),
  });
  if (!response.ok) {
    throw new Error(`webhook responded ${response.status}`);
  }
}

async function deliverViaSmtp(payload: RequestPayload): Promise<void> {
  const port = Number(process.env.REQUEST_SMTP_PORT ?? 587);
  const transport = nodemailer.createTransport({
    host: process.env.REQUEST_SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: {
      user: process.env.REQUEST_SMTP_USER,
      pass: process.env.REQUEST_SMTP_PASS,
    },
  });
  await transport.sendMail({
    from:
      process.env.REQUEST_FROM_EMAIL ?? process.env.REQUEST_SMTP_USER,
    to: process.env.REQUEST_INBOX_EMAIL,
    subject: subjectFor(payload),
    text: formatBody(payload),
  });
}

async function deliverViaResend(payload: RequestPayload): Promise<void> {
  const to = process.env.REQUEST_INBOX_EMAIL!;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:
        process.env.REQUEST_FROM_EMAIL ??
        "Thai RAG Benchmark <onboarding@resend.dev>",
      to,
      subject: subjectFor(payload),
      text: formatBody(payload),
    }),
  });
  if (!response.ok) {
    throw new Error(`resend responded ${response.status}`);
  }
}

async function deliverViaNotion(payload: RequestPayload): Promise<void> {
  const databaseId = process.env.NOTION_REQUESTS_DATABASE_ID!;
  const text = (name: string, content: string) => ({ [name]: { rich_text: [{ text: { content } }] } });
  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [{ text: { content: `${payload.generatorName} + ${payload.embeddingName}` } }],
        },
        ...text("Contact", payload.contact),
        ...text("Email", payload.email),
        ...text("Generator", payload.generatorName),
        ...text("Embedding", payload.embeddingName),
        ...text("Reranker", payload.rerankerName || "(dense only)"),
        ...text("Notes", payload.notes ?? ""),
      },
    }),
  });
  if (!response.ok) {
    throw new Error(`notion responded ${response.status}`);
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, reason: "invalid_json" },
      { status: 400 }
    );
  }

  const { errors, payload } = validate(body);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { ok: false, reason: "invalid_fields", errors },
      { status: 400 }
    );
  }

  // Count only valid submissions, so fixing a typo never burns the quota.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, reason: "rate_limited" },
      { status: 429 }
    );
  }

  const providers: Array<() => Promise<void>> = [];
  if (process.env.REQUEST_WEBHOOK_URL) providers.push(() => deliverViaWebhook(payload));
  if (
    process.env.REQUEST_SMTP_HOST &&
    process.env.REQUEST_SMTP_USER &&
    process.env.REQUEST_SMTP_PASS &&
    process.env.REQUEST_INBOX_EMAIL
  )
    providers.push(() => deliverViaSmtp(payload));
  if (process.env.RESEND_API_KEY && process.env.REQUEST_INBOX_EMAIL)
    providers.push(() => deliverViaResend(payload));
  if (process.env.NOTION_TOKEN && process.env.NOTION_REQUESTS_DATABASE_ID)
    providers.push(() => deliverViaNotion(payload));

  if (providers.length === 0) {
    return NextResponse.json(
      { ok: false, reason: "not_configured" },
      { status: 503 }
    );
  }

  try {
    await providers[0]();
  } catch (error) {
    console.error("request delivery failed:", error);
    return NextResponse.json(
      { ok: false, reason: "delivery_failed" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
