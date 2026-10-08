'''
BERGEN
Copyright (c) 2024-present NAVER Corp.
CC BY-NC-SA 4.0 license

Pooling and similarity functions shared by all embedding-based retrievers
(local dense models and API-backed ones alike). Kept dependency-free (torch
only) on purpose: API retrievers should not require the transformers stack.
'''

import torch


class MeanPooler:

    @staticmethod
    def pool(outputs, mask):
        outputs = outputs.masked_fill(~mask[..., None].bool(), 0.)
        return outputs.sum(dim=1) / mask.sum(dim=1)[..., None]


class ClsPooler:

    @staticmethod
    def pool(outputs, *args):
        return outputs[:, 0]


class DotProduct:

    @staticmethod
    def sim(query_embds, doc_embds):
        return torch.mm(query_embds, doc_embds.t())


class CosineSim:

    @staticmethod
    def sim(query_embds, doc_embds):
        query_embds = query_embds / (torch.norm(query_embds, dim=-1, keepdim=True) + 1e-9)
        doc_embds = doc_embds / (torch.norm(doc_embds, dim=-1, keepdim=True) + 1e-9)
        return torch.mm(query_embds, doc_embds.t())
