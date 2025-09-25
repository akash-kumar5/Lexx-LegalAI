"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

/** Types */
type LoadingContextType = {
  showLoading: (msg?: string) => void;
  hideLoading: () => void;
  isLoading: boolean;
  message?: string | null;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

/** Provider */
export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const showLoading = useCallback((msg?: string) => {
    setMessage(msg ?? null);
    setIsLoading(true);
  }, []);
  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setMessage(null);
  }, []);

  const value = useMemo(
    () => ({ showLoading, hideLoading, isLoading, message }),
    [showLoading, hideLoading, isLoading, message]
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <LoadingOverlay isOpen={isLoading} message={message} />
    </LoadingContext.Provider>
  );
}

/** Hook */
export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used within LoadingProvider");
  return ctx;
}

/** Overlay (portal) */
function LoadingOverlay({ isOpen, message }: { isOpen: boolean; message?: string | null }) {
  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-hidden={isOpen ? "false" : "true"}
        >
          {/* Backdrop (adapts to light/dark) */}
          <div
            aria-busy={true}
            className={`
              absolute inset-0
              bg-gradient-to-b from-white/60 to-white/30 dark:from-black/70 dark:to-black/90
              backdrop-blur-md
              transition-colors
            `}
          />

          {/* Card (adapts to light/dark) */}
          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.15 }}
            role="status"
            aria-live="polite"
            className={`
              relative z-10 flex flex-col items-center gap-4 rounded-xl px-6 py-5 shadow-2xl
              min-w-[240px] max-w-[420px]
              bg-white border border-zinc-200
              dark:bg-stone-900 dark:border-stone-700
            `}
          >
            {/* Spinner + text row */}
            <div className="flex items-center gap-3">
              {/* SVG spinner: stroke colors adapt */}
              <svg
                className="h-8 w-8 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeOpacity="0.12"
                  strokeWidth="4"
                  className="text-zinc-400 dark:text-zinc-700"
                />
                <path
                  d="M22 12a10 10 0 0 0-10-10"
                  stroke="url(#g1)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="g1" x1="0" x2="1">
                    <stop offset="0%" stopColor="#94a3b8" />
                    <stop offset="100%" stopColor="#0b0b0b" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="text-left">
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Working on it…</div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  {message ?? "This might take a few seconds."}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
