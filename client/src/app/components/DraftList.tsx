"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Draft = {
  id: string;
  category: string;
  slug: string;
  draftContent: string;
  formData: { [key: string]: string };
  timestamp: number;
};

export default function DraftListPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const savedDrafts = JSON.parse(localStorage.getItem("savedDrafts") || "[]") as Draft[];
    setDrafts(savedDrafts);
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this draft?")) {
      const updatedDrafts = drafts.filter((draft) => draft.id !== id);
      localStorage.setItem("savedDrafts", JSON.stringify(updatedDrafts));
      setDrafts(updatedDrafts);
    }
  };

  const filteredDrafts = filter === "all" ? drafts : drafts.filter((d) => d.category === filter);

  return (
  <div
    className={`
      min-h-screen py-10
      text-zinc-900 dark:text-zinc-100
      bg-gradient-to-b from-white via-zinc-100 to-white
      dark:bg-gradient-to-b dark:from-zinc-950 dark:via-zinc-900 dark:to-black
    `}
  >
    <div className="max-w-5xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Draft History</h1>

      {/* Filter + CTA row */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:gap-4">
        <label htmlFor="draft-filter" className="sr-only">
          Filter drafts
        </label>
        <select
          id="draft-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={`
            px-3 py-2 rounded border shadow-sm
            bg-white border-zinc-300 text-zinc-900
            focus:outline-none focus:ring-2 focus:ring-zinc-300
            dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-100
            dark:focus:ring-stone-700
          `}
        >
          <option value="all">All</option>
          <option value="notices">Notices</option>
          <option value="affidavits">Affidavits</option>
          <option value="pleadings">Pleadings</option>
        </select>

        <div className="mt-3 sm:mt-0 sm:ml-auto">
          <Button
            onClick={() => router.push("/docs/draft")}
            className="px-4 py-2 bg-zinc-800 text-white hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600"
          >
            Start Drafting
          </Button>
        </div>
      </div>

      {filteredDrafts.length === 0 ? (
        <div className="text-center text-zinc-600 dark:text-zinc-400 py-24">
          <p>No drafts found.</p>
          <div className="mt-4">
            <Button
              onClick={() => router.push("/docs/draft")}
              className="bg-zinc-800 text-white hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600"
            >
              Start Drafting
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredDrafts.map((draft) => (
            <Card
              key={draft.id}
              className={`
                overflow-hidden transition-colors
                bg-white border border-zinc-300 hover:border-zinc-400
                dark:bg-zinc-900 dark:border-zinc-700 dark:hover:border-zinc-600
              `}
            >
              <CardContent className="p-4">
                <h2 className="text-xl font-semibold mb-2 capitalize">
                  {draft.slug.replace(/-/g, " ")}
                </h2>

                <p className="text-sm mb-2 text-zinc-600 dark:text-zinc-400">
                  Category:{" "}
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {draft.category}
                  </span>
                </p>

                <p className="text-xs mb-4 text-zinc-500 dark:text-zinc-400">
                  Saved on: {new Date(draft.timestamp).toLocaleString()}
                </p>

                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      router.push(
                        `/docs/draft/${draft.category}/${draft.slug}?draftId=${draft.id}`
                      )
                    }
                    className={`
                      flex-1 px-3 py-2
                      bg-zinc-800 text-white hover:bg-zinc-700
                      dark:bg-zinc-700 dark:hover:bg-zinc-600
                    `}
                  >
                    View / Edit
                  </Button>

                  <Button
                    onClick={() => handleDelete(draft.id)}
                    className={`
                      flex-1 px-3 py-2
                      bg-red-600 text-white hover:bg-red-500
                      dark:bg-red-700 dark:hover:bg-red-600
                    `}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  </div>
);
}