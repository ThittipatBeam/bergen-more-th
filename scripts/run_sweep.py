#!/usr/bin/env python3
"""
BERGEN-TH Sweep & Batch Experiment Runner.

Runs a matrix of predefined models/experiments sequentially with a single command.
Supports both explicit combinations and full Cartesian product (matrix) generation
across Generators, Retrievers, and Rerankers.

Features:
  - --pilot [N]: Smoke test / dry-run with real API calls on N questions (default: 1)
  - Full .env integration (automatically loads API keys and endpoint URLs)
  - Automatic LLM Judge post-eval and leaderboard updates

Usage:
    python3 scripts/run_sweep.py [--config sweep_config.yaml] [--dry-run] [--pilot]
"""

import argparse
import glob
import itertools
import os
import re
import shlex
import shutil
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path
import yaml

# Load .env at top level so all credentials and URLs are available
try:
    from models.env import load_env_file
    load_env_file()
except Exception:
    pass

# Color codes for readable console output
CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BOLD = "\033[1m"
RESET = "\033[0m"


def log_info(msg):
    print(f"{CYAN}{BOLD}[INFO]{RESET} {msg}")


def log_success(msg):
    print(f"{GREEN}{BOLD}[SUCCESS]{RESET} {msg}")


def log_warn(msg):
    print(f"{YELLOW}{BOLD}[WARN]{RESET} {msg}")


def log_error(msg):
    print(f"{RED}{BOLD}[ERROR]{RESET} {msg}")


def load_config(config_path: str) -> dict:
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Configuration file not found: {config_path}")
    with open(config_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def expand_matrix(matrix_cfg: dict) -> list:
    """Expands Cartesian product of generators, retrievers, and rerankers."""
    generators = matrix_cfg.get("generators", [])
    retrievers = matrix_cfg.get("retrievers", [])
    rerankers = matrix_cfg.get("rerankers", [None])

    if not generators or not retrievers:
        log_warn("Matrix mode enabled but generators or retrievers list is empty.")
        return []

    runs = []
    for gen, ret, rer in itertools.product(generators, retrievers, rerankers):
        g_name = gen.get("name") or gen.get("model") or gen.get("generator") or gen.get("config", "gen")
        ret_name = ret.get("name") or ret.get("model") or ret.get("config") or ret.get("retriever", "ret")
        rer_name = "No-Rerank"
        if rer and (rer.get("config") or rer.get("reranker") or rer.get("model")):
            rer_name = rer.get("name") or rer.get("model") or rer.get("config") or rer.get("reranker", "rerank")

        run_name = f"{g_name} + {ret_name} + {rer_name}"
        run_entry = {
            "name": run_name,
            "enabled": True,
            "generator": gen.get("generator") or gen.get("config", "openai_compatible"),
            "generator_model": gen.get("model") or gen.get("generator_model"),
            "retriever": ret.get("config") or ret.get("retriever", "api-embed-openai-compatible"),
            "retriever_model": ret.get("model") or ret.get("retriever_model"),
            "reranker": (rer.get("config") or rer.get("reranker")) if rer else None,
            "reranker_model": (rer.get("model") or rer.get("reranker_model")) if rer else None,
        }
        runs.append(run_entry)

    return runs


def build_command_args(run_cfg: dict, defaults: dict, force: bool = False, pilot: int = None) -> list:
    """Merges defaults with run_cfg and constructs Hydra command line arguments."""
    cfg = {**defaults, **run_cfg}
    args = []

    # Dataset
    if cfg.get("dataset"):
        args.append(f"dataset='{cfg['dataset']}'")

    # Pilot / Smoke-test mode: activates debug mode in bergen
    if pilot:
        args.append("debug=true")

    # Retriever
    retriever = cfg.get("retriever")
    if retriever:
        retriever_cfg = str(retriever)
        args.append(f"retriever='{retriever_cfg}'")
        if cfg.get("retriever_model"):
            args.append(f"retriever.init_args.model_name='{cfg['retriever_model']}'")
        if cfg.get("retrieve_top_k") is not None:
            args.append(f"retrieve_top_k={cfg['retrieve_top_k']}")
        # Only pass require_confirmation for API retrievers
        if "api" in retriever_cfg.lower():
            args.append("retriever.init_args.require_confirmation=false")

    # Reranker
    reranker = cfg.get("reranker")
    if reranker and str(reranker).lower() not in ("null", "none"):
        reranker_cfg = str(reranker)
        args.append(f"reranker='{reranker_cfg}'")
        if cfg.get("reranker_model"):
            args.append(f"reranker.init_args.model_name='{cfg['reranker_model']}'")
        if cfg.get("rerank_top_k") is not None:
            args.append(f"rerank_top_k={cfg['rerank_top_k']}")
        # Only pass require_confirmation for API rerankers
        if "api" in reranker_cfg.lower():
            args.append("reranker.init_args.require_confirmation=false")

    # Generator
    generator = cfg.get("generator")
    if generator:
        gen_cfg = str(generator)
        args.append(f"generator='{gen_cfg}'")
        if cfg.get("generator_model"):
            args.append(f"generator.init_args.model_name='{cfg['generator_model']}'")
        if cfg.get("generation_top_k") is not None:
            args.append(f"generation_top_k={cfg['generation_top_k']}")

    # Thai metrics
    if cfg.get("thai_metrics"):
        args.append("thai_metrics=true")

    # Overwrite / Force
    if force or not cfg.get("skip_existing", True):
        args.append("overwrite_exp=true")

    # Split
    split = cfg.get("split", "dev")
    args.append(f"dataset_split='{split}'")

    return args


def prepare_environment(run_cfg: dict, defaults: dict, pilot: int = None) -> dict:
    """Sets environment variables so that .env credentials are kept while model names swap."""
    cfg = {**defaults, **run_cfg}
    env = os.environ.copy()
    env["BERGEN_API_CONFIRM"] = "1"

    # In pilot mode, specify the exact number of debug questions
    if pilot:
        env["BERGEN_DEBUG_SAMPLES"] = str(pilot)

    # Set generator model in env so load_dotenv() won't take precedence
    if cfg.get("generator_model"):
        env["LLM_MODEL"] = str(cfg["generator_model"])

    # Set retriever model in env
    if cfg.get("retriever_model"):
        env["EMBED_MODEL"] = str(cfg["retriever_model"])

    # Set reranker model in env
    reranker = cfg.get("reranker")
    if reranker and str(reranker).lower() not in ("null", "none") and cfg.get("reranker_model"):
        env["RERANK_MODEL"] = str(cfg["reranker_model"])
    elif (not reranker or str(reranker).lower() in ("null", "none")) and "RERANK_MODEL" in env:
        # Prevent old RERANK_MODEL from forcing a reranker
        del env["RERANK_MODEL"]

    return env


def execute_command(cmd: list, log_file: Path, env: dict):
    """Executes a command while streaming output to both stdout and a log file."""
    exp_folder = None
    already_exists = False

    with open(log_file, "w", encoding="utf-8") as lf:
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            env=env,
        )

        for line in proc.stdout:
            sys.stdout.write(line)
            sys.stdout.flush()
            lf.write(line)
            lf.flush()

            # Detect finished experiment folder
            m_exp = re.search(r"experiment_folder\s+(experiments/[a-zA-Z0-9_-]+)", line)
            if m_exp:
                exp_folder = m_exp.group(1)

            if "already exists!" in line:
                already_exists = True

        proc.wait()
        return proc.returncode, exp_folder, already_exists


