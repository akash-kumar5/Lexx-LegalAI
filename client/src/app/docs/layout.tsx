// app/docs/layout.tsx
"use client";

import React from "react";
import DocsSidebar from "../components/DocsSidebar";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* Sidebar stays fixed */}
      <DocsSidebar />

      {/* Main content area */}
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
