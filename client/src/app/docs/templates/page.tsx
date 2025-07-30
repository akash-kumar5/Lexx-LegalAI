import CategoryCard from "@/app/components/CategoryCard";

export default function TemplatesCategoriesPage() {
  const categories = [
    { name: "Agreements", description: "Business, Employment, Rental etc.", route: "/docs/templates/agreements" },
    { name: "Notices", description: "Legal Notices, Termination, Demand Letters.", route: "/docs/templates/notices" },
    { name: "Affidavits", description: "Sworn statements for legal procedures.", route: "/docs/templates/affidavits" },
    { name: "Applications", description: "Legal applications and petitions.", route: "/docs/templates/applications" },
    { name: "Deeds", description: "Sale Deeds, Gift Deeds, Lease Deeds etc.", route: "/docs/templates/deeds" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-20 px-6">
      <h1 className="text-3xl font-bold mb-10 text-center">Select a Template Category</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {categories.map((cat) => (
          <CategoryCard key={cat.name} {...cat} />
        ))}
      </div>
    </div>
  );
}
