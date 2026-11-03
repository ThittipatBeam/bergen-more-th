/** Reading notes for the NitiBench+ board — comparability caveats that must
 *  travel with the numbers whenever they are shown. */

export function NitiBenchCaveats({
  isTh,
  judgeModel,
}: {
  isTh: boolean;
  judgeModel: string | null;
}) {
  const judge = judgeModel ?? "KIMI-K3";
  const bullets = isTh
    ? [
        "Retrieval ทำบนคลัง 3,253 มาตรา (gold pool) — คลังเต็มของชุดข้อมูลต้นทาง (~105k sections) ยังไม่เปิดเผย ดังนั้น Recall ที่นี่ง่ายกว่าการตั้งค่าทางการ และเทียบตัวเลขกับ leaderboard ทางการโดยตรงไม่ได้",
        `Judge คือ ${judge} ผ่าน harness ของเรา (system prompt และ rubric 8 ระดับตามเอกสารทางการของสภาทนายความ) — ไม่ใช่โมเดล judge ทางการของชุดข้อมูล`,
        "EM/F1 แบบเทียบคำถูกคำนวณและเก็บไว้ในข้อมูลดิบ แต่ไม่แสดงในโหมดนี้ เพราะคำตอบกฎหมายเป็น JSON เชิงโครงสร้าง การเทียบคำวัดความถูกต้องของเนื้อหาแทบไม่ได้",
        "คอลัมน์ «คดี» คือจำนวนคดีที่ judge ประเมินจริง — benchmark เต็มคือ 498 คดี แถว pilot แสดงน้อยกว่านั้น",
        "Rubric score แกว่งจาก nondeterminism ของ judge: สองรันที่ retrieval ตรงกันเด๊ะตวัดเดียวออกต่างกันประมาณ 0.4–0.5 คะแนน (เต็ม 10) — อ่านอันดับที่ต่างกันนิดเดียวด้วยความระวัง",
        "Parametric = ตอบจากความจำโดยไม่ค้นเอกสาร (citation เทียบแบบ fuzzy); Gold-cited = ใส่เนื้อมาตราเฉลยลงใน context ให้โดยตรง",
      ]
    : [
        "Retrieval runs over a 3,253-section gold pool — the benchmark's full ~105k-section corpus is not yet released, so Recall here is easier than the official setting and the numbers are not directly comparable to the official leaderboard.",
        `The judge is ${judge} via our harness (system prompt and 8-tier rubric taken verbatim from the official Bar-Council grading docs) — it is not the dataset's official judge model.`,
        "Lexical EM/F1 are computed and stored in the raw data but intentionally hidden in this mode: legal answers are structured JSON, so word matching measures almost nothing about correctness.",
        "The Cases column is the number of cases the judge actually scored — the full benchmark is 498 cases; pilot rows show fewer.",
        "Rubric scores wobble from judge nondeterminism: two runs with byte-identical retrieval and answers differed by ~0.4–0.5 out of 10 — treat tiny rank gaps with caution.",
        "Parametric = answering from memory with no retrieval (fuzzy citation matching); Gold-cited = the gold statute text placed directly in context.",
      ];
  return (
    <aside className="rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
        {isTh ? "อ่านตัวเลขยังไง" : "How to read these numbers"}
      </h3>
      <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-xs leading-relaxed text-[var(--text-secondary)]">
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </aside>
  );
}
