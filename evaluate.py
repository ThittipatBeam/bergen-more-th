import json
import re
import shutil
import sys
import torch
import os
import omegaconf
import yaml
import gc
import pandas as pd

from models.env import load_env_file
load_env_file()   # pick up API keys from .env in the repo root, if present
pd.set_option("display.precision", 4)


def load_data(input_file: str, nb_samples: int) -> pd.DataFrame:
    result_dict = json.load(open(input_file))
    data = pd.DataFrame(result_dict)
    if nb_samples > 0 and nb_samples < len(data):
        data = data[:nb_samples]
    return data


def load_opponent_predictions(opponent_folder: str, split: str, data: dict) -> list:
    """
    Loads predictions from the opponent folder
    Orders them as in 'data' and checks all elements are present
    """
    # We filter the other data to keep the q_ids in data
    other_data = load_data(f'{opponent_folder}/eval_{split}_out.json', nb_samples=-1)
    other_data = other_data[other_data.q_id.isin(data.q_id.unique())]
    
    assert len(other_data) == len(data), f'{len(other_data)} VS {len(data)}'
    
    # Reordering along data order:
    other_data = other_data.set_index('q_id').reindex(data['q_id']).reset_index()
    
    # Sanity checks: proper joint sorting
    for elt, other_elt in zip(data['q_id'].values, other_data['q_id'].values):
        assert elt == other_elt, f'Unmatching q_id {elt} vs {other_elt} in json files: cannot compare'
        
    return other_data['response'].values


def persist_metric(experiment_folder,
                   split: str,
                   metric_name: str,
                   data,
                   scores,
                   model_score,
                   nb_samples: int = -1,
                   extra_columns: dict = None,
                   metrics_dict: dict = None):
    """Write one metric column (and its score) back to an experiment folder.

    Shared by eval_single and judge_eval so both persist identically. Two
    details in here are load-bearing:
      - force_ascii=False: without it a post-hoc metrics run re-escapes the
        Thai in the whole 21MB out file into \\u0e... sequences.
      - the tmp-write-then-shutil.move ordering: a crash mid-write must never
        truncate the only copy of eval_{split}_out.json.
    """
    data = data.copy()
    data[metric_name] = scores
    for column, values in (extra_columns or {}).items():
        data[column] = values

    metrics_out_file = f'{experiment_folder}/eval_{split}_out.json'
    if nb_samples > 0:
        metrics_out_file = f'{experiment_folder}/eval_{split}_out_{nb_samples}.json'
    data.to_json(metrics_out_file + "_", orient='records', force_ascii=False)
    shutil.move(metrics_out_file + '_', metrics_out_file)

    if metrics_dict is not None:
        if isinstance(model_score, dict):  # win tie lose for pairwise !
            metrics_dict.update({metric_name + '_' + k: v for k, v in model_score.items()})
        else:
            metrics_dict.update({metric_name: model_score})

        metrics_file = f'{experiment_folder}/eval_{split}_metrics.json'
        with open(metrics_file + '_', 'w') as fp:
            json.dump(metrics_dict, fp, indent=2)
        shutil.move(metrics_file + '_', metrics_file)


