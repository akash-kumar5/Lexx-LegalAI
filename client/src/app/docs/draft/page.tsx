import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRightIcon } from "@radix-ui/react-icons";

export default function DraftSelectorPage() {
  const draftCategories = [
    {
      title: "Notices",
      description: "Legal Notices, Termination, Demand Letters.",
      category: "notices",
    },
    {
      title: "Affidavits",
      description: "Sworn statements for legal procedures.",
      category: "affidavits",
    },
    {
      title: "Pleadings & Petitions",
      description: "Complaints, Rejoinders, Petitions for courts.",
      category: "pleadings",
    },
  ];

  return (
    <div className="max-h-screen bg-zinc-950 text-white pt-5">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Select Draft Type</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
          {draftCategories.map((item) => (
            <Link key={item.category} href={`/docs/draft/${item.category}`}>
              <Card className="bg-zinc-900 lg:m-0 md:m-0 sm:mx-3 border border-zinc-700 hover:border-zinc-500 transition-colors">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-zinc-200">
                      {item.title}
                    </h2>
                    <ArrowRightIcon />
                  </div>
                  <p className="text-zinc-400 text-sm italic">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
      <hr className="my-12 border-zinc-700 rounded-full w-80 mx-auto" />
      <div className="mt-12 flex justify-center">
        <Link href="/docs/draft/history">
          <Card className="bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition-colors w-64">
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
