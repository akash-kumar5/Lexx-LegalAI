"use client";
import { motion } from "framer-motion";

export default function AboutProjectSection() {
  return (
    <section
      className={`
        relative w-full py-20 sm:py-24 px-6 overflow-hidden
        bg-white text-zinc-900
        dark:bg-black dark:text-zinc-100
      `}
    >
      {/* Background constellation pattern */}
      <div
        className={`
          absolute inset-0 z-0 opacity-20
          bg-[radial-gradient(circle_at_25%_30%,black_0px,transparent_1.5%),radial-gradient(circle_at_75%_80%,black_0px,transparent_1.5%)]
          dark:bg-[radial-gradient(circle_at_25%_30%,white_0px,transparent_1.5%),radial-gradient(circle_at_75%_80%,white_0px,transparent_1.5%)]
        `}
        style={{ backgroundSize: "4rem 4rem" }}
        aria-hidden
      />

      {/* Central glow */}
      <div
        className={`
          absolute inset-x-0 top-1/2 -translate-y-1/2 h-72
          bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.05)_0%,transparent_60%)]
          dark:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,transparent_60%)]
        `}
        aria-hidden
      />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className={`
            text-4xl md:text-5xl font-bold mb-6 tracking-tight text-center
            text-transparent bg-clip-text
            bg-gradient-to-b from-zinc-900 to-zinc-600
            dark:from-zinc-100 dark:to-zinc-400
          `}
        >
          About Lexx
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`
            max-w-3xl text-center text-lg leading-relaxed
            text-zinc-700 dark:text-zinc-300
          `}
        >
          Lexx is a fully integrated AI-powered legal assistant designed for Indian law. 
          It unifies{" "}
          <span
            className={`
              px-2 py-1 rounded-md
              bg-zinc-200 text-zinc-900
              dark:bg-white/10 dark:text-white
            `}
          >
            legal research
          </span>,{" "}
          <span
            className={`
              px-2 py-1 rounded-md
              bg-zinc-200 text-zinc-900
              dark:bg-white/10 dark:text-white
            `}
          >
            drafting
          </span>, and{" "}
          <span
            className={`
              px-2 py-1 rounded-md
              bg-zinc-200 text-zinc-900
              dark:bg-white/10 dark:text-white
            `}
          >
            summarization
          </span>{" "}
          into a single platform, delivering accurate, professional documents in minutes. 
          Built with modern web technologies and powered by state-of-the-art AI, 
          Lexx transforms how legal professionals approach their work.
        </motion.p>
      </div>
    </section>
  );
}
