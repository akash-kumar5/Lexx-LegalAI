"use client";

import { easeOut, motion } from "framer-motion";
import { MinusCircle, PlusCircle } from "lucide-react";

export default function ProblemSolutionSection() {
  // Framer Motion variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } },
  };

  return (
    <section
      id="problemsolutionsection"
      className="relative w-full bg-black py-20 sm:py-24 px-6 overflow-hidden"
    >
      {/* Static Background Grid */}
      <div
        className="absolute inset-0 z-0 h-full w-full bg-transparent"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px)",
          backgroundSize: "3rem 3rem",
        }}
      ></div>

      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold mb-16 text-transparent bg-clip-text bg-gradient-to-b from-zinc-100 to-zinc-400 tracking-tight"
        >
          Why Lexx?
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto"
        >
          {/* Problem Card */}
          <motion.div
            variants={itemVariants}
            className="group relative bg-white/5 backdrop-blur-md rounded-2xl p-8 text-left shadow-2xl transition-all duration-300 hover:bg-zinc-900/10 hover:text-black"
          >
            {/* --- New: Glowing Border Effect --- */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-zinc-500 to-zinc-800 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <MinusCircle className="w-7 h-7 text-zinc-400" />
                <h3 className="text-zinc-200 font-semibold text-2xl">
                  The Problem
                </h3>
              </div>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Drafting legal documents is{" "}
                <span className="text-white">slow</span>, repetitive, and error-prone.
                Research takes hours across scattered sources, and{" "}
                <span className="text-white">missing one clause</span> can change an outcome.
              </p>
            </div>
          </motion.div>

          {/* Solution Card */}
          <motion.div
            variants={itemVariants}
            className="group relative bg-white/5 backdrop-blur-md rounded-2xl p-8 text-left shadow-2xl transition-all duration-300 hover:bg-zinc-800/10"
          >
            {/* --- New: Glowing Border Effect --- */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-zinc-500 to-zinc-800 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <PlusCircle className="w-7 h-7 text-white" />
                <h3 className="text-white font-semibold text-2xl">
                  The Lexx Solution
                </h3>
              </div>
              <p className="text-zinc-300 text-lg leading-relaxed">
                Lexx combines <span className="text-white">AI-powered drafting</span> with
                citation-backed research, so you can go from a{" "}
                <span className="text-white">single question</span> to a ready legal draft in
                minutes. Accurate, fast, and built for Indian law.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
      {/* Note: The scroll-down button is removed from individual sections for better page flow. 
          The main page layout will handle the overall scroll experience. */}
    </section>
  );
}