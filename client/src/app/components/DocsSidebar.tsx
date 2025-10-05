"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PlusIcon,
  BookTemplateIcon,
  HistoryIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "lucide-react";

export default function DocsSidebar() {
  const pathname = usePathname();

  // collapsed by default on small screens
  const [expanded, setExpanded] = useState(true);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  // Detect screen size on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setExpanded(false);
    }
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <aside
      ref={sidebarRef}
      className={`
        fixed top-0 left-0 h-full z-40 pt-18
        lg:static lg:h-auto
        transition-all duration-300 ease-in-out
        ${expanded ? "w-64" : "w-16"}

        bg-white text-zinc-900 border-r border-zinc-200
        dark:bg-stone-900 dark:text-stone-100 dark:border-stone-700
      `}
    >
      <div className="flex flex-col h-full p-3">
        {/* Toggle expand/collapse */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setExpanded((s) => !s)}
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
            className="p-1 rounded-md text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition"
          >
            {expanded ? (
              <ChevronLeftIcon size={20} />
            ) : (
              <ChevronRightIcon size={20} />
            )}
          </button>
        </div>

        {/* Content */}
        <nav className="flex-1">
          {/* New Draft always visible */}
          <div className="mb-2">
            <Link
              href="/docs/new"
              className={`
                flex items-center gap-3 px-2 py-2 rounded-md transition-colors
                ${
                  isActive("/docs/new")
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold"
                    : "text-zinc-700 dark:text-zinc-200"
                }
                hover:bg-zinc-50 dark:hover:bg-zinc-800
                ${expanded ? "justify-start" : "justify-center"}
              `}
            >
              <PlusIcon size={18} />
              {expanded && <span>New Draft</span>}
            </Link>
          </div>

          {/* Expand-only links */}
          <div className={`${expanded ? "block mt-4" : "hidden"}`}>
            <Link
              href="/docs"
              className={`
                flex items-center gap-3 px-2 py-2 rounded-md transition-colors
                ${
                  isActive("/docs")
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold"
                    : "text-zinc-700 dark:text-zinc-200"
                }
                hover:bg-zinc-50 dark:hover:bg-zinc-800
              `}
            >
              <BookTemplateIcon size={18} />
              <span>Browse Templates</span>
            </Link>

            <Link
              href="/docs/history"
              className={`
                flex items-center gap-3 px-2 py-2 rounded-md mt-1 transition-colors
                ${
                  isActive("/docs/history")
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold"
                    : "text-zinc-700 dark:text-zinc-200"
                }
                hover:bg-zinc-50 dark:hover:bg-zinc-800
              `}
            >
              <HistoryIcon size={18} />
              <span>Draft History</span>
            </Link>

            {/* Recent drafts */}
            <div className="mt-6 px-2 text-zinc-500 dark:text-zinc-400 text-sm">
              <h3 className="mb-2 font-semibold text-zinc-700 dark:text-zinc-200">
                Recent Drafts
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/docs/payment-reminder"
                    className="block hover:text-zinc-900 dark:hover:text-white"
                  >
                    Payment Reminder Notice
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs/termination-notice"
                    className="block hover:text-zinc-900 dark:hover:text-white"
                  >
                    Termination Notice
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs/legal-demand-notice"
                    className="block hover:text-zinc-900 dark:hover:text-white"
                  >
                    Legal Demand Notice
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}
