"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PlusIcon,
  BookTemplateIcon,
  HistoryIcon,
  MenuIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ArrowRightCircleIcon,
} from "lucide-react";

export default function DocsSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false); // full sidebar open/close (for sm)
  const [expanded, setExpanded] = useState(false); // lg+ sidebar expanded or collapsed

  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close sidebar on click outside (only for sm open)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        open &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Mobile toggle button (hamburger) */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-14 left-4 z-50 p-2 bg-zinc-800 text-white rounded-md lg:hidden focus:outline-none focus:ring-2 focus:ring-white"
        aria-label={open ? "Close sidebar" : "Open sidebar"}
      >
        {open ? <ArrowRightCircleIcon size={24} /> : <MenuIcon size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-full bg-zinc-900 border-r border-zinc-700 z-40
          transform transition-transform duration-1300 ease-in-out
          
          ${open ? "translate-x-0" : "-translate-x-full"}  // Mobile slide in/out

          lg:static lg:h-auto lg:flex lg:flex-col
          lg:translate-x-0
          ${expanded ? "w-64" : "w-14"}  // width changes on lg+
        `}
      >
        <div className="flex flex-col p-2 h-full">
          {/* Toggle expand/collapse on lg+ */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="hidden lg:flex items-center justify-center mb-6 p-2 rounded-md text-zinc-400 hover:text-white transition self-end"
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {expanded ? <ChevronLeftIcon size={20} /> : <ChevronRightIcon size={20} />}
          </button>

          {/* New Draft always visible */}
          <Link
            href="/docs/new"
            className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-zinc-800 cursor-pointer
              ${
                isActive("/docs/new")
                  ? "bg-zinc-700 text-white font-semibold"
                  : "text-zinc-300"
              }
              ${expanded ? "justify-start" : "justify-center"}
            `}
            onClick={() => {
              setOpen(false); // close mobile sidebar on click
            }}
          >
            <PlusIcon size={20} />
            {expanded && <span>New Draft</span>}
          </Link>



          {/* Other links hidden when collapsed */}
          <div className={`${expanded ? "block mt-6" : "hidden"}`}>
            <Link
              href="/docs"
              className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-zinc-800 cursor-pointer
                ${
                  isActive("/docs")
                    ? "bg-zinc-700 text-white font-semibold"
                    : "text-zinc-400"
                }
              `}
              onClick={() => setOpen(false)}
            >
              <BookTemplateIcon size={20} />
              <span>Browse Templates</span>
            </Link>
            <Link
              href="/docs/draft/history"
              className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-zinc-800 cursor-pointer
                ${
                  isActive("/docs/draft/history")
                    ? "bg-zinc-700 text-white font-semibold"
                    : "text-zinc-400"
                }
              `}
              onClick={() => setOpen(false)}
            >
              <HistoryIcon size={20} />
              <span>Draft History</span>
            </Link>

            {/* Recent drafts */}
            <div className="mt-6 px-3 text-zinc-400 text-sm">
              <h3 className="mb-2 font-semibold text-zinc-200">Recent Drafts</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/docs/payment-reminder"
                    className="block hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    Payment Reminder Notice
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs/termination-notice"
                    className="block hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    Termination Notice
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs/legal-demand-notice"
                    className="block hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    Legal Demand Notice
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay behind sidebar on mobile */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"></div>
      )}
    </>
  );
}
