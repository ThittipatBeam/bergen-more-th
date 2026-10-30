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

// Navigation is deliberately English in both languages (locked-nav decision);
// NAV_ITEMS_EN is the single source consumed by Navbar and MobileMenu.

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
        "SIAM GPT Thai RAG Benchmark: open evaluation of Thai retrieval-augmented generation pipelines",
      leaderboard: "Leaderboard",
      metrics: "Metrics",
      methodology: "Methodology",
      about: "About",
      requestRun: "Request a run →",
    },
    hero: {
      title: "Thai RAG Benchmark",
      subtitle:
        "Thai RAG Benchmark: tests embedding, reranker, and generator models on question-answer pairs from Thai Wikipedia",
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
      noneDirectDense: "None",
      corpusLabel: "Corpus: Thai Wikipedia QA",
      fullResults: "Full results ↓",
    },
    leaderboard: {
      title: "Benchmark results",
      latestRun: (date: string) => `Latest run ${date}`,
      noRuns: "No runs yet",
      experimentsSoFar: (n: number) => `${n} experiments so far`,
      readMetrics: "Metrics guide →",
      readMethodology: "How it's built →",
      tableCaption:
        "Leaderboard of evaluated Thai RAG pipelines, ranked by overall score. Metric column headers are sortable; the Model column is not.",
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
        "Ranked by overall score (Judge 80% + Match TH 20%). A darker tint means a higher score. Generation time is shown in minutes:seconds and covers answer writing only.",
      genPrefix: "Gen time",
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
      colLatency: "Gen time (min:sec)",
    },
    request: {
      kicker: "Custom evaluation",
      title: "Request a benchmark run",
      lead: "Tell us which generator, embedding model, and reranker to evaluate. We will email you before scheduling the run.",
      sending: "Sending…",
      errorTitle: "Couldn't send the request",
      errorBody:
        "Your form is still filled in. Check your connection and try again.",
      retryBtn: "Try again",
      unconfiguredTitle: "Online submission isn't set up yet",
      unconfiguredBody:
        "Nothing was sent. Open an issue on the GitHub repo with the pipeline you want tested, and we'll pick it up from there.",
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
      submitBtn: "Request this run",
      successTitle: "Request received",
      successLead: (email: string) =>
        `We'll reply to ${email} before the run is scheduled.`,
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
      openMenuAria: "เปิดเมนูนำทาง",
      closeMenuAria: "ปิดเมนูนำทาง",
      benchmarkTag: "SIAM.AI BENCHMARK",
      corpusTag: "THAI RAG CORPUS",
    },
    footer: {
      tagline:
        "SIAM GPT Thai RAG Benchmark: โครงการประเมินผล Thai Retrieval-Augmented Generation",
      leaderboard: "ลีดเดอร์บอร์ด",
      metrics: "การวัดผล",
      methodology: "ระเบียบวิธีวิจัย",
      about: "เกี่ยวกับโครงการ",
      requestRun: "ส่งโมเดลเข้าทดสอบ →",
    },
    hero: {
      title: "Thai RAG Benchmark",
      subtitle:
        "Thai RAG Benchmark: ทดสอบโมเดล embedding, reranker และ generator บนโจทย์คำถาม-คำตอบจาก Thai Wikipedia",
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
      stageReranker: "2. จัดอันดับซ้ำ (Reranker)",
      stageGenerator: "3. สร้างคำตอบ (Generator)",
      noneDirectDense: "ไม่มี",
      corpusLabel: "ชุดข้อมูล: Thai Wikipedia QA",
      fullResults: "ดูตารางทั้งหมด ↓",
    },
    leaderboard: {
      title: "ตารางอันดับการทดสอบ",
      latestRun: (date: string) => `รันล่าสุดเมื่อ ${date}`,
      noRuns: "ยังไม่มีผลการทดสอบ",
      experimentsSoFar: (n: number) => `ทดสอบแล้ว ${n} การทดลอง`,
      readMetrics: "อ่านเรื่อง metric →",
      readMethodology: "ดูวิธีสร้างชุดข้อมูล →",
      tableCaption:
        "ตารางอันดับไปป์ไลน์ Thai RAG ที่ทดสอบแล้ว เรียงตามคะแนนรวม คลิกหัวคอลัมน์ metric เพื่อเรียงลำดับใหม่ได้ (คอลัมน์โมเดลเรียงไม่ได้)",
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
        "จัดอันดับตามคะแนนรวม (Judge 80% + Match TH 20%) เฉดสีเข้มขึ้นคือคะแนนสูงขึ้น เวลาสร้างคำตอบแสดงเป็นนาที:วินาที และครอบคลุมเฉพาะช่วงเขียนคำตอบ",
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
      colLatency: "เวลาสร้างคำตอบ (นาที:วินาที)",
    },
    request: {
      kicker: "ส่งโมเดลเข้าทดสอบ",
      title: "ส่งโมเดลหรือไปป์ไลน์เข้าทดสอบ",
      lead: "บอกมาว่าอยากให้ทดสอบ generator, embedding และ reranker ตัวไหน เราจะเมลกลับก่อนเริ่มรัน",
      sending: "กำลังส่ง…",
      errorTitle: "ส่งคำขอไม่สำเร็จ",
      errorBody: "ข้อมูลที่กรอกยังอยู่ครบ ตรวจการเชื่อมต่อแล้วลองส่งใหม่อีกครั้ง",
      retryBtn: "ลองส่งใหม่",
      unconfiguredTitle: "ยังไม่เปิดรับคำขอผ่านหน้าเว็บ",
      unconfiguredBody:
        "ยังไม่มีข้อมูลถูกส่งออกไป เปิด issue ใน GitHub repo พร้อมระบุไปป์ไลน์ที่ต้องการให้ทดสอบ เราจะรับเรื่องจากที่นั่น",
      meta: (n: number, judge: string) =>
        `ThaiWikiV4 · ${n} คำถาม · ตรวจโดย ${judge}`,
      pipelineGroup: "โมเดลที่ต้องการทดสอบ",
      generatorLabel: "โมเดล Generator",
      generatorPlaceholder: "เช่น Qwen/Qwen2.5-7B-Instruct หรือ gpt-4o-mini",
      embeddingLabel: "โมเดล Embedding",
      embeddingPlaceholder: "เช่น BAAI/bge-m3 หรือ text-embedding-3-small",
      rerankerLabel: "โมเดล Reranker (ไม่บังคับ)",
      rerankerPlaceholder:
        "เช่น BAAI/bge-reranker-v2-m3 หรือเว้นว่างถ้าใช้เฉพาะ Dense",
      contactGroup: "ข้อมูลสำหรับติดต่อกลับ",
      emailLabel: "อีเมลของคุณ",
      nameLabel: "ชื่อคุณหรือทีม",
      notesLabel: "หมายเหตุเพิ่มเติม หรือรายละเอียด endpoint",
      submitBtn: "ส่งคำขอทดสอบนี้",
      successTitle: "รับคำขอแล้ว",
      successLead: (email: string) =>
        `จะเมลกลับไปที่ ${email} ก่อนจัดคิวรัน`,
      submitAnother: "ส่งคำขอเพิ่มอีก",
      noneFallback: "ไม่มี",
    },
    about: {
      kicker: "เกี่ยวกับโครงการ · SIAM.AI Cloud",
      title: "เกี่ยวกับโครงการ",
      lead: "ที่มาของเบนช์มาร์ก ข้อมูลที่เราเปิดเผย และทีมงานผู้ดูแลโครงการ",
    },
  },
} as const;