def run_sweep():
    parser = argparse.ArgumentParser(description="BERGEN-TH Batch Experiment & Model Sweep Runner")
    parser.add_argument("--config", default="sweep_config.yaml", help="Path to sweep config yaml")
    parser.add_argument("--dry-run", action="store_true", help="Print planned commands without executing")
    parser.add_argument("--pilot", nargs="?", const=1, type=int, default=None,
                        help="Run quick smoke test with N questions (default: 1) across full pipeline")
    parser.add_argument("--filter", type=str, default=None, help="Filter run names matching this regex/substring")
    parser.add_argument("--force", action="store_true", help="Force re-run and overwrite existing experiments")
    parser.add_argument("--fresh", action="store_true",
                        help="Perform a clean run: clears pilot query indexes, runs, and experiments cache before running")
    parser.add_argument("--judge", action="store_true", help="Force enable LLM-as-judge evaluation")
    parser.add_argument("--no-judge", action="store_true", help="Disable LLM-as-judge evaluation")
    parser.add_argument("--list", action="store_true", help="List all configured runs and exit")
    args = parser.parse_args()

    config = load_config(args.config)
    defaults = config.get("defaults", {})
    matrix_cfg = config.get("matrix", {})

    # Determine run source: matrix expansion or explicit runs
    if matrix_cfg.get("enabled", False):
        log_info("Matrix mode enabled. Generating all model combinations...")
        runs = expand_matrix(matrix_cfg)
    else:
        runs = config.get("runs", [])

    if not runs:
        log_warn("No runs defined in configuration file.")
        return

    # Filter runs
    filtered_runs = []
    for r in runs:
        if args.filter and not re.search(args.filter, r.get("name", "")):
            continue
        filtered_runs.append(r)

    if args.list:
        print(f"\n{BOLD}Configured Runs in {args.config}:{RESET}")
        for idx, r in enumerate(filtered_runs, 1):
            enabled = r.get("enabled", True)
            status = f"{GREEN}enabled{RESET}" if enabled else f"{YELLOW}disabled{RESET}"
            gen_model = r.get("generator_model", defaults.get("generator_model", "-"))
            ret_model = r.get("retriever_model", defaults.get("retriever_model", "-"))
            rer_model = r.get("reranker_model", defaults.get("reranker_model", "none")) if r.get("reranker") else "none"
            judge_enabled = not args.no_judge and (args.judge or r.get("run_judge", defaults.get("run_judge", False)))
            judge_m = r.get("judge_model", defaults.get("judge_model", "env")) if judge_enabled else "disabled"
            print(f"  {idx:2d}. [{status}] {BOLD}{r.get('name', 'unnamed')}{RESET}")
            print(f"      Gen: {gen_model} | Embed: {ret_model} | Rerank: {rer_model} | Judge: {judge_m}")
        return

    active_runs = [r for r in filtered_runs if r.get("enabled", True)]
    if not active_runs:
        log_warn("No enabled runs to execute. Enable runs in sweep_config.yaml or use --list.")
        return

    mode_str = "Matrix Grid" if matrix_cfg.get("enabled", False) else "Explicit List"
    if args.pilot:
        mode_str += f" | {YELLOW}PILOT SMOKE-TEST: {args.pilot} Q{RESET}"

    print("=" * 80)
    print(f"{BOLD}{CYAN}BERGEN-TH Batch Sweep Runner ({mode_str}){RESET}")
    print(f"Config: {args.config} | Active Runs: {len(active_runs)}")
    print("=" * 80)

    # Dry-run inspection
    if args.dry_run:
        log_info("Dry-run mode activated. Commands that would be run:")
        for idx, r in enumerate(active_runs, 1):
            cmd_args = build_command_args(r, defaults, force=args.force, pilot=args.pilot)
            full_cmd = "python3 bergen.py " + " ".join(cmd_args)
            env_vars = prepare_environment(r, defaults, pilot=args.pilot)
            print(f"\n[{idx}/{len(active_runs)}] Run: {BOLD}{r.get('name')}{RESET}")
            pilot_str = f" BERGEN_DEBUG_SAMPLES={args.pilot}" if args.pilot else ""
            print(f"  Env: LLM_MODEL={env_vars.get('LLM_MODEL', '-')} EMBED_MODEL={env_vars.get('EMBED_MODEL', '-')}{pilot_str}")
            print(f"  Command: {full_cmd}")
            should_judge = args.judge or (r.get("run_judge", defaults.get("run_judge", False)) and not args.no_judge)
            if should_judge:
                judge_model = r.get("judge_model", defaults.get("judge_model"))
                judge_arg = f" --judge_model {judge_model}" if judge_model else ""
                sample_arg = f" --sample {args.pilot}" if args.pilot else ""
                print(f"  Judge: python3 evaluate.py --folder <exp_folder> --split {r.get('split', defaults.get('split', 'dev'))} --judge{judge_arg}{sample_arg}")
        print("\n" + "=" * 80)
        return

    # Fresh run handling: clean intermediate caches
    if args.fresh:
        log_info("Fresh run requested (--fresh). Clearing intermediate caches...")
        if args.pilot:
            for p in glob.glob("indexes/*debug*"):
                log_info(f"Removing debug index: {p}")
                shutil.rmtree(p, ignore_errors=True)
            for p in glob.glob("runs/run.*debug*"):
                log_info(f"Removing debug run: {p}")
                try:
                    os.remove(p)
                except OSError:
                    pass
            for p in glob.glob("experiments/*"):
                if os.path.isdir(p):
                    cfg_file = Path(p) / "config.yaml"
                    if cfg_file.exists():
                        try:
                            c = yaml.safe_load(cfg_file.read_text())
                            if c and c.get("debug") is True:
                                shutil.rmtree(p, ignore_errors=True)
                        except Exception:
                            pass
                    elif Path(p).name.startswith("tmp_"):
                        shutil.rmtree(p, ignore_errors=True)
                else:
                    try:
                        os.remove(p)
                    except OSError:
                        pass
        else:
            log_info("Clearing experiments/ folder for fresh sweep...")
            for p in glob.glob("experiments/*"):
                if os.path.isdir(p):
                    shutil.rmtree(p, ignore_errors=True)
                else:
                    try:
                        os.remove(p)
                    except OSError:
                        pass
        args.force = True

    # Ensure log directory
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    prefix = "pilot_" if args.pilot else "sweep_"
    log_dir = Path("logs") / f"{prefix}{timestamp}"
    log_dir.mkdir(parents=True, exist_ok=True)
    log_info(f"Logging execution to {log_dir}/")

    results_summary = []
    start_total_time = time.time()

    for idx, r in enumerate(active_runs, 1):
        run_name = r.get("name", f"run_{idx}")
        run_slug = re.sub(r"[^a-zA-Z0-9_\-]", "_", run_name)
        log_file = log_dir / f"{idx:02d}_{run_slug}.log"

        print("\n" + "-" * 80)
        tag = f" [PILOT: {args.pilot} Q]" if args.pilot else ""
        log_info(f"[{idx}/{len(active_runs)}] Starting:{tag} {BOLD}{run_name}{RESET}")
        cmd_args = build_command_args(r, defaults, force=args.force, pilot=args.pilot)
        cmd = ["python3", "bergen.py"] + cmd_args
        env = prepare_environment(r, defaults, pilot=args.pilot)
        print(f"Executing: {' '.join(shlex.quote(c) for c in cmd)}")
        print(f"Environment: LLM_MODEL={env.get('LLM_MODEL', '-')} EMBED_MODEL={env.get('EMBED_MODEL', '-')} RERANK_MODEL={env.get('RERANK_MODEL', 'none')}")
        print("-" * 80 + "\n")

        t0 = time.time()
        ret_code, exp_folder, already_exists = execute_command(cmd, log_file, env)
        elapsed = time.time() - t0
        elapsed_str = f"{int(elapsed // 60)}m {int(elapsed % 60)}s"

        if ret_code == 0:
            log_success(f"Finished {run_name} in {elapsed_str}")
            status = "SUCCESS"

            # Post-run LLM Judge if configured
            should_judge = args.judge or (r.get("run_judge", defaults.get("run_judge", False)) and not args.no_judge)
            if should_judge and exp_folder and os.path.exists(exp_folder):
                split = r.get("split", defaults.get("split", "dev"))
                judge_cmd = ["python3", "evaluate.py", "--folder", exp_folder, "--split", split, "--judge"]
                judge_model = r.get("judge_model", defaults.get("judge_model"))
                if judge_model:
                    judge_cmd.extend(["--judge_model", judge_model])
                if args.pilot:
                    judge_cmd.extend(["--sample", str(args.pilot)])

                log_info(f"Running LLM Judge for {exp_folder}...")
                judge_log = log_dir / f"{idx:02d}_{run_slug}_judge.log"
                j_code, _, _ = execute_command(judge_cmd, judge_log, env)
                if j_code == 0:
                    log_success(f"Judge evaluation completed for {run_name}")
                else:
                    log_warn(f"Judge evaluation failed for {run_name} (code: {j_code})")

            # Update experiments_data.json
            if r.get("auto_scan", defaults.get("auto_scan", True)):
                try:
                    subprocess.run([sys.executable, "scripts/scan_experiments.py"], check=True, stdout=subprocess.DEVNULL)
                except Exception as e:
                    log_warn(f"Failed to auto-scan experiments: {e}")

        elif already_exists and r.get("skip_existing", defaults.get("skip_existing", True)):
            log_info(f"Experiment already completed on disk. Skipping {run_name}.")
            status = "SKIPPED"
        else:
            log_error(f"Run {run_name} failed with exit code {ret_code}. Check log: {log_file}")
            status = "FAILED"

        results_summary.append({
            "name": run_name,
            "status": status,
            "elapsed": elapsed_str,
            "log": str(log_file),
            "exp_folder": exp_folder or "-"
        })

    total_elapsed = time.time() - start_total_time
    total_elapsed_str = f"{int(total_elapsed // 60)}m {int(total_elapsed % 60)}s"

    # Final summary display
    print("\n" + "=" * 80)
    print(f"{BOLD}{CYAN}SWEEP SUMMARY{RESET} (Total time: {total_elapsed_str})")
    print("=" * 80)
    for res in results_summary:
        st = res["status"]
        if st == "SUCCESS":
            st_color = f"{GREEN}{st}{RESET}"
        elif st == "SKIPPED":
            st_color = f"{YELLOW}{st}{RESET}"
        else:
            st_color = f"{RED}{st}{RESET}"
        print(f" • {res['name']:<45} [{st_color}] {res['elapsed']:<8} (Log: {res['log']})")

    # Display print_results table
    print("\n" + "=" * 80)
    log_info("Overall Benchmark Results:")
    try:
        subprocess.run(["python3", "print_results.py", "--folder", "experiments/", "--format=tiny"])
    except Exception as e:
        log_warn(f"Could not print results table: {e}")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    run_sweep()
