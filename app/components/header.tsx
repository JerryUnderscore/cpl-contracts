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
        zIndex: 20,

        /* polish */
        background: "rgba(255, 255, 255, 0.88)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <nav
        style={{
          maxWidth: 1300,
          margin: "0 auto",

          /* 1) more breathing room */
          padding: "0.95rem 1.25rem",

          display: "flex",
          alignItems: "center",
          gap: "1.1rem",
        }}
      >
        {/* 2) slightly smaller logo */}
        <a
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            flex: "0 0 auto",
          }}
        >
          <img
            src="/logo.png"
            alt="CPL Contracts"
            style={{
              height: 38,
              width: "auto",
              display: "block",
            }}
          />
        </a>

        {/* Desktop club navigation */}
        <div
          className="clubNavDesktop"
          style={{
            marginLeft: "auto",
            gap: "1.05rem",
            flexWrap: "nowrap",
            alignItems: "center",
            justifyContent: "flex-end",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            whiteSpace: "nowrap",
            maxWidth: "100%",
            display: "flex",

            /* small visual refinement */
            padding: "0.15rem 0",
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
                padding: "0.25rem 0.25rem",
                borderRadius: 10,
              }}
            >
              <img
                src={`/clubs/${c.logoFile}`}
                alt={`${c.name} logo`}
                style={{
                  height: 18,
                  width: 18,
                  objectFit: "contain",
                  display: "block",
                }}
              />
              <span>{c.navLabel}</span>
            </a>
          ))}
        </div>

        {/* Mobile hamburger */}
        <div className="clubNavMobile" style={{ marginLeft: "auto" }}>
          <ClubMenu clubs={clubs} />
        </div>
      </nav>
    </header>
  );
}