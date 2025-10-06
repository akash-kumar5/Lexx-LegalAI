# utils/search_index.py
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import re, json

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

CITE_RX = re.compile(r"((?:AIR\s+(?:19|20)\d{2}\s+[A-Z]{2,}\s+\d+)|\((?:19|20)\d{2}\)\s+\d+\s+SCC\s+\d+|\b\d{4}\s+SCC\s+OnLine\s+[A-Za-z.()]+\s+\d+\b|\((?:19|20)\d{2}\)\s+\d+\s+SCR\s+\d+)")

class CaseIndex:
    def __init__(self, jsonl_path: Path):
        self.path = jsonl_path
        self.cases: Dict[str, Dict] = {}
        self.ids: List[str] = []
        self.docs: List[str] = []
        self.vect = TfidfVectorizer(max_features=100_000, ngram_range=(1,2), lowercase=True)
        self.mat = None

    def load(self):
        self.cases.clear(); self.ids.clear(); self.docs.clear()
        with self.path.open("r", encoding="utf-8") as f:
            for line in f:
                c = json.loads(line)
                self.cases[c["id"]] = c
                self.ids.append(c["id"])
                blob = " \n ".join([
                    c.get("title",""), c.get("court",""), c.get("date",""),
                    " ".join(c.get("reporter_citations",[]) or []),
                    c.get("neutral_citation","") or "",
                    c.get("issues","") or "",
                    c.get("ratio_summary","") or "",
                    c.get("text","") or "",
                ])
                self.docs.append(blob)
        self.mat = self.vect.fit_transform(self.docs)

    def _exact_citation_hits(self, q: str) -> List[int]:
        m = CITE_RX.search(q)
        if not m: return []
        cite = m.group(1)
        hits = []
        for i, cid in enumerate(self.ids):
            c = self.cases[cid]
            reps = (c.get("reporter_citations") or []) + ([c.get("neutral_citation")] if c.get("neutral_citation") else [])
            if any(cite in r for r in reps):
                hits.append(i)
        return hits

    def query(self, q: str, filters: Optional[Dict] = None, top_k: int = 25):
        filters = filters or {}
        qv = self.vect.transform([q])
        sims = cosine_similarity(qv, self.mat).ravel()
        idxs = np.argsort(-sims)[: top_k + 50]
        reasons = {i: "TF-IDF match" for i in idxs if sims[i] > 0}

        # exact citation boost
        exact = self._exact_citation_hits(q)
        for i in exact:
            reasons[i] = "Exact citation match"
            sims[i] = max(sims[i], 1.5)

        def passes(i: int) -> bool:
            c = self.cases[self.ids[i]]
            if f := filters.get("court"):
                if c.get("court") != f: return False
            yf, yt = filters.get("yearFrom"), filters.get("yearTo")
            if yf or yt:
                y = (c.get("date","") or "")[:4]
                if yf and y and y < yf: return False
                if yt and y and y > yt: return False
            if issue := filters.get("issue"):
                if issue.lower() not in (c.get("issues","") or "").lower(): return False
            if out := filters.get("outcome"):
                if c.get("outcome") != out: return False
            return True

        kept = [i for i in idxs if passes(i)]
        kept.sort(key=lambda i: -sims[i])
        return [(self.ids[i], sims[i], reasons.get(i, "match")) for i in kept[:top_k]]

# Singleton
_index: Optional[CaseIndex] = None

def get_index() -> CaseIndex:
    global _index
    if _index is None:
        p = Path(__file__).parent.parent / "data" / "cases.sample.jsonl"
        _index = CaseIndex(p); _index.load()
    return _index
