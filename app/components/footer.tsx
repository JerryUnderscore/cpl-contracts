// app/components/footer.tsx
import * as React from "react";

export default function Footer() {
  const correctionsUrl = process.env.NEXT_PUBLIC_CORRECTIONS_FORM_URL;

  return (
    <footer
      style={{
        borderTop: "1px solid #eee",
        marginTop: "2rem",
        padding: "1.25rem 1rem",
        color: "#444",
      }}
    >
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        {/* Top row: navigation + copyright */}
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
            <a href="/players" style={{ textDecoration: "none", color: "#1d4ed8" }}>
              Players
            </a>
            <a href="/clubs" style={{ textDecoration: "none", color: "#1d4ed8" }}>
              Clubs
            </a>
            <a href="/about" style={{ textDecoration: "none", color: "#1d4ed8" }}>
              About
            </a>

            {correctionsUrl ? (
              <a
                href={correctionsUrl}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "none", color: "#1d4ed8" }}
              >
                Submit a correction
              </a>
            ) : null}

            <a href="mailto:wurnig@gmail.com" style={{ textDecoration: "none", color: "#1d4ed8" }}>
              Contact
            </a>
          </div>

          <div style={{ fontSize: "0.9rem", color: "#666" }}>
            © {new Date().getFullYear()} CPL Contracts
          </div>
        </div>

        {/* Disclaimer */}
        <p style={{ margin: 0, lineHeight: 1.5, fontSize: "0.95rem" }}>
          CPL Contracts is an independent, community-run project and is not affiliated with the Canadian Premier League
          (CPL) or any of its clubs. Team names, logos, and other trademarks are the property of their respective owners.
          If you are a trademark owner and would like something removed, please{" "}
          <a href="mailto:wurnig@gmail.com" style={{ color: "#1d4ed8" }}>
            contact us
          </a>
          .
        </p>
      </div>
    </footer>
  );
}