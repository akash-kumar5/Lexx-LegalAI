// lib/lexxApi.ts
export type SearchMode = "all" | "citation" | "parties" | "facts";
export type Filters = { court?: string; yearFrom?: string; yearTo?: string; issue?: string; outcome?: string };

const BASE = process.env.NEXT_PUBLIC_LEXX_API ?? "http://localhost:8000";

export async function apiSearch(q: string, mode: SearchMode, filters: Filters) {
  const res = await fetch(`${BASE}/cases/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q, mode, filters }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiGetCase(id: string) {
  const res = await fetch(`${BASE}/cases/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
