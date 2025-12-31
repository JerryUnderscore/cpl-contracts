// app/components/club-menu.tsx
"use client";

import * as React from "react";

type ClubNavItem = {
  slug: string;
  name: string;
  navLabel: string;
  logoFile: string;
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
    // prevent background scroll when drawer is open
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const buttonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.45rem 0.7rem",
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "#ffffff",
    fontWeight: 650,
    cursor: "pointer",
    userSelect: "none",
  };

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    zIndex: 9999,
    display: "flex",
    justifyContent: "flex-end",
  };

  const drawerStyle: React.CSSProperties = {
    width: "min(360px, 88vw)",
    height: "100%",
    background: "#ffffff",
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

  const linkStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.55rem",
    padding: "0.55rem 0.6rem",
    borderRadius: 10,
    border: "1px solid var(--borderSoft)",
    background: "#ffffff",
    fontWeight: 650,
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} style={buttonStyle} aria-label="Open menu">
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
            // click outside drawer closes
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div style={drawerStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>Clubs</div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  marginLeft: "auto",
                  border: "1px solid var(--border)",
                  background: "#ffffff",
                  borderRadius: 10,
                  padding: "0.35rem 0.55rem",
                  cursor: "pointer",
                  fontWeight: 650,
                }}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div style={listStyle}>
              {clubs.map((c) => (
                <a
                  key={c.slug}
                  href={`/clubs/${c.slug}`}
                  title={c.name}
                  style={linkStyle}
                  onClick={() => setOpen(false)}
                >
                  <img
                    src={`/clubs/${c.logoFile}`}
                    alt=""
                    style={{ width: 18, height: 18, objectFit: "contain", display: "block" }}
                  />
                  <span>{c.navLabel}</span>
                </a>
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