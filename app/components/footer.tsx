// app/components/Footer.tsx
import * as React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: "2rem",
        padding: "1.25rem 1rem",
        borderTop: "1px solid #eee",
        color: "#444",
        lineHeight: 1.5,
        fontSize: "0.9rem",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ margin: 0 }}>
          CPL Contracts is an independent, community-run project and not affiliated with the
          Canadian Premier League (CPL) or any of its clubs. The CPL logo, team logos, team names,
          and other trademarks are the property of their respective owners. If you are a trademark
          owner and would like something removed, please{" "}
          <a href="mailto:wurnig@gmail.com" style={{ color: "inherit" }}>
            contact us
          </a>
          .
        </p>
      </div>
    </footer>
  );
}