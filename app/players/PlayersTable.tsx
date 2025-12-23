"use client";

import * as React from "react";

type ContractType = "Guaranteed" | "Option" | "Loan" | "Unknown";

export type Player = {
  id: string;
  name: string;
  club: string;
  position?: string;
  contractEnd?: string;
  contractType?: ContractType;
  source?: string;
  notes?: string;
};

type SortKey = "name" | "club" | "position" | "contractEnd" | "contractType";
type SortDir = "asc" | "desc";

function compare(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

export default function PlayersTable({ players }: { players: Player[] }) {
  const [sortKey, setSortKey] = React.useState<SortKey>("name");
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");

  const sorted = React.useMemo(() => {
    const copy = [...players];
    copy.sort((p1, p2) => {
      const v1 = (p1[sortKey] ?? "").toString();
      const v2 = (p2[sortKey] ?? "").toString();
      const c = compare(v1, v2);
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
          <Header keyName="name" label="Name" />
          <Header keyName="club" label="Club" />
          <Header keyName="position" label="Pos" />
          <Header keyName="contractEnd" label="Contract end" />
          <Header keyName="contractType" label="Type" />
        </tr>
      </thead>
      <tbody>
        {sorted.map((p) => (
          <tr key={p.id}>
            <td style={{ padding: "0.5rem" }}>{p.name}</td>
            <td style={{ padding: "0.5rem" }}>{p.club}</td>
            <td style={{ padding: "0.5rem" }}>{p.position ?? "—"}</td>
            <td style={{ padding: "0.5rem" }}>{p.contractEnd ?? "—"}</td>
            <td style={{ padding: "0.5rem" }}>{p.contractType ?? "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}