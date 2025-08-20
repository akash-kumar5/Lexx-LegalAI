"use client";

import Link from "next/link";
import React, { useState, useRef, forwardRef, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext"; // Assuming path is correct
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, MoonIcon, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";

// Define a proper type for the user object to be used across components
type UserType = {
  fullName?: string;
  profilePictureUrl?: string;
};

// Define the type for the AuthContext value to avoid using 'as'
interface AuthContextType {
  token: string | null;
  logout: () => void;
  user: UserType | null;
}

// Nav links data remains the same
const navItems = [
  { href: "/chat", label: "Chat" },
  { href: "/docs", label: "Docs" },
  { href: "/casematching", label: "Case-Matching" },
];

// Generic click outside hook (Correctly implemented)
const useClickOutside = (
  refs: React.RefObject<HTMLElement>[],
  handler: (event: MouseEvent | TouchEvent) => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // Do nothing if clicking one of the ref's elements or descendent elements
      if (refs.some((ref) => ref.current?.contains(event.target as Node))) {
        return;
      }
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

// NavLinks component (Unchanged, but benefits from better props)
type NavLinksProps = {
  onLinkClick?: () => void;
};

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

// ProfileMenu component (Refactored slightly for clarity)
type ProfileMenuProps = {
  user: UserType | null;
  logout: () => void;
  onClose: () => void;
};

const ProfileMenu = forwardRef<HTMLDivElement, ProfileMenuProps>(
  ({ user, logout, onClose }, ref) => {
    const { theme, setTheme } = useTheme();

    const handleLogout = () => {
      logout();
      onClose(); // Ensure menu closes on logout
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className="absolute right-0 mt-2 w-56 origin-top-right bg-stone-900 border border-stone-700 rounded-md shadow-lg z-50"
      >
        <div className="px-4 py-3 text-sm text-stone-400 border-b border-stone-700">
          <p>Signed in as</p>
          <p className="font-medium text-stone-200 truncate">
            {user?.fullName || "User"}
          </p>
        </div>
        <div className="py-1">
          <Link
            href="/profile"
            onClick={onClose}
            className="flex items-center w-full text-left px-4 py-2 text-sm text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <User className="w-4 h-4 mr-3" />
            Your Profile
          </Link>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center w-full text-left px-4 py-2 text-sm text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <MoonIcon className="w-4 h-4 mr-3" />
            <span>
              Switch to {theme === "dark" ? "Light" : "Dark"} Mode
            </span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-stone-800 transition-colors"
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

// Navbar component
export default function Navbar() {
  const { token, logout, user } = useAuth() as AuthContextType;

  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);

  // REFS: Use separate refs for each interactive element to avoid conflicts.
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null); // Only one ref needed now

  // BUG FIX: Separate click-outside hooks for each menu.
  // This prevents one menu from interfering with the other.
  useClickOutside([mobileMenuRef, mobileMenuButtonRef], () => {
    if (isMobileMenuOpen) setMobileMenuOpen(false);
  });

  useClickOutside([profileMenuRef, profileButtonRef], () => {
    if (isProfileMenuOpen) setProfileMenuOpen(false);
  });

  const toggleMobileMenu = () => {
    setProfileMenuOpen(false); // Close profile menu when opening mobile menu
    setMobileMenuOpen((prev) => !prev);
  };

  const toggleProfileMenu = () => {
    setMobileMenuOpen(false); // Close mobile menu when opening profile menu
    setProfileMenuOpen((prev) => !prev);
  };

  const closeAllMenus = () => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 mx-auto w-full max-w-[97%] md:max-w-[96%] mt-2 bg-stone-900/40 backdrop-blur-md border border-stone-800 text-stone-100 shadow-lg rounded-full">
      <div className="mx-auto flex max-w-[95%] items-center justify-between py-3">
        <Link href="/" onClick={closeAllMenus} className="text-xl font-bold tracking-tight text-white">
          Lexx
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center space-x-2 text-sm font-medium">
          <NavLinks onLinkClick={closeAllMenus} />
        </div>

        {/* Auth and Menu Toggles */}
        <div className="flex items-center space-x-4">
          {token ? (
            <div className="relative">
              <motion.button
                ref={profileButtonRef}
                onClick={toggleProfileMenu}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-stone-600 hover:border-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-stone-900"
                aria-label="Toggle profile menu"
                aria-expanded={isProfileMenuOpen}
              >
                <Image
                  src={user?.profilePictureUrl || "/default-avatar.png"}
                  width={40} // Increased size for better quality
                  height={40}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
                />
              </motion.button>
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <ProfileMenu
                    ref={profileMenuRef}
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

          {/* Mobile Menu Burger */}
          <div className="md:hidden flex items-center">
            <button
              ref={mobileMenuButtonRef}
              onClick={toggleMobileMenu}
              className="text-stone-200"
              aria-label="Toggle mobile navigation"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav links */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
          >
            <div className="flex flex-col items-center space-y-2 py-4 border-t border-stone-800">
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