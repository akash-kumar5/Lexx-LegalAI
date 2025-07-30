export default function WorkflowSection() {
  const steps = [
    {
      step: "Step 1",
      title: "Select Draft Type or Upload Document",
      description: "Choose from ready-made templates or upload an existing draft to get started instantly.",
    },
    {
      step: "Step 2",
      title: "Describe Your Case or Context",
      description: "Provide a brief description, and Lexi’s AI will understand the context to draft accurately.",
    },
    {
      step: "Step 3",
      title: "Review, Edit & Finalize",
      description: "Lexi generates a polished draft. You can make edits, get suggestions, and export in preferred formats.",
    },
  ];

  return (
    <section className="min-h-screen py-16 px-6 text-white text-center">
      <h2 className="text-4xl font-bold mb-10">How Lexi Works</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl min-h-4xl mx-auto">
        {steps.map((item, index) => (
          <div key={index} className="border border-zinc-500 bg-black/20 rounded-3xl p-6 shadow-lg">
            <h4 className="text-zinc-300 text-sm font-bold uppercase mb-2">{item.step}</h4>
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p className="text-gray-400 italic">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
