"use client";

import { motion } from "framer-motion";
import { BookCheck, BrainCircuit, Search, Triangle } from "lucide-react";

const techItems = [
  { name: "Indian Bare Acts", icon: BookCheck },
  { name: "LLM + RAG Architecture", icon: BrainCircuit },
  { name: "Next.js & Vercel", icon: Triangle },
  { name: "Semantic Search", icon: Search },
];

export default function TechBar() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section
      className={`
        relative w-full py-16 sm:py-20
        bg-white text-zinc-900
        dark:bg-black dark:text-zinc-100
      `}
    >
      {/* Background beam */}
      <div
        className={`
          absolute inset-x-0 top-1/2 -translate-y-1/2 h-24 opacity-70
          bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.05)_0%,_transparent_70%)]
          dark:bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.08)_0%,_transparent_70%)]
        `}
        aria-hidden
      ></div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
        <motion.h3
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-sm font-semibold uppercase tracking-wider mb-10 text-zinc-600 dark:text-zinc-400"
        >
          Grounded in reliable sources & built with modern tech
        </motion.h3>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="flex flex-wrap justify-center items-center gap-x-10 gap-y-6"
        >
          {techItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.name}
                variants={itemVariants}
                className="flex items-center gap-3 text-zinc-800 dark:text-zinc-300"
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-lg">{item.name}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
