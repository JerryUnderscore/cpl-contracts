// app/components/recent-developments.tsx
"use client";

import * as React from "react";

type UpdateItem = {
  id: string;
  player: string;
  club: string;
  summary?: string;
  link?: string;
  source?: string;
};

function smallClubTag(club: string) {
  const map: Record<string, string> = {
    "HFX Wanderers FC": "HFX",
    "Atlético Ottawa": "ATO",
    "Cavalry FC": "CAV",
    "Forge FC": "FOR",
    "Pacific FC": "PAC",
    "Vancouver FC": "VFC",
    "Inter Toronto FC": "ITO",
    "FC Supra du Québec": "SUP",
  };
  return map[club] ?? club.split(" ")[0];
}

function SourcePill({
  label,
  title,
  href,
}: {
  label: string;
  title?: string;
  href?: string;
}) {
  const style: React.CSSProperties = {
    display: "inline-block",
    marginLeft: "0.35rem",
    fontSize: "0.65rem",
    lineHeight: 1.2,
    padding: "0.05rem 0.3rem",
    borderRadius: 6,
    background: "#99999933",
    border: "1px solid #dddddd",
    color: "inherit",
    textDecoration: "none",
    whiteSpace: "nowrap",
    verticalAlign: "baseline",
  };

  if (!href) {
    return (
      <span style={style} title={title}>
        {label}
      </span>
    );
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" style={style} title={title}>
      {label}
    </a>
  );
}

function UpdateRow({ u }: { u: UpdateItem }) {
  const tag = smallClubTag(u.club);
  const pillLabel = u.source?.trim() ? u.source.trim() : "Source";
  const pillTitle = u.summary?.trim() ? u.summary.trim() : undefined;

  return (
    <li style={{ marginBottom: "0.4rem" }}>
      <span style={{ fontWeight: 650 }}>{u.player}</span>{" "}
      <span style={{ color: "var(--muted)" }}>({tag})</span>
      <SourcePill label={pillLabel} href={u.link} title={pillTitle} />
    </li>
  );
}

export default function RecentDevelopments({
  signings,
  departures,
  extensions,
  step = 5,
  initial = 5,
}: {
  signings: UpdateItem[];
  departures: UpdateItem[];
  extensions: UpdateItem[];
  step?: number;
  initial?: number;
}) {
  const [count, setCount] = React.useState(initial);

  const visSignings = signings.slice(0, count);
  const visDepartures = departures.slice(0, count);
  const visExtensions = extensions.slice(0, count);

  const hasMore =
    signings.length > count || departures.length > count || extensions.length > count;

  return (
    <div
      style={{
        margin: "1.25rem 0 2rem",
        padding: "1rem 1rem",
        border: `1px solid var(--borderSoft)`,
        borderRadius: 14,
        background: "var(--card)",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: "0.85rem", textAlign: "center" }}>
        Recent developments
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "1.25rem",
          alignItems: "start",
        }}
      >
        <div>
          <h3 style={{ marginTop: 0, marginBottom: "0.5rem" }}>Signings</h3>
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            {visSignings.length ? visSignings.map((u) => <UpdateRow key={u.id} u={u} />) : <li>No signings yet.</li>}
          </ul>
        </div>

        <div>
          <h3 style={{ marginTop: 0, marginBottom: "0.5rem" }}>Departures</h3>
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            {visDepartures.length ? visDepartures.map((u) => <UpdateRow key={u.id} u={u} />) : <li>No departures yet.</li>}
          </ul>
        </div>

        <div>
          <h3 style={{ marginTop: 0, marginBottom: "0.5rem" }}>Extensions</h3>
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            {visExtensions.length ? visExtensions.map((u) => <UpdateRow key={u.id} u={u} />) : <li>No extensions yet.</li>}
          </ul>
        </div>
      </div>

      {hasMore ? (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
          <button
            onClick={() => setCount((c) => c + step)}
            style={{
              height: 40,
              borderRadius: 12,
              border: "1px solid var(--borderSoft)",
              padding: "0 1rem",
              background: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            More
          </button>
        </div>
      ) : null}

      <style>{`
        @media (max-width: 720px) {
          /* stack the 3 columns on mobile */
          div[style*="grid-template-columns: 1fr 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}