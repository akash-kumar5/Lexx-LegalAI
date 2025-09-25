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

const features = [
  { title: "AI Drafting", desc: "Auto-generate notices, contracts & petitions with legal-grade accuracy.", icon: Sparkles },
  { title: "Smart Chat", desc: "Chat with your documents or case files, ask questions and get instant answers.", icon: MessageCircle },
  { title: "Summarization", desc: "Condense bulky judgments & acts into crisp summaries.", icon: Scissors },
  { title: "Judgment Search", desc: "Semantic search across precedents, not just keyword matching.", icon: SearchCode },
  { title: "Template Library", desc: "Access ready-to-use legal templates tailored to Indian law.", icon: Library },
  { title: "Collaboration", desc: "Work with clients or teams in real time, securely.", icon: Users },
];

export default function FeaturesSection() {
  const [index, setIndex] = useState(0);
  const step = 2;

  const next = () => setIndex((prev) => (prev + step) % features.length);
  const prev = () => setIndex((prev) => (prev - step + features.length) % features.length);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, []);

  // Prepare visible items safely (wrap if near end)
  const getVisible = (start: number, count: number) => {
    const out = [];
    for (let i = 0; i < count; i++) {
      out.push(features[(start + i) % features.length]);
    }
    return out;
  };

  return (
    <section
      className={`
        relative w-full py-20 sm:py-24 px-6 overflow-hidden
        bg-white text-zinc-900
        dark:bg-black dark:text-zinc-100
      `}
    >
      <div className="max-w-7xl mx-auto w-full text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className={`
            text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text tracking-tight text-center
            bg-gradient-to-b from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-300
          `}
        >
          What Makes Lexx Different?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-zinc-700 dark:text-zinc-300 mb-12 max-w-2xl mx-auto text-lg"
        >
          Explore the key features that redefine how law is practiced.
        </motion.p>

        <div className="relative p-4 rounded-2xl border border-zinc-200/8 dark:border-stone-700/40">
          <div className="relative flex items-center justify-center w-full">
            <button
              onClick={prev}
              aria-label="Previous features"
              className={`
                absolute -left-4 md:-left-6 z-20 p-2 rounded-full transition-colors
                bg-zinc-100/60 border border-zinc-200 hover:bg-zinc-100 dark:bg-stone-800/70 dark:border-stone-700
                dark:hover:bg-stone-800
                backdrop-blur-sm
              `}
            >
              <ChevronLeft className="w-6 h-6 text-zinc-800 dark:text-zinc-100" />
            </button>

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
                  {getVisible(index, step).map((f) => {
                    const Icon = f.icon;
                    return (
                      <div
                        key={f.title}
                        className={`
                          group relative rounded-2xl p-8 text-left shadow-2xl h-60 flex flex-col justify-center
                          bg-white dark:bg-stone-900 border border-zinc-100/6 dark:border-stone-700/40
                        `}
                      >
                        {/* subtle glass / overlay */}
                        <div className="absolute inset-0 rounded-2xl bg-white/4 dark:bg-black/20 backdrop-blur-md pointer-events-none"></div>

                        <div className="relative z-10">
                          <div className="w-10 h-10 mb-4 flex items-center justify-center rounded-md
                            bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                            <Icon className="w-5 h-5" />
                          </div>

                          <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-stone-100">{f.title}</h3>
                          <p className="text-zinc-600 dark:text-zinc-300 text-base">{f.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>

            <button
              onClick={next}
              aria-label="Next features"
              className={`
                absolute -right-4 md:-right-6 z-20 p-2 rounded-full transition-colors
                bg-zinc-100/60 border border-zinc-200 hover:bg-zinc-100 dark:bg-stone-800/70 dark:border-stone-700
                dark:hover:bg-stone-800
                backdrop-blur-sm
              `}
            >
              <ChevronRight className="w-6 h-6 text-zinc-800 dark:text-zinc-100" />
            </button>
          </div>
        </div>

        <div className="flex justify-center mt-8 gap-2.5">
          {Array.from({ length: Math.ceil(features.length / step) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i * step)}
              className={`h-2 rounded-full transition-all duration-300 ${index / step === i ? "w-6 bg-zinc-900 dark:bg-white" : "w-2 bg-zinc-400 dark:bg-zinc-600 hover:bg-zinc-500"}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
