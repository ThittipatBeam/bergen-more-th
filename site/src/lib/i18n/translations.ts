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
    description: "คลังข้อมูล ไปป์ไลน์ และเกณฑ์ทดสอบ",
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
    description: "ที่มาและทีมงานผู้อยู่เบื้องหลัง",
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
        "SIAM.AI Thai RAG Benchmark — open evaluation of Thai retrieval-augmented generation pipelines. New runs are published as they complete.",
      leaderboard: "Leaderboard",
      metrics: "Metrics",
      methodology: "Methodology",
      about: "About",
      requestRun: "Request a run →",
    },
    hero: {
      title: "Thai RAG Benchmark",
      subtitle:
        "Open benchmark for Thai retrieval-augmented generation — embedding, reranking, and generation pipelines scored by an LLM judge on Thai Wikipedia QA.",
      exploreBtn: "Explore Leaderboard",
      requestBtn: "Request a Benchmark",
      scrollCue: "Scroll to explore models",
      llmJudgeBadge: "LLM Judge",
      qaPairs: "QA pairs",
    },
    champions: {
      ragPipelineArch: "RAG Pipeline Architecture",
      rankPrefix: "Rank #",
      stageRetrieval: "1. Retrieval",
      stageReranker: "2. Reranker",
      stageGenerator: "3. Generator",
      noneDirectDense: "None (Direct Dense)",
      corpusLabel: "Corpus: Thai Wikipedia QA",
      fullResults: "Full results ↓",
    },
    leaderboard: {
      title: "The measured sheet",
      subtitle: (dataset: string, count: number, judge: string) =>
        `${dataset} dev split · ${count.toLocaleString()} QA pairs per pipeline · answers scored by judge ${judge}`,
      latestRun: (date: string) => `Latest run ${date}`,
      noRuns: "No runs yet",
      experimentsSoFar: (n: number) => `${n} experiments so far`,
      sortHint: "Overall score leads — sort any metric column.",
      overallFormula: "Overall = 45% judge + 20% Match TH + 20% F1 + 15% EM",
      howBuilt: "How it's built",
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
        "Ranked by overall score. Generation time excludes retrieval and scoring.",
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
      lead: "Tell us which generator, embedding and reranker to put in the pipeline. We will reply by email before the run is scheduled.",
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
        `Every run uses ThaiWikiV4 · ${n} questions, and results are published openly.`,
      successTitle: "Request received",
      successLead: (email: string) =>
        `We will reply to ${email} before the run is scheduled.`,
      submitAnother: "Submit another request",
      noneFallback: "None",
    },
    about: {
      kicker: "About · SIAM.AI Cloud",
      title: "About the benchmark",
      lead: "Why we run it, what we publish, and who is behind it.",
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
        "SIAM.AI Thai RAG Benchmark — ระบบประเมินผลมาตรฐานสำหรับ Thai Retrieval-Augmented Generation แบบเปิด เผยแพร่ผลการทดสอบใหม่ทันทีที่รันเสร็จสิ้น",
      leaderboard: "ลีดเดอร์บอร์ด",
      metrics: "เมทริกซ์การวัดผล",
      methodology: "ระเบียบวิธีวิจัย",
      about: "เกี่ยวกับโครงการ",
      requestRun: "ส่งโมเดลเข้าทดสอบ →",
    },
    hero: {
      title: "Thai RAG Benchmark",
      subtitle:
        "เกณฑ์ประเมินมาตรฐานสำหรับ Thai RAG — ทดสอบทั้ง Embedding, Reranking และ Generator Model ประเมินผลด้วย LLM Judge บนชุดข้อมูล Thai Wikipedia QA",
      exploreBtn: "ดูผลการทดสอบ",
      requestBtn: "ส่งโมเดลเข้าทดสอบ",
      scrollCue: "เลื่อนลงเพื่อดูโมเดลทั้งหมด",
      llmJudgeBadge: "LLM Judge",
      qaPairs: "คู่คำถาม-คำตอบ",
    },
    champions: {
      ragPipelineArch: "สถาปัตยกรรม RAG Pipeline",
      rankPrefix: "อันดับ #",
      stageRetrieval: "1. ค้นคืน (Retrieval)",
      stageReranker: "2. จัดอันดับซ้ำ (Reranker)",
      stageGenerator: "3. สร้างคำตอบ (Generator)",
      noneDirectDense: "ไม่มี (Direct Dense)",
      corpusLabel: "ชุดข้อมูล: Thai Wikipedia QA",
      fullResults: "ดูตารางทั้งหมด ↓",
    },
    leaderboard: {
      title: "ตารางผลการประเมิน Benchmark",
      subtitle: (dataset: string, count: number, judge: string) =>
        `ชุดข้อมูล ${dataset} · ${count.toLocaleString()} คู่คำถาม-คำตอบต่อไปป์ไลน์ · ประเมินผลด้วย ${judge}`,
      latestRun: (date: string) => `รันล่าสุดเมื่อ ${date}`,
      noRuns: "ยังไม่มีผลการทดสอบ",
      experimentsSoFar: (n: number) => `ทดสอบแล้ว ${n} การทดลอง`,
      sortHint:
        "เรียงตาม Overall Score เป็นหลัก — คลิกหัวตารางเพื่อเรียงตามเมทริกซ์อื่นได้",
      overallFormula: "Overall = 45% Judge + 20% Match TH + 20% F1 + 15% EM",
      howBuilt: "ดูวิธีคำนวณคะแนน",
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
        "จัดอันดับตาม Overall Score · เวลา Generation ไม่รวมช่วงค้นคืนและให้คะแนน",
      genPrefix: "เวลา Gen",
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
      colLatency: "เวลา Gen",
    },
    request: {
      kicker: "ส่งโมเดลเข้าทดสอบ",
      title: "ส่งโมเดลหรือไปป์ไลน์เข้าทดสอบ",
      lead: "ระบุโมเดล Generator, Embedding และ Reranker ที่ต้องการทดสอบในไปป์ไลน์ ทีมงานจะติดต่อกลับทางอีเมลก่อนเริ่มรันการทดสอบ",
      meta: (n: number, judge: string) =>
        `ThaiWikiV4 · ${n} คำถาม · ตัดสินโดย ${judge}`,
      pipelineGroup: "องค์ประกอบของไปป์ไลน์",
      generatorLabel: "โมเดล Generator",
      generatorPlaceholder: "เช่น Qwen/Qwen2.5-7B-Instruct หรือ gpt-4o-mini",
      embeddingLabel: "โมเดล Embedding",
      embeddingPlaceholder: "เช่น BAAI/bge-m3 หรือ text-embedding-3-small",
      rerankerLabel: "โมเดล Reranker (ไม่บังคับ)",
      rerankerPlaceholder:
        "เช่น BAAI/bge-reranker-v2-m3 หรือเว้นว่างหากใช้เฉพาะ Dense",
      contactGroup: "ข้อมูลผู้ติดต่อและรายละเอียดเพิ่มเติม",
      emailLabel: "อีเมลของคุณ",
      nameLabel: "ชื่อของคุณหรือทีม",
      notesLabel: "หมายเหตุเพิ่มเติม หรือรายละเอียด API Endpoint",
      submitBtn: "ส่งคำขอทดสอบนี้ →",
      disclaimer: (n: number) =>
        `ทุกการทดสอบใช้ชุดข้อสอบ ThaiWikiV4 ${n} ข้อ และผลลัพธ์จะเผยแพร่แบบเปิด`,
      successTitle: "ได้รับคำขอทดสอบเรียบร้อยแล้ว",
      successLead: (email: string) =>
        `ทีมงานจะติดต่อกลับไปยัง ${email} ก่อนกำหนดการรันการทดสอบ`,
      submitAnother: "ส่งคำขอรายการอื่นเพิ่มเติม",
      noneFallback: "ไม่มี",
    },
    about: {
      kicker: "เกี่ยวกับโครงการ · SIAM.AI Cloud",
      title: "เกี่ยวกับ Thai RAG Benchmark",
      lead: "เหตุผลที่เราจัดทำ สิ่งที่เราเผยแพร่ และทีมงานผู้อยู่เบื้องหลัง",
    },
  },
} as const;
