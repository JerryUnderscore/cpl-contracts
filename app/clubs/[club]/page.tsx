// app/clubs/[club]/page.tsx
/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import { notFound } from "next/navigation";
import { getPlayers, type Player } from "../../lib/players";
import PlayersTable from "../../players/PlayersTable";
import { CLUB_BY_SLUG } from "../../lib/clubs";
import { getClubMetaBySlug } from "../../lib/clubs-meta";
import { getTransfers, type TransferItem } from "../../lib/transfers";
import SourcePill from "../../components/SourcePill";
import Card from "../../components/Card";
import styles from "./club-page.module.css";

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
      className={styles.transferRow}
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

  const [players, transfers, clubMetaBySlug] = await Promise.all([
    getPlayers(),
    getTransfers(),
    getClubMetaBySlug(),
  ]);
  const meta = clubMetaBySlug[clubSlug];
  const merged = {
    displayName: meta?.displayName ?? club.name,
    location: meta?.location ?? club.location,
    stadium: meta?.stadium ?? club.stadium,
    capacity: meta?.capacity ?? club.capacity,
    manager: meta?.manager ?? club.headCoach,
    joinedYear: club.joined,
  };

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
        <div className={styles.clubHeaderInner}>
          <div className={styles.clubBadgeWrap}>
            {club.slug === "vancouver" ? (
              // IMPORTANT: keep a single layout slot and absolutely stack the two images,
              // so the hidden one can't push the layout around.
              <span className={styles.clubBadgeSwap} aria-hidden="true">
                <img src="/clubs/vancouver.png" alt="" className={`${styles.clubBadge} siteLogoLight`} />
                <img src="/clubs/Vancouver-dark.png" alt="" className={`${styles.clubBadge} siteLogoDark`} />
              </span>
            ) : (
              <img src={`/clubs/${club.logoFile}`} alt={`${merged.displayName} logo`} className={styles.clubBadge} />
            )}
          </div>

          <div className={styles.clubInfo}>
            <h1 className={styles.clubName}>{merged.displayName}</h1>

            <div className={styles.clubMetaGrid}>
              <div className="clubMetaItem">
                <div className={styles.clubMetaLabel}>Location</div>
                <div className={styles.clubMetaValue}>{merged.location}</div>
              </div>

              <div className="clubMetaItem">
                <div className={styles.clubMetaLabel}>Stadium</div>
                <div className={styles.clubMetaValue}>{merged.stadium}</div>
              </div>

              <div className="clubMetaItem">
                <div className={styles.clubMetaLabel}>Capacity</div>
                <div className={styles.clubMetaValue}>{fmtNumber(merged.capacity)}</div>
              </div>

              <div className="clubMetaItem">
                <div className={styles.clubMetaLabel}>Joined</div>
                <div className={styles.clubMetaValue}>{merged.joinedYear}</div>
              </div>

              <div className={`clubMetaItem ${styles.clubMetaFull}`}>
                <div className={styles.clubMetaLabel}>Head coach</div>
                <div className={styles.clubMetaValue}>{merged.manager}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roster */}
      <h2 style={{ marginTop: "2rem" }}>Roster</h2>
      <PlayersTable players={clubPlayers} hideClub />

      {/* Transfers */}
      <h2 style={{ marginTop: "2rem" }}>Transfers</h2>

      <div className={styles.transfersGrid}>
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
    </div>
  );
}
