"use client";

import Link from "next/link";
import React, { useState, forwardRef, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext"; // adjust path if needed
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";

type UserType = {
  fullName?: string;
  profilePictureUrl?: string;
};

interface AuthContextType {
  token: string | null;
  logout: () => void;
  user: UserType | null;
}

const navItems = [
  { href: "/chat", label: "Chat" },
  { href: "/docs", label: "Docs" },
  { href: "/casematching", label: "Case-Matching" },
];

const useClickOutside = (
  refs: React.RefObject<Element>[],
  handler: (event: MouseEvent | TouchEvent) => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (refs.some((ref) => ref.current?.contains(event.target as Node)))
        return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [refs, handler]);
};

type NavLinksProps = { onLinkClick?: () => void };

const NavLinks = ({ onLinkClick }: NavLinksProps) => (
  <>
    {navItems.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        onClick={onLinkClick}
        className="hover:text-red-400 transition-colors duration-300 px-4 py-2 text-center md:text-left"
      >
        {item.label}
      </Link>
    ))}
  </>
);

type ProfileMenuProps = {
  user: UserType | null;
  logout: () => void;
  onClose: () => void;
};

const ProfileMenu = forwardRef<HTMLDivElement, ProfileMenuProps>(
  ({ user, logout, onClose }, ref) => {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const handleLogout = () => {
      logout();
      onClose();
    };

    // avoid rendering theme-dependent UI until mounted to prevent hydration mismatch
    if (!mounted) {
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.12 }}
          className="absolute right-0 mt-2 w-56 origin-top-right bg-white border border-zinc-200 rounded-md shadow-lg z-50 dark:bg-stone-900 dark:border-stone-700"
        >
          <div className="px-4 py-3 text-sm text-zinc-500 border-b border-zinc-100 dark:border-stone-700">
            <p>Signed in as</p>
            <p className="font-medium text-zinc-900 truncate dark:text-stone-200">
              User
            </p>
          </div>
          <div className="py-1">
            {/* simple placeholders until mounted */}
            <div className="px-4 py-2 text-sm text-zinc-700 dark:text-stone-200">
              Loading…
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: -10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.12 }}
        className="absolute right-0 mt-2 w-56 origin-top-right bg-white border border-zinc-200 rounded-md shadow-lg z-50 dark:bg-stone-900 dark:border-stone-700"
      >
        <div className="px-4 py-3 text-sm text-zinc-600 border-b border-zinc-100 dark:text-stone-400 dark:border-stone-700">
          <p>Signed in as</p>
          <p className="font-medium text-zinc-900 truncate dark:text-stone-200">
            {user?.fullName || "User"}
          </p>
        </div>

        <div className="py-1">
          <Link
            href="/profile"
            onClick={onClose}
            className="flex items-center w-full text-left px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-100 transition-colors dark:text-stone-200 dark:hover:bg-stone-800"
          >
            <User className="w-4 h-4 mr-3" />
            Your Profile
          </Link>

          <button
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            className="flex items-center w-full text-left px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-100 transition-colors dark:text-stone-200 dark:hover:bg-stone-800"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="w-4 h-4 mr-3" />
            ) : (
              <Moon className="w-4 h-4 mr-3" />
            )}
            <span>
              Switch to {resolvedTheme === "dark" ? "Light" : "Dark"} Mode
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-zinc-100 transition-colors dark:hover:bg-stone-800"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </button>
        </div>
      </motion.div>
    );
  }
);
ProfileMenu.displayName = "ProfileMenu";

export default function Navbar() {
  const { token, logout, user } = useAuth() as AuthContextType;

  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);

  const mobileMenuRef = React.createRef<HTMLDivElement>();
  const mobileMenuButtonRef = React.createRef<HTMLButtonElement>();
  const profileMenuRef = React.createRef<HTMLDivElement>();
  const profileButtonRef = React.createRef<HTMLButtonElement>();

  useClickOutside(
    [
      mobileMenuRef as React.RefObject<Element>,
      mobileMenuButtonRef as React.RefObject<Element>,
    ],
    () => {
      if (isMobileMenuOpen) setMobileMenuOpen(false);
    }
  );

  useClickOutside(
    [
      profileMenuRef as React.RefObject<Element>,
      profileButtonRef as React.RefObject<Element>,
    ],
    () => {
      if (isProfileMenuOpen) setProfileMenuOpen(false);
    }
  );

  const toggleMobileMenu = () => {
    setProfileMenuOpen(false);
    setMobileMenuOpen((p) => !p);
  };

  const toggleProfileMenu = () => {
    setMobileMenuOpen(false);
    setProfileMenuOpen((p) => !p);
  };

  const closeAllMenus = () => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  };

  return (
    <nav
      className={`
    sticky top-0 z-50 mx-auto w-full max-w-[97%] md:max-w-[96%] mt-2
    backdrop-blur-md border text-zinc-900 dark:text-stone-100 shadow-lg rounded-full
    /* Light mode gradient */
    bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-100 border-zinc-400
    /* Dark mode gradient */
    dark:bg-gradient-to-r dark:from-black/20 dark:via-zinc-800 dark:to-black/20 dark:border-stone-700
  `}
    >
      <div className="mx-auto flex max-w-[95%] items-center justify-between py-3">
        <Link
          href="/"
          onClick={closeAllMenus}
          className="text-xl font-bold tracking-tight"
        >
          <span className="text-black dark:text-white">Lexx</span>
        </Link>

        <div className="hidden md:flex items-center space-x-2 text-sm font-medium">
          <NavLinks onLinkClick={closeAllMenus} />
        </div>

        <div className="flex items-center space-x-4">
          {token ? (
            <div className="relative">
              <motion.button
                ref={profileButtonRef}
                onClick={toggleProfileMenu}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-zinc-300 hover:border-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-stone-900"
                aria-label="Toggle profile menu"
                aria-expanded={isProfileMenuOpen}
              >
                <Image
                  src={user?.profilePictureUrl || "/default-avatar.png"}
                  width={40}
                  height={40}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
                />
              </motion.button>

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <ProfileMenu
                    ref={profileMenuRef as React.RefObject<HTMLDivElement>}
                    user={user}
                    logout={logout}
                    onClose={closeAllMenus}
                  />
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden md:block">
              <Link
                href="/auth"
                className="text-sm font-medium hover:text-red-400 transition-colors duration-300"
              >
                Login
              </Link>
            </div>
          )}

          <div className="md:hidden flex items-center">
            <button
              ref={mobileMenuButtonRef}
              onClick={toggleMobileMenu}
              className="text-zinc-900 dark:text-stone-100"
              aria-label="Toggle mobile navigation"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef as React.RefObject<HTMLDivElement>}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
          >
            <div className="flex flex-col items-center space-y-2 py-4 border-t border-zinc-200 dark:border-stone-700">
              <NavLinks onLinkClick={closeAllMenus} />
              {!token && (
                <Link
                  href="/auth"
                  onClick={closeAllMenus}
                  className="px-4 py-2 w-full text-center hover:text-red-400 transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
