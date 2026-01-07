// app/components/recent-developments.tsx
"use client";

import * as React from "react";
import SourcePill from "./SourcePill";

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
      
      <h2 style={{ marginTop: 0, marginBottom: "0.25rem", textAlign: "center" }}>
        Recent developments
      </h2>

      <div
        style={{
          textAlign: "center",
          color: "var(--muted)",
          fontSize: "0.98rem",
          lineHeight: 1.5,
          marginBottom: "1.1rem",
        }}
      >
        The latest signings, departures, and extensions from public reporting.
      </div>

      <div
        className="recentDevelopmentsGrid"
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
            className="rdMoreBtn"
            onClick={() => setCount((c) => c + step)}
            style={{
              height: 40,
              borderRadius: 12,
              border: "1px solid var(--border)",
              padding: "0 1rem",
              background: "var(--card)",
              color: "var(--text)",
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
          .recentDevelopmentsGrid {
            grid-template-columns: 1fr !important;
          }
        }
        .rdMoreBtn:hover {
          background: var(--rowHover);
  }
      `}</style>
    </div>
  );
}
