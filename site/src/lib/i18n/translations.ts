
export interface NavItemTranslation {
  label: string;
  href: string;
  description: string;
}

export const NAV_ITEMS_EN: NavItemTranslation[] = [
  {
    label: "LEADERBOARD",
    href: "/",
    description: "Thai RAG & LLM rankings",
  },
  {
    label: "METHODOLOGY",
    href: "/methodology",
    description: "Corpus, pipeline & protocol",
  },
  {
    label: "METRICS",
    href: "/metrics",
    description: "Evaluation metrics & formulas",
  },
  {
    label: "REQUEST",
    href: "/request",
    description: "Request pipeline combination",
  },
  {
    label: "ABOUT",
    href: "/about",
    description: "About the benchmark",
  },
];

export const NAV_ITEMS_TH: NavItemTranslation[] = [
  {
    label: "ลีดเดอร์บอร์ด",
    href: "/",
    description: "อันดับโมเดล Thai RAG & LLM",
  },
  {
    label: "ระเบียบวิธีวิจัย",
    href: "/methodology",
    description: "วิธีสร้างชุดข้อมูลและขั้นตอนทดสอบ",
  },
  {
    label: "เมทริกซ์การวัดผล",
    href: "/metrics",
    description: "เกณฑ์การวัดผลและสูตรคำนวณ",
  },
  {
    label: "ส่งโมเดลทดสอบ",
    href: "/request",
    description: "เสนอโมเดลหรือไปป์ไลน์เข้าทดสอบ",
  },
  {
    label: "เกี่ยวกับโครงการ",
    href: "/about",
    description: "ที่มาและทีมงานผู้ดูแลโครงการ",
  },
];

export function getNavItems(): NavItemTranslation[] {
  // Navigation bar is strictly English across all languages per design guidelines
  return NAV_ITEMS_EN;
}

