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
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Debounce the user's query to avoid sending too many requests
  const debouncedQuery = useDebounce(query, 300);

  // This is the static list of all templates available for browsing
  const allTemplates = [
    {
      title: "Payment Reminder Notice",
      description: "Recover outstanding payments from clients or tenants.",
      route: "/docs/payment-reminder",
    },
    {
      title: "Termination Notice",
      description:
        "Formally terminate an employee's contract with proper notice.",
      route: "/docs/termination-notice",
    },
    {
      title: "Legal Demand Notice",
      description:
        "Send a formal legal demand for claims, dues, or compensation.",
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
      description:
        "Bill clients for services rendered with clear payment terms.",
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
      description:
        "Outlines scope of work, deliverables, timelines, and payment terms for services provided.",
      route: "/docs/service-agreement",
    },
    {
      title: "Consulting Agreement",
      description:
        "Sets terms for professional consulting services, including fees, duration, and confidentiality.",
      route: "/docs/consulting-agreement",
    },
    {
      title: "Employment Contract",
      description:
        "Defines job role, responsibilities, compensation, and conditions of employment.",
      route: "/docs/employment-contract",
    },
    {
      title: "Partnership Agreement",
      description:
        "Establishes rights, responsibilities, and profit-sharing terms between business partners.",
      route: "/docs/partnership-agreement",
    },
    {
      title: "Joint Venture Agreement",
      description:
        "Details collaboration terms, contributions, and profit-sharing for a joint project or venture.",
      route: "/docs/joint-venture-agreement",
    },
    {
      title: "Promissory Note",
      description:
        "A written promise to repay a specified sum of money under agreed terms and timeline.",
      route: "/docs/promissory-note",
    },
    {
      title: "Shareholders Agreement",
      description:
        "Governs rights, obligations, shareholding structure, and dispute resolution among shareholders.",
      route: "/docs/shareholders-agreement",
    },
    {
      title: "Memorandum of Understanding",
      description:
        "A preliminary agreement recording mutual intentions and terms before a formal contract.",
      route: "/docs/memorandum-of-understanding",
    },
    {
      title: "Notice to Vacate",
      description:
        "A formal notice requiring a tenant or occupant to vacate a property within a given time.",
      route: "/docs/notice-to-vacate",
    },
    {
      title: "Notice for Breach of Contract",
      description:
        "Notifies the other party of a contract violation and demands corrective action.",
      route: "/docs/notice-for-breach-of-contract",
    },
    {
      title: "Notice for Recovery of Dues",
      description:
        "A formal demand for repayment of outstanding dues or debts before legal action.",
      route: "/docs/notice-for-recovery-of-dues",
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
        const res = await fetch(`${API_URL}/docs/search`, {
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
      const res = await fetch(`${API_URL}/docs/generate-draft`, {
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
  <div
    className={`
      min-h-screen pt-24
      bg-gradient-to-b from-white via-zinc-100 to-white text-zinc-900
      dark:bg-gradient-to-b dark:from-zinc-950 dark:via-zinc-900 dark:to-black dark:text-white
    `}
  >
    <div className="flex-1">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Legal Workspace</h1>

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
          rows={2}
          placeholder="Describe your situation… (e.g., 'I need to fire an employee for poor performance')"
          className={`
            w-full resize-none rounded-md p-4
            border bg-white text-zinc-900 placeholder:text-zinc-500
            border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-400/50
            dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-neutral-400
            dark:border-stone-700 dark:focus:ring-stone-600/60
          `}
        />
        {query && (
          <button
            onClick={handleDraftGeneration}
            disabled={loading}
            aria-label="Generate draft"
            className={`
              absolute right-3 bottom-3 transition-colors
              text-zinc-600 hover:text-zinc-900
              dark:text-zinc-400 dark:hover:text-white
            `}
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-t-2 border-zinc-400" />
            ) : (
              <ArrowRightIcon className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      {/* AI Recommended Templates */}
      {suggestions.length > 0 && (
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-lg mb-4 text-zinc-600 dark:text-zinc-400">Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {suggestions.map((draft: Suggestion) => (
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

      {/* All Templates */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-lg mb-4 text-zinc-600 dark:text-zinc-400">Browse All Templates</h2>
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