import DocsCard from "../components/DocsCard";

export default function Docs() {
  const actions = [
    {
      title: "Draft Legal Documents",
      description: "Generate contracts, notices, and petitions quickly.",
      route: "/docs/draft",
    },
    {
      title: "Summarize Documents",
      description: "Upload PDFs or text to get a quick summary.",
      route: "/docs/summarize",
    },
    {
      title: "Explore Templates",
      description: "Browse ready-made legal templates you can edit.",
      route: "/docs/templates",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-20 px-6">
      <h1 className="text-3xl font-bold mb-10 text-center">Your Legal Workspace</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {actions.map((action) => (
          <DocsCard key={action.title} {...action} />
        ))}
      </div>
    </div>
  );
}
