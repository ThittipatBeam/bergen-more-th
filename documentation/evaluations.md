
## Evaluation


### Output files
Example files generated for split `dev` using `naver_splade-cocondenser-selfdistil` as a retriever.
- `config.yaml` The parameters of the experiment in yaml format.
- `eval_dev_generation_time.json` The generation time in json format.
- `eval_dev_metrics.json` Generation evaluation metrics in json format.
- `eval_dev_out.json` Output of the generation, contains `q_id` (str), `response` `(str)` the generated response, `label` `(list (str))` the answer reference (multiple possible), `instruction` `(str)` the instruction given to the generator, `ranking_label` `(list(list(str)), optional)` ids of reference paragraph (again multiple references possible).
- `run.retrieve.top_5.kilt_nq.dev.naver_splade-cocondenser-selfdistil.trec` The retrieval run in `trec` format.
- `eval_dev_ranking_metrics.json` Retrieval evaluation metrics in json format.


Non-neural metrics will be calculated automatically. Neural metrics such as `BEM` and `LLM` need to be evoked seperately.

### Thai-aware metrics

Thai is written without spaces, and the text encountered in a pipeline is segmented inconsistently: retrieved documents are usually word-segmented (`สปริงเบรก. ใน อดีต ที่พัก ...`) while model answers often are not. The standard lexical metrics mis-handle this:

- `M` and `EM` use `normalize()`, which *collapses* whitespace but never removes it, so a verbatim-correct answer written without the gold's spaces scores 0.
- `F1` / `Precision` / `Recall` tokenize with `str.split()`, which sees space-less Thai as a single token — gold `เลดี้ กาก้า` against `...ร้องโดยเลดี้กาก้า...` yields zero overlap and Recall 0.0.
- `Recall_char3gram` is character-based so it survives both, but it credits near-miss substrings: gold `1980` scores 0.5 against an answer containing `1985` (the trigram `198` matches).

Four additional metrics address this, computed alongside the standard ones (which are left untouched, so existing results stay comparable):

| Metric | Meaning |
|---|---|
| `M_th` | gold contained in the prediction, whitespace-insensitive |
| `F1_th`, `Precision_th`, `Recall_th` | word-level F1/P/R over `pythainlp` word tokens |

`Recall_th` correctly gives 0.0 on the `1980`/`1985` case where `Recall_char3gram` gives 0.5.

They are **enabled automatically when the dataset's language is Thai**, read from `dataset.<split>.query.init_args.lang == 'th'` in the experiment config. Override per run with a Hydra argument:

```bash
# force on (e.g. a Thai dataset that does not declare lang: th)
python3 bergen.py dataset=... thai_metrics=true

# force off
python3 bergen.py dataset=... thai_metrics=false
```

The segmenter engine defaults to `newmm` (pure Python, no model download) and can be changed with the `THAI_TOKENIZE_ENGINE` environment variable; `longest` is the other engine available without extra dependencies.

**Applying them to a run that already finished** requires no re-retrieval and no re-generation — the metrics are recomputed from the answers already on disk:

```bash
python3 evaluate.py --folder experiments/<exp_folder> --split dev --thai
```

This adds the four columns to `eval_dev_out.json` and the four keys to `eval_dev_metrics.json`. Re-running is a no-op (each metric prints `already done`); pass `--force` to recompute.

### LLM-as-judge

The metrics above are all string-matching: they require the gold string to appear in the answer, so none of them can represent a **correct refusal** or a **correct answer written with a different Thai transliteration than the gold**. The `edge of glory` question is the canonical case — the gold is `เลดี้ กาก้า`, the retrieved Thai-Wikipedia context says `เล ดี กา กา`, and `เลดี้ กาก้า` never appears in the context at all, so every lexical metric reads the correct answer as wrong.

`--judge` runs a post-hoc LLM-as-judge that scores each question **0 or 1** on factual correctness, judged against the **retrieved context**, with the gold answer as a **fallible hint** (it may be incomplete, outdated, or simply wrong). It reads only data already on disk — no re-retrieval, no re-generation.

```bash
# sample first (cheap), then the full split
python3 evaluate.py --folder experiments/<exp_folder> --split dev --judge --sample 50
python3 evaluate.py --folder experiments/<exp_folder> --split dev --judge
```

It configures itself from `JUDGE_MODEL` / `JUDGE_API_KEY` / `JUDGE_BASE_URL` in `.env`, falling back to `OPENAI_BASE_URL` / `OPENAI_API_KEY` — so pointing it at the same gateway as everything else needs no extra config (see `documentation/apis.md`). The prompt lives in `config/evaluator/judge_qa.yaml`; `--judge_prompt` selects another.

Results land in `eval_dev_metrics.json` as three keys:

| Key | Meaning |
|---|---|
| `LLMeval_judge` | the fraction correct (0–1), consistent with the other metrics |
| `LLMeval_judge_pct` | the same number as a percentage |
| `LLMeval_judge_unknown_rate` | share of verdicts the judge's reply could not be parsed for |

