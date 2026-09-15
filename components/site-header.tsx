"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, LogOut } from "lucide-react";
import { useProgress } from "./progress-provider";

const links = [
  ["Learn", "/learn"], ["Practice", "/practice"], ["Normal curve", "/normal"], ["Games", "/games"],
];

export function SiteHeader() {
  const path = usePathname();
  const { user, signOut } = useProgress();
  return <header className="site-header"><div className="nav-wrap">
    <Link className="brand" href="/"><span><BarChart2 size={23} /></span>statwise</Link>
    <nav aria-label="Main navigation">{links.map(([label, href]) => <Link key={href} className={path === href ? "active" : ""} href={href}>{label}</Link>)}</nav>
    {user ? <button className="nav-account" onClick={() => void signOut()} title="Sign out"><span>{user.email?.split("@")[0]}</span><LogOut size={17} /></button> : <Link className="nav-signin" href="/auth">Sign in</Link>}
  </div></header>;
}
