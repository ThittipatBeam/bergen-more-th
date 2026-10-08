'''
Implementation of standard metrics for evaluation of RAG pipeline.
The RAGMetrics class returns a dictionary of standard metrics which are ultimately reported in the output experiment folder.
For neural metrics such as LLMEval, see eval.py or models/evaluators/ for specific implementations.
'''

from scipy.stats import pearsonr, spearmanr
import os
import string
import regex
import numpy as np
from rouge import Rouge
from collections import Counter
from typing import List

# partly adapted from https://github.com/facebookresearch/atlas/blob/0ec8889492d5187b26c51b8d1781239a4cf6741e/src/evaluation.py

rouge = Rouge()


def simple_accuracy(preds, labels):
    return float((preds == labels).mean())


def acc_and_f1(preds, labels):
    acc = simple_accuracy(preds, labels)
    f1 = float(f1_score(y_true=labels, y_pred=preds))
    return {
        "accuracy": acc,
        "f1": f1,
    }

def normalize(s: str) -> str:
    def remove_articles(text):
        return regex.sub(r"\b(a|an|the)\b", " ", text)

    def white_space_fix(text):
        return " ".join(text.split())

    def remove_punc(text):
        exclude = set(string.punctuation)
        return "".join(ch for ch in text if ch not in exclude)

    def lower(text):
        return text.lower()

    return white_space_fix(remove_articles(remove_punc(lower(s))))

# pythainlp engine used for Thai word segmentation; 'newmm' is the pure-python
# default (no model download, no extra dependency). 'longest' is the other
# engine available without extras - override to compare segmentation choices.
THAI_ENGINE = os.environ.get('THAI_TOKENIZE_ENGINE', 'newmm')

def normalize_th(s: str) -> str:
    """Like normalize(), but also removes whitespace.

    Thai is written without spaces and gets spaced inconsistently: retrieved
    documents are word-segmented ('สปริงเบรก. ใน อดีต ...') while model answers
    often are not. normalize() only collapses whitespace runs, so a verbatim
    correct answer containing the gold string can still score M=0 - stripping
    whitespace makes containment/comparison space-insensitive.
    """
    return regex.sub(r'\s+', '', normalize(s))

def thai_tokens(s: str) -> List[str]:
    """Thai word segmentation, used as a tokenfun in place of str.split().

    import is lazy so non-Thai runs never pay pythainlp's import cost.
    """
    from pythainlp.tokenize import word_tokenize
    return word_tokenize(s, keep_whitespace=False, engine=THAI_ENGINE)

def f1_single(prediction: str, ground_truth: str, tokenfun=lambda x: x.split()):
    prediction_tokens = tokenfun(normalize(prediction))
    ground_truth_tokens = tokenfun(normalize(ground_truth))
    common = Counter(prediction_tokens) & Counter(ground_truth_tokens)
    num_same = sum(common.values())
    if num_same == 0:
        return 0, 0, 0
    precision = 1.0 * num_same / len(prediction_tokens)
    recall = 1.0 * num_same / len(ground_truth_tokens)
    f1 = (2 * precision * recall) / (precision + recall)
    return f1, precision, recall

def ngrams(s: str, n: int=3):
    exclude = set(string.punctuation)
    s = ''.join(ch if ch not in exclude else " " for ch in s.lower())
    tokens = []
    for w in s.split():
        l = len(w)
        if l < n:
            tokens.append(w)
        else:
            for i in range(l-n+1):
                tokens.append(w[i:i+n])
    return tokens

def rouge_wrapper(prediction: str, ground_truth: str):
    try:
        result = rouge.get_scores(prediction, ground_truth, avg=True)
        return result["rouge-1"]["f"], result["rouge-2"]["f"], result["rouge-l"]["f"]
    except:
        return 0.0, 0.0, 0.0


def rouge_score_single(prediction: str, ground_truths: list[str]):
    ground_truths = [x for x in ground_truths if len(x) > 0]
    if len(prediction) == 0 or len(ground_truths) == 0:  
        # check if empty prediction or if there is no hypothesis with len > 0
        return 0.0, 0.0, 0.0
    scores = [rouge_wrapper(prediction, gt) for gt in ground_truths]
    rouge1 = max(s[0] for s in scores)
    rouge2 = max(s[1] for s in scores)
    rougel = max(s[2] for s in scores)
    return rouge1, rouge2, rougel

def rouge_score(predictions: list[str], references: list[list[str]]):
    rouge1, rouge2, rougel = list(), list(), list()
    for ground_truths, predicition in zip(references, predictions):
        rouge1_, rouge2_, rougel_ = rouge_score_single(predicition, ground_truths) 
        rouge1.append(rouge1_)
        rouge2.append(rouge2_)
        rougel.append(rougel_)
    return {"rouge1": rouge1, "rouge2": rouge2, "rougel": rougel}


def f1_score(predictions: list[str], references: list[list[str]], tokenfun=lambda x: x.split()):
    f1, precision, recall = list(), list(), list()
    for ground_truths, prediction in zip(references, predictions):
        f1_, precision_, recall_ = [max(values) for values in zip(*[f1_single(prediction, gt, tokenfun) for gt in ground_truths])]
        f1.append(f1_)
        precision.append(precision_)
        recall.append(recall_)
    return {"f1": f1, "precision": precision, "recall": recall}

def em_single(prediction: str, ground_truth: str):
    return float(normalize(prediction) == normalize(ground_truth))


def exact_match_score(predictions: list[str], references: list[list[str]]):
    match_samples = [max([em_single(prediction, gt) for gt in ground_truths]) for ground_truths, prediction in zip(references, predictions)] 
    return match_samples

def match_single(prediction: str, ground_truth: str, normalize_fun=normalize):
    return float(normalize_fun(ground_truth) in normalize_fun(prediction))


def match_score(predictions, references, normalize_fun=normalize):
    assert isinstance(references[0], list), f"during metrics computation: Labels are type {type(references[0])}, but are expected to be a list of strings (even if only one label). Metrics computation may run but produce false results."
    match_samples = [max([match_single(prediction, gt, normalize_fun) for gt in ground_truths]) for ground_truths, prediction in zip(references, predictions)]
    return match_samples



class RAGMetrics:
    @staticmethod
    def compute(predictions, references, questions=None, thai=False):
        """thai=True additionally returns Thai-aware metrics (M_th, F1_th,
        Precision_th, Recall_th) alongside the standard ones - the standard
        keys are always computed unchanged so existing runs stay comparable."""
        rouge = rouge_score(predictions, references)
        f1_scores = f1_score(predictions, references)
        recall_char3gram = f1_score(predictions, references, ngrams)["recall"]
        metrics = { "M": match_score(predictions, references),
                    "EM": exact_match_score(predictions, references),
                    "F1": f1_scores["f1"],
                    "Precision": f1_scores["precision"],
                    "Recall": f1_scores["recall"],
                    "Recall_char3gram": recall_char3gram,
                    "Rouge-1": rouge["rouge1"],
                    "Rouge-2": rouge["rouge2"],
                    "Rouge-L": rouge["rougel"],
                }
        if thai:
            # whitespace-insensitive containment, plus word-level F1 over
            # pythainlp tokens instead of str.split() (which sees Thai text
            # with no spaces as a single token)
            thai_f1 = f1_score(predictions, references, thai_tokens)
            metrics.update({   "M_th": match_score(predictions, references, normalize_th),
                               "F1_th": thai_f1["f1"],
                               "Precision_th": thai_f1["precision"],
                               "Recall_th": thai_f1["recall"],
                           })
        return metrics

