// app/clubs/[club]/page.tsx
import * as React from "react";
import { notFound } from "next/navigation";
import { getPlayers } from "../../lib/players";
import PlayersTable from "../../players/PlayersTable";
import { CLUB_BY_SLUG } from "../../lib/clubs";
import { getTransfers, type TransferItem } from "../../lib/transfers";

export const revalidate = 300;

function fmtNumber(n: number) {
  return new Intl.NumberFormat("en-CA").format(n);
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

function TransferRow({ t }: { t: TransferItem }) {
  const when = t.date ?? "";
  const who = t.playerName;

  const left = t.fromClub ?? "—";
  const right = t.toClub ?? "—";

  const summaryBits: string[] = [];
  // In your sheet this is things like "Permanent" (not In/Out)
  if (t.transferType) summaryBits.push(t.transferType);
  if (t.fee) summaryBits.push(t.fee);

  const pillLabel = t.source?.trim() ? t.source.trim() : t.link ? "Source" : "";

  return (
    <li style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--borderSoft)" }}>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "baseline", flexWrap: "wrap" }}>
        {when ? (
          <span style={{ color: "var(--muted)", fontSize: "0.9rem", whiteSpace: "nowrap" }}>
            {when}
          </span>
        ) : null}

        <span style={{ fontWeight: 700 }}>{who}</span>

        <span style={{ color: "var(--muted)" }}>
          {left} → {right}
        </span>

        {summaryBits.length ? (
          <span style={{ color: "var(--muted)" }}>({summaryBits.join(" • ")})</span>
        ) : null}

        {pillLabel ? <SourcePill label={pillLabel} href={t.link} title={t.notes} /> : null}
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

  const clubPlayers = players.filter((p) => p.clubSlug === clubSlug);

  // IMPORTANT: infer direction by slugs (since your sheet's "transferType" is like "Permanent")
  const transfersIn = transfers.filter((t) => (t.toClubSlug ?? "").trim() === clubSlug);
  const transfersOut = transfers.filter((t) => (t.fromClubSlug ?? "").trim() === clubSlug);

  // Sort newest first (if dates exist)
  transfersIn.sort((a, b) => ((a.date ?? "") < (b.date ?? "") ? 1 : (a.date ?? "") > (b.date ?? "") ? -1 : 0));
  transfersOut.sort((a, b) => ((a.date ?? "") < (b.date ?? "") ? 1 : (a.date ?? "") > (b.date ?? "") ? -1 : 0));

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
            <img src={`/clubs/${club.logoFile}`} alt={`${club.name} logo`} className="clubBadge" />
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

          /* Mobile: stack badge above name/info */
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

      {/* Transfers (under roster) */}
      <h2 style={{ marginTop: "2rem" }}>Transfers</h2>

      <div className="transfersGrid">
        <div
          style={{
            border: "1px solid var(--borderSoft)",
            borderRadius: 14,
            background: "var(--card)",
            padding: "1rem",
            minWidth: 0,
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "0.75rem" }}>Transfers In</h3>
          {transfersIn.length ? (
            <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
              {transfersIn.map((t) => (
                <TransferRow key={t.id} t={t} />
              ))}
            </ul>
          ) : (
            <div style={{ color: "var(--muted)" }}>No transfers in yet.</div>
          )}
        </div>

        <div
          style={{
            border: "1px solid var(--borderSoft)",
            borderRadius: 14,
            background: "var(--card)",
            padding: "1rem",
            minWidth: 0,
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "0.75rem" }}>Transfers Out</h3>
          {transfersOut.length ? (
            <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
              {transfersOut.map((t) => (
                <TransferRow key={t.id} t={t} />
              ))}
            </ul>
          ) : (
            <div style={{ color: "var(--muted)" }}>No transfers out yet.</div>
          )}
        </div>
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
      `}</style>
    </div>
  );
}