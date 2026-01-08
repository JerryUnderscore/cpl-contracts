// app/clubs/[club]/page.tsx
import * as React from "react";
import { notFound } from "next/navigation";
import { getPlayers, type Player } from "../../lib/players";
import PlayersTable from "../../players/PlayersTable";
import { CLUB_BY_SLUG } from "../../lib/clubs";
import { getTransfers, type TransferItem } from "../../lib/transfers";
import SourcePill from "../../components/SourcePill";
import Card from "../../components/Card";

export const revalidate = 300;

function fmtNumber(n: number) {
  return new Intl.NumberFormat("en-CA").format(n);
}

function isActivePlayer(p: Player) {
  // default to active if missing
  return (p.status ?? "active").trim().toLowerCase() === "active";
}

function TransferRow({ t }: { t: TransferItem }) {
  const who = t.playerName;

  const left = t.fromClub ?? "—";
  const right = t.toClub ?? "—";

  const summaryBits: string[] = [];
  if (t.transferType) summaryBits.push(t.transferType);
  if (t.fee) summaryBits.push(t.fee);

  const pillLabel = t.source?.trim() ? t.source.trim() : t.link ? "Source" : "";
  const pillTitle = t.notes?.trim() ? t.notes.trim() : undefined;

  return (
    <li
      className="transferRow"
      style={{
        padding: "0.5rem 0",
        borderBottom: "1px solid var(--borderSoft)",
      }}
    >
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "baseline", flexWrap: "wrap" }}>
        <span style={{ fontWeight: 700 }}>{who}</span>

        <span style={{ color: "var(--muted)" }}>
          {left} → {right}
        </span>

        {summaryBits.length ? (
          <span style={{ color: "var(--muted)" }}>({summaryBits.join(" • ")})</span>
        ) : null}

        {pillLabel ? <SourcePill label={pillLabel} href={t.link} title={pillTitle} /> : null}
      </div>

      {t.notes ? (
        <div style={{ marginTop: "0.25rem", color: "var(--muted)", fontSize: "0.95rem" }}>
          {t.notes}
        </div>
      ) : null}
    </li>
  );
}

export default async function ClubPage({ params }: { params: { club: string } }) {
  const clubSlug = params.club;
  const club = CLUB_BY_SLUG[clubSlug];
  if (!club) return notFound();

  const [players, transfers] = await Promise.all([getPlayers(), getTransfers()]);

  // Only show ACTIVE players on club pages
  const clubPlayers = players.filter((p) => p.clubSlug === clubSlug && isActivePlayer(p));

  const transfersIn = transfers
    .filter((t) => (t.toClubSlug ?? "").trim() === clubSlug)
    .sort((a, b) => a.playerName.localeCompare(b.playerName, undefined, { sensitivity: "base" }));

  const transfersOut = transfers
    .filter((t) => (t.fromClubSlug ?? "").trim() === clubSlug)
    .sort((a, b) => a.playerName.localeCompare(b.playerName, undefined, { sensitivity: "base" }));

  const accent = `#${club.colors.primary}`;

  return (
    <div>
      {/* Club header */}
      <div
        style={{
          marginTop: "0.5rem",
          padding: "1.25rem 1rem",
          border: "1px solid var(--borderSoft)",
          borderRadius: 14,
          boxShadow: `inset 0 6px 0 0 ${accent}, 0 10px 30px rgba(0,0,0,0.18)`,
          background: "var(--card)",
        }}
      >
        <div className="clubHeaderInner">
          <div className="clubBadgeWrap">
            {club.slug === "vancouver" ? (
              <>
                <img src="/clubs/Vancouver.png" alt={`${club.name} logo`} className="clubBadge siteLogoLight" />
                <img src="/clubs/Vancouver-dark.png" alt={`${club.name} logo`} className="clubBadge siteLogoDark" />
              </>
            ) : (
              <img src={`/clubs/${club.logoFile}`} alt={`${club.name} logo`} className="clubBadge" />
            )}
          </div>

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

          /* Optional polish: make the badge pop a bit in dark mode */
          html[data-theme="dark"] .clubBadge {
            filter: drop-shadow(0 1px 6px rgba(0,0,0,0.35));
          }

          .clubInfo {
            flex: 1 1 auto;
            min-width: 0;
          }

          .clubName {
            margin: 0;
            font-size: 2.25rem;
            line-height: 1.1;
            color: var(--text);
          }

          .clubMetaGrid {
            margin-top: 0.85rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem 1.25rem;
            color: var(--text);
          }

          .clubMetaLabel {
            font-size: 0.85rem;
            color: var(--muted);
          }

          .clubMetaValue {
            font-weight: 600;
          }

          .clubMetaFull {
            grid-column: 1 / -1;
          }

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

      {/* Transfers */}
      <h2 style={{ marginTop: "2rem" }}>Transfers</h2>

      <div className="transfersGrid">
        <Card title="Transfers In">
          {transfersIn.length ? (
            <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
              {transfersIn.map((t) => (
                <TransferRow key={t.id} t={t} />
              ))}
            </ul>
          ) : (
            <div style={{ color: "var(--muted)" }}>No transfers in yet.</div>
          )}
        </Card>

        <Card title="Transfers Out">
          {transfersOut.length ? (
            <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
              {transfersOut.map((t) => (
                <TransferRow key={t.id} t={t} />
              ))}
            </ul>
          ) : (
            <div style={{ color: "var(--muted)" }}>No transfers out yet.</div>
          )}
        </Card>
      </div>

      <style>{`
        .transfersGrid {
          margin-top: 1rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          align-items: start;
        }

        @media (max-width: 720px) {
          .transfersGrid {
            grid-template-columns: 1fr;
          }
        }

        /* Remove divider under the last transfer row in each card */
        ul > li.transferRow:last-child {
          border-bottom: none !important;
        }
      `}</style>
    </div>
  );
}
