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

// Decide whether a season cell counts as "under contract / meaningful status"
function isActiveSeasonCell(raw: string | undefined) {
  const s = (raw ?? "").trim();
  if (!s) return false;

  const low = s.toLowerCase();

  // treat these as NOT under contract
  if (low === "-" || low === "—") return false;
  if (low === "n/a" || low === "na") return false;
  if (low.includes("expired")) return false;

  // everything else counts (Domestic, International, Guaranteed, Option, In Discussion, etc.)
  return true;
}

function Badge({ label, title }: { label: string; title?: string }) {
  return (
    <span
      title={title}
      style={{
        display: "inline-block",
        marginLeft: "0.4rem",
        padding: "0.05rem 0.35rem",
        borderRadius: "999px",
        fontSize: "0.7rem",
        lineHeight: 1.4,
        border: "1px solid #ddd",
        background: "#f8f8f8",
        whiteSpace: "nowrap",
        verticalAlign: "middle",
      }}
    >
      {label}
    </span>
  );
}

function badgeForSeasonAge(age: number | undefined) {
  if (age == null) return null;
  if (age < 18) return { label: "U-18", title: "U-18 on Jan 1" };
  if (age < 21) return { label: "U-21", title: "U-21 on Jan 1" };
  return null;
}

export default function PlayersTable({ players }: { players: Player[] }) {
  const [sortKey, setSortKey] = React.useState<SortKey>("name");
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");

  const years = React.useMemo(() => {
    const set = new Set<string>();
    for (const p of players) {
      for (const y of Object.keys(p.seasons ?? {})) {
        if (/^\d{4}$/.test(y)) set.add(y);
      }
    }
    return Array.from(set).sort();
  }, [players]);

  // Choose what year the Age column represents (closest season >= current year)
  const ageSeason = React.useMemo(() => {
    const current = new Date().getFullYear();
    const numericYears = years
      .map((y) => Number(y))
      .filter((n) => Number.isFinite(n))
      .sort((a, b) => a - b);

    return numericYears.find((y) => y >= current) ?? numericYears[0] ?? current;
  }, [years]);

  function ageOf(p: Player) {
    return ageOnJan1(p.birthDate, ageSeason);
  }

  function sortValue(p: Player, key: SortKey): string | number {
    if (key.startsWith("season:")) {
      const y = key.slice("season:".length);
      // Sort by the raw season cell value (blank sorts last naturally via "")
      return p.seasons?.[y] ?? "";
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

  return (
    <table style={{ borderCollapse: "collapse", width: "100%", marginTop: "1rem" }}>
      <thead>
        <tr>
          <Header keyName="number" label="No." />
          <Header keyName="name" label="Player" />
          <Header keyName="position" label="Pos" />
          <Header keyName="age" label="Age" />
          <Header keyName="nationality" label="Nat." />
          <Header keyName="club" label="Club" />
          {years.map((y) => (
            <Header key={y} keyName={`season:${y}`} label={y} />
          ))}
        </tr>
      </thead>

      <tbody>
        {sorted.map((p) => {
          const age = ageOf(p);

          return (
            <tr key={p.id}>
              <td style={{ padding: "0.5rem" }}>{p.number ?? "—"}</td>
              <td style={{ padding: "0.5rem" }}>{p.name}</td>
              <td style={{ padding: "0.5rem" }}>{p.position ?? "—"}</td>
              <td style={{ padding: "0.5rem" }}>{age ?? "—"}</td>
              <td style={{ padding: "0.5rem" }}>{FlagsFromCell(p.nationality)}</td>
              <td style={{ padding: "0.5rem" }}>{p.club}</td>

              {years.map((y) => {
                const raw = p.seasons?.[y]; // will be undefined if your sheet cell is blank (because getPlayers only stores non-empty)
                const showBadge = isActiveSeasonCell(raw);

                const seasonYear = Number(y);
                const seasonAge =
                  showBadge && Number.isFinite(seasonYear)
                    ? ageOnJan1(p.birthDate, seasonYear)
                    : undefined;

                const b = showBadge ? badgeForSeasonAge(seasonAge) : null;

                return (
                  <td key={y} style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>
                    {raw ? raw : "" /* blank cell stays blank */}
                    {b ? <Badge label={b.label} title={b.title} /> : null}
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