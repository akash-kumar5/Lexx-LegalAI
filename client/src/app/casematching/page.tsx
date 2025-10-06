"use client";
import React, { useMemo, useState } from "react";
import {
  Search,
  Filter,
  ChevronRight,
  BookOpenText,
  Gavel,
  CalendarDays,
  BadgeCheck,
  FileDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import FilterChip from "../components/FilterChip";
import ModeChip from "../components/ModeChip";
import { apiSearch, apiGetCase } from "@/lib/lexxApi";


// ---------- Types ----------

type SearchMode = "all" | "citation" | "parties" | "facts";

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

type Filters = {
  court?: string;
  yearFrom?: string;
  yearTo?: string;
  issue?: string;
  outcome?: string;
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

// ---------- Helper UI ----------

const OutcomeBadge: React.FC<{ outcome: CaseStub["outcome"] }> = ({
  outcome,
}) => {
  const map: Record<string, string> = {
    allowed: "bg-emerald-100 text-emerald-800",
    dismissed: "bg-rose-100 text-rose-800",
    partly: "bg-amber-100 text-amber-800",
    na: "bg-zinc-100 text-zinc-800",
  };
  const label =
    outcome === "na" ? "—" : outcome.charAt(0).toUpperCase() + outcome.slice(1);
  return <Badge className={`rounded-full ${map[outcome]}`}>{label}</Badge>;
};

const Labeled: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: string | React.ReactNode;
}> = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 text-sm text-zinc-700">
    <div className="w-4 h-4 flex items-center justify-center">{icon}</div>
    <span className="font-medium text-zinc-900">{label}:</span>
    <span className="truncate">{value || "—"}</span>
  </div>
);

// ---------- Main Component ----------

