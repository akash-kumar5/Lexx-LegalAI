"use client";
import { motion } from "framer-motion";

export default function AboutProjectSection() {
  return (
    <section className="relative w-full bg-black py-20 sm:py-24 px-6 overflow-hidden">
      {/* --- New: Background Constellation/Node Pattern --- */}
      <div
        className="absolute inset-0 z-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle at 25% 30%, white 0px, transparent 1.5%), radial-gradient(circle at 75% 80%, white 0px, transparent 1.5%)",
          backgroundSize: "4rem 4rem",
        }}
      ></div>
      {/* --- New: Central Glow --- */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-72 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,transparent_60%)]"></div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-b from-zinc-100 to-zinc-400 tracking-tight text-center"
        >
          About Lexx
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-zinc-300 max-w-3xl text-center text-lg leading-relaxed"
        >
          Lexx is a fully integrated AI-powered legal assistant designed for Indian law. 
          It unifies{" "}
          <span className="text-white bg-white/10 px-2 py-1 rounded-md">legal research</span>,{" "}
          <span className="text-white bg-white/10 px-2 py-1 rounded-md">drafting</span>, and{" "}
          <span className="text-white bg-white/10 px-2 py-1 rounded-md">summarization</span> into a single platform, 
          delivering accurate, professional documents in minutes. Built with modern web technologies 
          and powered by state-of-the-art AI, Lexx transforms how legal professionals approach their work.
        </motion.p>
      </div>
    </section>
  );
}