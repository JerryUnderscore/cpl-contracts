// app/players/PlayersTable.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import type { Player as BasePlayer } from "../lib/players";
import TagPill from "../components/TagPill";
import { FlagsFromCell } from "../lib/Flag";
import { normalizeContractValue, hasContractValue, contractKindFromValue } from "../lib/contracts";
import { getClubBadgeFile, isLinkableClubSlug } from "../lib/club-badges";

type Player = BasePlayer & {
  positionDetail?: string;
};

type SortDir = "asc" | "desc";
type SortKey =
  | "name"
  | "club"
  | "position"
  | "number"
  | "age"
  | "nationality"
  | `season:${string}`;

function compareStrings(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function compareValues(a: string | number, b: string | number) {
  const aNum = typeof a === "number";
  const bNum = typeof b === "number";
  if (aNum && bNum) return a - b;
  return compareStrings(String(a), String(b));
}

function isYearHeader(h: string) {
  return /^\d{4}$/.test(h);
}

// CPL rule: age on Jan 1 of the season year
function ageOnJan1(birthDate: string | undefined, seasonYear: number) {
  if (!birthDate) return undefined;

  const m = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return undefined;

  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return undefined;

  let age = seasonYear - y;
  if (!(mo === 1 && d === 1)) age -= 1;
  return age;
}

// badges: U-18 is <18, U-21 is <21
function badgeForSeasonAge(age: number | undefined) {
  if (age == null) return null;
  if (age < 18) return { label: "U-18", title: "U-18 on Jan 1" };
  if (age < 21) return { label: "U-21", title: "U-21 on Jan 1" };
  return null;
}

function pillStyle(kind: string): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "inline-block",
    padding: "0.15rem 0.55rem",
    borderRadius: "999px",
    fontSize: "0.85rem",
    lineHeight: 1.4,
    whiteSpace: "nowrap",
    border: "1px solid var(--pillBorder)",
    background: "var(--pillBg)",
    color: "var(--pillText)",
  };

  if (kind === "international")
    return { ...base, background: "var(--pillIntlBg)", borderColor: "var(--pillIntlBorder)" };

  if (kind === "domestic")
    return { ...base, background: "var(--pillDomBg)", borderColor: "var(--pillDomBorder)" };

  if (kind === "club_option")
    return { ...base, background: "var(--pillClubOptBg)", borderColor: "var(--pillClubOptBorder)" };

  if (kind === "option_pending")
    return { ...base, background: "var(--pillOptPendingBg)", borderColor: "var(--pillOptPendingBorder)" };

  if (kind === "in_discussion")
    return { ...base, background: "var(--pillDiscussionBg)", borderColor: "var(--pillDiscussionBorder)" };

  if (kind === "eyt" || kind === "u_sports" || kind === "development")
    return { ...base, background: "var(--pillDevBg)", borderColor: "var(--pillDevBorder)" };

  return base;
}

function ContractPill({ value }: { value: string }) {
  const kind = contractKindFromValue(value);
  return <span style={pillStyle(kind)}>{value}</span>;
}

// --- Country code -> display name ---
const COUNTRY_NAME_BY_CODE: Record<string, string> = {
  AL: "Albania",
  AR: "Argentina",
  BD: "Bangladesh",
  BR: "Brazil",
  CA: "Canada",
  CD: "Congo (DRC)",
  CG: "Republic of the Congo",
  CI: "Côte d’Ivoire",
  CL: "Chile",
  CM: "Cameroon",
  CO: "Colombia",
  DE: "Germany",
  DZ: "Algeria",
  EE: "Estonia",
  ENG: "England",
  FR: "France",
  GH: "Ghana",
  GR: "Greece",
  HR: "Croatia",
  IE: "Republic of Ireland",
  IT: "Italy",
  LB: "Lebanon",
  MA: "Morocco",
  MD: "Moldova",
  MX: "Mexico",
  NL: "Netherlands",
  NZ: "New Zealand",
  PE: "Peru",
  PH: "Philippines",
  PL: "Poland",
  RS: "Serbia",
  SO: "Somalia",
  SY: "Syria",
  TN: "Tunisia",
  UA: "Ukraine",
  UY: "Uruguay",
  WA: "Wales",
  HT: "Haiti",
  IR: "Iran",
  JM: "Jamaica",
  LC: "Saint Lucia",
  NG: "Nigeria",
  NOR_IRE: "Northern Ireland",
  PT: "Portugal",
  SCOT: "Scotland",
  SE: "Sweden",
  SN: "Senegal",
  TT: "Trinidad and Tobago",
  US: "United States",
  WALES: "Wales",
};

