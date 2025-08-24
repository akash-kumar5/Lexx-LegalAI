"use client";
import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";

export default function PreviewSection() {
  return (
    <section className="relative w-full bg-black py-20 sm:py-24 px-6 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-b from-zinc-100 to-zinc-400 tracking-tight text-center"
        >
          See Lexx in Action
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-zinc-400 max-w-2xl text-center mb-12 text-lg"
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
          {/* --- New: Background Glow Effect --- */}
          <div className="absolute inset-x-0 -top-1/4 h-[500px] bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(255,255,255,0.1),transparent)]"></div>

          {/* --- New: Angled 3D Frame --- */}
          <div
            className="relative p-2 bg-white/5 rounded-2xl ring-1 ring-inset ring-white/10"
            style={{ transform: "perspective(2000px) rotateX(5deg)" }}
          >
            {/* Video / GIF Placeholder */}
            <div className="w-full h-[300px] sm:h-[450px] bg-black rounded-lg overflow-hidden shadow-inner flex items-center justify-center">
              {/* Replace this with your actual video/iframe/component */}
              <div className="text-center text-zinc-500">
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