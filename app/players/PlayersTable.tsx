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

function normalizeIso2(code: string) {
  return code.trim().toLowerCase();
}

function Flag({ code, title }: { code: string; title?: string }) {
  const iso2 = normalizeIso2(code);
  if (!/^[a-z]{2}$/.test(iso2)) return null;

  return (
    <img
      src={`/flags/4x3/${iso2}.svg`}
      alt={code.toUpperCase()}
      title={title ?? code.toUpperCase()}
      style={{
        width: "1.2em",
        height: "0.9em",
        verticalAlign: "middle",
        borderRadius: "2px",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.08)",
      }}
    />
  );
}

function renderFlags(cell: string | undefined) {
  if (!cell) return "—";

  const codes = cell
    .split(";")
    .map((s) => s.trim())
    .map(normalizeIso2)
    .filter((c) => /^[a-z]{2}$/.test(c)); // keep only valid ISO-2

  if (codes.length === 0) return "—";

  return (
    <span style={{ display: "inline-flex", gap: "0.35rem", alignItems: "center" }}>
      {codes.map((c) => (
        <Flag key={c} code={c} title={cell} />
      ))}
    </span>
  );
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
          return (
            <tr key={p.id}>
              <td style={{ padding: "0.5rem" }}>{p.number ?? "—"}</td>
              <td style={{ padding: "0.5rem" }}>{p.name}</td>
              <td style={{ padding: "0.5rem" }}>{p.position ?? "—"}</td>
              <td style={{ padding: "0.5rem" }}>{age ?? "—"}</td>

              <td style={{ padding: "0.5rem" }} title={p.nationality ?? ""}>
                {renderFlags(p.nationality)}
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