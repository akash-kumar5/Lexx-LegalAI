"use client";
import { GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { X, Linkedin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className={`
        relative w-full py-8 px-6
        bg-white text-zinc-900 border-t border-zinc-200
        dark:bg-zinc-950 dark:text-zinc-100 dark:border-stone-800
      `}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
        {/* Left Side: Brand & Copyright */}
        <div className="text-center sm:text-left">
          <h3 className="text-xl font-semibold">Lexx.</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            © {currentYear} Lexx. All rights reserved.
          </p>
        </div>

        {/* Center: Navigation Links */}
        <div className="flex items-center gap-x-6 text-zinc-600 dark:text-zinc-400">
          <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">About</a>
          <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Contact</a>
        </div>

        {/* Right Side: Social Media Icons */}
        <div className="flex items-center gap-x-4">
          <a href="https://x.com/akash_tsuki" aria-label="Twitter" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </a>
          <a href="https://www.linkedin.com/in/-akash-kumar/" aria-label="LinkedIn" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
            <LinkedInLogoIcon className="w-5 h-5" />
          </a>
          <a href="https://github.com/akash-kumar5" aria-label="Github" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
            <GitHubLogoIcon className="w-5 h-5" />
          </a>
        </div>
      </div>
    </motion.footer>
  );
}
