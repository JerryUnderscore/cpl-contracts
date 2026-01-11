// app/components/club-menu.tsx
"use client";
/* eslint-disable @next/next/no-img-element */

import * as React from "react";
import Link from "next/link";
import styles from "./club-menu.module.css";

type ClubNavItem = {
  slug: string;
  name: string;
  navLabel: string;
  logoFile: string;
};

const buttonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.45rem 0.7rem",
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--text)",
  fontWeight: 650,
  cursor: "pointer",
  userSelect: "none",
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  zIndex: 9999,
  display: "flex",
  justifyContent: "flex-end",
};

const drawerStyle: React.CSSProperties = {
  width: "min(360px, 88vw)",
  height: "100%",
  background: "var(--bg)",
  borderLeft: "1px solid var(--border)",
  padding: "0.9rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

const listStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.35rem",
  overflowY: "auto",
  paddingRight: "0.25rem",
};

const itemStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.55rem",
  padding: "0.55rem 0.6rem",
  borderRadius: 12,
  border: "1px solid var(--borderSoft)",
  background: "var(--card)",
  color: "var(--link)",
  fontWeight: 650,
};

const closeButtonStyle: React.CSSProperties = {
  marginLeft: "auto",
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--text)",
  borderRadius: 10,
  padding: "0.35rem 0.55rem",
  cursor: "pointer",
  fontWeight: 750,
  lineHeight: 1,
};

export default function ClubMenu({ clubs }: { clubs: ClubNavItem[] }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={buttonStyle}
        className={styles.menuButton}
        aria-label="Open club menu"
      >
        <span aria-hidden="true" style={{ fontSize: "1.1rem", lineHeight: 1 }}>
          ☰
        </span>
        <span>Clubs</span>
      </button>

      {open ? (
        <div
          style={overlayStyle}
          role="dialog"
          aria-modal="true"
          aria-label="Club menu"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div style={drawerStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--text)" }}>Clubs</div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                style={closeButtonStyle}
                className={styles.menuButton}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div style={listStyle}>
              {clubs.map((c) => (
                <Link
                  key={c.slug}
                  href={`/clubs/${c.slug}`}
                  title={c.name}
                  style={itemStyle}
                  className={styles.menuItem}
                  onClick={() => setOpen(false)}
                >
                  {c.slug === "vancouver" ? (
  <>
    <img
      src="/clubs/vancouver.png"
      alt=""
      className="siteLogoLight clubBadgeSmall"
      loading="lazy"
    />
    <img
      src="/clubs/vancouver-dark.png"
      alt=""
      className="siteLogoDark clubBadgeSmall"
      loading="lazy"
    />
  </>
) : (
  <img
    src={`/clubs/${c.logoFile}`}
    alt=""
    className="clubBadgeSmall"
    loading="lazy"
  />
)}
                  <span>{c.navLabel}</span>
                </Link>
              ))}
            </div>

            <div style={{ marginTop: "auto", color: "var(--muted)", fontSize: "0.9rem" }}>
              Tip: tap outside the panel or press Esc to close.
            </div>

          </div>
        </div>
      ) : null}
    </>
  );
}
