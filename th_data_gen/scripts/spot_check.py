#!/usr/bin/env python3
"""
Human spot-check UI for judge-verified Thai QA triples.

Opens a Gradio interface showing random samples from verified.jsonl,
lets you mark each as Pass / Fail / Skip. Verdicts are appended to
spot_check.jsonl.

Usage:
    python th_data_gen/scripts/spot_check.py \
        [--config-path th_data_gen/config.spot_check.yaml]
"""

import json
import random
from dataclasses import dataclass
from pathlib import Path

import gradio as gr
import yaml
import tyro


@dataclass
class Config:
    input: dict          # file: verified.jsonl
    output: dict         # file: spot_check.jsonl
    ui: dict             # sample_size: 50, port: 8402


def main(config_path: str = "th_data_gen/config.spot_check.yaml"):
    with open(config_path) as f:
        cfg = Config(**yaml.safe_load(f))

    # 1. Load verified candidates (judge_ok=true only)
    candidates = []
    with open(cfg.input["file"]) as f:
        for line in f:
            r = json.loads(line)
            if r.get("judge_ok"):
                candidates.append(r)
    if not candidates:
        raise SystemExit("No judge_ok=true records in verified.jsonl")

    # 2. Random sample
    sample = random.sample(candidates, min(cfg.ui["sample_size"], len(candidates)))

    # 3. Verdicts output
    verdicts_file = Path(cfg.output["file"])
    verdicts_file.parent.mkdir(parents=True, exist_ok=True)

    def render(idx: int) -> tuple[str, str, str, str, str, str]:
        """Render sample idx for display."""
        if idx >= len(sample):
            return (
                "### Done!",
                "",
                "",
                "",
                f"Checked {len(sample)} samples.",
                "",
            )
        s = sample[idx]
        return (
            f"### {s['title']}",
            f"🌍 [{s['url']}]({s['url']})",
            f"**Q:** {s['question']}",
            f"**A:** {s['answer']}",
            f"Judge verdict: {s.get('judge_verdict', 'N/A')}",
            f"Progress: {idx + 1} / {len(sample)}",
        )

    def save_and_advance(idx: int, verdict: str):
        """Save one verdict, advance idx, re-render."""
        if idx < len(sample):
            with open(verdicts_file, "a") as fout:
                fout.write(json.dumps(
                    {**sample[idx], "spot_verdict": verdict},
                    ensure_ascii=False,
                ) + "\n")
        next_idx = idx + 1
        renders = render(next_idx)
        return (next_idx, *renders)

    with gr.Blocks(title="Thai QA Spot Check") as demo:
        gr.Markdown(f"# Thai QA Spot Check — {len(sample)} random samples")

        with gr.Column():
            title_md = gr.Markdown()
            url_md = gr.Markdown()
            question_md = gr.Markdown()
            answer_md = gr.Markdown()
            info_md = gr.Markdown()
            progress_md = gr.Markdown()

        with gr.Row():
            pass_btn = gr.Button("👍 Pass", variant="success")
            fail_btn = gr.Button("👎 Fail", variant="danger")
            skip_btn = gr.Button("⏭️ Skip", variant="secondary")

        state_idx = gr.State(0)

        outputs_list = [
            state_idx,
            title_md, url_md, question_md, answer_md, info_md, progress_md,
        ]

        pass_btn.click(
            lambda idx: save_and_advance(idx, "pass"),
            inputs=[state_idx],
            outputs=outputs_list,
        )
        fail_btn.click(
            lambda idx: save_and_advance(idx, "fail"),
            inputs=[state_idx],
            outputs=outputs_list,
        )
        skip_btn.click(
            lambda idx: save_and_advance(idx, "skip"),
            inputs=[state_idx],
            outputs=outputs_list,
        )

        # Initial render on load
        demo.load(
            fn=lambda: render(0),
            inputs=[],
            outputs=[title_md, url_md, question_md, answer_md, info_md, progress_md],
        )

    print(f"Spot-check UI: http://localhost:{cfg.ui['port']} (or public gradio.live URL when --share)")
    demo.launch(server_port=cfg.ui["port"], share=True)


if __name__ == "__main__":
    tyro.cli(main)
