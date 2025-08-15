import FeaturesSection from "./components/FeaturesGrid";
import WorkflowSection from "./components/WorkflowSection";
import Footer from "./components/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-zinc-800 text-white text-center">
      <section className="relative min-h-screen flex flex-col items-center justify-center text-white text-center px-6 w-[100%] overflow-hidden">
        {/* Background Visual (Gradient or Image Overlay) */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-zinc-800 opacity-80 z-0" />
        {/* Optional: You can swap above with a bg-image + gradient overlay */}

        {/* Floating Blurred Shapes for Style */}
        <div className="absolute w-96 h-96 bg-zinc-600 rounded-full blur-3xl opacity-30 top-10 left-[-100px] z-0" />
        <div className="absolute w-72 h-72 bg-zinc-500 rounded-full blur-2xl opacity-20 bottom-[-50px] right-[-100px] z-0" />

        {/* Content */}
        <div className="relative z-10">
          <p className="text-sm uppercase tracking-widest text-white/40 mb-2">
            AI-Powered Legal Assistant
          </p>
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 drop-shadow-lg">
            Lexx
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mb-8">
            Automate legal drafting, simplify research, and create professional
            documents with AI precision — in minutes.
          </p>
          <Link
          href="/chat"
            className="bg-black/60 hover:bg-zinc-900 rounded-2xl border border-zinc-500 px-8 py-4 transition-transform transform hover:scale-110 shadow-md"
          >
            Get Started
          </Link>
        </div>
      </section>
      <FeaturesSection />
      <WorkflowSection />
      <Footer />
    </main>
  );
}
