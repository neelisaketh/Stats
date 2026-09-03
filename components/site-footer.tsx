import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <span className="footer-brand">statlab</span>
        <span>Built to make statistical thinking visible.</span>
      </div>
      <nav aria-label="Footer navigation">
        <Link href="/learn">Course</Link>
        <Link href="/lab">Lab</Link>
        <Link href="/reference">Reference</Link>
      </nav>
    </footer>
  );
}
