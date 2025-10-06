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

/**
 * Breakpoints (Tailwind defaults):
 * sm: 640px, md: 768px, lg: 1024px
 * We collapse by default below lg, expand by default at/above lg.
 */
const LG_WIDTH = 1024;

export default function DocsSidebar() {
  const pathname = usePathname();

  // null until we know the viewport; avoids hydration mismatch
  const [expanded, setExpanded] = useState<boolean | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  // Initialize + keep in sync with resize
  useEffect(() => {
    const decide = () => setExpanded(window.innerWidth >= LG_WIDTH);
    decide();
    window.addEventListener("resize", decide);
    return () => window.removeEventListener("resize", decide);
  }, []);

  const isActive = (path: string) => pathname === path;

  // Until we know screen size, render nothing to avoid flicker/mismatch
  if (expanded === null) return null;

  return (
    <>
      {/* When collapsed on small screens, show a tiny floating toggle so users can open the sidebar */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          aria-label="Open sidebar"
          className="
            fixed top-20 left-2 z-50
            flex h-8 w-8 items-center justify-center
            rounded-md border
            bg-white text-zinc-700
            hover:bg-zinc-50 hover:text-zinc-900
            border-zinc-200
            dark:bg-stone-900 dark:text-stone-200 dark:border-stone-700 dark:hover:bg-stone-800
            lg:hidden
          "
        >
          <ChevronRightIcon size={18} />
        </button>
      )}

      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 z-40 pt-18 h-full
          transition-[width,transform] duration-300 ease-in-out
          bg-white text-zinc-900 border-r border-zinc-200
          dark:bg-stone-900 dark:text-stone-100 dark:border-stone-700

          /* Small/medium: slide in/out */
          ${expanded ? "translate-x-0 w-56" : "-translate-x-full w-56"}
          /* Large and up: never slide, just shrink to rail */
          lg:translate-x-0 lg:${expanded ? "w-64" : "w-16"}
        `}
      >
        <div className="flex h-full flex-col p-3">
          {/* Toggle expand/collapse */}
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setExpanded((s) => !s)}
              aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
              className="
                p-1 rounded-md transition
                text-zinc-600 hover:text-zinc-900
                dark:text-zinc-400 dark:hover:text-white
              "
            >
              {expanded ? <ChevronLeftIcon size={20} /> : <ChevronRightIcon size={20} />}
            </button>
          </div>

          {/* Content */}
          <nav className="flex-1">
            {/* New Draft (always present; label hidden when rail) */}
            <div className="mb-2">
              <Link
                href="/docs/new"
                className={`
                  flex items-center gap-3 px-2 py-2 rounded-md transition-colors
                  ${isActive("/docs/new")
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold"
                    : "text-zinc-700 dark:text-zinc-200"}
                  hover:bg-zinc-50 dark:hover:bg-zinc-800
                  ${expanded ? "justify-start" : "justify-center"}
                `}
              >
                <PlusIcon size={18} />
                {expanded && <span>New Draft</span>}
              </Link>
            </div>

            {/* Expand-only links */}
            <div className={`${expanded ? "block mt-4" : "hidden lg:block"}`}>
              <Link
                href="/docs"
                className={`
                  flex items-center gap-3 px-2 py-2 rounded-md transition-colors
                  ${isActive("/docs")
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold"
                    : "text-zinc-700 dark:text-zinc-200"}
                  hover:bg-zinc-50 dark:hover:bg-zinc-800
                `}
              >
                <BookTemplateIcon size={18} />
                {expanded && <span>Browse Templates</span>}
              </Link>

              <Link
                href="/docs/history"
                className={`
                  mt-1 flex items-center gap-3 px-2 py-2 rounded-md transition-colors
                  ${isActive("/docs/history")
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold"
                    : "text-zinc-700 dark:text-zinc-200"}
                  hover:bg-zinc-50 dark:hover:bg-zinc-800
                `}
              >
                <HistoryIcon size={18} />
                {expanded && <span>Draft History</span>}
              </Link>

              {/* Recent drafts (labels only when expanded) */}
              {expanded && (
                <div className="mt-6 px-2 text-sm text-zinc-500 dark:text-zinc-400">
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
              )}
            </div>
          </nav>
        </div>
      </aside>

      {/* Dim overlay for small screens when sidebar is open */}
      <div
        className={`
          fixed inset-0 z-30 bg-black/40
          ${expanded ? "opacity-100" : "opacity-0 pointer-events-none"}
          transition-opacity duration-300
          lg:hidden
        `}
        onClick={() => setExpanded(false)}
        aria-hidden
      />
    </>
  );
}
