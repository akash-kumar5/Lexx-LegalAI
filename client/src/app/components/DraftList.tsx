import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DraftListPage() {
  const [drafts, setDrafts] = useState([]);
  const router = useRouter();
  const [filter, setFilter] = useState("all");

  type Draft = {
    id: string; // UUID or timestamp based unique id
    category: string; // e.g., "notices"
    slug: string; // e.g., "payment-reminder"
    draftContent: string;
    formData: { [key: string]: string };
    timestamp: number; // Date.now()
  };

  useEffect(() => {
    const savedDrafts = JSON.parse(localStorage.getItem("savedDrafts") || "[]");
    setDrafts(savedDrafts);
  }, []);

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this draft?")) {
      const updatedDrafts = drafts.filter((draft) => draft.id !== id);
      localStorage.setItem("savedDrafts", JSON.stringify(updatedDrafts));
      setDrafts(updatedDrafts);
    }
  };

  const filteredDrafts =
    filter === "all" ? drafts : drafts.filter((d) => d.category === filter);

  return (
    <div className="max-w-5xl mx-auto py-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Draft History</h1>

      {/* Filter Dropdown */}
      <div className="mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 p-2 rounded"
        >
          <option value="all">All</option>
          <option value="notices">Notices</option>
          <option value="affidavits">Affidavits</option>
          <option value="pleadings">Pleadings</option>
        </select>
      </div>

      {filteredDrafts.length === 0 ? (
        <div className="text-center text-zinc-400">
          <p>No drafts found.</p>
          <Button onClick={() => router.push("/docs/draft")} className="mt-4">
            Start Drafting
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredDrafts.map((draft) => (
            <Card key={draft.id} className="bg-zinc-900 border border-zinc-700">
              <CardContent className="p-4">
                <h2 className="text-xl font-semibold mb-2">
                  {draft.slug.replace(/-/g, " ")}
                </h2>
                <p className="text-sm text-zinc-400 mb-2 capitalize">
                  Category: {draft.category}
                </p>
                <p className="text-xs text-zinc-500 mb-4">
                  Saved on: {new Date(draft.timestamp).toLocaleString()}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      router.push(
                        `/docs/draft/${draft.category}/${draft.slug}?draftId=${draft.id}`
                      )
                    }
                    className="flex-1 bg-zinc-700 hover:bg-zinc-600"
                  >
                    View/Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(draft.id)}
                    variant="outline"
                    className="flex-1 bg-red-800 hover:bg-red-700"
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
