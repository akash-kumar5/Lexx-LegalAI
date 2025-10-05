"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../../../context/AuthContext";

interface Draft {
  timestamp: number;
  slug: string;
  draft_content: string;
}

export default function DraftHistoryPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();
  const token = auth.token;

  useEffect(() => {
    async function fetchDrafts() {
      try {
        const res = await fetch("http://localhost:8000/drafts", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setDrafts(data);
        } else {
          console.error("Failed to fetch drafts");
          setDrafts([]);
        }
      } catch (e) {
        console.log("Error fetching drafts:", e);
        setDrafts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchDrafts();
  }, []);

  // Delete draft
  const handleDeleteDraft = async (timestamp: number) => {
    await fetch(`http://localhost:8000/drafts/${timestamp}`, {
      method: "DELETE",
      headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
    });
    setDrafts((prev) => prev.filter((d) => d.timestamp !== timestamp));
  };

  if (loading) {
    return <p className="text-zinc-400 p-6">Loading Drafts...</p>;
  }
return (
  <div
    className={`
      min-h-screen p-6
      text-zinc-900 dark:text-zinc-100
      bg-gradient-to-b from-white via-zinc-100 to-white
      dark:bg-gradient-to-b dark:from-zinc-950 dark:via-zinc-900 dark:to-black
    `}
  >
    <h1 className="text-3xl font-bold mb-6">My Drafts</h1>

    {drafts.length === 0 ? (
      <p className="text-zinc-600 dark:text-zinc-400">No drafts saved yet.</p>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drafts.map((draft) => (
          <Card
            key={draft.timestamp}
            className={`
              overflow-hidden transition-colors
              bg-white border border-zinc-300 hover:border-zinc-400
              dark:bg-zinc-900 dark:border-zinc-700 dark:hover:border-zinc-600
            `}
          >
            <CardContent className="p-4 space-y-3">
              <h2 className="text-xl font-semibold capitalize">
                {draft.slug.replace(/-/g, " ")}
              </h2>

              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Saved on {new Date(draft.timestamp).toLocaleString()}
              </p>

              <div className="flex justify-between items-center gap-2">
                <Link
                  href={{
                    pathname: `/docs/${draft.slug}`,
                    query: {
                      body: encodeURIComponent(draft.draft_content),
                      timestamp: draft.timestamp,
                    },
                  }}
                >
                  <Button
                    size="sm"
                    className="bg-zinc-800 text-white hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                  >
                    Load Draft
                  </Button>
                </Link>

                <Button
                  size="sm"
                  className="bg-red-600 text-white hover:bg-red-500 dark:bg-red-700 dark:hover:bg-red-600"
                  onClick={() => handleDeleteDraft(draft.timestamp)}
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
);
}