def eval_single(experiment_folder,
                folder,
                split: str,
                model,
                metric_name: str,
                nb_samples: int = -1,
                gpt: str = None,
                opponent_folder: str = None,
                force: bool = False,
                ):
    if nb_samples > 0:
        metric_name = f"{metric_name}_{nb_samples}"
    if folder is not None:
        folders = [folder]
    else:
        folders = [ f.path for f in os.scandir(experiment_folder) if f.is_dir() and 'tmp_' not in f.path]
    for experiment_folder in folders:
        print('evaluating', experiment_folder)
        
        input_file = f'{experiment_folder}/eval_{split}_out.json'
        if os.path.exists(input_file):
            data = load_data(input_file, nb_samples=nb_samples)
                                    
            # Check whether this metric is already calculated:                        
            metrics_file = f'{experiment_folder}/eval_{split}_metrics.json'
            if os.path.exists(metrics_file):
                metrics_dict = json.load(open(metrics_file))
            else:
                metrics_dict = {}
                    
            # Was the metric already calculated ? (tie tests for pairwise metrics)
            if (metric_name in metrics_dict or metric_name + '_tie' in metrics_dict) and not force:
                print(f"{experiment_folder}\t{metric_name}\talready done")
                continue
            
            predictions = data['response'].values
            references = data['label'].values
            questions = data['question'].values    
        
            if gpt is not None:
                if opponent_folder is None:
                    model_score, scores, cost = model(predictions, references, questions)
                else:
                    opponent_predictions = load_opponent_predictions(opponent_folder, split=split, data=data)
                    model_score, scores, cost = model.pairwise_win_rate(predictions, opponent_predictions, references, questions)
                        
                # openai costs
                costs_out_file = f'{experiment_folder}/eval_{split}_cost_{metric_name}_out.json'
                with open(costs_out_file, 'w') as fout:
                    fout.write(json.dumps(cost))
            else:
                if opponent_folder is None:                    
                    model_score, scores = model(predictions, references, questions)
                else:
                    opponent_predictions = load_opponent_predictions(opponent_folder, split=split, data=data)
                    model_score, scores = model(predictions=predictions, references=references, questions=questions, opponent_predictions=opponent_predictions)
                    
            persist_metric(experiment_folder, split, metric_name, data, scores,
                           model_score, nb_samples=nb_samples, metrics_dict=metrics_dict)
            print(metric_name, model_score)
                    
                    
def llm_eval(llm: list[str], experiment_folder, folder, split, batch_size, llm_prompt, opponent_folder, opponent_name, nb_samples, force):
    if len(llm) == 0:
        model_config, metric_name = "SOLAR-107B", "LLMeval_SOLAR-107B"            
    else:
        model_config = llm[0]
        metric_name = llm[1] if len(llm) > 1 else model_config
        metric_name = f"LLMeval_{metric_name}"
        
    if opponent_folder is not None:
        metric_name += '_VS_' + opponent_name

    model_config = omegaconf.OmegaConf.load(f"config/generator/{model_config}.yaml")            
    if model_config['init_args']['_target_']=='models.generators.vllm.VLLM':
        from models.evaluators.vllm import VLLMeval 
        model = VLLMeval(model_config, batch_size=batch_size, config=llm_prompt)
        
    else:
        from models.evaluators.llm import LLMeval 
        model = LLMeval(model_config, batch_size=batch_size, config=llm_prompt)
        if model.use_logits:
            if opponent_folder is not None:
                print('WARNING: cannot use logits for pairwise comparison eval: defaulting to just text parsing.')
                model.use_logits = False
            else:
                metric_name = f"{metric_name}_logits"
        
    eval_single(experiment_folder, folder, split, model, metric_name=metric_name, nb_samples=nb_samples, opponent_folder=opponent_folder, force=force)
    del model
    torch.cuda.empty_cache()
    gc.collect()
    
    
def llm_ollama_eval(llm_ollama: list[str], experiment_folder, folder, split, batch_size, llm_prompt, ollama_url, nb_samples, force):
    from models.evaluators.llm_ollama import OllamaEval
    
    if len(llm_ollama) > 0:
        model_config = llm_ollama[0]
        short_name = llm_ollama[1] if len(llm_ollama) > 1 else model_config
        short_name = f"LLMeval_{short_name}"
        
    batch_size = batch_size or 1  
            
    model = OllamaEval(model_config, batch_size=batch_size, config=llm_prompt, basic_url=ollama_url)
    eval_single(experiment_folder, folder, split, model, metric_name=short_name, nb_samples = nb_samples, force=force)
    

