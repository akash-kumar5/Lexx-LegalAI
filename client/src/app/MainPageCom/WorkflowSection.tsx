"use client";
import { FileText, MessageSquare, FileCheck } from "lucide-react";
import { easeOut, motion } from "framer-motion";

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
    <section id="workflow" className="relative w-full bg-black py-20 sm:py-24 px-6 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold mb-20 text-transparent bg-clip-text bg-gradient-to-b from-zinc-100 to-zinc-400 tracking-tight"
        >
          How Lexx Works
        </motion.h2>

        <div className="relative">
          {/* --- New: Animated Connecting Line (Desktop Only) --- */}
          <motion.div
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1, delay: 0.8, ease: "easeInOut" }}
            className="absolute left-0 top-1/2 w-full h-px hidden md:block"
          >
             <svg width="100%" height="100%" viewBox="0 0 1000 1" preserveAspectRatio="none">
                <path d="M 0 0.5 H 1000" stroke="url(#gradient)" strokeWidth="2" strokeDasharray="8 8" />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(0, 0, 0, 0.91)" />
                        <stop offset="50%" stopColor="rgba(0, 0, 0, 0.59)" />
                        <stop offset="100%" stopColor="rgba(6, 6, 6, 1)" />
                    </linearGradient>
                </defs>
            </svg>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8"
          >
            {steps.map((item) => (
              <motion.div key={item.step} variants={itemVariants} className="group relative rounded-2xl p-8 text-center shadow-2xl flex flex-col items-center">
                <div className="absolute inset-0 bg-white/5 rounded-2xl backdrop-blur-md"></div>
                <div className="absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-10">
                  <div className="absolute inset-0 rounded-2xl bg-[conic-gradient(from_90deg_at_50%_50%,#553333_-45deg,#FFFFFF_0deg,#555555_45deg,#555555_135deg,#FFFFFF_180deg,#555555_225deg,#555555_315deg,#FFFFFF_360deg)] group-hover:animate-spin-slow"></div>
                </div>
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="mb-5 p-4 bg-zinc-900/80 rounded-full border border-zinc-700">
                     <item.icon className="w-8 h-8 text-zinc-200" />
                  </div>
                  <h4 className="text-zinc-400 text-sm font-bold uppercase mb-2">
                    {item.step}
                  </h4>
                  <h3 className="text-xl font-semibold mb-3 text-white">{item.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}