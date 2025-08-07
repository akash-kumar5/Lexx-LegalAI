// app/docs/page.tsx
"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import DocsCard from "../components/DocsCard";
import { ArrowRightIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function Docs() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

  const handleDraftGeneration = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate-draft", {
        method: "POST",
        body: JSON.stringify({ situation: query }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      const slug = data.slug || "custom";
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
    <div className="min-h-screen bg-zinc-950 text-white py-10 px-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Your Legal Workspace
      </h1>

      <div className="relative max-w-3xl mx-auto mb-10">
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
      <hr className="lg:my-12 md:my-8 sm:my-5 border-zinc-700 rounded-full w-80 mx-auto" />

      {/* Draft History Card */}
      <div className="flex justify-center">
        <Link href="/docs/draft/history">
          <Card className="bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition-colors w-64 cursor-pointer">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-200">
                  Draft History
                </h2>
                <p className="text-zinc-400 text-xs italic">
                  View saved drafts
                </p>
              </div>
              <ArrowRightIcon className="text-zinc-400" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
