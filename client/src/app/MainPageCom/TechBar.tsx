"use client";

import { motion } from "framer-motion";
import { BookCheck, BrainCircuit, Search, Triangle } from "lucide-react";

// It's better to manage complex items as an array of objects
const techItems = [
  { name: "Indian Bare Acts", icon: <BookCheck className="w-5 h-5" /> },
  { name: "LLM + RAG Architecture", icon: <BrainCircuit className="w-5 h-5" /> },
  { name: "Next.js & Vercel", icon: <Triangle className="w-5 h-5" /> },
  { name: "Semantic Search", icon: <Search className="w-5 h-5" /> },
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
    <section className="relative w-full bg-black py-16 sm:py-20">
      {/* --- New: Background Beam Effect --- */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-24 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.08)_0%,_transparent_70%)] opacity-70"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
        <motion.h3
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-10"
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
          {techItems.map((item) => (
            <motion.div
              key={item.name}
              variants={itemVariants}
              className="flex items-center gap-3 text-zinc-300"
            >
              {item.icon}
              <span className="font-medium text-lg">{item.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}