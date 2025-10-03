// components/ClientProviders.tsx
"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "../../../context/AuthContext";
import { LoadingProvider } from "./Loading"; // adjust path if needed

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <AuthProvider>
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
