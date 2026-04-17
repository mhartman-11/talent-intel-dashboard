import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "./_components/Nav";
import { getSnapshot } from "@/lib/data";

export const metadata: Metadata = {
  title: "Talent Intel | US Labor Market Intelligence",
  description:
    "Real-time US talent market intelligence: layoffs, hiring velocity, executive moves, compensation trends, and macroeconomic labor data — sourced from public APIs and freely available data.",
  openGraph: {
    title: "Talent Intel Dashboard",
    description: "Free, real-time US talent market intelligence for TA professionals.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const snapshot = getSnapshot();

  return (
    <html lang="en">
      <body className="bg-void text-white antialiased">
        {/* SVG filter for kinetic blur — must live in body, not head */}
        <svg
          style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
          aria-hidden="true"
        >
          <defs>
            <filter id="kinetic-blur">
              <feGaussianBlur stdDeviation="4 0" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
        </svg>
        <Nav snapshot={snapshot} />
        <main>{children}</main>
      </body>
    </html>
  );
}
