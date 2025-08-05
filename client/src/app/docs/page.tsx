"use client";
import { useState, useMemo } from "react";
import DocsCard from "../components/DocsCard";

export default function Docs() {
  const [query, setQuery] = useState("");

  const drafts = [
    {
      title: "Payment Reminder Notice",
      description: "Recover outstanding payments from clients or tenants.",
      keywords: ["payment", "invoice", "outstanding", "due", "rent", "money"],
      route: "/docs/draft/notices/payment-reminder",
    },
    {
      title: "Termination Notice",
      description: "Terminate an employee's contract with formal notice.",
      keywords: ["terminate", "termination", "fire", "employee", "job"],
      route: "/docs/draft/notices/termination-notice",
    },
    {
      title: "Legal Demand Notice",
      description: "Send legal demands for claims, dues, or compensation.",
      keywords: ["legal", "demand", "claim", "compensation", "lawsuit"],
      route: "/docs/draft/notices/legal-demand-notice",
    },
  ];

  // Simple scoring based on keyword matches
  const filteredDrafts = useMemo(() => {
    if (!query) return drafts;
    return drafts
      .map((draft) => {
        const matches = draft.keywords.filter((k) =>
          query.toLowerCase().includes(k)
        ).length;
        return { ...draft, score: matches };
      })
      .filter((d) => d.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [query]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-10 px-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Your Legal Workspace
      </h1>

      <div className="max-w-3xl mx-auto mb-10">
        <textarea
          className="w-full bg-zinc-900 p-4 rounded-md border border-zinc-700 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-600"
          rows={3}
          placeholder="Describe your situation… (e.g., My tenant hasn’t paid rent for 3 months)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filteredDrafts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredDrafts.map((action) => (
            <DocsCard key={action.title} {...action} />
          ))}
        </div>
      ) : (
        <>
          <p className="text-center text-zinc-400 mb-6">
            No drafts found for this situation.
          </p>
          <p className="text-center text-zinc-500 mb-4">
            You can also explore these drafts:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto opacity-60">
            {drafts.map((action) => (
              <DocsCard key={action.title} {...action} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