export default function CaseMatching() {
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<SearchMode>("all");
  const [filters, setFilters] = useState<Filters>({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CaseStub[] | null>(null);
  const [selected, setSelected] = useState<CaseDocument | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const yearsLabel = useMemo(() => {
    const { yearFrom, yearTo } = filters;
    if (!yearFrom && !yearTo) return "Any year";
    if (yearFrom && !yearTo) return `${yearFrom} →`;
    if (!yearFrom && yearTo) return `← ${yearTo}`;
    return `${yearFrom}–${yearTo}`;
  }, [filters]);

  async function runSearch() {
  setLoading(true);
  try {
    const data = await apiSearch(q, mode, filters);
    setResults(data);
  } catch (e) {
    console.error(e);
    setResults([]);
  } finally {
    setLoading(false);
  }
}

async function openCase(id: string) {
  try {
    const doc = await apiGetCase(id);
    setSelected(doc);
    setSheetOpen(true);
  } catch (e) {
    console.error(e);
  }
}
  return (
    <div
      className={`
      min-h-screen w-full pt-20
      bg-white text-zinc-900
      dark:bg-black dark:text-zinc-100
    `}
    >
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Case Matching
            </h1>
          </div>
        </div>

        {/* Search Row */}
        <div
          className={`
          flex flex-col gap-3 rounded-2xl border p-4
          md:flex-row md:items-center md:gap-4
          border-zinc-200 bg-white
          dark:border-zinc-800 dark:bg-zinc-950/40 dark:backdrop-blur
        `}
        >
          <div className="flex w-full items-center gap-2">
            <Search className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Type citation, parties, or plain English..."
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              className={`
              border-none focus-visible:ring-0
              bg-transparent text-zinc-900 placeholder:text-zinc-400
              dark:text-zinc-100 dark:placeholder:text-zinc-500
            `}
            />
            <Button onClick={runSearch} className="shrink-0">
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ModeChip
              label="All"
              active={mode === "all"}
              onClick={() => setMode("all")}
            />
            <ModeChip
              label="Citation"
              active={mode === "citation"}
              onClick={() => setMode("citation")}
            />
            <ModeChip
              label="Parties"
              active={mode === "parties"}
              onClick={() => setMode("parties")}
            />
            <ModeChip
              label="Facts"
              active={mode === "facts"}
              onClick={() => setMode("facts")}
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <Filter className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />

          <FilterChip
            label="Court"
            value={filters.court || "Any"}
            onClear={() => setFilters({ ...filters, court: undefined })}
          >
            <select
              className={`
              w-full rounded-md border p-2
              bg-zinc-50 text-zinc-900 border-zinc-200
              dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700
              focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-stone-700
            `}
              value={filters.court || ""}
              onChange={(e) =>
                setFilters({ ...filters, court: e.target.value || undefined })
              }
            >
              <option value="">Any</option>
              <option value="Supreme Court of India">
                Supreme Court of India
              </option>
              <option value="Delhi High Court">Delhi High Court</option>
              <option value="Bombay High Court">Bombay High Court</option>
            </select>
          </FilterChip>

          <FilterChip
            label="Year"
            value={yearsLabel}
            onClear={() =>
              setFilters({ ...filters, yearFrom: undefined, yearTo: undefined })
            }
          >
            <div className="flex gap-2">
              <Input
                placeholder="From"
                value={filters.yearFrom || ""}
                onChange={(e) =>
                  setFilters({ ...filters, yearFrom: e.target.value })
                }
                className={`
                bg-zinc-50 text-zinc-900 border-zinc-200
                dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700
              `}
              />
              <Input
                placeholder="To"
                value={filters.yearTo || ""}
                onChange={(e) =>
                  setFilters({ ...filters, yearTo: e.target.value })
                }
                className={`
                bg-zinc-50 text-zinc-900 border-zinc-200
                dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700
              `}
              />
            </div>
          </FilterChip>

          <FilterChip
            label="Issue"
            value={filters.issue || "Any"}
            onClear={() => setFilters({ ...filters, issue: undefined })}
          >
            <Input
              placeholder="e.g., NDPS bail, Section 34"
              value={filters.issue || ""}
              onChange={(e) =>
                setFilters({ ...filters, issue: e.target.value })
              }
              className={`
              bg-zinc-50 text-zinc-900 border-zinc-200
              dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700
            `}
            />
          </FilterChip>

          <FilterChip
            label="Outcome"
            value={filters.outcome || "Any"}
            onClear={() => setFilters({ ...filters, outcome: undefined })}
          >
            <select
              className={`
              w-full rounded-md border p-2
              bg-zinc-50 text-zinc-900 border-zinc-200
              dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700
              focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-stone-700
            `}
              value={filters.outcome || ""}
              onChange={(e) =>
                setFilters({ ...filters, outcome: e.target.value || undefined })
              }
            >
              <option value="">Any</option>
              <option value="allowed">Allowed</option>
              <option value="dismissed">Dismissed</option>
              <option value="partly">Partly</option>
            </select>
          </FilterChip>
        </div>

        {/* Results */}
        <div className="mt-6">
          {!results && (
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Start by typing a query, then hit Search.
            </div>
          )}

          {loading && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`
                  h-24 animate-pulse rounded-xl
                  bg-zinc-100 dark:bg-zinc-800/50
                `}
                />
              ))}
            </div>
          )}

          {!loading && results && results.length === 0 && (
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              No results. Try broadening your query or switching mode.
            </div>
          )}

          {!loading && results && results.length > 0 && (
            <div className="space-y-3">
              {results.map((c) => (
                <Card
                  key={c.id}
                  className={`
                  transition hover:shadow-md
                  bg-white border-zinc-200
                  dark:bg-zinc-950/40 dark:border-zinc-800 dark:backdrop-blur
                `}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <OutcomeBadge outcome={c.outcome} />
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {new Date(c.date).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            • {c.court}
                          </span>
                        </div>

                        <h3 className="mt-1 line-clamp-1 text-lg font-medium">
                          {c.title}
                        </h3>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                          {c.neutral_citation && (
                            <Badge variant="outline" className="rounded-full">
                              {c.neutral_citation}
                            </Badge>
                          )}
                          {c.reporter_citations?.slice(0, 2).map((r) => (
                            <Badge
                              key={r}
                              variant="outline"
                              className="rounded-full"
                            >
                              {r}
                            </Badge>
                          ))}
                        </div>

                        {c.issues && c.issues.length > 0 && (
                          <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2">
                            <span className="font-medium">Issues:</span>{" "}
                            {c.issues.join("; ")}
                          </div>
                        )}

                        {c.why && (
                          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                            <span className="font-medium text-zinc-700 dark:text-zinc-300">
                              Why this matched:
                            </span>{" "}
                            {c.why}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0">
                        <Button
                          onClick={() => openCase(c.id)}
                          className="group"
                        >
                          Open Case{" "}
                          <ChevronRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Case Sheet Drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className={`
          w-full overflow-y-auto sm:max-w-2xl
          bg-white text-zinc-900
          dark:bg-zinc-950 dark:text-zinc-100
        `}
        >
          <SheetHeader>
            <SheetTitle className="pr-8">
              {selected?.title || "Case"}
            </SheetTitle>
            <SheetDescription className="flex flex-wrap items-center gap-2">
              {selected?.neutral_citation && (
                <Badge variant="outline" className="rounded-full">
                  {selected.neutral_citation}
                </Badge>
              )}
              {selected?.reporter_citations?.map((r) => (
                <Badge key={r} variant="outline" className="rounded-full">
                  {r}
                </Badge>
              ))}
            </SheetDescription>
          </SheetHeader>

          {/* Snapshot */}
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Labeled
                icon={<Gavel className="h-4 w-4" />}
                label="Court"
                value={selected?.court}
              />
              <Labeled
                icon={<CalendarDays className="h-4 w-4" />}
                label="Date"
                value={
                  selected ? new Date(selected.date).toLocaleDateString() : "—"
                }
              />
              <Labeled
                icon={<BadgeCheck className="h-4 w-4" />}
                label="Outcome"
                value={<OutcomeBadge outcome={selected?.outcome || "na"} />}
              />
              <Labeled
                icon={<BookOpenText className="h-4 w-4" />}
                label="Statutes"
                value={selected?.statutes?.join(", ") || "—"}
              />
            </div>

            {selected?.ratio_summary && (
              <Card className="border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950/40">
                <CardHeader className="py-3">
                  <CardTitle className="text-base">Ratio (2–3 line)</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-zinc-700 dark:text-zinc-300">
                  {selected.ratio_summary}
                </CardContent>
              </Card>
            )}
          </div>

          <Separator className="my-4 dark:bg-zinc-800" />

          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="issues">Issues & Ratio</TabsTrigger>
              <TabsTrigger value="citations">Citations</TabsTrigger>
              <TabsTrigger value="similar">Similar</TabsTrigger>
            </TabsList>
            <TabsContent value="timeline" className="mt-3">
              <ScrollArea className="max-h-[50vh] rounded-lg border p-3 border-zinc-200 dark:border-zinc-800">
                <div className="space-y-4">
                  {selected?.timeline?.map((t) => (
                    <div key={t.date} className="relative pl-6">
                      <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-zinc-900 dark:bg-zinc-200" />
                      <div className="text-sm font-medium">
                        {new Date(t.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-zinc-700 dark:text-zinc-300">
                        {t.purpose}
                        {t.coram ? ` — ${t.coram}` : ""}
                      </div>
                      {t.note && (
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          {t.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="orders" className="mt-3">
              <div className="space-y-3">
                {selected?.orders?.map((o) => (
                  <Card
                    key={o.id}
                    className="border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950/40"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium">{o.title}</div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            {new Date(o.date).toLocaleDateString()}
                          </div>
                          {o.summary && (
                            <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                              {o.summary}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0">
                          {o.pdfUrl && (
                            <Button variant="outline" asChild>
                              <a
                                href={o.pdfUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <FileDown className="mr-2 h-4 w-4" /> PDF
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="issues" className="mt-3">
              <Card className="border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950/40">
                <CardContent className="p-4 text-sm text-zinc-700 dark:text-zinc-300">
                  <div className="space-y-1">
                    <div>
                      <span className="font-medium">Issues:</span>{" "}
                      {selected?.statutes?.join(", ") || "—"}
                    </div>
                    <div>
                      <span className="font-medium">Holding:</span>{" "}
                      {selected?.ratio_summary || "—"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="citations" className="mt-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Card className="border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">Cites</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 p-3">
                    {selected?.citations.cites?.map((c) => (
                      <div
                        key={c.id}
                        className="rounded-md border p-2 border-zinc-200 dark:border-zinc-800"
                      >
                        <div className="text-sm font-medium">{c.title}</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          {[
                            c.court,
                            c.date && new Date(c.date).toLocaleDateString(),
                          ]
                            .filter(Boolean)
                            .join(" • ")}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">Cited by</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 p-3">
                    {selected?.citations.citedBy?.map((c) => (
                      <div
                        key={c.id}
                        className="rounded-md border p-2 border-zinc-200 dark:border-zinc-800"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">{c.title}</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                              {[
                                c.court,
                                c.date && new Date(c.date).toLocaleDateString(),
                              ]
                                .filter(Boolean)
                                .join(" • ")}
                            </div>
                          </div>
                          {c.treatment && (
                            <Badge className="rounded-full">
                              {c.treatment}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="similar" className="mt-3">
              <div className="space-y-3">
                {selected?.similar.map((s) => (
                  <Card
                    key={s.id}
                    className="hover:shadow-sm border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950/40"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <OutcomeBadge outcome={s.outcome} />
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                              {new Date(s.date).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                              • {s.court}
                            </span>
                          </div>
                          <div className="mt-1 truncate font-medium">
                            {s.title}
                          </div>
                          {s.issues && (
                            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                              {s.issues.join("; ")}
                            </div>
                          )}
                          {s.why && (
                            <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                Why this matched:
                              </span>{" "}
                              {s.why}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0">
                          <Button
                            variant="outline"
                            onClick={() => openCase(s.id)}
                          >
                            Open <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  );
}
