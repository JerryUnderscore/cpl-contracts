import * as React from "react";

/**
 * Supports:
 * - ISO-2 country codes: CA, FR, JM, etc (case-insensitive)
 * - UK home nations + a few friendly aliases:
 *   ENG / ENGLAND  -> eng.svg
 *   SCOT / SCO / SCOTLAND -> scot.svg
 *   WALES / WAL -> wales.svg
 *   NIR / NOR_IRE / "NORTHERN IRELAND" -> nor_ire.svg
 *
 * In Google Sheets you can store multiple codes separated by semicolons:
 *   "CA; JM" or "CA; ENG"
 */

const ALIASES: Record<string, string> = {
  // England
  eng: "eng",
  england: "eng",

  // Scotland
  scot: "scot",
  sco: "scot",
  scotland: "scot",

  // Wales
  wales: "wales",
  wal: "wales",

  // Northern Ireland
  nir: "nor_ire",
  nor_ire: "nor_ire",
  "northern ireland": "nor_ire",
};

function normalize(code: string) {
  return code.trim().toLowerCase();
}

function resolveFlagFile(code: string): string | null {
  const c = normalize(code);

  // ISO-2 (e.g., CA, FR, JM)
  if (/^[a-z]{2}$/.test(c)) return c;

  // Aliases (eng/scot/wales/nor_ire etc)
  return ALIASES[c] ?? null;
}

export function Flag({ code, title }: { code: string; title?: string }) {
  const file = resolveFlagFile(code);
  if (!file) return null;

  return (
    <img
      src={`/flags/4x3/${file}.svg`}
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

  // Render only codes we can resolve (ISO-2 or known aliases)
  const resolved = codes.filter((c) => resolveFlagFile(c) !== null);
  if (resolved.length === 0) return "—";

  return (
    <span style={{ display: "inline-flex", gap: "0.35rem", alignItems: "center" }}>
      {resolved.map((c) => (
        <Flag key={c} code={c} title={cell} />
      ))}
    </span>
  );
}