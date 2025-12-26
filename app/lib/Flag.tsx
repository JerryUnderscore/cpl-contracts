// app/components/Flag.tsx
import * as React from "react";

function normalizeIso2(code: string) {
  return code.trim().toLowerCase();
}

export function Flag({ code, title }: { code: string; title?: string }) {
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

export function FlagsFromCell(cell: string | undefined) {
  if (!cell) return "—";
  const codes = cell
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  if (codes.length === 0) return "—";

  return (
    <span style={{ display: "inline-flex", gap: "0.35rem", alignItems: "center" }}>
      {codes.map((c) => (
        <Flag key={c} code={c} title={cell} />
      ))}
    </span>
  );
}