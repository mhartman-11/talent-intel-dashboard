"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { List, X } from "@phosphor-icons/react";
import { DataFreshnessChip } from "./DataFreshnessChip";
import type { Snapshot } from "@/lib/types";
import clsx from "clsx";

const NAV_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/intel/layoffs", label: "Layoffs" },
  { href: "/intel/hiring", label: "Hiring" },
  { href: "/intel/org-moves", label: "Org Moves" },
  { href: "/intel/comp", label: "Comp" },
  { href: "/intel/macro", label: "Macro" },
  { href: "/sources", label: "Sources" },
];

interface NavProps {
  snapshot: Snapshot;
}

export function Nav({ snapshot }: NavProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: "rgba(14,14,14,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span
            className="font-display font-black text-base tracking-tight"
            style={{ color: "#81ecff" }}
          >
            TALENT INTEL
          </span>
          <span
            className="hidden sm:inline label-overline"
            style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}
          >
            DASHBOARD
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                pathname === href
                  ? "text-white"
                  : "text-white/50 hover:text-white/80"
              )}
              style={
                pathname === href
                  ? { backgroundColor: "rgba(255,255,255,0.08)" }
                  : undefined
              }
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right: freshness chip + mobile toggle */}
        <div className="flex items-center gap-3">
          <DataFreshnessChip generatedAt={snapshot.generated_at} />
          <button
            className="md:hidden p-2 rounded-lg text-white/60 hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          className="md:hidden border-t px-4 py-3 flex flex-col gap-1"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={clsx(
                "px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                pathname === href
                  ? "text-white bg-white/8"
                  : "text-white/50 hover:text-white"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
