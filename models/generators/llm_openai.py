'''
BERGEN
Copyright (c) 2024-present NAVER Corp.
CC BY-NC-SA 4.0 license
'''

import os
import sys
from concurrent.futures import ThreadPoolExecutor

import openai

from models.api_utils import call_with_retry
from models.generators.generator import Generator


class OpenAI(Generator):
    def __init__(self,
                model_name="gpt-3.5-turbo",
                batch_size=1,
                max_new_tokens=1,
                max_doc_len=25000,
                max_length=None,
                prompt=None,
                base_url=None,
                concurrency=1,
                max_retries=6,
                 ):
        Generator.__init__(self,
                           model_name=model_name,
                           batch_size=batch_size,
                           max_new_tokens=max_new_tokens,
                           max_doc_len=max_doc_len,
                           max_length=max_length)
        # base_url=None falls back to $LLM_BASE_URL then $OPENAI_BASE_URL then
        # api.openai.com, so any OpenAI-compatible endpoint (vLLM, Together,
        # LiteLLM, local proxy) works; per-component env vars let the LLM sit
        # on a different server than the embedder/reranker
        base_url = base_url or os.environ.get('LLM_BASE_URL') or None
        api_key = os.environ.get('LLM_API_KEY') or os.environ.get('OPENAI_API_KEY')
        self._base_url = base_url
        self._api_key = api_key
        self.client = None
        self.prompt = prompt
        # in-flight API requests; 1 keeps the original sequential behavior,
        # values >1 use a thread pool in generate() (the openai client is
        # thread-safe). env LLM_CONCURRENCY overrides the config default.
        self.concurrency = int(os.environ.get('LLM_CONCURRENCY') or concurrency)
        self.max_retries = max_retries
        self.total_cost = 0
        self.prompt_cost = 0
        self.completion_cost = 0
        # requests that failed permanently (e.g. a server-side 400 on one
        # particular prompt); their answers are '' and score 0 downstream
        self.failed_requests = 0
        self.tokenizer=None

    # ---------- pickling (DataLoader spawn workers) ----------

    def __getstate__(self):
        # generator.py builds its evaluation DataLoader with num_workers=4 and
        # bergen.py sets the spawn start method, so this object is pickled into
        # the worker processes; the openai client holds thread locks and cannot
        # be pickled. drop it - workers rebuild their own lazily (and only run
        # collate_fn, which never touches the client)
        state = self.__dict__.copy()
        state['client'] = None
        return state

    def _get_client(self):
        if self.client is None:
            self.client = openai.OpenAI(api_key=self._api_key,
                                        base_url=self._base_url,)
        return self.client

    def generate(self, messages):
        responses=[None] * len(messages)
        if self.concurrency <= 1:
            for i, msg in enumerate(messages):
                responses[i] = self._generate_one(msg)
        else:
            # order-preserving fan-out: executor.map assigns results by index
            with ThreadPoolExecutor(max_workers=self.concurrency) as pool:
                for i, content in enumerate(pool.map(self._generate_one, messages)):
                    responses[i] = content
        # systemic-failure guard: a single dead question must not kill the run,
        # but a dead endpoint (every request in the batch failed) must - writing
        # an all-empty output silently would be worse than crashing
        if messages and all(r == '' for r in responses):
            raise RuntimeError(
                f'all {len(messages)} generation requests in this batch failed - '
                f'the endpoint is likely down or misconfigured; aborting instead of '
                f'writing empty answers')
        n_failed = sum(1 for r in responses if r == '')
        if n_failed:
            print(f'WARNING: {n_failed}/{len(messages)} generation requests failed in this batch '
                  f'(total so far: {self.failed_requests}); their answers will be empty and score 0',
                  file=sys.stderr)
        return responses

    def _generate_one(self, msg):
        def call():
            return self._get_client().chat.completions.create(messages=msg, model=self.model_name)

        try:
            response = call_with_retry(call, max_retries=self.max_retries, provider='openai_compatible')
        except Exception as e:
            # permanent failure on this one prompt (e.g. a server-side 400 triggered
            # by specific content): count it, flag it, and score it 0 rather than
            # losing the whole run
            self.failed_requests += 1
            print(f'WARNING: generation request failed permanently ({type(e).__name__}: {str(e)[:200]}); '
                  f'continuing with an empty answer for this question', file=sys.stderr)
            return ''
        t,p,c = self.openai_api_calculate_cost(response.usage)
        self.total_cost += t
        self.prompt_cost += p
        self.completion_cost += c
        return response.choices[0].message.content


    def openai_api_calculate_cost(self,usage):
        pricing = {
            'gpt-3.5-turbo': {
                'prompt': 0.0015 ,
                'completion': 0.0020,
            },
            'gpt-4-1106-preview': {
                'prompt': 0.01,
                'completion': 0.03,
            },
            'gpt-4': {
                'prompt': 0.03,
                'completion': 0.06,
            },
            'gpt-4-0125-preview':{
                'prompt': 0.01,
                'completion': 0.03,                
            },
            'gpt-4o': {
            'prompt': 0.005,  #US$5.00 / 1M tokens
            'completion': 0.015,  #US$15.00 / 1M tokens
            }                 
        }

        if self.model_name not in pricing:
            # custom-served model (via base_url): cost is unknown, warn instead of crashing
            print(f"WARNING: no pricing entry for model '{self.model_name}', cost tracking disabled")
            return (0.0, 0.0, 0.0)
        model_pricing = pricing[self.model_name]

        prompt_cost = usage.prompt_tokens * model_pricing['prompt'] / 1000
        completion_cost = usage.completion_tokens * model_pricing['completion'] / 1000

        total_cost = prompt_cost + completion_cost
        # round to 6 decimals
        total_cost = round(total_cost, 6)

        #print(f"\nTokens used:  {usage.prompt_tokens:,} prompt + {usage.completion_tokens:,} completion = {usage.total_tokens:,} tokens")
        #print(f"Total cost for {model}: ${total_cost:.4f}\n")

        return (total_cost,prompt_cost,completion_cost)

    # only required for training
    def prediction_step(self, model, model_input, label_ids=None):
        # e.g.       
        # output = model(**model_input, labels=label_ids)
        # return output.logits, output.loss
        pass
    
    def collate_fn(self, examples, eval=False, **kwargs):
        q_ids = [e['q_id'] for e in examples]
        instr = [self.format_instruction(e) for e in examples]

        label = [e['label'] if isinstance(e['label'], str) else e['label'] for e in examples]
        query = [e['query'] for e in examples]
        ranking_label = [e['ranking_label'] for e in examples] if 'ranking_label' in examples[0] else [None] * len(examples)

        data_dict = {}
        # for inference: questions that already have an answer from a previous
        # (resumed) run get model_input=None so Generator.eval skips the API call
        model_input = [None if e.get('existing_response') is not None else i
                       for e, i in zip(examples, instr)]

        data_dict.update({
            'model_input': model_input,
            'q_id': q_ids,
            'query': query,
            'instruction': instr,
            'label': label,
            'ranking_label': ranking_label,
        })

        return data_dict

    def compile_prompt(self, system_prompt, user_prompt, question, docs, label):
        """
        openai chat template
        """
        instr_prompt = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": eval(user_prompt).replace(':\ ', ': ')}
        ]
        return instr_prompt