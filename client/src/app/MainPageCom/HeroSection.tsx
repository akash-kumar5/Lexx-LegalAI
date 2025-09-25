"use client";

import Link from "next/link";
import React from "react";
import { easeInOut, motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

export default function HeroSection() {
  const scrollToNext = () => {
    const nextSection = document.getElementById("problemsolutionsection");
    if (nextSection) nextSection.scrollIntoView({ behavior: "smooth" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: easeInOut },
    },
  };

  return (
    <section
      className={`
        relative min-h-screen flex items-center justify-center
        px-6 overflow-hidden text-center

        /* Light mode bg */
        bg-gradient-to-b from-white via-zinc-50 to-zinc-100 text-zinc-900

        /* Dark mode bg */
        dark:from-zinc-900 dark:via-zinc-900/30 dark:to-black dark:text-zinc-100
      `}
    >
      {/* Subtle radial glow adapted for both modes */}
      <div
        className={`
          absolute inset-0 z-0
          bg-[radial-gradient(ellipse_70%_70%_at_50%_-30%,rgba(131,129,129,0.06),rgba(255,255,255,0))]
          dark:bg-[radial-gradient(ellipse_70%_70%_at_50%_-30%,rgba(131,129,129,0.8),rgba(255,255,255,0))]
        `}
        aria-hidden
      />

      <motion.div
        className="relative z-10 flex flex-col items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={itemVariants}
          className={`
            text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl
            text-transparent bg-clip-text

            /* Light: strong dark text with subtle gradient */
            bg-gradient-to-b from-zinc-900 to-zinc-600

            /* Dark: bright gradient for better pop */
            dark:from-white dark:to-zinc-300
          `}
        >
          Ask. Research. Draft.
          <br className="hidden md:block" /> All in One Platform.
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className={`
            text-lg max-w-2xl mb-10 leading-relaxed

            /* Light description color */
            text-zinc-700

            /* Dark description color */
            dark:text-zinc-300
          `}
        >
          Lexx unifies citation-backed legal research and intelligent document
          drafting into one seamless platform built for the complexities of
          Indian law.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
          {/* Primary CTA */}
          <Link
            href="/chat"
            className={`
              group relative inline-flex items-center justify-center rounded-lg px-8 py-3 text-lg font-medium shadow-lg transform-gpu transition-transform

              /* Light primary: white button with dark text and subtle border */
              bg-white text-black border border-zinc-200 hover:-translate-y-1 hover:shadow-xl
              
              /* Dark primary: dark filled button with white text */
              dark:bg-zinc-800 dark:text-white dark:border-zinc-700 dark:hover:-translate-y-1
            `}
            aria-label="Start researching"
          >
            Start Researching
          </Link>

          {/* Secondary CTA */}
          <Link
            href="/docs"
            className={`
              group relative inline-flex items-center justify-center rounded-lg px-8 py-3 text-lg font-medium backdrop-blur-sm transition-all

              /* Light secondary: muted outline */
              bg-white/5 text-zinc-900 border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300

              /* Dark secondary: translucent dark with light text */
              dark:bg-white/5 dark:text-zinc-100 dark:border-white/10 dark:hover:bg-white/10 dark:hover:border-white/20
            `}
            aria-label="Begin drafting"
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
          className={`
            absolute bottom-[-6rem] md:bottom-[-8rem] transition-colors
            text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-white
          `}
          aria-label="Scroll to next section"
        >
          <ArrowDown className="w-6 h-6" />
        </motion.button>
      </motion.div>
    </section>
  );
}