and in `eval_dev_out.json` as the `LLMeval_judge` score column plus a `judge_reason` column holding the judge's one-sentence Thai justification per question. The reason column is text, so it stays out of the metrics JSON — `print_results.py` renders from the metrics JSON, and a text value there would break the markdown table.

**Unparseable verdicts** use the codebase's existing `-100` unknown convention rather than scoring 0, so a parsing failure never drags the mean down; the mean is taken over known verdicts only. That also means `LLMeval_judge` reads `0.00` when *every* verdict is unknown — check `LLMeval_judge_unknown_rate` before reading a `0` as "0% correct".

#### Resuming and re-paying

Verdicts are appended to a JSONL sidecar (`eval_<split>_judge_<model>[_<n>]_partial.jsonl`) **as they arrive**, so an interrupted run resumes instead of re-paying. A crash costs at most the in-flight requests. Verdicts are reused only when the judge model *and* a hash of the prompt *and* the sample size match, so editing the prompt or switching judge model re-judges rather than silently mixing judges.

- Re-running the same command skips questions already judged.
- `--force` recomputes even when the metric is already present, **but still reuses the sidecar** (that money is already spent). Use `--judge_fresh` to discard the sidecar and deliberately re-pay.
- `--judge_sample_seed N` samples randomly instead of taking the file's first N rows (which are all one topic, so an unseeded sample can be badly biased).
- `--dry_run` prints how many calls *would* be made and exits without spending. Note that a background/non-TTY run auto-proceeds past the cost prompt.

By default `evaluate.py` will scan all folders in `experiments/` and evaluate them sequentially. To evaluate a single folder pass the folder using `--folder`. To avoid running out of memory either run `BEM` using `--bem` or run `LLM` using `--llm` . A csv file will automatically be saved to `results/` containing the table in `csv` format.

When using `--llm` you have a choice on how you transform LLM predictions in the final score:
- directly check in the generated answer for the expepected label occurence (default Yes/No), and assign corresponding score (default 1/0), when no expected label is found, or more than one expected label is matched, we assign score -100 to the corresponding sample, such samples are excluded from the mean score computation
- rely on the logits assigned to the first token (not available with vllm generators): get values corresponding to the expected labels, normalize them to 1 (get probability distribution across possible labels `p(label)`); final score would correspond to Inline equation: $\sum_{label} score(label)*p(label)$ 
The choice of score interpretation is done via `use_logits` parameter specified at evaluation config file. Default value is set to `True` (corresponding to the second option)


```bash
python3 evaluate.py --experiments_folder experiments/ --llm_batch_size 16 --split 'dev' --llm
```
Similarly to  `--generator` you can specify which LLM you are willing as first options of `--llm`, as well as short name at metrics naming (use the name of the configuration file as the name of the llm). 
 

```bash
# use llama2-7b-chat to run evaluation, output metric will be named VLLMeval_l2_7b
python3 evaluate.py --experiments_folder experiments/ --llm_batch_size 16 --split 'dev' --llm  "vllm_llama-2-7b-chat" "l2_7b"

# use tinyllama to run evaluation, output metric will be named LLMeval_tinyllama
python3 evaluate.py --experiments_folder experiments/ --llm_batch_size 16 --split 'dev' --llm  "tinyllama-chat" "tinyllama"

# in default settings (with no arguments specified) we use SOLAR-107B for evaluation and output metric is named LLMeval
python3 eval.py --experiments_folder experiments/ --llm_batch_size 16 --split 'dev' --llm  

```

You can specify prompt and other parameters in the evaluation config file for `--llm` at `config/evaluator` directory. By default they rely on `default_qa.yaml` configuration which assigns binary (Yes/No) value to each triple of <em>Question/Response/Gold Response</em>. You can specify finer granularity options and prompt (aka <em>rubrik section</em>). See example of more fine-grained configuration at `config/evaluator/default_multi_qa.yaml`. 

```bash
python3 eval.py --experiments_folder experiments/ --llm_batch_size 16 --split 'dev' --llm  --llm_prompt default_multi_qa
```


If you have local ollama server running, you can call models installed on this server as following:

```bash
python3 eval.py --experiments_folder experiments/ --llm_ollama "phi3:latest" --ollama_url "http://localhost:11434"   --llm_prompt default_multi_qa
```

### Pairwise comparisons

Instead of computing an LLM eval score for a given run, you can compare two outputs using the same script and some additional arguments e.g.
````
python3 evaluate.py --llm --folder mistral_preds --opponent_folder llama_preds  --opponent_name llama
```
where both `mistral_preds` and `llama_preds` are output folders of bergen inferences.
This scripts uses an LLM (can be any LLM supported in bergen or gpt-4o) to compare the two sets of predictions and compute win/tie/lose rates against the opponent. Results are stored in the metrics file of the folder. The prompt used is the pairwise prompt in `config/default_qa.yaml`.

This approach does not use logits but rather the raw prediction of the LLMs (win, tie or lose).

In this setup note that:
    - A single experiment folder must be specified for `--folder` and `--opponent_folder`
    - the `opponent_name` is required 