"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Is the legal information provided by Lexx accurate and up-to-date?",
    answer:
      "Yes. Lexx is grounded in a comprehensive and continuously updated database of Indian Bare Acts, precedents, and legal statutes. Our Retrieval-Augmented Generation (RAG) architecture ensures that all generated content is based on reliable, verifiable sources, not just the LLM's internal knowledge.",
  },
  {
    question: "Is my data secure and confidential?",
    answer:
      "Absolutely. We prioritize client confidentiality with end-to-end encryption for all data in transit and at rest. Your case details and documents are processed in a secure environment, and we adhere to strict data privacy protocols.",
  },
  {
    question: "Who is this platform designed for?",
    answer:
      "Lexx is designed for legal professionals, including lawyers, law firms, in-house counsel, and law students in India. Its tools are built to enhance productivity for anyone involved in legal research, drafting, and case preparation.",
  },
  {
    question: "Can I use Lexx for jurisdictions outside of India?",
    answer:
      "Currently, Lexx is highly specialized and optimized for the complexities of the Indian legal system. While some general principles might apply, its core knowledge base and templates are tailored specifically for Indian law.",
  },
];

type FAQItemProps = {
  question: string;
  answer: string;
};

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      layout
      initial={{ borderRadius: 12 }}
      className="border-b border-zinc-200/10 dark:border-zinc-700/40"
    >
      <motion.button
        onClick={() => setIsOpen((s) => !s)}
        className={`
          flex justify-between items-center w-full py-5 text-left text-lg font-medium
          text-zinc-900 bg-white dark:bg-transparent
          dark:text-zinc-100
          transition-colors
        `}
      >
        <span className="max-w-[85%]">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <ChevronDown className="w-5 h-5 text-zinc-500 dark:text-zinc-300" />
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: "auto",
              transition: { duration: 0.28, ease: "easeInOut" },
            }}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.18 } }}
            className="overflow-hidden"
          >
            <p className="pb-5 pr-8 text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  return (
    <section
      className={`
        relative w-full py-20 sm:py-24 px-6 overflow-hidden
        bg-white text-zinc-900
        dark:bg-black dark:text-zinc-100
      `}
    >
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className={`
            text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text tracking-tight text-center
            bg-gradient-to-b from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-300
          `}
        >
          Frequently Asked Questions
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-zinc-700 dark:text-zinc-300 max-w-2xl text-center mb-12 text-lg"
        >
          Have questions? We&apos;ve got answers. If you don&apos;t see your query here, feel free to contact us.
        </motion.p>

        <div className="w-full">
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
