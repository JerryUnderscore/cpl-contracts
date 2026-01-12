// app/clubs/page.tsx
import Image from "next/image";
import Link from "next/link";
import { getClubsMeta } from "../lib/clubs-meta";
import { getClubsHonoursSummary } from "../lib/clubs-honours";
import { CLUB_BY_SLUG, CLUB_ORDER_WEST_EAST } from "../lib/clubs";
import { HONOUR_ICONS } from "../lib/honours-icons";

export const revalidate = 300;

function fmtNumber(n: number | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-CA").format(n);
}

function yearsLabel(years: number[]) {
  return years.length ? years.join(", ") : "—";
}

function initials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/g)
    .filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase() || name.slice(0, 2).toUpperCase();
}

export default async function ClubsIndexPage() {
  const [meta, honoursBySlug] = await Promise.all([getClubsMeta(), getClubsHonoursSummary()]);

  const metaBySlug = Object.fromEntries(meta.map((m) => [m.clubSlug, m] as const));

  // Prefer your curated west→east order, then append anything that isn't in that list
  const orderedSlugs = [
    ...CLUB_ORDER_WEST_EAST,
    ...meta.map((m) => m.clubSlug).filter((s) => !CLUB_ORDER_WEST_EAST.includes(s)),
  ].filter((s, idx, arr) => arr.indexOf(s) === idx);

  const clubs = orderedSlugs.map((slug) => metaBySlug[slug]).filter(Boolean);

  return (
    <main className="clubsPage">
      <div className="clubsGrid">
        {clubs.map((c) => {
          const brand = CLUB_BY_SLUG[c.clubSlug]; // may be undefined for defunct / not-in-brands clubs
          const honours = honoursBySlug[c.clubSlug];

          const accent = brand?.colors?.primary ? `#${brand.colors.primary}` : "var(--border)";
          const isDefunct = Boolean(c.defunct);

          const northStarCount = honours?.northStarCupTitles ?? 0;
          const shieldCount = honours?.cplShieldTitles ?? 0;
          const playoffCount = honours?.playoffSeasons?.length ?? 0;
          const woodenSpoonCount = honours?.woodenSpoonTitles ?? 0;

          const northStarYears = honours?.northStarCupYears ?? [];
          const shieldYears = honours?.cplShieldYears ?? [];
          const playoffYears = honours?.playoffSeasons ?? [];
          const woodenSpoonYears = honours?.woodenSpoonYears ?? [];

          return (
            <article
              key={c.clubSlug}
              className={`clubCard ${isDefunct ? "clubCardDefunct" : ""}`}
              style={{ boxShadow: `inset 0 5px 0 0 ${accent}, 0 10px 26px rgba(0,0,0,0.16)` }}
            >
              <div className="clubTop">
                <div className="clubBadgeWrap">
                  {brand?.logoFile ? (
                    c.clubSlug === "vancouver" ? (
                      <span className="clubLogoSwap" aria-hidden="true">
                        <Image
                          src="/clubs/vancouver.png"
                          alt=""
                          className="siteLogoLight"
                          width={66}
                          height={66}
                        />
                        <Image
                          src="/clubs/vancouver_dark.png"
                          alt=""
                          className="siteLogoDark"
                          width={66}
                          height={66}
                        />
                      </span>
                    ) : (
                      <Image
                        src={`/clubs/${brand.logoFile}`}
                        alt={`${c.displayName} logo`}
                        className="clubBadge"
                        width={66}
                        height={66}
                      />
                    )
                  ) : (
                    <div className="clubBadgeFallback" aria-hidden="true">
                      {initials(c.displayName)}
                    </div>
                  )}
                </div>

                <div className="clubHeading">
                  <div className="clubNameRow">
                    {isDefunct ? (
                      <span className="clubNameText">{c.displayName}</span>
                    ) : (
                      <Link className="clubNameLink" href={`/clubs/${c.clubSlug}`}>
                        {c.displayName}
                      </Link>
                    )}

                    {isDefunct ? (
                      <span className="defunctPill" title="Defunct club">
                        Defunct{c.lastSeason ? ` • last season ${c.lastSeason}` : ""}
                      </span>
                    ) : null}
                  </div>

                  {c.formerNames?.length ? (
                    <div className="clubFormerNames" title={c.formerNames.join(" • ")}>
                      Formerly: {c.formerNames.join(" • ")}
                    </div>
                  ) : null}

                  {isDefunct && c.successorSlug ? (
                    <div className="clubSuccessor">
                      Successor:{" "}
                      <Link href={`/clubs/${c.successorSlug}`} className="clubSuccessorLink">
                        {metaBySlug[c.successorSlug]?.displayName ?? c.successorSlug}
                      </Link>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="clubMetaGrid">
                <div className="metaItem">
                  <div className="metaLabel">Joined</div>
                  <div className="metaValue">{c.joined ?? "—"}</div>
                </div>

                <div className="metaItem">
                  <div className="metaLabel">Location</div>
                  <div className="metaValue">{c.location ?? "—"}</div>
                </div>

                <div className="metaItem">
                  <div className="metaLabel">Stadium</div>
                  <div className="metaValue">{c.stadium ?? "—"}</div>
                </div>

                <div className="metaItem">
                  <div className="metaLabel">Capacity</div>
                  <div className="metaValue">{fmtNumber(c.capacity)}</div>
                </div>

                <div className="metaItem metaFull">
                  <div className="metaLabel">Manager</div>
                  <div className="metaValue">{c.manager ?? "—"}</div>
                </div>
              </div>

              <div className="honoursRow" aria-label="Honours">
                <div className="honourBlock" title={`North Star Cup years: ${yearsLabel(northStarYears)}`}>
                  <Image
                    src={HONOUR_ICONS.northStarCup.src}
                    alt=""
                    aria-hidden="true"
                    className="honourIcon"
                    width={60}
                    height={60}
                  />
                  <div className="honourLabel">North Star Cup <small>(League Championship)</small></div>
                  <div className="honourValue">{northStarCount}</div>
                </div>

                <div className="honourBlock" title={`CPL Shield years: ${yearsLabel(shieldYears)}`}>
                  <Image
                    src={HONOUR_ICONS.cplShield.src}
                    alt=""
                    aria-hidden="true"
                    className="honourIcon"
                    width={60}
                    height={60}
                  />
                  <div className="honourLabel">CPL Shield <small>(Regular season)</small></div>
                  <div className="honourValue">{shieldCount}</div>
                </div>

                <div className="honourBlock" title={`Playoff seasons: ${yearsLabel(playoffYears)}`}>
                  <Image
                    src={HONOUR_ICONS.playoffs.src}
                    alt=""
                    aria-hidden="true"
                    className="honourIcon"
                    width={60}
                    height={60}
                  />
                  <div className="honourLabel">Playoff Appearances</div>
                  <div className="honourValue">{playoffCount}</div>
                </div>

                <div className="honourBlock" title={`Wooden Spoon years: ${yearsLabel(woodenSpoonYears)}`}>
                  <Image
                    src={HONOUR_ICONS.woodenSpoon.src}
                    alt=""
                    aria-hidden="true"
                    className="honourIcon"
                    width={60}
                    height={60}
                  />
                  <div className="honourLabel">Wooden Spoon</div>
                  <div className="honourValue">{woodenSpoonCount}</div>
                </div>
              </div>

              <div className="clubActions">
                {isDefunct ? (
                  <span className="clubActionsMuted">No active roster page</span>
                ) : (
                  <Link className="clubButton" href={`/clubs/${c.clubSlug}`}>
                    View roster →
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <style>{`
        .clubsPage {
          max-width: 1300px;
          margin: 0 auto;
          padding: 1.6rem 1.25rem 2.25rem;
        }

        .clubsGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
          align-items: start;
        }

        @media (max-width: 900px) {
          .clubsGrid {
            grid-template-columns: 1fr;
          }
        }

        .clubCard {
          background: var(--card);
          border: 1px solid var(--borderSoft);
          border-radius: 14px;
          padding: 1rem;
        }

        .clubCardDefunct {
          opacity: 0.72;
        }

        .clubTop {
          display: flex;
          gap: 0.95rem;
          align-items: center;
        }

        .clubBadgeWrap {
          flex: 0 0 66px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .clubBadge {
          width: 66px;
          height: 66px;
          object-fit: contain;
          display: block;
        }

        .clubBadgeFallback {
          width: 58px;
          height: 58px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--borderSoft);
          background: var(--bg);
          color: var(--text);
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .clubHeading {
          flex: 1 1 auto;
          min-width: 0;
        }

        .clubNameRow {
          display: flex;
          align-items: baseline;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .clubNameLink {
          color: var(--text);
          text-decoration: none;
          font-weight: 900;
          font-size: 1.35rem;
          line-height: 1.15;
        }

        .clubNameLink:hover {
          text-decoration: underline;
        }

        .clubNameText {
          color: var(--text);
          font-weight: 900;
          font-size: 1.35rem;
          line-height: 1.15;
        }

        .defunctPill {
          display: inline-block;
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
          font-size: 0.85rem;
          border: 1px solid var(--borderSoft);
          background: var(--bg);
          color: var(--muted);
          white-space: nowrap;
          font-weight: 700;
        }

        .clubFormerNames {
          margin-top: 0.25rem;
          color: var(--muted);
          font-size: 0.92rem;
        }

        .clubSuccessor {
          margin-top: 0.25rem;
          color: var(--muted);
          font-size: 0.92rem;
        }

        .clubSuccessorLink {
          color: var(--link);
          font-weight: 700;
        }

        .clubMetaGrid {
          margin-top: 0.9rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem 1.1rem;
        }

        .metaItem {
          min-width: 0;
        }

        .metaFull {
          grid-column: 1 / -1;
        }

        .metaLabel {
          font-size: 0.85rem;
          color: var(--muted);
        }

        .metaValue {
          font-weight: 650;
          color: var(--text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ===== Honours as mini award cards ===== */

        .honoursRow {
          margin-top: 0.9rem;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.75rem;
        }

        @media (max-width: 900px) {
          .honoursRow {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 520px) {
          .honoursRow {
            grid-template-columns: 1fr;
          }
        }

        .honourBlock {
          border: 1px solid var(--borderSoft);
          background: rgba(96, 165, 250, 0.10);
          border-radius: 14px;
          padding: 0.75rem 0.75rem 0.85rem;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;

          gap: 0.4rem;

          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
        }

        html[data-theme=dark] .honourBlock {
          background: rgba(96, 165, 250, 0.14);
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.25);
        }

        .honourIcon {
          width: 60px;
          height: 60px;
          object-fit: contain;
          display: block;
          filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.12));
        }

        .honourLabel {
          color: var(--text);
          font-size: 0.95rem;
          font-weight: 800;
          line-height: 1.25;
          text-align: center;
        } 

        .honourLabel small {
          display: block;
          font-size: 0.75rem;
          font-weight: 650;
          opacity: 0.9;
        }

        .honourValue {
          color: var(--text);
          font-weight: 900;
          font-size: 1.35rem;
          line-height: 1;
          margin-top: 0.1rem;
        }

        /* ===== Actions ===== */

        .clubActions {
          margin-top: 0.9rem;
          display: flex;
          justify-content: flex-end;
        }

        .clubButton {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border-radius: 12px;
          border: 1px solid var(--btnBorder);
          background: var(--btnBg);
          color: var(--btnText);
          font-weight: 750;
          text-decoration: none;
        }

        .clubButton:hover {
          background: var(--rowHover);
        }

        .clubActionsMuted {
          color: var(--muted);
          font-weight: 650;
          font-size: 0.95rem;
        }

        /* Vancouver swap slot */
        .clubLogoSwap {
          width: 66px;
          height: 66px;
          flex: 0 0 66px;
          position: relative;
          display: block;
        }

        .clubLogoSwap img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
      `}</style>
    </main>
  );
}
