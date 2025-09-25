"use client";

import { easeOut, motion } from "framer-motion";
import { MinusCircle, PlusCircle } from "lucide-react";

export default function ProblemSolutionSection() {
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
      className={`
        relative w-full py-20 sm:py-24 px-6 overflow-hidden
        bg-white text-zinc-900
        dark:bg-black dark:text-zinc-100
      `}
    >
      {/* Static background grid: light uses faint gray, dark uses faint white */}
      <div
        className="absolute inset-0 z-0 h-full w-full"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "3rem 3rem",
        }}
      />
      <div
        className="absolute inset-0 z-0 h-full w-full dark:hidden"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "3rem 3rem",
        }}
      />
      <div
        className="absolute inset-0 z-0 h-full w-full hidden dark:block"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "3rem 3rem",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className={`
            text-4xl md:text-5xl font-bold mb-16 tracking-tight
            text-transparent bg-clip-text
            bg-gradient-to-b from-zinc-900 to-zinc-600
            dark:from-zinc-100 dark:to-zinc-300
          `}
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
            className={`
              group relative rounded-2xl p-8 text-left shadow-2xl transition-all duration-300
              bg-zinc-50 border border-zinc-100/40
              hover:bg-zinc-100/60 hover:shadow-2xl
              dark:bg-stone-900 dark:border-stone-700/40 dark:hover:bg-stone-800/60
            `}
          >
            {/* Glowing border (subtle in light, subtle in dark) */}
            <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none">
              <div className="h-full w-full rounded-2xl bg-gradient-to-r from-zinc-300 to-zinc-500 dark:from-stone-700 dark:to-stone-900 opacity-30" />
            </div>

            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <MinusCircle className="w-7 h-7 text-zinc-600 dark:text-zinc-300" />
                <h3 className="font-semibold text-2xl text-zinc-900 dark:text-white">
                  The Problem
                </h3>
              </div>
              <p className="text-zinc-700 dark:text-zinc-300 text-lg leading-relaxed">
                Drafting legal documents is <span className="font-semibold text-zinc-900 dark:text-white">slow</span>, repetitive, and error-prone.
                Research takes hours across scattered sources, and{" "}
                <span className="font-semibold text-zinc-900 dark:text-white">missing one clause</span> can change an outcome.
              </p>
            </div>
          </motion.div>

          {/* Solution Card */}
          <motion.div
            variants={itemVariants}
            className={`
              group relative rounded-2xl p-8 text-left shadow-2xl transition-all duration-300
              bg-zinc-50 border border-zinc-100/40
              hover:bg-zinc-100/60
              dark:bg-stone-900 dark:border-stone-700/40 dark:hover:bg-stone-800/60
            `}
          >
            <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none">
              <div className="h-full w-full rounded-2xl bg-gradient-to-r from-zinc-300 to-zinc-500 dark:from-stone-700 dark:to-stone-900 opacity-30" />
            </div>

            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <PlusCircle className="w-7 h-7 text-white bg-zinc-900 rounded-full p-1 dark:bg-white dark:text-zinc-900" />
                <h3 className="text-zinc-900 dark:text-white font-semibold text-2xl">
                  The Lexx Solution
                </h3>
              </div>
              <p className="text-zinc-700 dark:text-zinc-300 text-lg leading-relaxed">
                Lexx combines <span className="font-semibold text-zinc-900 dark:text-white">AI-powered drafting</span> with
                citation-backed research, so you can go from a <span className="font-semibold text-zinc-900 dark:text-white">single question</span> to a ready legal draft in
                minutes. Accurate, fast, and built for Indian law.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
