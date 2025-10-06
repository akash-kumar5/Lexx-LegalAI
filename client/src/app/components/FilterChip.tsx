import { Button } from "@/components/ui/button";
import {motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

const ChevronDownMini: React.FC<{ open: boolean }> = ({ open }) => (
  <svg
    className={`h-4 w-4 transition ${open ? "rotate-180" : "rotate-0"}`}
    viewBox="0 0 20 20"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
  </svg>
);

function FilterChip({
  label,
  value,
  onClear,
  children,
}: {
  label: string;
  value: React.ReactNode;
  onClear: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`
          group inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm
          bg-white hover:bg-zinc-50 border-zinc-200
          dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-700
        `}
      >
        <span className="text-zinc-700 dark:text-zinc-300">{label}:</span>
        <span className="max-w-[10rem] truncate text-zinc-900 dark:text-zinc-100">
          {value}
        </span>
        <ChevronDownMini open={open} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={`
              absolute z-10 mt-2 w-72 rounded-xl border p-3 shadow-xl
              bg-white border-zinc-200
              dark:bg-zinc-900 dark:border-zinc-700
            `}
          >
            <div className="space-y-3">
              {children}
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={onClear}>
                  <X className="mr-1 h-4 w-4" /> Clear
                </Button>
                <Button size="sm" onClick={() => setOpen(false)}>
                  Done
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FilterChip;