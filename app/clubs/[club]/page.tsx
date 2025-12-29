// app/clubs/[club]/page.tsx
import * as React from "react";
import { notFound } from "next/navigation";
import { getPlayers } from "../../lib/players";
import PlayersTable from "../../players/PlayersTable";
import { CLUB_BY_SLUG } from "../../lib/clubs";

export const revalidate = 300;

function fmtNumber(n: number) {
  return new Intl.NumberFormat("en-CA").format(n);
}

export default async function ClubPage({
  params,
}: {
  params: { club: string };
}) {
  const clubSlug = params.club;
  const club = CLUB_BY_SLUG[clubSlug];
  if (!club) return notFound();

  const players = await getPlayers();
  const clubPlayers = players.filter((p) => p.clubSlug === clubSlug);

  const accent = `#${club.colors.primary}`;

  return (
    <div>
      {/* Club header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "180px 1fr",
          gap: "1.5rem",
          alignItems: "center",
          marginTop: "0.5rem",
          padding: "1.25rem 1rem",
          border: "1px solid #eee",
          borderRadius: 14,
          borderTop: `6px solid ${accent}`, // primary colour accent
          background: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "0.25rem",
          }}
        >
          <img
            src={`/clubs/${club.logoFile}`}
            alt={`${club.name} logo`}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: 140,
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>

        <div>
          <h1 style={{ margin: 0, fontSize: "2.25rem", lineHeight: 1.1 }}>
            {club.name}
          </h1>

          <div
            style={{
              marginTop: "0.85rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.5rem 1.25rem",
              color: "#222",
            }}
          >
            <div>
              <div style={{ fontSize: "0.85rem", color: "#666" }}>Location</div>
              <div style={{ fontWeight: 600 }}>{club.location}</div>
            </div>

            <div>
              <div style={{ fontSize: "0.85rem", color: "#666" }}>Stadium</div>
              <div style={{ fontWeight: 600 }}>{club.stadium}</div>
            </div>

            <div>
              <div style={{ fontSize: "0.85rem", color: "#666" }}>Capacity</div>
              <div style={{ fontWeight: 600 }}>{fmtNumber(club.capacity)}</div>
            </div>

            <div>
              <div style={{ fontSize: "0.85rem", color: "#666" }}>Joined</div>
              <div style={{ fontWeight: 600 }}>{club.joined}</div>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: "0.85rem", color: "#666" }}>
                Head coach
              </div>
              <div style={{ fontWeight: 600 }}>{club.headCoach}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Roster */}
      <h2 style={{ marginTop: "2rem" }}>Roster</h2>
      <PlayersTable players={clubPlayers} />
    </div>
  );
}