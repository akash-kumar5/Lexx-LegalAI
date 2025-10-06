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

type CaseDocument = {
  id: string;
  title: string;
  court: string;
  bench?: string;
  date: string; // ISO
  outcome: "allowed" | "dismissed" | "partly" | "na";
  statutes: string[]; // extracted
  neutral_citation?: string;
  reporter_citations?: string[];
  ratio_summary?: string;
  parties?: { appellant?: string[]; respondent?: string[] };
  // Timeline entries (docket-style)
  timeline: Array<{
    date: string; // ISO
    purpose: string; // e.g., "Hearing", "Order reserved", "Pronounced"
    coram?: string; // bench for that date
    note?: string;
    orderId?: string; // link to orders list below
  }>;
  orders: Array<{
    id: string;
    date: string; // ISO
    title: string; // e.g., "Interim Order"
    summary?: string;
    pdfUrl?: string;
  }>;
  citations: {
    cites: Array<{ id: string; title: string; court?: string; date?: string }>; // outbound
    citedBy: Array<{
      id: string;
      title: string;
      court?: string;
      date?: string;
      treatment?: "followed" | "distinguished" | "overruled" | "referred";
    }>; // inbound
  };
  similar: CaseStub[];
};

async function mockGetCase(id: string): Promise<CaseDocument> {
  await new Promise((r) => setTimeout(r, 500));
  return {
    id,
    title: id.includes("sc-2021")
      ? "State of Maharashtra v XYZ & Ors"
      : "Union of India v ABC Limited",
    court: "Supreme Court of India",
    bench: "Chandrachud, Narasimha, Trivedi, JJ.",
    date: id.includes("2021") ? "2021-02-03" : "2023-07-15",
    outcome: id.includes("2021") ? "allowed" : "dismissed",
    statutes: [
      "NDPS Act, 1985 — S.37",
      "Arbitration and Conciliation Act, 1996 — S.34",
    ],
    neutral_citation: id.includes("2021")
      ? "2021 SCC OnLine SC 456"
      : "2023 SCC OnLine SC 1234",
    reporter_citations: id.includes("2021")
      ? ["(2021) 4 SCC 321"]
      : ["(2023) 7 SCC 123"],
    ratio_summary: id.includes("2021")
      ? "Bail granted noting twin conditions satisfied; custodial interrogation unnecessary; delay considered."
      : "Section 34 petition dismissed; scope of interference with arbitral awards remains narrow; no patent illegality.",
    parties: {
      appellant: [
        id.includes("2021") ? "State of Maharashtra" : "Union of India",
      ],
      respondent: [id.includes("2021") ? "XYZ and Others" : "ABC Limited"],
    },
    timeline: [
      {
        date: "2020-12-01",
        purpose: "Filing",
        note: "Registered; defects removed.",
      },
      {
        date: "2021-01-10",
        purpose: "Hearing",
        coram: "Narasimha, J.",
        note: "Notice issued; reply in 2 weeks.",
      },
      {
        date: "2021-02-03",
        purpose: "Pronounced",
        coram: "Bench as above",
        note: "Judgment delivered.",
      },
    ],
    orders: [
      {
        id: "ord-1",
        date: "2021-01-10",
        title: "Interim Order",
        summary: "Notice issued; no coercive steps.",
        pdfUrl: "https://example.com/order1.pdf",
      },
      {
        id: "ord-2",
        date: "2021-02-03",
        title: "Final Judgment",
        summary: "Appeal allowed; bail granted.",
        pdfUrl: "https://example.com/judgment.pdf",
      },
    ],
    citations: {
      cites: [
        {
          id: "sc-2018-010",
          title: "Narcotics Control Bureau v PQR",
          court: "SC",
          date: "2018-05-12",
        },
        {
          id: "sc-2020-011",
          title: "ABC v State of Gujarat",
          court: "SC",
          date: "2020-09-22",
        },
      ],
      citedBy: [
        {
          id: "bom-2022-001",
          title: "DEF v State of Maharashtra",
          court: "Bom HC",
          date: "2022-01-11",
          treatment: "followed",
        },
        {
          id: "del-2023-002",
          title: "State (NCT of Delhi) v GHI",
          court: "Del HC",
          date: "2023-03-05",
          treatment: "distinguished",
        },
      ],
    },
    similar: [
      {
        id: "sc-2022-003",
        title: "UOI v LMN Pvt Ltd",
        court: "Supreme Court of India",
        date: "2022-06-18",
        outcome: "dismissed",
        issues: ["Arbitration — Section 34 — Patent illegality"],
        why: "Semantic similarity in holding paragraphs.",
      },
    ],
  };
}