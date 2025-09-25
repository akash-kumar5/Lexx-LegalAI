"use client";
import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";

export default function PreviewSection() {
  return (
    <section
      className={`
        relative w-full py-20 sm:py-24 px-6 overflow-hidden
        bg-white text-zinc-900
        dark:bg-black dark:text-zinc-100
      `}
    >
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className={`
            text-4xl md:text-5xl font-bold mb-4 text-center tracking-tight
            text-transparent bg-clip-text
            bg-gradient-to-b from-zinc-900 to-zinc-600
            dark:from-zinc-100 dark:to-zinc-400
          `}
        >
          See Lexx in Action
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-zinc-700 dark:text-zinc-300 max-w-2xl text-center mb-12 text-lg"
        >
          Watch how Lexx can generate drafts, answer queries, and summarize cases in real time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative w-full max-w-5xl"
        >
          {/* Background glow */}
          <div
            className={`
              absolute inset-x-0 -top-1/4 h-[500px]
              bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(0,0,0,0.05),transparent)]
              dark:bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(255,255,255,0.1),transparent)]
            `}
            aria-hidden
          ></div>

          {/* Frame */}
          <div
            className={`
              relative p-2 rounded-2xl
              bg-zinc-100 ring-1 ring-inset ring-zinc-200
              dark:bg-white/5 dark:ring-white/10
            `}
            style={{ transform: "perspective(2000px) rotateX(5deg)" }}
          >
            {/* Video / GIF Placeholder */}
            <div
              className={`
                w-full h-[300px] sm:h-[450px] rounded-lg overflow-hidden shadow-inner flex items-center justify-center
                bg-zinc-100 dark:bg-black
              `}
            >
              <div className="text-center text-zinc-500 dark:text-zinc-400">
                <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="italic">Your demo video/GIF goes here</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
