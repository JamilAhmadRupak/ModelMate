"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./Logo";

const NAV = [
  { href: "/tasks", label: "Tasks" },
  { href: "/models", label: "Models" },
  { href: "/discussions", label: "Community" },
];

export default function Header() {
  const { user, isLoggedIn, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    router.push("/auth/login");
  };

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);
  const navLinks = NAV.map(({ href, label }) => (
    <Link
      key={href}
      href={href}
      className={`rounded-full px-4 py-2 text-[15px] font-semibold transition-colors ${
        isActive(href) ? "bg-coral-50 text-coral-700" : "text-ink-700 hover:bg-cream-200 hover:text-ink-900"
      }`}
    >
      {label}
    </Link>
  ));

  return (
    <header className="sticky top-0 z-50 border-b border-cream-200 bg-page/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between">
          <Logo />

          <nav className="hidden md:flex items-center gap-1">{navLinks}</nav>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="animate-pulse bg-cream-200 h-10 w-28 rounded-full" />
            ) : isLoggedIn && user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-ink-700 hover:bg-cream-200 focus:outline-none"
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                >
                  <div className="w-8 h-8 bg-mint-100 text-mint-700 rounded-full flex items-center justify-center font-bold">
                    {user.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="hidden sm:block text-sm font-semibold">{user.username}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {menuOpen && (
                  <>
                    {/* Overlay to close menu */}
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-cream-300 bg-white py-1.5 shadow-lift z-50">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm font-medium text-ink-700 hover:bg-cream-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/profile/settings"
                        className="block px-4 py-2 text-sm font-medium text-ink-700 hover:bg-cream-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      <hr className="my-1 border-cream-200" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm font-medium text-coral-700 hover:bg-coral-50"
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="hidden sm:block rounded-full px-4 py-2 text-[15px] font-semibold text-ink-700 hover:bg-cream-200">
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-full bg-coral-500 px-5 py-2.5 text-[15px] font-semibold text-white transition hover:bg-coral-600"
                >
                  Join free
                </Link>
              </>
            )}
          </div>
        </div>

        <nav className="flex md:hidden items-center gap-1 overflow-x-auto pb-3 -mt-2">{navLinks}</nav>
      </div>
    </header>
  );
}
