"use client";

import Link from "next/link";
import React, { useState, useRef, forwardRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, MoonIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";

// Nav links data
const navItems = [
  { href: "/chat", label: "Chat" },
  { href: "/docs", label: "Docs" },
  { href: "/casematching", label: "Case-Matching" },
];

// Reusable outside click hook
interface ClickOutsideHandler {
  (event: MouseEvent): void;
}

const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: ClickOutsideHandler
): void => {
  React.useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
};

// NavLinks component for desktop/mobile menu
type NavLinksProps = {
  onLinkClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

function NavLinks({ onLinkClick }: NavLinksProps) {
  return (
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
}

// ProfileMenu component (dropdown)
type ProfileMenuProps = {
  user: {
    fullName?: string;
    profilePictureUrl?: string;
  } | null;
  logout: () => void;
  onClose: () => void;
};

const ProfileMenu = forwardRef<HTMLDivElement, ProfileMenuProps>(({ user, logout, onClose }, ref) => {
  const { theme, setTheme } = useTheme();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className="absolute right-0 mt-2 w-48 origin-top-right bg-stone-900 border border-stone-700 rounded-md shadow-lg"
    >
      <div className="px-4 py-2 text-sm text-stone-400 border-b border-stone-700">
        Signed in as
        <br />
        <span className="font-medium text-stone-200">{user?.fullName || "User"}</span>
      </div>
      <div className="py-1">
        <Link
          href="/profile"
          onClick={onClose}
          className="flex items-center w-full text-left px-4 py-2 text-sm text-stone-200 hover:bg-stone-800 transition-colors"
        >
          <User className="w-4 h-4 mr-2" />
          Your Profile
        </Link>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-stone-800 transition-colors"
        >
          <MoonIcon className="w-4 h-4 mr-2" />
          Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
        </button>
        <button
          onClick={logout}
          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-stone-800 transition-colors"
        >
          <X className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>
    </motion.div>
  );
});
ProfileMenu.displayName = "ProfileMenu";


export default function Navbar() {
  type UserType = {
    fullName?: string;
    profilePictureUrl?: string;
  };

  const { token, logout, user } = useAuth() as {
    token: string | null;
    logout: () => void;
    user: UserType | null;
  };

  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(mobileMenuRef, () => setMobileMenuOpen(false));
  useClickOutside(profileMenuRef, () => setProfileMenuOpen(false));

  const toggleProfileMenu = () => setProfileMenuOpen((v) => !v);
  const toggleMobileMenu = () => setMobileMenuOpen((v) => !v);

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 mx-auto w-full max-w-[97%] md:max-w-[96%] mt-2 bg-stone-900/40 backdrop-blur-md border border-stone-800 text-stone-100 shadow-lg rounded-full">
      <div className="mx-auto flex max-w-[95%] items-center justify-between py-3">
        <Link href="/" className="text-xl font-bold tracking-tight text-white">
          Lexx
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center space-x-2 text-sm font-medium">
          <NavLinks onLinkClick={closeMenus} />
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex relative">
            {token ? (
              <>
                <motion.button
                  onClick={toggleProfileMenu}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 rounded-full overflow-hidden border-2 border-stone-600 hover:border-red-500 transition-colors"
                >
                  <Image
                    src={user?.profilePictureUrl || "/default-avatar.png"}
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
                      onClose={() => setProfileMenuOpen(false)}
                    />
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Link
                href="/auth"
                className="text-sm font-medium hover:text-red-400 transition-colors duration-300"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu & Profile */}
          <div className="md:hidden flex items-center space-x-3">
            <button
              onClick={toggleMobileMenu}
              className="text-stone-200"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            {token && (
              <div className="relative">
                <motion.button
                  onClick={toggleProfileMenu}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 rounded-full overflow-hidden border-2 border-stone-600 hover:border-red-500 transition-colors"
                  aria-label="Profile menu"
                >
                  <Image
                    src={user?.profilePictureUrl || "/default-avatar.png"}
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
                      logout={() => {
                        logout();
                        closeMenus();
                      }}
                      onClose={closeMenus}
                    />
                  )}
                </AnimatePresence>
              </div>
            )}
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
              <NavLinks onLinkClick={closeMenus} />
              {!token && (
                <Link
                  href="/auth"
                  onClick={closeMenus}
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