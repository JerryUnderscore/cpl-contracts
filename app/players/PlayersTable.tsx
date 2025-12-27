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

  // birthDate is "YYYY-MM-DD"
  const m = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return undefined;

  const y = Number(m[1]);
  const mo = Number(m[2]); // 1-12
  const d = Number(m[3]);  // 1-31
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return undefined;

  let age = seasonYear - y;

  // If birthday is AFTER Jan 1 (i.e., not Jan 1), subtract 1
  // Jan 1 => (mo === 1 && d === 1) means no subtraction.
  if (!(mo === 1 && d === 1)) age -= 1;

  return age;
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

  // Use the first season column (usually 2026) to compute the Age column
  const ageSeason = React.useMemo(() => {
    const first = years[0];
    return first && /^\d{4}$/.test(first) ? Number(first) : new Date().getFullYear();
  }, [years]);

  function ageOf(p: Player) {
    return ageOnJan1(p.birthDate, ageSeason);
  }

  function sortValue(p: Player, key: SortKey): string | number {
    if (key.startsWith("season:")) {
      const y = key.slice("season:".length);
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
        // sort by raw cell value (e.g., "CA;NG")
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

              <td style={{ padding: "0.5rem" }}>
                {FlagsFromCell(p.nationality)}
              </td>

              <td style={{ padding: "0.5rem" }}>{p.club}</td>

              {years.map((y) => (
                <td key={y} style={{ padding: "0.5rem" }}>
                  {p.seasons?.[y] ?? "—"}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}