def lid_eval(lid, lid_advanced, experiment_folder, folder, split, nb_samples, force):
    from models.evaluators.lid import LID
    from models.evaluators.lid_advanced import LID_advanced
    if folder is None:
        folders = [ f.path for f in os.scandir(experiment_folder) if f.is_dir() and 'tmp_' not in f.path]
    else:
        folders = [folder]

    for folder in folders:
        # we need to get language from each folder config separately
        config = yaml.safe_load(open(f"{folder}/config.yaml")) 
        if 'lng' in config['dataset'][split]['query']['init_args']:
            tgt_lng = config['dataset'][split]['query']['init_args']['lng']
        elif  'lang' in  config['dataset'][split]['query']['init_args']:
            tgt_lng = config['dataset'][split]['query']['init_args']['lang']
        else:
            #if language is not specified we set it to English by default
            tgt_lng = 'en'
            print(f"{folder}: didn't find lng in the config.yaml, set it to English by default")
        if lid is not None:
            model = LID(tgt_lng)  
            eval_single(experiment_folder, folder, split, model, metric_name="lid", nb_samples = nb_samples, force=force)
        if lid_advanced is not None:
            model = LID_advanced(tgt_lng)
            eval_single(experiment_folder, folder, split, model, metric_name="lid_advanced", nb_samples = nb_samples, force=force)
            
            
def thai_eval(experiment_folder, folder, split, nb_samples, force):
    """Post-hoc Thai-aware lexical metrics for already-finished runs.

    Reads only eval_{split}_out.json, so no retrieval or generation is re-run;
    the four metrics are scored from the answers already on disk. Uses the same
    implementations as the pipeline (modules.metrics) so the two cannot drift.
    """
    from modules import metrics as M
    import numpy as np
    f1_keys = {'F1_th': 'f1', 'Precision_th': 'precision', 'Recall_th': 'recall'}

    def scorer(metric_name):
        # eval_single contract: model(predictions, references, questions) -> (mean, per_question)
        def score(predictions, references, questions=None):
            if metric_name == 'M_th':
                scores = M.match_score(list(predictions), list(references), M.normalize_th)
            else:
                scores = M.f1_score(list(predictions), list(references), M.thai_tokens)[f1_keys[metric_name]]
            return float(np.mean(scores)), list(scores)
        return score

    for metric_name in ('M_th', 'F1_th', 'Precision_th', 'Recall_th'):
        eval_single(experiment_folder, folder, split, scorer(metric_name),
                    metric_name=metric_name, nb_samples=nb_samples, force=force)


