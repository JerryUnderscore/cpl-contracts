"use client";

import * as React from "react";
import type { Player } from "../lib/players";
import { FlagsFromCell } from "../lib/Flag";

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
  // Jan 1 counts as already had birthday; anything after Jan 1 => subtract 1
  if (!(mo === 1 && d === 1)) age -= 1;
  return age;
}

function isUnderContractValue(raw: string | undefined) {
  const v = (raw ?? "").trim();
  if (!v) return false;
  if (/^n\/a$/i.test(v)) return false;
  return true;
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

  if (kind === "international") return { ...base, background: "#fff4f4", borderColor: "#f0c9c9" };
  if (kind === "domestic") return { ...base, background: "#f4fff6", borderColor: "#cfe9d4" };
  if (kind === "option") return { ...base, background: "#f4f7ff", borderColor: "#cfd8f0" };
  if (kind === "draft") return { ...base, background: "#fffaf0", borderColor: "#f0e1bf" };
  if (kind === "discussion") return { ...base, background: "#f8f8f8", borderColor: "#e0e0e0" };

  return base;
}

function contractKindFromValue(raw: string) {
  const v = raw.toLowerCase();
  if (v.includes("international")) return "international";
  if (v.includes("domestic")) return "domestic";
  if (v.includes("option")) return "option";
  if (v.includes("u-sports") || v.includes("draft")) return "draft";
  if (v.includes("discussion")) return "discussion";
  return "other";
}

function ContractPill({ value }: { value: string }) {
  const kind = contractKindFromValue(value);
  return <span style={pillStyle(kind)}>{value}</span>;
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

  const years = React.useMemo(() => {
    const set = new Set<string>();
    for (const p of players) {
      for (const y of Object.keys(p.seasons ?? {})) {
        if (isYearHeader(y)) set.add(y);
      }
    }
    return Array.from(set).sort();
  }, [players]);

  // Age column uses the first season column (e.g., 2026) for “age on Jan 1”
  const ageSeason = React.useMemo(() => {
    const first = years[0];
    return first && isYearHeader(first) ? Number(first) : new Date().getFullYear();
  }, [years]);

  function ageOf(p: Player) {
    return ageOnJan1(p.birthDate, ageSeason);
  }

  function sortValue(p: Player, key: SortKey): string | number {
    if (key.startsWith("season:")) {
      const y = key.slice("season:".length);
      return (p.seasons?.[y] ?? "").trim();
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

  const sorted = React.useMemo(() => {
    const copy = [...players];
    copy.sort((p1, p2) => {
      const v1 = sortValue(p1, sortKey);
      const v2 = sortValue(p2, sortKey);
      const c = compareValues(v1, v2);
      return sortDir === "asc" ? c : -c;
    });
    return copy;
  }, [players, sortKey, sortDir, ageSeason]);

  function onHeaderClick(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
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

  const firstYear = years[0]; // vertical divider goes before this column

  return (
    <table style={{ borderCollapse: "collapse", width: "100%", marginTop: "1rem" }}>
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
            return (
              <th
                key={y}
                onClick={() => onHeaderClick(`season:${y}`)}
                style={{
                  textAlign: "center", // ✅ centered year headers
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
                {sortKey === `season:${y}` ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
              </th>
            );
          })}
        </tr>
      </thead>

      <tbody>
        {sorted.map((p, idx) => {
          const age = ageOf(p);
          const isHover = hoverId === p.id;

          // Zebra + hover
          const baseBg = idx % 2 === 0 ? "white" : "#fafafa";
          const rowBg = isHover ? "#f1f7ff" : baseBg;

          return (
            <tr
              key={p.id}
              onMouseEnter={() => setHoverId(p.id)}
              onMouseLeave={() => setHoverId(null)}
              style={{ background: rowBg }}
            >
              <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>{p.number ?? "—"}</td>

              <td style={{ padding: "0.5rem", fontWeight: 600 }}>{p.name}</td>

              <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>{p.position ?? "—"}</td>

              <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>{age ?? "—"}</td>

              <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>
                {FlagsFromCell(p.nationality)}
              </td>

              {!hideClub && <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>{p.club}</td>}
{years.map((y, yearIdx) => {
  const raw = (p.seasons?.[y] ?? "").trim();
  const underContract = isUnderContractValue(raw);

  const leftDivider = y === firstYear;
  const seasonAge = ageOnJan1(p.birthDate, Number(y));
  const badge = underContract ? badgeForSeasonAge(seasonAge) : null;

  // Tooltip on FIRST contract year only (when notes exist)
  const showNotesTooltip = yearIdx === 0 && !!p.notes;
  const cellTitle = showNotesTooltip ? p.notes : undefined;

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
  );
}