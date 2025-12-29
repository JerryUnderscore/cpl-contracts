// app/clubs/[club]/page.tsx
import * as React from "react";
import { getPlayers } from "../../lib/players";
import PlayersTable from "../../players/PlayersTable";

export const revalidate = 300;

type ClubMeta = {
  label: string;
  logo: string;
  location: string;
  stadium: string;
  capacity: number;
  joined: number;
  coach: string;
};

const CLUBS: Record<string, ClubMeta> = {
  "atletico-ottawa": {
    label: "Atlético Ottawa",
    logo: "/clubs/ottawa.svg",
    location: "Ottawa, Ontario",
    stadium: "TD Place Stadium",
    capacity: 6419,
    joined: 2020,
    coach: "Diego Mejía",
  },
  cavalry: {
    label: "Cavalry FC",
    logo: "/clubs/cavalry.svg",
    location: "Foothills County, Alberta",
    stadium: "ATCO Field",
    capacity: 6000,
    joined: 2019,
    coach: "Tommy Wheeldon Jr.",
  },
  forge: {
    label: "Forge FC",
    logo: "/clubs/forge.svg",
    location: "Hamilton, Ontario",
    stadium: "Hamilton Stadium",
    capacity: 23218,
    joined: 2019,
    coach: "Bobby Smyrniotis",
  },
  "hfx-wanderers": {
    label: "HFX Wanderers FC",
    logo: "/clubs/wanderers.svg",
    location: "Halifax, Nova Scotia",
    stadium: "Wanderers Grounds",
    capacity: 7500,
    joined: 2019,
    coach: "Vanni Sartini",
  },
  "inter-toronto": {
    label: "Inter Toronto FC",
    logo: "/clubs/toronto.png",
    location: "Toronto, Ontario",
    stadium: "York Lions Stadium",
    capacity: 4000,
    joined: 2019,
    coach: "Mauro Eustáquio",
  },
  pacific: {
    label: "Pacific FC",
    logo: "/clubs/pacific.svg",
    location: "Langford, British Columbia",
    stadium: "Starlight Stadium",
    capacity: 6000,
    joined: 2019,
    coach: "James Merriman",
  },
  supra: {
    label: "FC Supra du Québec",
    logo: "/clubs/supra.png",
    location: "Laval, Quebec",
    stadium: "Stade Boréale",
    capacity: 5581,
    joined: 2026,
    coach: "Nicholas Razzaghi",
  },
  vancouver: {
    label: "Vancouver FC",
    logo: "/clubs/vancouver.png",
    location: "Langley, British Columbia",
    stadium: "Willoughby Community Park Stadium",
    capacity: 6560,
    joined: 2023,
    coach: "Martin Nash",
  },
};

export default async function ClubPage({
  params,
}: {
  params: { club: string };
}) {
  const club = CLUBS[params.club];
  if (!club) {
    return <h1>Club not found</h1>;
  }

  const players = await getPlayers();
  const clubPlayers = players.filter(
    (p) => p.clubSlug === params.club
  );

  return (
    <div>
      {/* Club header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          gap: "2rem",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <img
          src={club.logo}
          alt={club.label}
          style={{
            width: "100%",
            maxWidth: 200,
            height: "auto",
          }}
        />

        <div>
          <h1 style={{ marginTop: 0 }}>{club.label}</h1>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, lineHeight: 1.8 }}>
            <li>
              <strong>Location:</strong> {club.location}
            </li>
            <li>
              <strong>Stadium:</strong> {club.stadium}
            </li>
            <li>
              <strong>Capacity:</strong> {club.capacity.toLocaleString()}
            </li>
            <li>
              <strong>Joined:</strong> {club.joined}
            </li>
            <li>
              <strong>Head coach:</strong> {club.coach}
            </li>
          </ul>
        </div>
      </div>

      {/* Roster */}
      <h2>Roster</h2>
      <PlayersTable players={clubPlayers} />
    </div>
  );
}