function displayCountry(code: string) {
  const c = String(code ?? "").trim().toUpperCase();
  return COUNTRY_NAME_BY_CODE[c] ?? c;
}

function parseNationalityCodes(cell: string | undefined): string[] {
  if (!cell) return [];
  return cell
    .split(/[;,]/g)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}

type AgeBucket = "all" | "u18" | "u21" | "21_24" | "25_29" | "30plus";

function ageBucketLabel(b: AgeBucket) {
  switch (b) {
    case "u18":
      return "U-18";
    case "u21":
      return "U-21";
    case "21_24":
      return "21–24";
    case "25_29":
      return "25–29";
    case "30plus":
      return "30+";
    default:
      return "All ages";
  }
}

function ageMatchesBucket(age: number | undefined, b: AgeBucket) {
  if (b === "all") return true;
  if (age == null) return false;
  if (b === "u18") return age < 18;
  if (b === "u21") return age < 21;
  if (b === "21_24") return age >= 21 && age <= 24;
  if (b === "25_29") return age >= 25 && age <= 29;
  if (b === "30plus") return age >= 30;
  return true;
}

function prettifyStatus(value: string) {
  return value;
}

export default function PlayersTable({
  players,
  hideClub = false,
  hideContracts = false,
  entityLabel = "players",
  searchPlaceholder = "Search player, club, position, nationality…",
}: {
  players: BasePlayer[];
  hideClub?: boolean;
  hideContracts?: boolean;
  entityLabel?: string;
  searchPlaceholder?: string;
}) {
  const typedPlayers = players as Player[];

  const [sortKey, setSortKey] = React.useState<SortKey>("name");
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");

  // Filters
  const [q, setQ] = React.useState("");
  const [posFilter, setPosFilter] = React.useState<string>("all");
  const [ageFilter, setAgeFilter] = React.useState<AgeBucket>("all");
  const [natFilter, setNatFilter] = React.useState<string>("all");
  const [clubFilter, setClubFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const years = React.useMemo(() => {
    if (hideContracts) return [];
    const set = new Set<string>();
    for (const p of typedPlayers) {
      for (const y of Object.keys(p.seasons ?? {})) {
        if (isYearHeader(y)) set.add(y);
      }
    }
    return Array.from(set).sort();
  }, [typedPlayers, hideContracts]);

  const firstYear = years[0];

  const ageSeason = React.useMemo(() => {
    return firstYear && isYearHeader(firstYear) ? Number(firstYear) : new Date().getFullYear();
  }, [firstYear]);

  function ageOf(p: Player) {
    return ageOnJan1(p.birthDate, ageSeason);
  }

  const positionOptions = React.useMemo(() => {
    const set = new Set<string>();
    for (const p of typedPlayers) {
      const v = (p.position ?? "").trim();
      if (v) set.add(v);
    }
    return Array.from(set).sort(compareStrings);
  }, [typedPlayers]);

  const clubOptions = React.useMemo(() => {
    const set = new Set<string>();
    for (const p of typedPlayers) {
      const v = (p.club ?? "").trim();
      if (v) set.add(v);
    }
    return Array.from(set).sort(compareStrings);
  }, [typedPlayers]);

  const nationalityOptions = React.useMemo(() => {
    const set = new Set<string>();
    for (const p of typedPlayers) {
      for (const c of parseNationalityCodes(p.nationality)) set.add(c);
    }
    return Array.from(set).sort((a, b) => compareStrings(displayCountry(a), displayCountry(b)));
  }, [typedPlayers]);

  const statusOptions = React.useMemo(() => {
    if (hideContracts) return [];
    const set = new Set<string>();
    const y = firstYear;
    if (!y) return [];
    for (const p of typedPlayers) {
      const raw = normalizeContractValue(p.seasons?.[y]);
      if (hasContractValue(raw)) set.add(raw);
    }
    const preferred = [
      "Domestic",
      "International",
      "Club Option",
      "Option (pending)",
      "In Discussion",
      "EYT",
      "U SPORTS",
      "Development",
    ];
    const rest = Array.from(set)
      .filter((x) => !preferred.includes(x))
      .sort(compareStrings);
    return [...preferred.filter((x) => set.has(x)), ...rest];
  }, [typedPlayers, firstYear, hideContracts]);

  function resetFilters() {
    setQ("");
    setPosFilter("all");
    setAgeFilter("all");
    setNatFilter("all");
    setClubFilter("all");
    setStatusFilter("all");
  }

  function sortValue(p: Player, key: SortKey): string | number {
    if (key.startsWith("season:")) {
      const y = key.slice("season:".length);
      return normalizeContractValue(p.seasons?.[y]);
    }

    switch (key) {
      case "name":
        return p.name ?? "";
      case "club":
        return p.club ?? "";
      case "position":
        return p.position ?? "";
      case "nationality":
        return p.nationality ?? "";
      case "number":
        return p.number ?? Number.POSITIVE_INFINITY;
      case "age":
        return ageOf(p) ?? Number.POSITIVE_INFINITY;
      default:
        return "";
    }
  }

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();

    return typedPlayers.filter((p) => {
      const age = ageOf(p);

      if (query) {
        const hay = [
          p.name ?? "",
          p.club ?? "",
          p.position ?? "",
          p.positionDetail ?? "",
          p.nationality ?? "",
          String(p.number ?? ""),
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(query)) return false;
      }

      if (posFilter !== "all") {
        if ((p.position ?? "").trim() !== posFilter) return false;
      }

      if (!ageMatchesBucket(age, ageFilter)) return false;

      if (natFilter !== "all") {
        const codes = parseNationalityCodes(p.nationality);
        if (!codes.includes(natFilter)) return false;
      }

      if (!hideClub && clubFilter !== "all") {
        if ((p.club ?? "").trim() !== clubFilter) return false;
      }

      if (!hideContracts && statusFilter !== "all" && firstYear) {
        const raw = normalizeContractValue(p.seasons?.[firstYear]);
        if (!hasContractValue(raw)) return false;
        if (raw !== statusFilter) return false;
      }

      return true;
    });
  }, [typedPlayers, q, posFilter, ageFilter, natFilter, clubFilter, statusFilter, firstYear, hideClub, hideContracts, ageSeason]);

  const sorted = React.useMemo(() => {
    const copy = [...filtered];
    copy.sort((p1, p2) => {
      const v1 = sortValue(p1, sortKey);
      const v2 = sortValue(p2, sortKey);
      const c = compareValues(v1, v2);
      return sortDir === "asc" ? c : -c;
    });
    return copy;
  }, [filtered, sortKey, sortDir, ageSeason]);

  function onHeaderClick(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function HeaderCell({ keyName, label, center }: { keyName: SortKey; label: string; center?: boolean }) {
    const active = sortKey === keyName;
    const arrow = active ? (sortDir === "asc" ? " ▲" : " ▼") : "";
    return (
      <th
        onClick={() => onHeaderClick(keyName)}
        style={{
          textAlign: center ? "center" : "left",
          borderBottom: "1px solid var(--borderSoft)",
          padding: "0.75rem 0.6rem",
          cursor: "pointer",
          userSelect: "none",
          whiteSpace: "nowrap",
          color: "var(--muted)",
          fontWeight: 800,
          letterSpacing: "0.01em",
        }}
        title="Click to sort"
      >
        {label}
        {arrow}
      </th>
    );
  }

  const controlWrap: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.9rem",
    alignItems: "end",
    padding: "0.9rem",
    border: "1px solid var(--borderSoft)",
    borderRadius: 14,
    background: "var(--card)",
    marginTop: "0.75rem",
  };

  const controlBlock: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    minWidth: 180,
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: 700,
    color: "var(--muted)",
  };

  const inputStyle: React.CSSProperties = {
    height: 42,
    borderRadius: 12,
    border: "1px solid var(--borderSoft)",
    padding: "0 0.75rem",
    fontSize: "1rem",
    background: "var(--bg)",
    color: "var(--text)",
    outline: "none",
  };

  function ClubCell({ p }: { p: Player }) {
    const slug = (p.clubSlug ?? "").trim();
    const badgeFile = getClubBadgeFile(slug);
    const linkable = isLinkableClubSlug(slug);

    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
        {badgeFile ? (
          <img
            src={`/clubs/${badgeFile}`}
            alt={`${p.club} badge`}
            style={{ width: 18, height: 18, objectFit: "contain", display: "block" }}
          />
        ) : null}

        {linkable ? (
          <Link href={`/clubs/${slug}`} style={{ color: "var(--link)", fontWeight: 650 }}>
            {p.club}
          </Link>
        ) : (
          <span style={{ fontWeight: 550 }}>{p.club}</span>
        )}
      </div>
    );
  }

  const tableWrap: React.CSSProperties = {
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
    width: "100%",
    borderRadius: 14,
  };

  const tableStyle: React.CSSProperties = {
    borderCollapse: "separate",
    borderSpacing: 0,
    width: "100%",
    marginTop: "1rem",
    minWidth: 980,
    background: "var(--card)",
    border: "1px solid var(--borderSoft)",
    borderRadius: 14,
  };

  const tdBase: React.CSSProperties = {
    padding: "0.75rem 0.6rem",
    whiteSpace: "nowrap",
    borderBottom: "1px solid var(--borderSoft)",
    color: "var(--text)",
    verticalAlign: "middle",
  };

  return (
    <div>
      <div style={controlWrap}>
        <div style={{ ...controlBlock, minWidth: 260, flex: "1 1 260px" }}>
          <div style={labelStyle}>Search</div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder}
            style={inputStyle}
          />
        </div>

        <div style={controlBlock}>
          <div style={labelStyle}>Position</div>
          <select value={posFilter} onChange={(e) => setPosFilter(e.target.value)} style={inputStyle}>
            <option value="all">All</option>
            {positionOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div style={controlBlock}>
          <div style={labelStyle}>Age</div>
          <select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value as AgeBucket)} style={inputStyle}>
            <option value="all">{ageBucketLabel("all")}</option>
            <option value="u18">{ageBucketLabel("u18")}</option>
            <option value="u21">{ageBucketLabel("u21")}</option>
            <option value="21_24">{ageBucketLabel("21_24")}</option>
            <option value="25_29">{ageBucketLabel("25_29")}</option>
            <option value="30plus">{ageBucketLabel("30plus")}</option>
          </select>
        </div>

        <div style={controlBlock}>
          <div style={labelStyle}>Nationality</div>
          <select value={natFilter} onChange={(e) => setNatFilter(e.target.value)} style={inputStyle}>
            <option value="all">All</option>
            {nationalityOptions.map((code) => (
              <option key={code} value={code}>
                {displayCountry(code)}
              </option>
            ))}
          </select>
        </div>

        {!hideContracts ? (
          <div style={controlBlock}>
            <div style={labelStyle}>Status ({firstYear ?? "Year"})</div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={inputStyle}
              disabled={!firstYear}
            >
              <option value="all">All</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {prettifyStatus(s)}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {!hideClub ? (
          <div style={controlBlock}>
            <div style={labelStyle}>Club</div>
            <select value={clubFilter} onChange={(e) => setClubFilter(e.target.value)} style={inputStyle}>
              <option value="all">All</option>
              {clubOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div style={{ marginLeft: "auto" }}>
          <button
            onClick={resetFilters}
            style={{
              height: 42,
              borderRadius: 12,
              padding: "0 1rem",
              fontWeight: 700,
              cursor: "pointer",
              background: "var(--btnBg)",
              color: "var(--btnText)",
              border: "1px solid var(--btnBorder)",
            }}
          >
            Reset
          </button>
        </div>

        <div style={{ width: "100%", color: "var(--muted)", fontSize: "0.95rem" }}>
          Showing <b style={{ color: "var(--text)" }}>{sorted.length}</b> of{" "}
          <b style={{ color: "var(--text)" }}>{typedPlayers.length}</b> {entityLabel}
        </div>
      </div>

      <div style={tableWrap}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <HeaderCell keyName="number" label="No." />
              <HeaderCell keyName="name" label="Player" />
              <HeaderCell keyName="position" label="Pos" />
              <HeaderCell keyName="age" label="Age" />
              <HeaderCell keyName="nationality" label="Nat." />
              {!hideClub && <HeaderCell keyName="club" label="Club" />}

              {!hideContracts
                ? years.map((y) => {
                    const leftDivider = y === firstYear;
                    const active = sortKey === `season:${y}`;
                    const arrow = active ? (sortDir === "asc" ? " ▲" : " ▼") : "";

                    return (
                      <th
                        key={y}
                        onClick={() => onHeaderClick(`season:${y}`)}
                        style={{
                          textAlign: "center",
                          borderBottom: "1px solid var(--borderSoft)",
                          padding: "0.75rem 0.6rem",
                          cursor: "pointer",
                          userSelect: "none",
                          whiteSpace: "nowrap",
                          borderLeft: leftDivider ? "2px solid var(--border)" : undefined,
                          color: "var(--muted)",
                          fontWeight: 800,
                          letterSpacing: "0.01em",
                        }}
                        title="Click to sort"
                      >
                        {y}
                        {arrow}
                      </th>
                    );
                  })
                : null}
            </tr>
          </thead>

          <tbody>
            {sorted.map((p, idx) => {
              const age = ageOf(p);

              return (
                <tr key={p.id} style={{ background: idx % 2 === 0 ? "transparent" : "var(--rowAlt)" }}>
                  <td style={tdBase}>{p.number ?? "—"}</td>

                  <td style={{ ...tdBase, fontWeight: 650 }}>{p.name}</td>

                  <td style={{ ...tdBase, whiteSpace: "nowrap" }}>
                    <div style={{ fontWeight: 550 }}>{p.position ?? "—"}</div>
                    {p.positionDetail ? (
                      <div
                        style={{
                          fontSize: "0.8rem",
                          fontStyle: "italic",
                          color: "var(--muted)",
                          lineHeight: 1.3,
                        }}
                      >
                        {p.positionDetail}
                      </div>
                    ) : null}
                  </td>

                  <td style={tdBase}>{age ?? "—"}</td>

                  <td style={tdBase}>{FlagsFromCell(p.nationality)}</td>

                  {!hideClub ? <td style={tdBase}><ClubCell p={p} /></td> : null}

                  {!hideContracts
                    ? years.map((y, yearIdx) => {
                        const raw = normalizeContractValue(p.seasons?.[y]);
                        const underContract = hasContractValue(raw);

                        const leftDivider = y === firstYear;
                        const seasonAge = ageOnJan1(p.birthDate, Number(y));
                        const badge = underContract ? badgeForSeasonAge(seasonAge) : null;

                        const cellTitle = yearIdx === 0 && underContract && p.notes ? p.notes : undefined;

                        return (
                          <td
                            key={y}
                            title={cellTitle}
                            style={{
                              ...tdBase,
                              textAlign: "center",
                              borderLeft: leftDivider ? "2px solid var(--border)" : undefined,
                            }}
                          >
                            {underContract ? <ContractPill value={raw} /> : "—"}

                            {badge ? (
                              <span style={{ marginLeft: "0.5rem", display: "inline-block" }} title={badge.title}>
                                <TagPill label={badge.label} />
                              </span>
                            ) : null}
                          </td>
                        );
                      })
                    : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <style>{`
        table tr:hover td {
          background: var(--rowHover);
        }
        table tr:hover td:first-child {
          border-top-left-radius: 12px;
          border-bottom-left-radius: 12px;
        }
        table tr:hover td:last-child {
          border-top-right-radius: 12px;
          border-bottom-right-radius: 12px;
        }
      `}</style>
    </div>
  );
}
