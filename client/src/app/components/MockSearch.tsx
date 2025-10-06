type SearchMode = "all" | "citation" | "parties" | "facts";

type Filters = {
  court?: string;
  yearFrom?: string;
  yearTo?: string;
  issue?: string;
  outcome?: string;
};

type CaseStub = {
  id: string;
  title: string; // e.g., "Union of India v ABC Ltd."
  court: string; // e.g., "Supreme Court of India"
  date: string; // ISO
  outcome: "allowed" | "dismissed" | "partly" | "na";
  neutral_citation?: string;
  reporter_citations?: string[];
  issues?: string[];
  why?: string; // short reason for match
};

async function mockSearch(params: {
  q: string;
  mode: SearchMode;
  filters: Filters;
}) {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 500));
  const sample: CaseStub[] = [
    {
      id: "sc-2023-001",
      title: "Union of India v ABC Limited",
      court: "Supreme Court of India",
      date: "2023-07-15",
      outcome: "dismissed",
      neutral_citation: "2023 SCC OnLine SC 1234",
      reporter_citations: ["(2023) 7 SCC 123"],
      issues: ["Arbitration — Section 34 — Limitation"],
      why: "Query terms matched in headnotes; high semantic similarity on 'Section 34 set-aside refused'.",
    },
    {
      id: "sc-2021-002",
      title: "State of Maharashtra v XYZ & Ors",
      court: "Supreme Court of India",
      date: "2021-02-03",
      outcome: "allowed",
      neutral_citation: "2021 SCC OnLine SC 456",
      reporter_citations: ["(2021) 4 SCC 321"],
      issues: ["Criminal — NDPS — Section 37 — Bail"],
      why: "Citation graph proximity to known bail precedents; query mentions 'NDPS bail granted'.",
    },
  ];
  return sample.filter(
    (c) =>
      c.title.toLowerCase().includes(params.q.toLowerCase()) ||
      params.mode !== "parties"
  );
}

export default mockSearch;