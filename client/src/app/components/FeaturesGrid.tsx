export default function FeaturesSection() {
  const features = [
    {
      title: "AI-Powered Drafting",
      description: "Generate legal drafts instantly with AI suggestions that understand your context.",
    },
    {
      title: "Customizable Templates",
      description: "Start with pre-built templates tailored for contracts, notices, and agreements.",
    },
    {
      title: "Judgment Search by Description",
      description: "Find relevant case laws by simply describing your case — no complex filters needed.",
    },
    {
      title: "Collaboration Ready",
      description: "Invite team members, share drafts, and collaborate in real-time effortlessly.",
    },
  ];

  return (
    <section className=" min-h-screen py-16 px-6 text-white text-center">
      <h2 className="text-4xl font-bold mb-10">What Can Lexx Do For You?</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 gap-x-15 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <div key={index} className="bg-black/30 border border-zinc-500 rounded-2xl p-6 shadow-lg text-left">
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-zinc-400">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
