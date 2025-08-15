"use client";
import { useState, useEffect } from "react";
import DocsCard from "../components/DocsCard";
import { ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";

// A simple debounce hook/function to delay API calls while typing
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

type Suggestion = {
  slug: string;
  title: string;
  description?: string;
};


export default function Docs() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]); // State for AI-powered suggestions
  const router = useRouter();

  // Debounce the user's query to avoid sending too many requests
  const debouncedQuery = useDebounce(query, 300);

  

  // This is the static list of all templates available for browsing
  const allTemplates = [
  {
    title: "Payment Reminder Notice",
    description: "Recover outstanding payments from clients or tenants.",
    route: "/docs/payment-reminder-notice",
  },
  {
    title: "Termination Notice",
    description: "Formally terminate an employee's contract with proper notice.",
    route: "/docs/termination-notice",
  },
  {
    title: "Legal Demand Notice",
    description: "Send a formal legal demand for claims, dues, or compensation.",
    route: "/docs/legal-demand-notice",
  },
  {
    title: "Non-Disclosure Agreement",
    description: "Protect confidential information shared between parties.",
    route: "/docs/non-disclosure-agreement",
  },
  {
    title: "Lease Agreement",
    description: "Outline terms and conditions for renting property.",
    route: "/docs/lease-agreement",
  },
  {
    title: "Invoice for Services",
    description: "Bill clients for services rendered with clear payment terms.",
    route: "/docs/invoice-for-services",
  },
  {
    title: "Loan Agreement",
    description: "Specify loan terms, repayment schedule, and conditions.",
    route: "/docs/loan-agreement",
  },
  {
    title: "Employment Offer Letter",
    description: "Formally offer a job role with agreed terms and benefits.",
    route: "/docs/employment-offer-letter",
  },
  {
    title: "Service Agreement",
    description: "Define scope, deliverables, and payment for services provided.",
    route: "/docs/service-agreement",
  },
];


  // Effect to fetch semantic search results from the backend as the user types
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        // Assuming your FastAPI router is prefixed with /docs
        const res = await fetch("http://localhost:8000/docs/search", {
          method: "POST",
          body: JSON.stringify({ query: debouncedQuery }),
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch suggestions");
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        setSuggestions([]); // Clear suggestions on error
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]); // This effect runs only when the debounced query changes

  const handleDraftGeneration = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      // Assuming your FastAPI router is prefixed with /docs
      const res = await fetch("http://localhost:8000/docs/generate-draft", {
        method: "POST",
        body: JSON.stringify({ situation: query }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to generate draft");
      }

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
      // You could add a user-facing error message here (e.g., using a toast library)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-10 px-6">
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Your Legal Workspace
        </h1>

        {/* Search Bar */}
        <div className="relative max-w-3xl mx-auto mb-8">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleDraftGeneration();
              }
            }}
            className="w-full bg-zinc-900 p-4 rounded-md border border-zinc-700 resize-none"
            placeholder="Describe your situation… (e.g., 'I need to fire an employee for poor performance')"
            rows={2}
          />
          {query && (
            <button
              onClick={handleDraftGeneration}
              className="absolute right-3 bottom-3 text-zinc-400 hover:text-white transition-colors"
              disabled={loading}
              aria-label="Generate draft"
            >
              {loading ? (
                <div className="animate-spin h-5 w-5 border-t-2 border-zinc-400 rounded-full" />
              ) : (
                <ArrowRightIcon className="h-5 w-5" />
              )}
            </button>
          )}
        </div>

        {/* AI Recommended Templates - This section now renders correctly */}
        {suggestions.length > 0 && (
          <div className="max-w-5xl mx-auto mb-12">
            <h2 className="text-lg text-zinc-400 mb-4">Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {suggestions.map((draft: Suggestion ) => (
                <DocsCard
                  key={draft.slug}
                  title={draft.title}
                  description={draft.description || ""}
                  route={`/docs/${draft.slug}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Templates - This section now renders correctly */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-lg text-zinc-400 mb-4">Browse All Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allTemplates.map((draft) => (
              <DocsCard key={draft.route} {...draft} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
