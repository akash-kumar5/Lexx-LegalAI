"use client";
import { motion } from "framer-motion";
import { Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative w-full bg-zinc-950 border-t border-white/10 py-8 px-6"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
        {/* Left Side: Brand & Copyright */}
        <div className="text-center sm:text-left">
          <h3 className="text-xl font-semibold text-white">Lexx.</h3>
          <p className="text-sm text-zinc-500 mt-1">
            © {currentYear} Lexx. All rights reserved.
          </p>
        </div>

        {/* Center: Navigation Links */}
        <div className="flex items-center gap-x-6 text-zinc-400">
          <a href="#" className="hover:text-white transition-colors">About</a>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>

        {/* Right Side: Social Media Icons */}
        <div className="flex items-center gap-x-4">
          <a href="#" aria-label="Twitter" className="text-zinc-500 hover:text-white transition-colors">
            <Twitter className="w-5 h-5" />
          </a>
          <a href="#" aria-label="LinkedIn" className="text-zinc-500 hover:text-white transition-colors">
            <Linkedin className="w-5 h-5" />
          </a>
        </div>
      </div>
    </motion.footer>
  );
}