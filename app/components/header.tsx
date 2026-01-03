// app/components/header.tsx
import * as React from "react";
import ClubMenu from "./club-menu";

type ClubNavItem = {
  slug: string;
  name: string;
  navLabel: string;
  logoFile: string;
};

export default function Header({ clubs }: { clubs: ClubNavItem[] }) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "#ffffff",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <nav
        style={{
          maxWidth: 1300,
          margin: "0 auto",
          padding: "0.75rem 1rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <a
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6rem",
            flex: "0 0 auto",
          }}
        >
          <img src="/logo.png" alt="CPL Contracts" style={{ height: 44, width: "auto" }} />
        </a>

        <div
          className="clubNavDesktop"
          style={{
            marginLeft: "auto",
            gap: "1.1rem",
            flexWrap: "nowrap",
            alignItems: "center",
            justifyContent: "flex-end",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            whiteSpace: "nowrap",
            maxWidth: "100%",
            display: "flex",
          }}
        >
          {clubs.map((c) => (
            <a
              key={c.slug}
              href={`/clubs/${c.slug}`}
              title={c.name}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                fontWeight: 600,
                color: "#1d4ed8",
                whiteSpace: "nowrap",
                flex: "0 0 auto",
              }}
            >
              <img
                src={`/clubs/${c.logoFile}`}
                alt={`${c.name} logo`}
                style={{ height: 18, width: 18, objectFit: "contain", display: "block" }}
              />
              <span>{c.navLabel}</span>
            </a>
          ))}
        </div>

        <div className="clubNavMobile" style={{ marginLeft: "auto" }}>
          <ClubMenu clubs={clubs} />
        </div>
      </nav>
    </header>
  );
}