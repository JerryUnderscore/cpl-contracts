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
          marginTop: "0.5rem",
          padding: "1.25rem 1rem",
          border: "1px solid #eee",
          borderRadius: 14,
          borderTop: `6px solid ${accent}`,
          background: "white",
        }}
      >
        <div className="clubHeaderInner">
          {/* Badge */}
          <div className="clubBadgeWrap">
            <img
              src={`/clubs/${club.logoFile}`}
              alt={`${club.name} logo`}
              className="clubBadge"
            />
          </div>

          {/* Name + info */}
          <div className="clubInfo">
            <h1 className="clubName">{club.name}</h1>

            <div className="clubMetaGrid">
              <div className="clubMetaItem">
                <div className="clubMetaLabel">Location</div>
                <div className="clubMetaValue">{club.location}</div>
              </div>

              <div className="clubMetaItem">
                <div className="clubMetaLabel">Stadium</div>
                <div className="clubMetaValue">{club.stadium}</div>
              </div>

              <div className="clubMetaItem">
                <div className="clubMetaLabel">Capacity</div>
                <div className="clubMetaValue">{fmtNumber(club.capacity)}</div>
              </div>

              <div className="clubMetaItem">
                <div className="clubMetaLabel">Joined</div>
                <div className="clubMetaValue">{club.joined}</div>
              </div>

              <div className="clubMetaItem clubMetaFull">
                <div className="clubMetaLabel">Head coach</div>
                <div className="clubMetaValue">{club.headCoach}</div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .clubHeaderInner {
            display: flex;
            gap: 1.5rem;
            align-items: center;
          }

          .clubBadgeWrap {
            flex: 0 0 180px;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0.25rem;
          }

          .clubBadge {
            width: 100%;
            height: auto;
            max-height: 140px;
            object-fit: contain;
            display: block;
          }

          .clubInfo {
            flex: 1 1 auto;
            min-width: 0;
          }

          .clubName {
            margin: 0;
            font-size: 2.25rem;
            line-height: 1.1;
          }

          .clubMetaGrid {
            margin-top: 0.85rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem 1.25rem;
            color: #222;
          }

          .clubMetaLabel {
            font-size: 0.85rem;
            color: #666;
          }

          .clubMetaValue {
            font-weight: 600;
          }

          .clubMetaFull {
            grid-column: 1 / -1;
          }

          /* ✅ Mobile: stack badge above name/info */
          @media (max-width: 720px) {
            .clubHeaderInner {
              flex-direction: column;
              align-items: center;
              text-align: center;
            }

            .clubBadgeWrap {
              flex: 0 0 auto;
              width: 100%;
            }

            .clubBadge {
              max-height: 120px;
              width: 140px;
            }

            .clubName {
              font-size: 1.8rem;
              line-height: 1.1;
            }

            .clubMetaGrid {
              grid-template-columns: 1fr;
              text-align: left;
              width: 100%;
              max-width: 420px;
              margin-left: auto;
              margin-right: auto;
            }

            .clubMetaFull {
              grid-column: auto;
            }
          }
        `}</style>
      </div>

      {/* Roster */}
      <h2 style={{ marginTop: "2rem" }}>Roster</h2>
      <PlayersTable players={clubPlayers} hideClub />
    </div>
  );
}