"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MessageCircle,
  Scissors,
  SearchCode,
  Library,
  Users,
} from "lucide-react";

// Updated features array with icons
const features = [
  { title: "AI Drafting", desc: "Auto-generate notices, contracts & petitions with legal-grade accuracy.", icon: <Sparkles /> },
  { title: "Smart Chat", desc: "Chat with your documents or case files, ask questions and get instant answers.", icon: <MessageCircle /> },
  { title: "Summarization", desc: "Condense bulky judgments & acts into crisp summaries.", icon: <Scissors /> },
  { title: "Judgment Search", desc: "Semantic search across precedents, not just keyword matching.", icon: <SearchCode /> },
  { title: "Template Library", desc: "Access ready-to-use legal templates tailored to Indian law.", icon: <Library /> },
  { title: "Collaboration", desc: "Work with clients or teams in real time, securely.", icon: <Users /> }
];

export default function FeaturesSection() {
  const [index, setIndex] = useState(0);

  // We show 2 features at a time
  const step = 2;

  const next = () => setIndex((prev) => (prev + step) % features.length);
  const prev = () => setIndex((prev) => (prev - step + features.length) % features.length);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full bg-black py-20 sm:py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-b from-zinc-100 to-zinc-400 tracking-tight"
        >
          What Makes Lexx Different?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-zinc-400 mb-12 max-w-2xl mx-auto text-lg">
            Explore the key features that redefine how law is practiced.
        </motion.p>

        {/* --- New: Carousel Frame --- */}
        <div className="relative p-4 rounded-2xl bg-zinc-900/30 border border-white/10">
          <div className="relative flex items-center justify-center w-full">
            <button
              onClick={prev}
              className="absolute -left-4 md:-left-6 z-20 p-2 bg-zinc-800/80 hover:bg-zinc-700 rounded-full transition-colors backdrop-blur-sm border border-white/10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Carousel Viewport with overflow hidden */}
            <div className="w-full overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 200 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -200 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(e, { offset, velocity }) => {
                    if (offset.x < -100 || velocity.x < -500) next();
                    else if (offset.x > 100 || velocity.x > 500) prev();
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full"
                >
                  {features.slice(index, index + step).map((f) => (
                    // --- Upgraded Glassmorphism Card ---
                    <div
                      key={f.title}
                      className="group relative rounded-2xl p-8 text-left shadow-2xl h-60 flex flex-col justify-center"
                    >
                      <div className="absolute inset-0 bg-white/5 rounded-2xl backdrop-blur-md"></div>
                      <div className="absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-10">
                        <div className="absolute inset-0 rounded-2xl bg-[conic-gradient(from_90deg_at_50%_50%,#555555_-45deg,#FFFFFF_0deg,#555555_45deg,#555555_135deg,#FFFFFF_180deg,#555555_225deg,#555555_315deg,#FFFFFF_360deg)] group-hover:animate-spin-slow"></div>
                      </div>
                      <div className="relative z-10">
                        <div className="text-white w-8 h-8 mb-4">{f.icon}</div>
                        <h3 className="text-xl font-semibold mb-2 text-white">{f.title}</h3>
                        <p className="text-zinc-400 text-base">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
            
            <button
              onClick={next}
              className="absolute -right-4 md:-right-6 z-20 p-2 bg-zinc-800/80 hover:bg-zinc-700 rounded-full transition-colors backdrop-blur-sm border border-white/10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Indicator dots */}
        <div className="flex justify-center mt-8 gap-2.5">
          {Array.from({ length: Math.ceil(features.length / step) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i * step)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index / step === i ? "w-6 bg-white" : "w-2 bg-zinc-600 hover:bg-zinc-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}