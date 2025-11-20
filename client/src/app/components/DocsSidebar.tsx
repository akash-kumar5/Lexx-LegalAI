"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PlusIcon,
  BookTemplateIcon,
  HistoryIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "lucide-react";

const LG_WIDTH = 1024;

type Props = {
  expanded: boolean | null;
  setExpanded: React.Dispatch<React.SetStateAction<boolean | null>>;
};

export default function DocsSidebar({ expanded, setExpanded }: Props) {
  const pathname = usePathname();

  // null until we know the viewport; avoids hydration mismatch (Docs manages this)
  const expandedState = expanded;

  const sidebarRef = useRef<HTMLDivElement | null>(null);

  // Close on ESC (mobile especially)
  useEffect(() => {
    if (expandedState === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && window.innerWidth < LG_WIDTH) {
        setExpanded(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expandedState, setExpanded]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (expandedState === null) return;
    const isMobile = window.innerWidth < LG_WIDTH;
    if (isMobile && expandedState) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [expandedState]);

  const isActive = (path: string) => pathname === path;

  // Until we know screen size, render nothing to avoid flicker/mismatch
  if (expandedState === null) return null;

  const expandedWide = !!expandedState; // readability

  return (
    <>
      {/* MOBILE: floating opener */}
      {!expandedWide && (
        <button
          onClick={() => setExpanded(true)}
          aria-label="Open sidebar"
          className="
            fixed top-18 left-2 z-50 md:hidden
            h-9 w-9 rounded-full grid place-items-center
            ring-1 ring-zinc-300 bg-white/90 text-zinc-700 backdrop-blur hover:bg-white
            dark:ring-zinc-600 dark:bg-zinc-900/90 dark:text-zinc-200
          "
        >
          <ChevronRightIcon size={16} />
        </button>
      )}

      <aside
        ref={sidebarRef}
        aria-expanded={Boolean(expandedWide)}
        className={`
          fixed top-0 left-0 z-40 h-full pt-[72px]
          transition-[width,transform] duration-300 ease-in-out
          bg-white/75 text-zinc-900 border-r border-zinc-200 backdrop-blur-sm shadow-lg
          dark:bg-zinc-950/50 dark:text-zinc-100 dark:border-white/10

          ${expandedWide ? "translate-x-0 w-56" : "-translate-x-full w-56"}
          lg:translate-x-0 ${expandedWide ? "lg:w-64" : "lg:w-16"}
        `}
      >
        <div className="flex h-full flex-col p-3">
          {/* Toggle expand/collapse */}
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setExpanded((s) => !s)}
              aria-label={expandedWide ? "Collapse sidebar" : "Expand sidebar"}
              className="
                h-8 w-8 grid place-items-center rounded-full
                ring-1 ring-zinc-300 text-zinc-700 hover:bg-zinc-100
                dark:ring-zinc-600 dark:text-zinc-200 dark:hover:bg-white/5
              "
            >
              {expandedWide ? <ChevronLeftIcon size={18} /> : <ChevronRightIcon size={18} />}
            </button>
          </div>

          {/* Content */}
          <nav className="flex-1">
            <div className="mb-2">
              <Link
                href="/docs/new"
                className={`
                  flex items-center gap-3 px-2 py-2 rounded-md transition-colors
                  ${isActive("/docs/new")
                    ? "bg-zinc-100 text-zinc-900 ring-1 ring-zinc-200 dark:bg-white/10 dark:text-zinc-50 dark:ring-white/10"
                    : "text-zinc-800 dark:text-zinc-200"}
                  hover:bg-zinc-100/70 dark:hover:bg-white/5
                  ${expandedWide ? "justify-start" : "justify-center"}
                `}
              >
                <PlusIcon size={18} />
                {expandedWide && <span>New Draft</span>}
              </Link>
            </div>

            {/* Expand-only links */}
            <div className={`${expandedWide ? "block mt-4" : "hidden lg:block"}`}>
              <Link
                href="/docs"
                className={`
                  flex items-center gap-3 px-2 py-2 rounded-md transition-colors
                  ${isActive("/docs")
                    ? "bg-zinc-100 text-zinc-900 ring-1 ring-zinc-200 dark:bg-white/10 dark:text-zinc-50 dark:ring-white/10"
                    : "text-zinc-800 dark:text-zinc-200"}
                  hover:bg-zinc-100/70 dark:hover:bg-white/5
                `}
              >
                <BookTemplateIcon size={18} />
                {expandedWide && <span>Browse Templates</span>}
              </Link>

              <Link
                href="/docs/history"
                className={`
                  mt-1 flex items-center gap-3 px-2 py-2 rounded-md transition-colors
                  ${isActive("/docs/history")
                    ? "bg-zinc-100 text-zinc-900 ring-1 ring-zinc-200 dark:bg-white/10 dark:text-zinc-50 dark:ring-white/10"
                    : "text-zinc-800 dark:text-zinc-200"}
                  hover:bg-zinc-100/70 dark:hover:bg-white/5
                `}
              >
                <HistoryIcon size={18} />
                {expandedWide && <span>Draft History</span>}
              </Link>

              {/* Recent drafts (labels only when expanded) */}
              {expandedWide && (
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
          fixed inset-0 z-30 bg-black/40 backdrop-blur-sm
          ${expandedWide ? "opacity-100" : "opacity-0 pointer-events-none"}
          transition-opacity duration-300
          lg:hidden
        `}
        onClick={() => setExpanded(false)}
        aria-hidden
      />
    </>
  );
}
