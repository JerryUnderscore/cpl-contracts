// app/components/footer.tsx
import * as React from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Footer() {
  const correctionsUrl = process.env.NEXT_PUBLIC_CORRECTIONS_FORM_URL;

  return (
    <footer
      style={{
        borderTop: "1px solid var(--borderSoft)",
        marginTop: "2rem",
        padding: "1.25rem 1rem",
        color: "var(--text)",
      }}
    >
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        {/* Top row: navigation + (theme toggle + copyright) */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.75rem",
          }}
        >
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href="/players" style={{ textDecoration: "none", color: "var(--link)" }}>
              Players
            </Link>

            <Link href="/free-agents" style={{ textDecoration: "none", color: "var(--link)" }}>
              Free Agents
            </Link>

            <Link href="/clubs" style={{ textDecoration: "none", color: "var(--link)" }}>
              Clubs
            </Link>

            <Link href="/about" style={{ textDecoration: "none", color: "var(--link)" }}>
              About
            </Link>

            {correctionsUrl ? (
              <a
                href={correctionsUrl}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "none", color: "var(--link)" }}
              >
                Submit a correction
              </a>
            ) : null}

            <a href="mailto:wurnig@gmail.com" style={{ textDecoration: "none", color: "var(--link)" }}>
              Contact
            </a>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              flexShrink: 0,
            }}
          >
            <ThemeToggle />
            <div style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
              © {new Date().getFullYear()} CPL Contracts
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p style={{ margin: 0, lineHeight: 1.5, fontSize: "0.95rem", color: "var(--muted)" }}>
          CPL Contracts is an independent, community-run project and is not affiliated with the Canadian Premier League
          (CPL) or any of its clubs. Team names, logos, and other trademarks are the property of their respective owners.
          If you are a trademark owner and would like something removed, please{" "}
          <a href="mailto:wurnig@gmail.com" style={{ color: "var(--link)" }}>
            contact us
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