export const I18N = {
  EN: {
    nav: {
      menu: "MENU",
      close: "CLOSE",
      openMenuAria: "Open navigation menu",
      closeMenuAria: "Close navigation menu",
      benchmarkTag: "SIAM.AI BENCHMARK",
      corpusTag: "THAI RAG CORPUS",
    },
    footer: {
      tagline:
        "SIAM.AI Thai RAG Benchmark: open evaluation of Thai retrieval-augmented generation pipelines. New runs are published as they complete.",
      leaderboard: "Leaderboard",
      metrics: "Metrics",
      methodology: "Methodology",
      about: "About",
      requestRun: "Request a run →",
    },
    hero: {
      title: "Thai RAG Benchmark",
      subtitle:
        "Open benchmark for Thai retrieval-augmented generation. Evaluates retriever, reranker, and generator combinations against Thai Wikipedia QA, with answers scored by an LLM judge.",
      exploreBtn: "Explore Leaderboard",
      requestBtn: "Request a Benchmark",
      scrollCue: "Scroll to explore models",
      llmJudgeBadge: "LLM Judge",
      qaPairs: "QA pairs",
    },
    champions: {
      ragPipelineArch: "RAG Pipeline",
      rankPrefix: "Rank #",
      stageRetrieval: "1. Retrieval",
      stageReranker: "2. Reranker",
      stageGenerator: "3. Generator",
      noneDirectDense: "None (Direct Dense)",
      corpusLabel: "Corpus: Thai Wikipedia QA",
      fullResults: "Full results ↓",
    },
    leaderboard: {
      title: "Benchmark results",
      subtitle: (dataset: string, count: number, judge: string) =>
        `${dataset} dev split · ${count.toLocaleString()} QA pairs · scored by ${judge}`,
      latestRun: (date: string) => `Latest run ${date}`,
      noRuns: "No runs yet",
      experimentsSoFar: (n: number) => `${n} experiments so far`,
      sortHint: "The table sorts by overall score by default. Select any metric column to re-sort.",
      overallFormula: "Overall = 45% judge + 20% Match TH + 20% F1 + 15% EM",
      howBuilt: "How we score",
      filterGeneratorPlaceholder: "Filter by generator model…",
      allModels: "All models",
      modelLabel: "Model:",
      rerankerAll: "All",
      rerankerYes: "With Reranker",
      rerankerNo: "Dense Only",
      overallTintTitle: (min: number, max: number) =>
        `Overall score tint: ${min.toFixed(1)} → ${max.toFixed(1)}`,
      overall: "Overall",
      runsCount: "runs",
      columns: "Columns",
      clearFilters: "Clear filters",
      noMatch: "No benchmark runs match your filters",
      requestRunRow: "Request a run →",
      mobileLead:
        "Ranked by overall score. Generation time reflects model output writing only.",
      genPrefix: "Gen",
      colRank: "#",
      colModel: "Model",
      colRetriever: "Embedding",
      colReranker: "Reranker",
      colOverall: "Overall",
      colJudge: "Judge",
      colMatchTh: "Match TH",
      colF1Th: "F1 TH",
      colPrecisionTh: "Precision TH",
      colRecallTh: "Recall TH",
      colEm: "EM",
      colLatency: "Gen (m:ss)",
    },
    request: {
      kicker: "Custom evaluation",
      title: "Request a benchmark run",
      lead: "Tell us which generator, embedding model, and reranker to evaluate. We will email you before scheduling the run.",
      meta: (n: number, judge: string) =>
        `ThaiWikiV4 · ${n} questions · judge ${judge}`,
      pipelineGroup: "Pipeline components",
      generatorLabel: "Generator Model",
      generatorPlaceholder: "e.g. Qwen/Qwen2.5-7B-Instruct or gpt-4o-mini",
      embeddingLabel: "Embedding Model",
      embeddingPlaceholder: "e.g. BAAI/bge-m3 or text-embedding-3-small",
      rerankerLabel: "Reranker Model (optional)",
      rerankerPlaceholder:
        "e.g. BAAI/bge-reranker-v2-m3 or leave blank for Dense only",
      contactGroup: "Contact details",
      emailLabel: "Your Email",
      nameLabel: "Your Name or Team",
      notesLabel: "Additional Notes or API Endpoint instructions",
      submitBtn: "Request this run →",
      disclaimer: (n: number) =>
        `Every run evaluates against the same ${n} ThaiWikiV4 questions, and all results are public.`,
      successTitle: "Request received",
      successLead: (email: string) =>
        `We will email ${email} before scheduling the run.`,
      submitAnother: "Submit another request",
      noneFallback: "None",
    },
    about: {
      kicker: "About · SIAM.AI Cloud",
      title: "About the benchmark",
      lead: "Why we run this benchmark, what we publish, and who maintains it.",
    },
  },
  TH: {
    nav: {
      menu: "MENU",
      close: "CLOSE",
      openMenuAria: "Open navigation menu",
      closeMenuAria: "Close navigation menu",
      benchmarkTag: "SIAM.AI BENCHMARK",
      corpusTag: "THAI RAG CORPUS",
    },
    footer: {
      tagline:
        "SIAM.AI Thai RAG Benchmark: โครงการประเมินผล Thai Retrieval-Augmented Generation แบบเปิด เผยแพร่ผลการทดสอบทันทีที่รันเสร็จสิ้น",
      leaderboard: "ลีดเดอร์บอร์ด",
      metrics: "เมทริกซ์การวัดผล",
      methodology: "ระเบียบวิธีวิจัย",
      about: "เกี่ยวกับโครงการ",
      requestRun: "ส่งโมเดลเข้าทดสอบ →",
    },
    hero: {
      title: "Thai RAG Benchmark",
      subtitle:
        "เบนช์มาร์กสำหรับ Thai RAG: ทดสอบโมเดล embedding, reranker และ generator บนโจทย์คำถาม-คำตอบจาก Thai Wikipedia โดยมี LLM judge เป็นผู้ตรวจคำตอบ",
      exploreBtn: "ดูผลการทดสอบ",
      requestBtn: "ส่งโมเดลเข้าทดสอบ",
      scrollCue: "เลื่อนลงเพื่อดูโมเดลทั้งหมด",
      llmJudgeBadge: "LLM Judge",
      qaPairs: "คู่คำถาม-คำตอบ",
    },
    champions: {
      ragPipelineArch: "ไปป์ไลน์ 3 ส่วน",
      rankPrefix: "อันดับ #",
      stageRetrieval: "1. ค้นหาเอกสาร (Retrieval)",
      stageReranker: "2. คัดกรองซ้ำ (Reranker)",
      stageGenerator: "3. สร้างคำตอบ (Generator)",
      noneDirectDense: "ไม่มี (Dense เท่านั้น)",
      corpusLabel: "ชุดข้อมูล: Thai Wikipedia QA",
      fullResults: "ดูตารางทั้งหมด ↓",
    },
    leaderboard: {
      title: "ตารางอันดับการทดสอบ",
      subtitle: (dataset: string, count: number, judge: string) =>
        `ชุดข้อมูล ${dataset} · ${count.toLocaleString()} คู่คำถาม-คำตอบ · ตรวจโดย ${judge}`,
      latestRun: (date: string) => `รันล่าสุดเมื่อ ${date}`,
      noRuns: "ยังไม่มีผลการทดสอบ",
      experimentsSoFar: (n: number) => `ทดสอบแล้ว ${n} การทดลอง`,
      sortHint:
        "ตารางเรียงตามคะแนนรวมเป็นค่าเริ่มต้น คุณสามารถคลิกหัวตารางเพื่อเรียงตามคะแนนอื่นได้",
      overallFormula: "Overall = 45% Judge + 20% Match TH + 20% F1 + 15% EM",
      howBuilt: "ดูวิธีคิดคะแนนรวม",
      filterGeneratorPlaceholder: "ค้นหาโมเดล Generator…",
      allModels: "โมเดลทั้งหมด",
      modelLabel: "โมเดล:",
      rerankerAll: "ทั้งหมด",
      rerankerYes: "มี Reranker",
      rerankerNo: "Dense เท่านั้น",
      overallTintTitle: (min: number, max: number) =>
        `ระดับสี Overall score: ${min.toFixed(1)} → ${max.toFixed(1)}`,
      overall: "Overall",
      runsCount: "รายการ",
      columns: "เลือกคอลัมน์",
      clearFilters: "ล้างตัวกรองทั้งหมด",
      noMatch: "ไม่พบผลการทดลองที่ตรงกับตัวกรอง",
      requestRunRow: "ส่งไปป์ไลน์เข้าทดสอบ →",
      mobileLead:
        "จัดอันดับตามคะแนนรวม เวลาสร้างคำตอบไม่รวมช่วงค้นหาและตรวจข้อสอบ",
      genPrefix: "เวลาสร้างคำตอบ",
      colRank: "#",
      colModel: "โมเดล",
      colRetriever: "Embedding",
      colReranker: "Reranker",
      colOverall: "Overall",
      colJudge: "Judge",
      colMatchTh: "Match TH",
      colF1Th: "F1 TH",
      colPrecisionTh: "Precision TH",
      colRecallTh: "Recall TH",
      colEm: "EM",
      colLatency: "เวลาสร้างคำตอบ",
    },
    request: {
      kicker: "ส่งโมเดลเข้าทดสอบ",
      title: "ส่งโมเดลหรือไปป์ไลน์เข้าทดสอบ",
      lead: "ระบุโมเดล generator, embedding และ reranker ที่ต้องการให้ทดสอบ เราจะตอบกลับทางอีเมลก่อนเริ่มรัน",
      meta: (n: number, judge: string) =>
        `ThaiWikiV4 · ${n} คำถาม · ตรวจโดย ${judge}`,
      pipelineGroup: "โมเดลที่ต้องการทดสอบ",
      generatorLabel: "โมเดล Generator",
      generatorPlaceholder: "เช่น Qwen/Qwen2.5-7B-Instruct หรือ gpt-4o-mini",
      embeddingLabel: "โมเดล Embedding",
      embeddingPlaceholder: "เช่น BAAI/bge-m3 หรือ text-embedding-3-small",
      rerankerLabel: "โมเดล Reranker (ไม่บังคับ)",
      rerankerPlaceholder:
        "เช่น BAAI/bge-reranker-v2-m3 หรือเว้นว่างหากใช้เฉพาะ Dense",
      contactGroup: "ข้อมูลสำหรับติดต่อกลับ",
      emailLabel: "อีเมลของคุณ",
      nameLabel: "ชื่อของคุณหรือทีม",
      notesLabel: "หมายเหตุเพิ่มเติม หรือรายละเอียด endpoint",
      submitBtn: "ส่งคำขอทดสอบนี้ →",
      disclaimer: (n: number) =>
        `ทุกการทดสอบใช้ชุดข้อสอบ ThaiWikiV4 ${n} ข้อชุดเดียวกัน และเปิดเผยผลลัพธ์สู่สาธารณะ`,
      successTitle: "ได้รับคำขอทดสอบเรียบร้อยแล้ว",
      successLead: (email: string) =>
        `เราจะติดต่อกลับไปที่ ${email} ก่อนจัดคิวรันการทดสอบ`,
      submitAnother: "ส่งคำขอรายการอื่นเพิ่มเติม",
      noneFallback: "ไม่มี",
    },
    about: {
      kicker: "เกี่ยวกับโครงการ · SIAM.AI Cloud",
      title: "เกี่ยวกับโครงการ",
      lead: "ที่มาของเบนช์มาร์ก ข้อมูลที่เราเปิดเผย และทีมงานผู้ดูแลโครงการ",
    },
  },
} as const;
