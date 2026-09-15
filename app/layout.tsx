import type { Metadata } from "next";
import { ProgressProvider } from "@/components/progress-provider";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Statwise — AP Statistics", template: "%s | Statwise" },
  description: "Learn AP Statistics with interactive lessons, original practice questions, and games.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ProgressProvider>
          <SiteHeader />
          {children}
        </ProgressProvider>
      </body>
    </html>
  );
}
