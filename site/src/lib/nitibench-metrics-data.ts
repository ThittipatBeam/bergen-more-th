import type { Language } from "@/hooks/use-language";
import type {
  MetricDefinition,
  MetricTechnicalCopy,
  NitiMetricId,
} from "@/types/metrics";
import {
  NITI_TECHNICAL_EN,
  NITI_TECHNICAL_TH,
} from "@/lib/nitibench-metrics-technical";

function techOf(id: NitiMetricId, isTh: boolean): MetricTechnicalCopy {
  const base = NITI_TECHNICAL_EN[id];
  const th = NITI_TECHNICAL_TH[id];
  if (!isTh) return base;
  return {
    ...base,
    reading: th.reading,
    formula: { tex: base.formula.tex, symbols: th.symbols },
    notes: th.notes,
  };
}

/** The five NitiBench+ metrics, in leaderboard order. */
export const NITI_METRIC_ORDER: NitiMetricId[] = [
  "rubric",
  "citationF1",
  "recallAtK",
  "pAt1",
  "hallucinated",
];

export function getNitiMetrics(
  lang: Language = "EN"
): Record<NitiMetricId, MetricDefinition> {
  const isTh = lang === "TH";

  return {
    rubric: {
      id: "rubric",
      name: "Bar rubric",
      icon: "gavel",
      family: "quality",
      direction: "higher",
      simple: {
        question: isTh
          ? "คำตอบนี้ผ่านการตรวจแบบสอบทนายไหม?"
          : "Would this pass a bar examiner?",
        explanation: isTh
          ? "Judge อ่านคำตอบทั้งคดีแล้วให้คะแนนตาม rubric ทางการของทนายสภา 8 ระดับ"
          : "A judge grades each case against the official Bar Council rubric, eight tiers.",
        example: isTh
          ? "ตอบถูก verdict ครบเหตุผลและอ้างถูกมาตรา: ได้เต็มช่วงสูงของสเกล"
          : "Right verdict with sound reasoning and correct statutes lands at the top.",
      },
      technical: techOf("rubric", isTh),
    },

    citationF1: {
      id: "citationF1",
      name: "Citation F1",
      icon: "edit_note",
      family: "containment",
      direction: "higher",
      simple: {
        question: isTh
          ? "อ้างถูกทั้งเลขมาตราและฉบับไหม?"
          : "Are the cited statutes right, down to the version?",
        explanation: isTh
          ? "ทุกการอ้างถูกเทียบกับฉบับที่มีผลใช้บังคับ ณ วันพิพากษา แล้วรวมเป็น F1"
          : "Every citation resolves against the version in force on the decision date; matches become an F1.",
        example: isTh
          ? "อ้าง ม.372 ฉบับปี 1978 ซึ่งใช้อยู่ในวันพิพากษา: นับว่าถูก"
          : "Citing section 372 in its 1978 version, the one in force that day, counts as a match.",
      },
      technical: techOf("citationF1", isTh),
    },

    recallAtK: {
      id: "recallAtK",
      name: "Recall@k",
      icon: "search",
      family: "overlap",
      direction: "higher",
      simple: {
        question: isTh
          ? "retrieval เจอมาตราของศาลกี่มาตรา?"
          : "How many of the court's statutes did retrieval surface?",
        explanation: isTh
          ? "เทียบชุดมาตราจาก top k กับมาตราที่ศาลอ้างจริงในแต่ละคำถาม"
          : "The top-k retrieval set is compared against the statutes the court actually cited.",
        example: isTh
          ? "ศาลอ้างสามมาตรา ค้นเจอสอง: Recall = 66.7%"
          : "The court cited three statutes; retrieval found two, so recall is 66.7%.",
      },
      technical: techOf("recallAtK", isTh),
    },

    pAt1: {
      id: "pAt1",
      name: "P@1",
      icon: "done_all",
      family: "overlap",
      direction: "higher",
      simple: {
        question: isTh
          ? "อันดับแรกคือมาตราของเฉลยไหม?"
          : "Is rank one a statute the court used?",
        explanation: isTh
          ? "ดูเฉพาะมาตราตัวแรกสุดของ retrieval ถ้าไม่ใช่เฉลยคำขอนั้นได้ 0"
          : "Only the very first retrieval result counts; anything else there scores the question zero.",
        example: isTh
          ? "เฉลยอยู่อันดับสอง: คำถามนั้นได้ 0 แม้ Recall จะถูก"
          : "Gold statute at rank two scores zero here even when recall hits.",
      },
      technical: techOf("pAt1", isTh),
    },

    hallucinated: {
      id: "hallucinated",
      name: "Hallucinated",
      icon: "help",
      family: "containment",
      direction: "lower",
      simple: {
        question: isTh
          ? "อ้างมาตราที่ไม่มีอยู่จริงกี่ครั้ง?"
          : "How often does the model invent a statute?",
        explanation: isTh
          ? "นับการอ้างที่ไม่มีในคลังเมื่อตรวจ ยิ่งต่ำยิ่งปลอดภัยในการนำไปใช้"
          : "Citations that resolve to nothing in the corpus are counted; the lower, the safer the output.",
        example: isTh
          ? "อ้างมาตรา 991 ที่ไม่เคยมีในประมวลกฎหมาย: บวกหนึ่ง"
          : "Citing a section 991 the code never contained adds one.",
      },
      technical: techOf("hallucinated", isTh),
    },
  };
}

