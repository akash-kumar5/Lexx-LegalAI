"use client"
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Draft {
  timestamp: number;
  slug: string;
  category: string;
}

export default function DraftHistoryPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const savedDrafts = JSON.parse(localStorage.getItem("savedDrafts") || "[]") as Draft[];
    setDrafts(savedDrafts);
  }, []);

  const handleDeleteDraft = (timestamp: number) => {
    const updatedDrafts = drafts.filter((d) => d.timestamp !== timestamp);
    setDrafts(updatedDrafts);
    localStorage.setItem("savedDrafts", JSON.stringify(updatedDrafts));
  };

  return (
    <div className="bg-zinc-950 text-white min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">My Drafts</h1>

      {drafts.length === 0 ? (
        <p className="text-zinc-400">No drafts saved yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drafts.map((draft) => (
            <Card key={draft.timestamp} className="bg-zinc-900 border border-zinc-700">
              <CardContent className="p-4 space-y-3 text-zinc-300">
                <h2 className="text-xl font-semibold capitalize">
                  {draft.slug.replace(/-/g, " ")}
                </h2>
                <p className="text-sm text-zinc-400">
                  Saved on {new Date(draft.timestamp).toLocaleString()}
                </p>
                <div className="flex justify-between items-center">
                  <Link href={`/docs/${draft.slug}`}>
                    <Button size="sm" variant="default" className="bg-green-700">
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
