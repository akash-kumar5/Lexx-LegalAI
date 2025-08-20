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
    <div className="bg-zinc-950 text-white min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">My Drafts</h1>

      {drafts.length === 0 ? (
        <p className="text-zinc-400">No drafts saved yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drafts.map((draft) => (
            <Card
              key={draft.timestamp}
              className="bg-zinc-900 border border-zinc-700"
            >
              <CardContent className="p-4 space-y-3 text-zinc-300">
                <h2 className="text-xl font-semibold capitalize">
                  {draft.slug.replace(/-/g, " ")}
                </h2>
                <p className="text-sm text-zinc-400">
                  Saved on {new Date(draft.timestamp).toLocaleString()}
                </p>
                <div className="flex justify-between items-center">
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
                      variant="default"
                      className="bg-green-700"
                    >
                      Load Draft
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-red-800"
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
