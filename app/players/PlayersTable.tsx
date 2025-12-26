"use client";

import * as React from "react";
import type { Player } from "../lib/players";

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

// Convert ISO-2 country code (e.g., "CA") into flag emoji (🇨🇦)
function iso2ToFlagEmoji(code: string) {
  const c = (code || "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(c)) return "🏳️"; // fallback for bad data
  const BASE = 0x1f1e6; // regional indicator symbol letter A
  const A = "A".charCodeAt(0);
  return String.fromCodePoint(
    BASE + (c.charCodeAt(0) - A),
    BASE + (c.charCodeAt(1) - A)
  );
}

// Your sheet will store ISO-2 codes, separated by semicolons: "CA;HT"
function renderFlags(nationalityCell?: string) {
  const raw = (nationalityCell ?? "").trim();
  if (!raw) return "—";

  const parts = raw
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!parts.length) return "—";

  return parts.map(iso2ToFlagEmoji).join(" ");
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

  const currentYear = new Date().getFullYear();

  function ageOf(p: Player) {
    return p.birthYear ? currentYear - p.birthYear : undefined;
  }

  // Sorting: for nationality, sort by the raw ISO-2 string in the sheet
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
        return p.nationality ?? "";
      case "number":
        return p.number ?? Number.POSITIVE_INFINITY; // blanks sort last
      case "age":
        return ageOf(p) ?? Number.POSITIVE_INFINITY; // blanks sort last
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
  }, [players, sortKey, sortDir]);

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
          const rawNat = (p.nationality ?? "").trim();

          return (
            <tr key={p.id}>
              <td style={{ padding: "0.5rem" }}>{p.number ?? "—"}</td>
              <td style={{ padding: "0.5rem" }}>{p.name}</td>
              <td style={{ padding: "0.5rem" }}>{p.position ?? "—"}</td>
              <td style={{ padding: "0.5rem" }}>{age ?? "—"}</td>

              <td style={{ padding: "0.5rem" }} title={rawNat || ""}>
                {renderFlags(rawNat)}
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