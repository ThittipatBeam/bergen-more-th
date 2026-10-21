"use client";

import { useState } from "react";
import { RequestSuccessCard } from "@/components/sections/RequestSuccessCard";

export function RequestSection() {
  const [submitted, setSubmitted] = useState(false);
  const [generator, setGenerator] = useState("DeepSeek-V3");
  const [retriever, setRetriever] = useState("BAAI/bge-m3");
  const [reranker, setReranker] = useState("BAAI/bge-reranker-v2-m3");
  const [dataset, setDataset] = useState("ThaiWikiV4");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setNotes("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 md:px-12 pt-28 pb-16 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2 pb-6 border-b border-[var(--border-default)]">
        <h1 className="text-3xl sm:text-4xl font-sans font-bold tracking-tight text-[var(--text-primary)]">
          Request Benchmark Combination
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] font-sans max-w-2xl mt-1 leading-relaxed">
          Specify a pipeline combination (Generator, Embedding, and Reranker) to test on the Thai RAG benchmark.
        </p>
      </div>

      {submitted ? (
        <RequestSuccessCard
          generator={generator}
          retriever={retriever}
          reranker={reranker}
          onReset={handleReset}
        />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] shadow-xs flex flex-col gap-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* 1. Generator Model */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="generator-select"
                className="text-xs font-sans font-bold uppercase tracking-wider text-[var(--text-primary)]"
              >
                1. Generator Model *
              </label>
              <select
                id="generator-select"
                required
                value={generator}
                onChange={(e) => setGenerator(e.target.value)}
                className="min-h-[44px] px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-subtle)] text-base font-sans text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] cursor-pointer"
              >
                <option value="DeepSeek-V3">DeepSeek-V3</option>
                <option value="DEEPSEEK-V4.1F">DeepSeek-V4.1F</option>
                <option value="Qwen-2.5-72B-Instruct">Qwen-2.5-72B-Instruct</option>
                <option value="Typhoon-2-70B">Typhoon-2-70B-Instruct</option>
                <option value="Claude-3.5-Sonnet">Claude-3.5-Sonnet</option>
                <option value="GPT-4o">GPT-4o</option>
                <option value="Custom">Custom / Other Model</option>
              </select>
            </div>

            {/* 2. Embedding Model (Retriever) */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="retriever-select"
                className="text-xs font-sans font-bold uppercase tracking-wider text-[var(--text-primary)]"
              >
                2. Embedding Model (Retriever) *
              </label>
              <select
                id="retriever-select"
                required
                value={retriever}
                onChange={(e) => setRetriever(e.target.value)}
                className="min-h-[44px] px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-subtle)] text-base font-sans text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] cursor-pointer"
              >
                <option value="BAAI/bge-m3">BAAI/bge-m3 (Dense + Multi-ling)</option>
                <option value="QWEN3-EMBED-8B">Qwen3-Embed-8B</option>
                <option value="typhoon-embed">Typhoon-Embed (Thai-tuned)</option>
                <option value="text-embedding-3-large">OpenAI text-embedding-3-large</option>
                <option value="Custom">Custom / Other Retriever</option>
              </select>
            </div>

            {/* 3. Reranker Model */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="reranker-select"
                className="text-xs font-sans font-bold uppercase tracking-wider text-[var(--text-primary)]"
              >
                3. Reranker Model (Optional)
              </label>
              <select
                id="reranker-select"
                value={reranker}
                onChange={(e) => setReranker(e.target.value)}
                className="min-h-[44px] px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-subtle)] text-base font-sans text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] cursor-pointer"
              >
                <option value="BAAI/bge-reranker-v2-m3">BAAI/bge-reranker-v2-m3</option>
                <option value="cohere-rerank-v3">Cohere Rerank v3</option>
                <option value="none">None (Dense Retrieval Only)</option>
              </select>
            </div>

            {/* 4. Target Dataset */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="dataset-select"
                className="text-xs font-sans font-bold uppercase tracking-wider text-[var(--text-primary)]"
              >
                4. Evaluation Corpus *
              </label>
              <select
                id="dataset-select"
                required
                value={dataset}
                onChange={(e) => setDataset(e.target.value)}
                className="min-h-[44px] px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-subtle)] text-base font-sans text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] cursor-pointer"
              >
                <option value="ThaiWikiV4">ThaiWikiV4 (General Knowledge, 500 samples)</option>
                <option value="MKQA/th">MKQA/th (Factoid Multilingual QA)</option>
                <option value="DomainQA">Thai Legal / Financial QA</option>
              </select>
            </div>
          </div>

          {/* Contact Handle */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="contact-input"
              className="text-xs font-sans font-bold uppercase tracking-wider text-[var(--text-primary)]"
            >
              Contact or Organization (Optional)
            </label>
            <input
              id="contact-input"
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="e.g. name@company.ai or @github_handle"
              className="min-h-[44px] px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-subtle)] text-base font-sans text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
            />
          </div>

          {/* Additional Notes */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="notes-input"
              className="text-xs font-sans font-bold uppercase tracking-wider text-[var(--text-primary)]"
            >
              Additional Notes or Evaluation Parameters
            </label>
            <textarea
              id="notes-input"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Specific top-k passages, custom system prompt, or quantizations..."
              className="p-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-subtle)] text-base font-sans text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] resize-y"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[var(--text-muted)] font-sans">
              All community benchmark runs are published openly.
            </span>
            <button
              type="submit"
              className="min-h-[44px] px-6 rounded-xl bg-[var(--brand-cta)] hover:bg-[var(--brand-cta-hover)] text-white text-sm font-sans font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              Queue Benchmark Run &rarr;
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
