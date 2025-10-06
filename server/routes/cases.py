# routes/cases.py
from fastapi import APIRouter, HTTPException
from typing import List
from models.Case import CaseStub, CaseDoc, SearchRequest
from utils.search import get_index

router = APIRouter(prefix="/cases", tags=["cases"])

@router.post("/search", response_model=List[CaseStub])
def search(req: SearchRequest):
    idx = get_index()
    hits = idx.query(req.q, req.filters.model_dump())
    out: List[CaseStub] = []
    for cid, _, why in hits:
        c = idx.cases[cid]
        out.append(CaseStub(
            id=c["id"],
            title=c.get("title",""),
            court=c.get("court",""),
            date=c.get("date",""),
            outcome=c.get("outcome","na"),
            neutral_citation=c.get("neutral_citation"),
            reporter_citations=c.get("reporter_citations"),
            issues=(c.get("issues_split") or c.get("issues") or "").split(";") if c.get("issues") else None,
            why=why,
        ))
    return out

@router.get("/{case_id}", response_model=CaseDoc)
def get_case(case_id: str):
    idx = get_index()
    c = idx.cases.get(case_id)
    if not c:
        raise HTTPException(404, "Case not found")
    return CaseDoc(
        id=c["id"],
        title=c.get("title",""),
        court=c.get("court",""),
        bench=c.get("bench"),
        date=c.get("date",""),
        outcome=c.get("outcome","na"),
        statutes=c.get("statutes",[]) or [],
        neutral_citation=c.get("neutral_citation"),
        reporter_citations=c.get("reporter_citations"),
        ratio_summary=c.get("ratio_summary"),
        parties=c.get("parties"),
        timeline=c.get("timeline",[]) or [],
        orders=c.get("orders",[]) or [],
        citations=c.get("citations", {"cites":[],"citedBy":[]}),
        similar=[CaseStub(**s) for s in c.get("similar",[]) or []] if c.get("similar") else [],
    )
