import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings } from "lucide-react";

export default function Navbar() {
  const { token, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <nav className="sticky top-0 z-50 mx-auto w-[90%] px-4 bg-stone-900/40 backdrop-blur-md border-b border-stone-800 text-stone-100 shadow-sm rounded-full bg-gradient-to-r from-zinc-700/40 via-black/30 to-zinc-700/40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-xl font-bold tracking-tight text-white">
          Lexi
        </Link>
        <div className="flex items-center space-x-6 text-sm font-medium">
          <Link href="/chat" className="hover:text-red-400 transition">
            Chat
          </Link>
          <Link href="/docs" className="hover:text-red-400 transition">
            Docs
          </Link>
          <Link href="/casematching" className="hover:text-red-400 transition">
            Case-Matching
          </Link>
        </div>
        <div>
          {token ? (
            <>
              <motion.button
                onClick={() => setMenuOpen(!menuOpen)}
                whileHover={{ scale: 1.08}}
                animate={{ rotate: menuOpen ? 60 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="text-stone-200 hover:text-white-400"
              >
                <Settings size={22} />
              </motion.button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 0,x:-42 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 0,x:12 }}
                    className="absolute right-0 mt-2 w-40 bg-stone-900 border border-stone-700 rounded-md shadow-lg"
                  >
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-stone-200 hover:bg-stone-800 transition"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <Link href="/auth" className="hover:text-red-400 transition">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