def judge_eval(experiment_folder, folder, split, judge_model, judge_prompt,
               nb_samples, force, judge_fresh, judge_concurrency,
               judge_sample_seed=None, dry_run=False, require_confirmation=True):
    """Post-hoc LLM-as-judge over an already-finished run.

    Reads only eval_{split}_out.json - no re-retrieval and no re-generation.
    The judge sees the question, the retrieved context, the gold answer (as a
    fallible hint) and the system answer, and returns a binary 0/1 verdict plus
    a one-sentence Thai justification.

    Resumable: verdicts land in a JSONL sidecar as they arrive, so an
    interrupted run resumes instead of re-paying for what it already bought.
    """
    from models.evaluators.judge import LLMJudge, extract_docs, join_gold

    if folder is not None:
        folders = [folder]
    else:
        folders = [f.path for f in os.scandir(experiment_folder)
                   if f.is_dir() and 'tmp_' not in f.path]

    for experiment_folder in folders:
        print('judging', experiment_folder)
        input_file = f'{experiment_folder}/eval_{split}_out.json'
        if not os.path.exists(input_file):
            continue
        data = load_data(input_file, -1)

        # a q_id-keyed checkpoint and a q_id-keyed reorder are both only sound
        # if the ids are unique; fail loudly rather than misalign every column
        assert data['q_id'].is_unique, \
            f'{input_file} has duplicate q_id values - cannot checkpoint or align judge results'

        # a random sample estimates the full split far better than the first N
        # rows (which are all one topic); the sampled ids are recorded in the
        # sidecar scope so the full run still resumes against them
        if nb_samples and nb_samples > 0 and nb_samples < len(data):
            if judge_sample_seed is not None:
                sampled = data.sample(n=nb_samples, random_state=judge_sample_seed)
                scope = f'{judge_sample_seed}'
            else:
                sampled = data[:nb_samples]
                scope = ''
            data = sampled
        else:
            scope = ''

        metrics_file = f'{experiment_folder}/eval_{split}_metrics.json'
        metrics_dict = json.load(open(metrics_file)) if os.path.exists(metrics_file) else {}
        # the skip must be scoped by HOW MANY questions were judged: without
        # this, the sample-first workflow (--sample 50, then the full run) would
        # see LLMeval_judge already present and silently report the 50-question
        # number as the full-split result. LLMeval_judge_n records the scope.
        if ('LLMeval_judge' in metrics_dict
                and metrics_dict.get('LLMeval_judge_n') == len(data) and not force):
            print(f'{experiment_folder}\tLLMeval_judge\talready done')
            continue

        judge = LLMJudge(model=judge_model, prompt_config=judge_prompt,
                         concurrency=judge_concurrency, dry_run=dry_run,
                         require_confirmation=require_confirmation)

        records = []
        n_without_context = 0
        for row in data.itertuples():
            docs, has_context = extract_docs(row.instruction)
            n_without_context += 0 if has_context else 1
            records.append({
                'q_id': row.q_id,
                'question': row.question,
                'docs': docs,
                'gold': join_gold(row.label),
                'response': row.response,
            })
        if n_without_context:
            print(f'WARNING: {n_without_context}/{len(records)} records have no retrievable '
                  f'context in `instruction`; judging them without context', file=sys.stderr)

        # the judge model and the sample scope go in the filename: a different
        # judge, or a 50-question run vs the full split, must never inherit
        # another's verdicts
        slug = re.sub(r'[^A-Za-z0-9._-]', '_', judge.model_name)
        scope_suffix = f'_{nb_samples}' + (f'_seed{scope}' if scope else '') if nb_samples and nb_samples > 0 else ''
        checkpoint = f'{experiment_folder}/eval_{split}_judge_{slug}{scope_suffix}_partial.jsonl'
        if judge_fresh and os.path.exists(checkpoint):
            os.remove(checkpoint)
            print(f'judge: --judge_fresh removed {checkpoint}')

        scores_by_qid, reasons_by_qid, stats = judge.judge_batch(
            records, checkpoint_path=checkpoint)

        if dry_run:
            continue

        # restore file order by q_id - as_completed returns out of order, and
        # using completion order would silently misalign every column
        scores = [scores_by_qid.get(q_id, -100) for q_id in data['q_id'].values]
        reasons = [reasons_by_qid.get(q_id, '') for q_id in data['q_id'].values]
        model_score = judge.mean(scores)

        persist_metric(experiment_folder, split, 'LLMeval_judge', data, scores,
                       model_score, nb_samples=nb_samples,
                       extra_columns={'judge_reason': reasons},
                       metrics_dict=metrics_dict)
        # the percentage the user asked for, plus an explicit unknown rate so an
        # all-unparseable run is distinguishable from a genuine 0%
        metrics_dict['LLMeval_judge_pct'] = model_score * 100
        metrics_dict['LLMeval_judge_unknown_rate'] = stats['unknown_rate']
        metrics_dict['LLMeval_judge_n'] = len(data)
        with open(metrics_file + '_', 'w') as fp:
            json.dump(metrics_dict, fp, indent=2, ensure_ascii=False)
        shutil.move(metrics_file + '_', metrics_file)

        costs_out_file = f'{experiment_folder}/eval_{split}_cost_LLMeval_judge_out.json'
        with open(costs_out_file, 'w') as fout:
            json.dump({'total_cost': stats['total_cost'],
                       'prompt_cost': stats['prompt_cost'],
                       'completion_cost': stats['completion_cost']}, fout)

        print(f"LLMeval_judge {model_score:.4f} ({model_score * 100:.1f}%)  "
              f"judged={stats['n_judged']} reused={stats['n_reused']} "
              f"failed={stats['n_failed']} unknown={stats['n_unknown']} "
              f"cost=${stats['total_cost']:.4f}")
        del judge


