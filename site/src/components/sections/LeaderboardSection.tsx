interface LeaderboardModel {
  rank: number;
  name: string;
  provider: string;
  type: "Dense" | "Hybrid" | "Sparse";
  ndcg10: number;
  recall10: number;
  mrr10: number;
  latencyMs: number;
  badge?: string;
  badgeVariant?: "primary" | "secondary" | "accent" | "neutral";
}

const MODELS: LeaderboardModel[] = [
  {
    rank: 1,
    name: "bge-m3",
    provider: "BAAI",
    type: "Hybrid",
    ndcg10: 0.784,
    recall10: 0.892,
    mrr10: 0.812,
    latencyMs: 38,
    badge: "SOTA",
    badgeVariant: "primary",
  },
  {
    rank: 2,
    name: "multilingual-e5-large",
    provider: "Microsoft",
    type: "Dense",
    ndcg10: 0.761,
    recall10: 0.874,
    mrr10: 0.791,
    latencyMs: 42,
  },
  {
    rank: 3,
    name: "siamgpt-embed-v1",
    provider: "SIAM.AI Cloud",
    type: "Dense",
    ndcg10: 0.758,
    recall10: 0.871,
    mrr10: 0.789,
    latencyMs: 24,
    badge: "SIAM.AI",
    badgeVariant: "accent",
  },
  {
    rank: 4,
    name: "typhoon-embed-v2",
    provider: "SCB 10X",
    type: "Dense",
    ndcg10: 0.752,
    recall10: 0.865,
    mrr10: 0.783,
    latencyMs: 29,
    badge: "Thai SOTA",
    badgeVariant: "secondary",
  },
  {
    rank: 5,
    name: "cohere-embed-multilingual-v3",
    provider: "Cohere",
    type: "Dense",
    ndcg10: 0.748,
    recall10: 0.859,
    mrr10: 0.776,
    latencyMs: 45,
  },
  {
    rank: 6,
    name: "wangchanberta-base-att-mrc",
    provider: "VISTEC / PyThaiNLP",
    type: "Dense",
    ndcg10: 0.718,
    recall10: 0.824,
    mrr10: 0.742,
    latencyMs: 18,
  },
  {
    rank: 7,
    name: "openthaigpt-1.5-embed",
    provider: "OpenThaiGPT",
    type: "Dense",
    ndcg10: 0.704,
    recall10: 0.811,
    mrr10: 0.729,
    latencyMs: 34,
  },
  {
    rank: 8,
    name: "bm25-th-pythainlp",
    provider: "Baseline",
    type: "Sparse",
    ndcg10: 0.642,
    recall10: 0.748,
    mrr10: 0.665,
    latencyMs: 8,
    badge: "Lexical",
    badgeVariant: "neutral",
  },
];

export function LeaderboardSection() {
  return (
    <section className="w-full px-4 sm:px-8 md:px-12 py-12 sm:py-16">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[var(--border-default)] transition-colors">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#01A9B1] dark:text-[#00A0BE] font-semibold">
              SIAM.AI BENCHMARK • THAI CORPUS & CLOUD RETRIEVAL
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)] mt-1 transition-colors">
              Top Performing Models
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Updated Today • 8 Models Evaluated</span>
          </div>
        </div>

        {/* Responsive Table Card */}
        <div className="w-full overflow-x-auto rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] shadow-xs transition-colors">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-[var(--background-subtle)] border-b border-[var(--border-default)] text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)] transition-colors">
                <th className="py-3.5 px-4 w-16">Rank</th>
                <th className="py-3.5 px-4">Model & Provider</th>
                <th className="py-3.5 px-3">Type</th>
                <th className="py-3.5 px-4 text-right">NDCG@10</th>
                <th className="py-3.5 px-4 text-right">Recall@10</th>
                <th className="py-3.5 px-4 text-right">MRR@10</th>
                <th className="py-3.5 px-4 text-right">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]/60 text-sm transition-colors">
              {MODELS.map((m) => (
                <tr
                  key={m.name}
                  className="hover:bg-[var(--surface-brand)]/60 transition-colors group"
                >
                  <td className="py-3.5 px-4 font-mono font-medium text-[var(--text-muted)]">
                    {m.rank === 1 && <span className="text-[#0795CF] font-bold">#1</span>}
                    {m.rank === 2 && <span className="text-[#00A0BE] font-bold">#2</span>}
                    {m.rank === 3 && <span className="text-[#01A9B1] font-bold">#3</span>}
                    {m.rank > 3 && `#${m.rank}`}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--text-primary)] font-mono text-sm transition-colors">
                        {m.name}
                      </span>
                      {m.badge && (
                        <span
                          className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-medium border ${
                            m.badgeVariant === "primary"
                              ? "bg-[#EAF6FB] dark:bg-[#142a38] text-[#006B91] dark:text-[#73B7DC] border-[#B7DBE8] dark:border-[#2a475e]"
                              : m.badgeVariant === "accent"
                              ? "bg-[#0795CF]/15 text-[#0795CF] border-[#73B7DC] dark:border-[#0795CF]/40"
                              : m.badgeVariant === "secondary"
                              ? "bg-[#E6F8F9] dark:bg-[#102830] text-[#01A9B1] border-[#B7DBE8] dark:border-[#1e4650]"
                              : "bg-[var(--background-subtle)] text-[var(--text-secondary)] border-[var(--border-default)]"
                          }`}
                        >
                          {m.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[var(--text-muted)] font-sans">{m.provider}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--background-subtle)] border border-[var(--border-default)] text-[var(--text-secondary)]">
                      {m.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-[var(--text-primary)]">
                    {m.ndcg10.toFixed(3)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[var(--text-secondary)]">
                    {m.recall10.toFixed(3)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[var(--text-secondary)]">
                    {m.mrr10.toFixed(3)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[var(--text-muted)]">
                    {m.latencyMs}ms
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
