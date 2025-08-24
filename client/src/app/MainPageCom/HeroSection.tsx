"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

export default function HeroSection() {
  const scrollToNext = () => {
    const nextSection = document.getElementById("problemsolutionsection");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-black text-center px-6 overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.1),rgba(255,255,255,0))]"></div>

      <motion.div
        className="relative z-10 flex flex-col items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400"
        >
          Ask. Research. Draft.
          <br className="hidden md:block" /> All in One Platform.
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg text-zinc-300 max-w-2xl mb-10 leading-relaxed"
        >
          Lexx unifies citation-backed legal research and intelligent document
          drafting into one seamless platform built for the complexities of Indian law.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4"
        >
          {/* --- Primary Button: REVISED with Monochrome Gradient --- */}
          <Link
            href="/chat"
            className="group relative inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-white to-zinc-300 px-8 py-3 text-lg font-medium text-black shadow-lg transition-transform transform-gpu hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-400 focus:ring-offset-black"
          >
            Start Researching
          </Link>
          
          <Link
            href="/docs"
            className="group relative inline-flex items-center justify-center rounded-lg bg-white/5 px-8 py-3 text-lg font-medium text-zinc-200 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/10 hover:border-white/20"
          >
            Begin Drafting
          </Link>
        </motion.div>

        <motion.button
          onClick={scrollToNext}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: [0, 10, 0], opacity: 1 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "loop",
            delay: 1.5,
          }}
          className="absolute bottom-[-6rem] md:bottom-[-8rem] text-zinc-500 hover:text-white transition-colors"
          aria-label="Scroll to next section"
        >
          <ArrowDown className="w-6 h-6" />
        </motion.button>
      </motion.div>
    </section>
  );
}