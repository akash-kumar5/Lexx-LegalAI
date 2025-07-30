"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import Navbar from "./Navbar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token && pathname !== "/auth" && pathname !== "/") {
      router.replace("/auth");
    } else {
      setLoading(false);
    }

    if (token && pathname == "/auth") {
      router.replace("/");
    }
  }, [token, pathname, router]);

  if (loading) {
    return null; // or a nice spinner maybe
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 overflow-y-auto py-0">
        {children}
      </main>
    </>
  );
}
