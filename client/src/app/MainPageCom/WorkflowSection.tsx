"use client";

import { motion } from "framer-motion";
import { easeOut } from "framer-motion";
import { FileText, MessageSquare, FileCheck } from "lucide-react";

const steps = [
  {
    step: "Step 1",
    title: "Upload or Select",
    description: "Choose from ready-made templates or upload an existing draft to get started instantly.",
    icon: FileText,
  },
  {
    step: "Step 2",
    title: "Describe Your Context",
    description: "Provide a brief description, and our AI will understand the context to draft accurately.",
    icon: MessageSquare,
  },
  {
    step: "Step 3",
    title: "Review & Finalize",
    description: "Lexx generates a polished draft. You can make edits, get suggestions, and export.",
    icon: FileCheck,
  },
];

export default function WorkflowSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: easeOut } },
  };

  return (
    <section
      id="workflow"
      className={`
        relative w-full py-20 sm:py-24 px-6 overflow-hidden
        bg-white text-zinc-900
        dark:bg-black dark:text-zinc-100
      `}
    >
      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className={`
            text-4xl md:text-5xl font-bold mb-20 text-transparent bg-clip-text tracking-tight text-center
            bg-gradient-to-b from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-300
          `}
        >
          How Lexx Works
        </motion.h2>

        <div className="relative">
          {/* Animated connecting line; uses currentColor so it adapts to theme */}
          <motion.div
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1, delay: 0.8, ease: "easeInOut" }}
            className="absolute left-0 top-1/2 w-full h-px hidden md:block text-zinc-300 dark:text-zinc-600"
            aria-hidden
          >
            <svg width="100%" height="2" viewBox="0 0 1000 2" preserveAspectRatio="none">
              <path d="M 0 1 H 1000" stroke="currentColor" strokeWidth="1" strokeDasharray="8 8" />
            </svg>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative"
          >
            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  variants={itemVariants}
                  className={`
                    group relative rounded-2xl p-8 text-center shadow-2xl flex flex-col items-center
                    bg-zinc-50 border border-zinc-100/40
                    dark:bg-stone-900 dark:border-stone-700/40
                    transition-colors
                  `}
                >
                  <div className="absolute inset-0 bg-white/4 dark:bg-black/20 rounded-2xl backdrop-blur-md pointer-events-none"></div>

                  <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute inset-0 rounded-2xl bg-[conic-gradient(from_90deg_at_50%_50%,#e6e6e6_0deg,#ffffff_60deg,#e6e6e6_120deg)] dark:bg-[conic-gradient(from_90deg_at_50%_50%,rgba(255,255,255,0.03)_0deg, rgba(255,255,255,0.06)_120deg)] opacity-30"></div>
                  </div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-5 p-4 rounded-full border border-zinc-200 bg-zinc-900/5 dark:bg-white/5">
                      <Icon className="w-8 h-8 text-zinc-800 dark:text-zinc-100" />
                    </div>

                    <h4 className="text-zinc-500 dark:text-zinc-400 text-sm font-bold uppercase mb-2">{item.step}</h4>
                    <h3 className="text-xl font-semibold mb-3 text-zinc-900 dark:text-white">{item.title}</h3>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-sm">{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