def gpt_eval(gpt, experiment_folder, folder, split, opponent_folder, opponent_name, nb_samples, force):
    from models.evaluators.openai import OpenAI
    model = OpenAI(gpt)
    metric_name = gpt
    if opponent_folder is not None:
        metric_name += '_VS_' + opponent_name
    eval_single(experiment_folder, folder, split, model, gpt=gpt, metric_name=metric_name, nb_samples=nb_samples, opponent_folder=opponent_folder, force=force)


def run_eval(experiment_folder=None,
             split="dev",
             llm: list[str]=None,
             llm_ollama: list[str]=None,
             gpt: bool=None,
             lid: bool=None,
             lid_advanced: bool=None,
             thai: bool=None,
             judge: bool=None,
             judge_model: str=None,
             judge_prompt: str="judge_qa",
             judge_concurrency: int=None,
             judge_fresh: bool=False,
             judge_sample_seed: int=None,
             dry_run: bool=False,
             require_confirmation: bool=True,
             llm_batch_size: int=None,
             llm_prompt: str = "default_qa",
             ollama_url: str=None,
             folder: str=None,
             force: bool=False,
             nb_samples: int=-1,
             opponent_folder: str = None,
             opponent_name: str = None):
    """
    Entry point for all LLM evaluations.
    """
    if gpt is not None:
        gpt_eval(gpt, 
                    experiment_folder, 
                    folder, 
                    split, 
                    opponent_folder=opponent_folder, 
                    opponent_name=opponent_name, 
                    nb_samples=nb_samples, 
                    force=force)
    
    if llm is not None:
        llm_eval(llm,
                 experiment_folder,
                 folder,
                 split,
                 llm_batch_size,
                 llm_prompt, 
                 opponent_folder=opponent_folder, 
                 opponent_name=opponent_name, 
                 nb_samples=nb_samples,
                 force=force)
        
    if llm_ollama is not None:
        llm_ollama_eval(llm_ollama, experiment_folder, folder, split, llm_batch_size, llm_prompt, ollama_url, nb_samples=nb_samples, force=force)
        
    if lid is not None or lid_advanced is not None:
        lid_eval(lid, lid_advanced, experiment_folder, folder, split, nb_samples=nb_samples, force=force)

    if thai is not None:
        thai_eval(experiment_folder, folder, split, nb_samples=nb_samples, force=force)

    if judge is not None:
        judge_eval(experiment_folder, folder, split,
                   judge_model=judge_model,
                   judge_prompt=judge_prompt,
                   nb_samples=nb_samples,
                   force=force,
                   judge_fresh=judge_fresh,
                   judge_concurrency=judge_concurrency,
                   judge_sample_seed=judge_sample_seed,
                   dry_run=dry_run,
                   require_confirmation=require_confirmation)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument('--experiments_folder', type=str, default="experiments/")
    parser.add_argument('--folder', type=str, default=None)
    
    parser.add_argument('--split', type=str, default='dev')
    parser.add_argument('--sample', type=int, default=-1, help="Use only subsample of the experiment folder for evaluation, useful for debug\
        purposes (default -1: use full dataset)")    
    parser.add_argument('--lid', action='store_true', default=None)
    parser.add_argument('--lid_advanced', action='store_true', default=None)

    parser.add_argument('--thai', action='store_true', default=None, help="""Compute Thai-aware lexical
        metrics (M_th, F1_th, Precision_th, Recall_th) post-hoc from an already-finished run.
        No retrieval or generation is re-run: scores are recomputed from eval_{split}_out.json.""" )

    parser.add_argument('--judge', action='store_true', default=None, help="""Run the LLM-as-judge
        post-hoc over an already-finished run: a binary 0/1 factual-correctness verdict per
        question, judged against the retrieved context with the gold answer as a fallible hint.
        No retrieval or generation is re-run. Resumable - verdicts are checkpointed as they
        arrive, so an interrupted run continues instead of re-paying. The model comes from
        --judge_model or JUDGE_MODEL; the endpoint from JUDGE_BASE_URL/JUDGE_API_KEY
        (falling back to OPENAI_BASE_URL/OPENAI_API_KEY).""")
    parser.add_argument('--judge_model', type=str, default=None,
        help="Judge model id (default: $JUDGE_MODEL).")
    parser.add_argument('--judge_prompt', type=str, default="judge_qa",
        help="Prompt config under config/evaluator/ (default: judge_qa).")
    parser.add_argument('--judge_concurrency', type=int, default=None,
        help="In-flight judge requests (default: $JUDGE_CONCURRENCY or 4).")
    parser.add_argument('--judge_fresh', action='store_true',
        help="Discard the checkpoint sidecar and re-judge everything. --force only "
             "recomputes the metric; it still resumes already-paid verdicts.")
    parser.add_argument('--judge_sample_seed', type=int, default=None,
        help="Sample --sample questions randomly with this seed instead of taking the "
             "first N rows (which are all one topic and give a biased estimate).")
    parser.add_argument('--dry_run', action='store_true',
        help="Print how many judge calls would be made and exit before any API call.")

    parser.add_argument('--llm', type=str, nargs='*', default=None,
            help=""" 
                - full model name (corresponding to generator config name) and short name (used for naming output files and metrics): 
                    eg. -llm SOLAR-107B solar 
                - if short name is missing: use full name in naming, 
                - if no arguments specified: falls back to default arguments: uses default values (SOLAR-107B LLMeval). 
                """)
                    
    parser.add_argument('--llm_ollama',  type=str, nargs='*', default=None, 
            help="""
                Calls ollama server to run evaluation. Requires 1 or 2 arguments: 
                - full model name  and short name (used for naming output files and metrics): eg. -llm_ollama llama3:default llama3 
                - if short name is missing: use full name in naming
                """ )
    
    parser.add_argument('--gpt', type=str, default=None)
    
    # Use these arguments to do pairwise evaluations:
    parser.add_argument('--opponent_folder', type=str, default=None, help='Provide a second folder via this to run pairwise comparisons\
        (only available with gpt and when specifying a folder)')
    parser.add_argument('--opponent_name', type=str, default=None, help='Provide a second folder via this to run pairwise comparisons\
        (only available with gpt and when specifying a folder)')
    
    parser.add_argument('--llm_batch_size', type=int, default=None)
    parser.add_argument('--force', action='store_true')
    parser.add_argument('--llm_prompt', type=str, default="default_qa", help="Provide yaml config file with updated prompt.\
        Default prompt: config/evaluator/default_prompt.yaml")
    parser.add_argument('--ollama_url', type=str, default="http://localhost:11434", help="")
    
    args = parser.parse_args()
    
    if args.opponent_folder is not None:
        assert args.gpt or args.llm is not None, f"{args.gpt} {args.llm}"
        assert args.folder is not None, 'Pairwise only supported if you specify a folder'
        assert os.path.isdir(args.opponent_folder), 'Pairwise_on argument should point to a directory to which compare the folder arg outputs.'
        assert args.opponent_name is not None, 'Specify a name for the opponent (to name the metrics)'
        print('Pairwise comparison detected, the opponent is found at:', args.opponent_folder, ' with name ', args.opponent_name)
    
    e = run_eval(
        folder=args.folder, 
        experiment_folder=args.experiments_folder, 
        split=args.split, 
        llm=args.llm, 
        llm_ollama=args.llm_ollama,
        gpt=args.gpt,
        lid=args.lid,
        lid_advanced=args.lid_advanced,
        thai=args.thai,
        judge=args.judge,
        judge_model=args.judge_model,
        judge_prompt=args.judge_prompt,
        judge_concurrency=args.judge_concurrency,
        judge_fresh=args.judge_fresh,
        judge_sample_seed=args.judge_sample_seed,
        dry_run=args.dry_run,
        llm_batch_size=args.llm_batch_size,
        llm_prompt=args.llm_prompt,
        ollama_url=args.ollama_url,
        force=args.force, 
        nb_samples=args.sample,
        opponent_folder=args.opponent_folder,
        opponent_name=args.opponent_name
    )
