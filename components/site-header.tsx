"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, LogOut } from "lucide-react";
import { useProgress } from "./progress-provider";
const links = [
  ["Learn", "/learn"],
  ["Practice", "/practice"],
  ["Normal curves", "/normal"],
  ["Games", "/games"],
];
export function SiteHeader() {
  const path = usePathname();
  const { user, signOut, isAdmin, profile, loading, error } = useProgress();
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <div className="nav-wrap">
          <Link className="brand" href="/">
            <span>
              <BarChart2 size={23} />
            </span>
            statwise
          </Link>
          <nav aria-label="Main navigation">
            {links.map(([label, href]) => (
              <Link
                key={href}
                className={path.startsWith(href) ? "active" : ""}
                aria-current={path.startsWith(href) ? "page" : undefined}
                href={href}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/progress"
              className={path === "/progress" ? "active" : ""}
            >
              My progress
            </Link>
            {isAdmin && (
              <Link href="/admin" className={path === "/admin" ? "active" : ""}>
                Administrator
              </Link>
            )}
          </nav>
          <div className="account-nav">
            {user ? (
              <>
                <Link href="/account" className="nav-signin">
                  My account
                </Link>
                <button
                  className="signout-button"
                  onClick={() => void signOut()}
                  aria-label="Sign out"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link className="nav-signin" href="/auth">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>
      {user &&
        !loading &&
        !profile &&
        !isAdmin &&
        path !== "/account" &&
        !path.startsWith("/auth") && (
          <div className="profile-banner">
            <Link href="/account">
              Add your grade, school year, and class period to post scores →
            </Link>
          </div>
        )}
      {error && (
        <div className="profile-banner" role="alert">
          {error}
        </div>
      )}
      <span id="main-content" tabIndex={-1} />
    </>
  );
}
