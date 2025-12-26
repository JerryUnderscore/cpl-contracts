// scripts/fetch-canpl-bio.js
// Run with: node scripts/fetch-canpl-bio.js > canpl_bio.csv

const SEASON_ID = "cpl::Football_Season::fd43e1d61dfe4396a7356bc432de0007";

const TEAM_IDS = [
  "cpl::Football_Team::8c24226c843b45a99c6c1be22188d7c4",
  "cpl::Football_Team::e354e4f836704887ba44258dfa50788a",
  "cpl::Football_Team::1f6cf207b98b4ebc868cb793d4b46628",
  "cpl::Football_Team::f428351afd4749b38c05d793a6848a2d",
  "cpl::Football_Team::8766f42a4214466483e9d873d9ca7c9e",
  "cpl::Football_Team::4552b8b370da48e881dd8408da645c5a",
];

async function getJson(url) {
  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "Mozilla/5.0",
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

function csvEscape(v) {
  const s = (v ?? "").toString();
  if (/[,"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function extractPlayers(roster) {
  // Try a few shapes that are common across sports feeds
  if (Array.isArray(roster?.players)) return roster.players;
  if (Array.isArray(roster?.roster)) return roster.roster;
  if (Array.isArray(roster?.roster?.players)) return roster.roster.players;
  if (Array.isArray(roster?.team?.players)) return roster.team.players;
  if (Array.isArray(roster?.squad)) return roster.squad;
  return [];
}

async function main() {
  const rows = [];
  rows.push(
    ["team", "playerId", "firstName", "lastName", "fullName", "birthYear", "nationality", "number"]
      .map(csvEscape)
      .join(",")
  );

  for (const teamId of TEAM_IDS) {
    const rosterUrl = `https://api-sdp.canpl.ca/v1/cpl/football/teams/${encodeURIComponent(
      teamId
    )}/roster?locale=en-US&seasonId=${encodeURIComponent(SEASON_ID)}`;

    const roster = await getJson(rosterUrl);
    const players = extractPlayers(roster);

    // Helpful debug if a team returns nothing
    if (!players.length) {
      console.error(`No players found for teamId: ${teamId}`);
      continue;
    }

    for (const p of players) {
      const playerId = p.playerId || p.id;
      if (!playerId) continue;

      const profileUrl = `https://api-sdp.canpl.ca/v1/cpl/football/players/${encodeURIComponent(
        playerId
      )}/profile?locale=en-US&seasonId=${encodeURIComponent(SEASON_ID)}`;

      const prof = await getJson(profileUrl);

      // Prefer roster names, but fall back to profile names (your profile JSON has these)
      const firstName =
        p.mediaFirstName || p.firstName || prof.mediaFirstName || "";
      const lastName =
        p.mediaLastName || p.lastName || prof.mediaLastName || "";
      const fullName =
        p.displayName ||
        prof.displayName ||
        `${firstName} ${lastName}`.trim() ||
        prof.shortName ||
        p.shortName ||
        "";

      // Prefer profile team name (seems reliable based on what you posted)
      const team =
        prof.team?.shortName ||
        prof.team?.officialName ||
        prof.team?.mediaName ||
        "";

      const birthYear = prof.dateOfBirth?.slice(0, 4) ?? "";
      const nationality = prof.nationality ?? "";
      const number = prof.bibNumber ?? "";

      rows.push(
        [team, playerId, firstName, lastName, fullName, birthYear, nationality, number]
          .map(csvEscape)
          .join(",")
      );

      await new Promise((r) => setTimeout(r, 80));
    }
  }

  console.log(rows.join("\n"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});