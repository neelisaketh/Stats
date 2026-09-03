"use client";

import Link from "next/link";
import { BarChart3, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useProgress } from "./progress-provider";

const nav = [
  { href: "/learn", label: "Course" },
  { href: "/lab", label: "Normal lab" },
  { href: "/reference", label: "Test guide" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, signOut, loading } = useProgress();

  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link className="brand" href="/" aria-label="Statlab home">
          <span className="brand-mark"><BarChart3 size={19} strokeWidth={2.4} /></span>
          <span>statlab</span>
        </Link>

        <button
          className="menu-button"
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>

        <nav className={open ? "nav-links nav-open" : "nav-links"} aria-label="Main navigation">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname.startsWith(item.href) ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {!loading && (user ? (
            <button className="nav-account" type="button" onClick={() => void signOut()}>
              <span>{user.email?.split("@")[0]}</span>
              <LogOut size={16} aria-label="Sign out" />
            </button>
          ) : (
            <Link className="nav-sign-in" href="/auth" onClick={() => setOpen(false)}>Sign in</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
