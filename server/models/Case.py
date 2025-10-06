# models/case.py
from typing import List, Optional, Literal, Dict
from pydantic import BaseModel, Field

Outcome = Literal["allowed","dismissed","partly","na"]
SearchMode = Literal["all","citation","parties","facts"]

class CaseStub(BaseModel):
    id: str
    title: str
    court: str
    date: str
    outcome: Outcome = "na"
    neutral_citation: Optional[str] = None
    reporter_citations: Optional[List[str]] = None
    issues: Optional[List[str]] = None
    why: Optional[str] = None

class CaseParties(BaseModel):
    appellant: Optional[List[str]] = None
    respondent: Optional[List[str]] = None

class CaseDoc(BaseModel):
    id: str
    title: str
    court: str
    bench: Optional[str] = None
    date: str
    outcome: Outcome = "na"
    statutes: List[str] = []
    neutral_citation: Optional[str] = None
    reporter_citations: Optional[List[str]] = None
    ratio_summary: Optional[str] = None
    parties: Optional[CaseParties] = None
    timeline: List[Dict] = []
    orders: List[Dict] = []
    citations: Dict[str, List[Dict]] = Field(default_factory=lambda: {"cites": [], "citedBy": []})
    similar: List[CaseStub] = []

class SearchFilters(BaseModel):
    court: Optional[str] = None
    yearFrom: Optional[str] = None
    yearTo: Optional[str] = None
    issue: Optional[str] = None
    outcome: Optional[str] = None

class SearchRequest(BaseModel):
    q: str
    mode: SearchMode = "all"
    filters: SearchFilters = SearchFilters()
