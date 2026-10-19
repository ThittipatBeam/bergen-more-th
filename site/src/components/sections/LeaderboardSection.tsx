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
    name: "typhoon-embed-v2",
    provider: "SCB 10X",
    type: "Dense",
    ndcg10: 0.752,
    recall10: 0.865,
    mrr10: 0.783,
    latencyMs: 29,
    badge: "Thai SOTA",
  },
  {
    rank: 4,
    name: "cohere-embed-multilingual-v3",
    provider: "Cohere",
    type: "Dense",
    ndcg10: 0.748,
    recall10: 0.859,
    mrr10: 0.776,
    latencyMs: 45,
  },
  {
    rank: 5,
    name: "wangchanberta-base-att-mrc",
    provider: "VISTEC / PyThaiNLP",
    type: "Dense",
    ndcg10: 0.718,
    recall10: 0.824,
    mrr10: 0.742,
    latencyMs: 18,
  },
  {
    rank: 6,
    name: "openthaigpt-1.5-embed",
    provider: "OpenThaiGPT",
    type: "Dense",
    ndcg10: 0.704,
    recall10: 0.811,
    mrr10: 0.729,
    latencyMs: 34,
  },
  {
    rank: 7,
    name: "bm25-th-pythainlp",
    provider: "Baseline",
    type: "Sparse",
    ndcg10: 0.642,
    recall10: 0.748,
    mrr10: 0.665,
    latencyMs: 8,
    badge: "Lexical",
  },
];

export function LeaderboardSection() {
  return (
    <section className="w-full px-4 sm:px-8 md:px-12 py-12 sm:py-16">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-neutral-200">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
              Benchmark v1.0 • Thai Corpus
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 mt-1">
              Top Performing Models
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>Updated Today • 7 Evaluated</span>
          </div>
        </div>

        {/* Responsive Table Card */}
        <div className="w-full overflow-x-auto rounded-2xl border border-neutral-200/80 bg-white shadow-xs">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200/80 text-[11px] font-mono uppercase tracking-wider text-neutral-500">
                <th className="py-3.5 px-4 w-16">Rank</th>
                <th className="py-3.5 px-4">Model & Provider</th>
                <th className="py-3.5 px-3">Type</th>
                <th className="py-3.5 px-4 text-right">NDCG@10</th>
                <th className="py-3.5 px-4 text-right">Recall@10</th>
                <th className="py-3.5 px-4 text-right">MRR@10</th>
                <th className="py-3.5 px-4 text-right">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm">
              {MODELS.map((m) => (
                <tr
                  key={m.name}
                  className="hover:bg-blue-50/40 transition-colors group"
                >
                  <td className="py-3.5 px-4 font-mono font-medium text-neutral-500">
                    {m.rank === 1 && <span className="text-amber-500 font-bold">#1</span>}
                    {m.rank === 2 && <span className="text-slate-400 font-bold">#2</span>}
                    {m.rank === 3 && <span className="text-amber-700 font-bold">#3</span>}
                    {m.rank > 3 && `#${m.rank}`}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-900 font-mono text-sm">
                        {m.name}
                      </span>
                      {m.badge && (
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-100/80 text-blue-800 font-medium">
                          {m.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-neutral-400 font-sans">{m.provider}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                      {m.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-neutral-900">
                    {m.ndcg10.toFixed(3)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-neutral-700">
                    {m.recall10.toFixed(3)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-neutral-700">
                    {m.mrr10.toFixed(3)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-neutral-500">
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
