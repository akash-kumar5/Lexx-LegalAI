// app/docs/page.tsx
"use client";
import { useState, useMemo, ReactElement } from "react";
import Link from "next/link";
import DocsCard from "../components/DocsCard";
import { ArrowRightIcon, HistoryIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import DocsLayout from "./layout";

export default function Docs() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const drafts = [
    {
      title: "Payment Reminder Notice",
      description: "Recover outstanding payments from clients or tenants.",
      keywords: ["payment", "invoice", "outstanding", "due", "rent", "money"],
      route: "/docs/payment-reminder",
    },
    {
      title: "Termination Notice",
      description: "Terminate an employee's contract with formal notice.",
      keywords: ["terminate", "termination", "fire", "employee", "job"],
      route: "/docs/termination-notice",
    },
    {
      title: "Legal Demand Notice",
      description: "Send legal demands for claims, dues, or compensation.",
      keywords: ["legal", "demand", "claim", "compensation", "lawsuit"],
      route: "/docs/legal-demand-notice",
    },
  ];

  const filteredDrafts = useMemo(() => {
    if (!query) return drafts;
    const q = query.toLowerCase();
    return drafts
      .map((draft) => {
        const matches = draft.keywords.filter((k) => q.includes(k)).length;
        return { ...draft, score: matches };
      })
      .filter((d) => d.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [query]);

  const topSuggestions = useMemo(() => filteredDrafts.slice(0, 3), [filteredDrafts]);

  const handleDraftGeneration = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/docs/generate-draft", {
        method: "POST",
        body: JSON.stringify({ situation: query }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      const slug = data.slug;
      const params = new URLSearchParams({
        title: data.title,
        body: data.body,
        placeholders: JSON.stringify(data.placeholders || []),
      });

      router.push(`/docs/${slug}?${params.toString()}`);
    } catch (err) {
      console.error("Error generating draft:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-10 px-6 flex gap-6">
      {/* Main Content */}
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-6 text-center">Your Legal Workspace</h1>

        {/* Search Bar */}
        <div className="relative max-w-3xl mx-auto mb-8">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleDraftGeneration();
              }
            }}
            className="w-full bg-zinc-900 p-4 rounded-md border border-zinc-700 resize-none"
            placeholder="Describe your situation…"
            rows={2}
          />
          {query && (
            <button
              onClick={handleDraftGeneration}
              className="absolute right-3 bottom-3 text-zinc-400 hover:text-white transition"
              disabled={loading}
            >
              {loading ? (
                <span className="animate-spin h-5 w-5 border-b-2 border-zinc-400 rounded-full" />
              ) : (
                <ArrowRightIcon />
              )}
            </button>
          )}
        </div>

        {/* AI Recommended Templates */}
        {query && topSuggestions.length > 0 && (
          <div className="max-w-5xl mx-auto mb-10">
            <h2 className="text-lg text-zinc-400 mb-3">AI Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topSuggestions.map((draft) => (
                <DocsCard key={draft.title} {...draft} />
              ))}
            </div>
          </div>
        )}

        {/* All Templates */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-lg text-zinc-400 mb-3">Browse Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(query ? filteredDrafts : drafts).map((draft) => (
              <DocsCard key={draft.title} {...draft} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}