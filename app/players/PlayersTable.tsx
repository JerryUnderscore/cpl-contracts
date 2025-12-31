// app/players/PlayersTable.tsx
"use client";

import * as React from "react";
import type { Player } from "../lib/players";
import { FlagsFromCell } from "../lib/Flag";
import {
  normalizeContractValue,
  hasContractValue,
  contractKindFromValue,
} from "../lib/contracts";

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
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d))
    return undefined;

  let age = seasonYear - y;
  // Jan 1 counts as already had birthday; anything after Jan 1 => subtract 1
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

function Badge({ label, title }: { label: string; title?: string }) {
  return (
    <span
      title={title}
      style={{
        display: "inline-block",
        marginLeft: "0.5rem",
        padding: "0.1rem 0.45rem",
        borderRadius: "999px",
        fontSize: "0.75rem",
        lineHeight: 1.4,
        border: "1px solid #ddd",
        background: "#f8f8f8",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function pillStyle(kind: string): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "inline-block",
    padding: "0.15rem 0.55rem",
    borderRadius: "999px",
    fontSize: "0.85rem",
    lineHeight: 1.4,
    border: "1px solid #ddd",
    background: "#f7f7f7",
    whiteSpace: "nowrap",
  };

  // semantic-ish variations (kept subtle)
  if (kind === "international")
    return { ...base, background: "#fff4f4", borderColor: "#f0c9c9" };
  if (kind === "domestic")
    return { ...base, background: "#f4fff6", borderColor: "#cfe9d4" };
  if (kind === "club_option")
    return { ...base, background: "#fffaf0", borderColor: "#f0e1bf" };
  if (kind === "option_pending")
    return { ...base, background: "#f4f7ff", borderColor: "#cfd8f0" };
  if (kind === "in_discussion")
    return { ...base, background: "#f8f8f8", borderColor: "#e0e0e0" };
  if (kind === "eyt")
    return { ...base, background: "#f5f0ff", borderColor: "#dccdf0" };
  if (kind === "u_sports")
    return { ...base, background: "#f5f0ff", borderColor: "#dccdf0" };
  if (kind === "development")
    return { ...base, background: "#f5f0ff", borderColor: "#dccdf0" };

  return base;
}

function ContractPill({ value }: { value: string }) {
  const kind = contractKindFromValue(value);
  return <span style={pillStyle(kind)}>{value}</span>;
}

// --- Country code -> display name (for nationality filter UI) ---
// Add more as you encounter them; unknown codes fall back to the code.
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
  // You said you use semicolons; also tolerate commas just in case.
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
  // Keeps display stable in the dropdown
  return value;
}

export default function PlayersTable({
  players,
  hideClub = false,
}: {
  players: Player[];
  hideClub?: boolean;
}) {
  const [sortKey, setSortKey] = React.useState<SortKey>("name");
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");
  const [hoverId, setHoverId] = React.useState<string | null>(null);

  // Filters
  const [q, setQ] = React.useState("");
  const [posFilter, setPosFilter] = React.useState<string>("all");
  const [ageFilter, setAgeFilter] = React.useState<AgeBucket>("all");
  const [natFilter, setNatFilter] = React.useState<string>("all"); // stores CODE
  const [clubFilter, setClubFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const years = React.useMemo(() => {
    const set = new Set<string>();
    for (const p of players) {
      for (const y of Object.keys(p.seasons ?? {})) {
        if (isYearHeader(y)) set.add(y);
      }
    }
    return Array.from(set).sort();
  }, [players]);

  const firstYear = years[0]; // also used for "Status (YYYY)" filter

  // Age column uses the first season column (e.g., 2026) for “age on Jan 1”
  const ageSeason = React.useMemo(() => {
    return firstYear && isYearHeader(firstYear)
      ? Number(firstYear)
      : new Date().getFullYear();
  }, [firstYear]);

  function ageOf(p: Player) {
    return ageOnJan1(p.birthDate, ageSeason);
  }

  // Build dropdown options
  const positionOptions = React.useMemo(() => {
    const set = new Set<string>();
    for (const p of players) {
      const v = (p.position ?? "").trim();
      if (v) set.add(v);
    }
    return Array.from(set).sort(compareStrings);
  }, [players]);

  const clubOptions = React.useMemo(() => {
    const set = new Set<string>();
    for (const p of players) {
      const v = (p.club ?? "").trim();
      if (v) set.add(v);
    }
    return Array.from(set).sort(compareStrings);
  }, [players]);

  const nationalityOptions = React.useMemo(() => {
    const set = new Set<string>();
    for (const p of players) {
      for (const c of parseNationalityCodes(p.nationality)) set.add(c);
    }
    // IMPORTANT: sort by country display name, not code
    return Array.from(set).sort((a, b) =>
      compareStrings(displayCountry(a), displayCountry(b))
    );
  }, [players]);

  const statusOptions = React.useMemo(() => {
    const set = new Set<string>();
    const y = firstYear;
    if (!y) return [];
    for (const p of players) {
      const raw = normalizeContractValue(p.seasons?.[y]);
      if (hasContractValue(raw)) set.add(raw);
    }
    // Make a stable order that feels human
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
  }, [players, firstYear]);

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

    return players.filter((p) => {
      const age = ageOf(p);

      // Search
      if (query) {
        const hay = [
          p.name ?? "",
          p.club ?? "",
          p.position ?? "",
          p.nationality ?? "",
          String(p.number ?? ""),
        ]
          .join(" ")
          .toLowerCase();

        if (!hay.includes(query)) return false;
      }

      // Position
      if (posFilter !== "all") {
        if ((p.position ?? "").trim() !== posFilter) return false;
      }

      // Age bucket
      if (!ageMatchesBucket(age, ageFilter)) return false;

      // Nationality (any match)
      if (natFilter !== "all") {
        const codes = parseNationalityCodes(p.nationality);
        if (!codes.includes(natFilter)) return false;
      }

      // Club
      if (!hideClub && clubFilter !== "all") {
        if ((p.club ?? "").trim() !== clubFilter) return false;
      }

      // Status (based on FIRST year column)
      if (statusFilter !== "all" && firstYear) {
        const raw = normalizeContractValue(p.seasons?.[firstYear]);
        if (!hasContractValue(raw)) return false;
        if (raw !== statusFilter) return false;
      }

      return true;
    });
  }, [
    players,
    q,
    posFilter,
    ageFilter,
    natFilter,
    clubFilter,
    statusFilter,
    ageSeason,
    firstYear,
    hideClub,
  ]);

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

  function Header({ keyName, label }: { keyName: SortKey; label: string }) {
    const active = sortKey === keyName;
    const arrow = active ? (sortDir === "asc" ? " ▲" : " ▼") : "";
    return (
      <th
        onClick={() => onHeaderClick(keyName)}
        style={{
          textAlign: "left",
          borderBottom: "1px solid #ddd",
          padding: "0.5rem",
          cursor: "pointer",
          userSelect: "none",
          whiteSpace: "nowrap",
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
    border: "1px solid #eee",
    borderRadius: 14,
    background: "#fff",
    marginTop: "0.75rem",
  };

  const controlBlock: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    minWidth: 180,
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: 650,
    color: "#444",
  };

  const inputStyle: React.CSSProperties = {
    height: 42,
    borderRadius: 12,
    border: "1px solid #ddd",
    padding: "0 0.75rem",
    fontSize: "1rem",
    background: "white",
  };

  return (
    <div>
      {/* Filters + search */}
      <div style={controlWrap}>
        <div style={{ ...controlBlock, minWidth: 260, flex: "1 1 260px" }}>
          <div style={labelStyle}>Search</div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search player, club, position, nationality…"
            style={inputStyle}
          />
        </div>

        <div style={controlBlock}>
          <div style={labelStyle}>Position</div>
          <select
            value={posFilter}
            onChange={(e) => setPosFilter(e.target.value)}
            style={inputStyle}
          >
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
          <select
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value as AgeBucket)}
            style={inputStyle}
          >
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
          <select
            value={natFilter}
            onChange={(e) => setNatFilter(e.target.value)}
            style={inputStyle}
          >
            <option value="all">All</option>
            {nationalityOptions.map((code) => (
              <option key={code} value={code}>
                {displayCountry(code)}
              </option>
            ))}
          </select>
        </div>

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

        {!hideClub ? (
          <div style={controlBlock}>
            <div style={labelStyle}>Club</div>
            <select
              value={clubFilter}
              onChange={(e) => setClubFilter(e.target.value)}
              style={inputStyle}
            >
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
              border: "1px solid #ddd",
              padding: "0 1rem",
              background: "white",
              fontWeight: 650,
              cursor: "pointer",
            }}
          >
            Reset
          </button>
        </div>

        <div style={{ width: "100%", color: "#666", fontSize: "0.95rem" }}>
          Showing <b>{sorted.length}</b> of <b>{players.length}</b> players
        </div>
      </div>

      {/* Table (now horizontally scrollable on small screens) */}
      <div
        style={{
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          width: "100%",
        }}
      >
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            marginTop: "1rem",
            minWidth: 980, // 👈 forces horizontal scrolling instead of squeezing columns
          }}
        >
          <thead>
            <tr>
              <Header keyName="number" label="No." />
              <Header keyName="name" label="Player" />
              <Header keyName="position" label="Pos" />
              <Header keyName="age" label="Age" />
              <Header keyName="nationality" label="Nat." />
              {!hideClub && <Header keyName="club" label="Club" />}

              {years.map((y) => {
                const leftDivider = y === firstYear;
                const active = sortKey === `season:${y}`;
                const arrow = active ? (sortDir === "asc" ? " ▲" : " ▼") : "";

                return (
                  <th
                    key={y}
                    onClick={() => onHeaderClick(`season:${y}`)}
                    style={{
                      textAlign: "center",
                      borderBottom: "1px solid #ddd",
                      padding: "0.5rem",
                      cursor: "pointer",
                      userSelect: "none",
                      whiteSpace: "nowrap",
                      borderLeft: leftDivider ? "2px solid #e5e5e5" : undefined,
                    }}
                    title="Click to sort"
                  >
                    {y}
                    {arrow}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {sorted.map((p, idx) => {
              const age = ageOf(p);
              const isHover = hoverId === p.id;

              const baseBg = idx % 2 === 0 ? "white" : "#fafafa";
              const rowBg = isHover ? "#f1f7ff" : baseBg;

              return (
                <tr
                  key={p.id}
                  onMouseEnter={() => setHoverId(p.id)}
                  onMouseLeave={() => setHoverId(null)}
                  style={{ background: rowBg }}
                >
                  <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>
                    {p.number ?? "—"}
                  </td>

                  <td style={{ padding: "0.5rem", fontWeight: 600 }}>{p.name}</td>

                  <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>
                    {p.position ?? "—"}
                  </td>

                  <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>
                    {age ?? "—"}
                  </td>

                  <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>
                    {FlagsFromCell(p.nationality)}
                  </td>

                  {!hideClub && (
                    <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>{p.club}</td>
                  )}

                  {years.map((y, yearIdx) => {
                    const raw = normalizeContractValue(p.seasons?.[y]);
                    const underContract = hasContractValue(raw);

                    const leftDivider = y === firstYear;
                    const seasonAge = ageOnJan1(p.birthDate, Number(y));
                    const badge = underContract ? badgeForSeasonAge(seasonAge) : null;

                    // Notes tooltip on the FIRST year column only, but only if that cell is actually "under contract".
                    const cellTitle =
                      yearIdx === 0 && underContract && p.notes ? p.notes : undefined;

                    return (
                      <td
                        key={y}
                        title={cellTitle}
                        style={{
                          padding: "0.5rem",
                          whiteSpace: "nowrap",
                          borderLeft: leftDivider ? "2px solid #e5e5e5" : undefined,
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        {underContract ? <ContractPill value={raw} /> : "—"}
                        {badge ? <Badge label={badge.label} title={badge.title} /> : null}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}