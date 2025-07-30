"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRightIcon } from "@radix-ui/react-icons";

export default function DraftTypeSelectorPage() {
  const params = useParams();
  const category = params.category as string;

  const draftTemplates: { [key: string]: { title: string; description: string; slug: string }[] } = {
    notices: [
      { title: "Payment Reminder", description: "Remind client for pending payments.", slug: "payment-reminder" },
      { title: "Termination Notice", description: "Formal employment termination letter.", slug: "termination-notice" },
      { title: "Legal Demand Notice", description: "Demand settlement before legal action.", slug: "legal-demand-notice" },
    ],
    affidavits: [
      { title: "Identity Affidavit", description: "Sworn statement for identity proof.", slug: "identity-affidavit" },
      { title: "Address Proof Affidavit", description: "Affidavit for address verification.", slug: "address-affidavit" },
    ],
    pleadings: [
      { title: "Civil Complaint", description: "Complaint for civil disputes.", slug: "civil-complaint" },
      { title: "Writ Petition", description: "Petition for High Court/Supreme Court.", slug: "writ-petition" },
    ],
  };

  const drafts = draftTemplates[category] || [];

  return (
    <div className="max-h-screen bg-zinc-950 text-white pt-5">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 capitalize">Select {category.replace(/-/g, ' ')} Draft</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:mx-4 lg:m-0 md:m-0">
          {drafts.map((item) => (
            <Link key={item.slug} href={`/docs/draft/${category}/${item.slug}`}>
              <Card className="bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition-colors">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-zinc-300">{item.title}</h2>
                    <ArrowRightIcon />
                  </div>
                  <p className="text-zinc-400 text-sm">{item.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