import type { WhichScoreRow } from "@/lib/metrics-guide";

export const NITI_WHICH_SCORE_EN: WhichScoreRow[] = [
  {
    need: "One number to rank pipelines on",
    use: "Bar (0–10)",
    why: "The official Bar-Council rubric decides the board; Citation F1 only breaks ties.",
  },
  {
    need: "Check the verdict is legally right",
    use: "Bar rubric",
    why: "A wrong verdict caps the case at 4, so scores track the judgment, not the prose.",
  },
  {
    need: "Verify the citations",
    use: "Citation F1 · Hallucinated",
    why: "Statute plus version must match; invented statutes have their own counter.",
  },
  {
    need: "Judge retrieval, before any reranking",
    use: "Recall@k · P@1",
    why: "Recall measures coverage of the court's statutes; P@1 measures rank-one placement.",
  },
  {
    need: "Compare model latency",
    use: "Gen time",
    why: "Measures generator writing time only, excluding retrieval and grading.",
  },
];

export const NITI_WHICH_SCORE_TH: WhichScoreRow[] = [
  {
    need: "ต้องการตัวเลขเดียวสำหรับจัดอันดับ",
    use: "Bar (0–10)",
    why: "rubric ทางการของทนายสภาเป็นตัวจัดอันดับ Citation F1 ใช้เพียงตัดสินคะแนนที่เท่ากัน",
  },
  {
    need: "ต้องการให้แน่ใจว่า verdict ถูกตามกฎหมาย",
    use: "Bar rubric",
    why: "ตอบผิดคำพิพากษาได้สูงสุดแค่ 4 คะแนนจึงผูกกับคุณภาพคำวินิจฉัยไม่ใช่การเรียบเรียงคำ",
  },
  {
    need: "ต้องการตรวจการอ้างอิง",
    use: "Citation F1 · Hallucinated",
    why: "ต้องตรงทั้งมาตราและฉบับ การอ้างเท็จมีตัวนับของตัวเองแยกต่างหาก",
  },
  {
    need: "ต้องการวัด retrieval ก่อน reranker",
    use: "Recall@k · P@1",
    why: "Recall วัดว่าครอบคลุมเฉลยแค่ไหน P@1 วัดว่าอันดับแรกมาเจอเฉลยหรือเปล่า",
  },
  {
    need: "ต้องการเปรียบเทียบความเร็ว",
    use: "Gen time",
    why: "จับเวลาเฉพาะช่วงที่โมเดลเขียนคำตอบ ไม่รวมค้นหาและการเกรด",
  },
];

export function getNitiWhichScoreRows(lang: Language = "EN"): WhichScoreRow[] {
  return lang === "TH" ? NITI_WHICH_SCORE_TH : NITI_WHICH_SCORE_EN;
}
