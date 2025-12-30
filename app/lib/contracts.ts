// app/lib/contracts.ts

export type ContractStatus =
  | "Domestic"
  | "International"
  | "Club Option"
  | "Option (pending)"
  | "In Discussion"
  | "EYT"
  | "U SPORTS"
  | "Development"
  | "N/A";

/**
 * Normalize whatever comes out of the sheet into a predictable value.
 * - trims
 * - collapses whitespace
 * - standardizes common variants / typos
 *
 * Returns:
 * - a canonical ContractStatus
 * - or "" for blank/empty
 */
export function normalizeContractValue(
  raw: string | undefined | null
): ContractStatus | "" {
  const v = String(raw ?? "").trim().replace(/\s+/g, " ");
  if (!v) return "";

  const lower = v.toLowerCase();

  // U SPORTS variants
  if (lower === "u sports" || lower === "u-sports" || lower === "usports") {
    return "U SPORTS";
  }

  // Option (pending) variants
  if (
    lower === "option pending" ||
    lower === "option (pending)" ||
    lower === "pending option"
  ) {
    return "Option (pending)";
  }

  // Club Option variants
  if (lower === "club option" || lower === "club-option" || lower === "cluboption") {
    return "Club Option";
  }

  // In Discussion variants
  if (lower === "in discussion" || lower === "discussion") return "In Discussion";

  // N/A variants
  if (lower === "n/a" || lower === "na" || lower === "n.a.") return "N/A";

  // If your sheet uses the dropdown list, this will already be a valid status.
  // If it isn't, this cast will still compile, but you may want to tighten later.
  return v as ContractStatus;
}

/**
 * True if the cell should display a contract value (pill/badge logic).
 * - blank => false
 * - N/A => false
 * - everything else => true
 */
export function isUnderContractValue(raw: string | undefined | null): boolean {
  const v = normalizeContractValue(raw);
  if (!v) return false;
  if (v === "N/A") return false;
  return true;
}

// Backwards compatibility for existing imports
export const hasContractValue = isUnderContractValue;

/**
 * Primary roster: counts toward CPL 20–23 (your chosen definition).
 * Domestic / International / Club Option
 */
export function isPrimaryContract(raw: string | undefined | null): boolean {
  const v = normalizeContractValue(raw);
  return v === "Domestic" || v === "International" || v === "Club Option";
}

/**
 * Developmental roster: tracked separately (your chosen definition).
 * EYT / U SPORTS / Development
 */
export function isDevelopmentContract(raw: string | undefined | null): boolean {
  const v = normalizeContractValue(raw);
  return v === "EYT" || v === "U SPORTS" || v === "Development";
}

/**
 * Ignored for compliance math (pending/discussion/N-A/blank).
 */
export function isIgnoredContract(raw: string | undefined | null): boolean {
  const v = normalizeContractValue(raw);
  return v === "" || v === "N/A" || v === "Option (pending)" || v === "In Discussion";
}

/**
 * Convenience: internationals ONLY (used for max-7 checks, etc.).
 */
export function isInternationalPrimary(raw: string | undefined | null): boolean {
  const v = normalizeContractValue(raw);
  return v === "International";
}

/**
 * Pill “kinds” used by PlayersTable styling logic.
 * These are underscore_names to match what your other files were expecting.
 */
export type ContractKind =
  | "domestic"
  | "international"
  | "club_option"
  | "option_pending"
  | "in_discussion"
  | "eyt"
  | "u_sports"
  | "development"
  | "na"
  | "other";

/**
 * Map a (raw) contract cell to a pill kind.
 */
export function contractKindFromValue(
  raw: string | undefined | null
): ContractKind {
  const v = normalizeContractValue(raw);

  if (!v) return "other";
  if (v === "Domestic") return "domestic";
  if (v === "International") return "international";
  if (v === "Club Option") return "club_option";
  if (v === "Option (pending)") return "option_pending";
  if (v === "In Discussion") return "in_discussion";
  if (v === "EYT") return "eyt";
  if (v === "U SPORTS") return "u_sports";
  if (v === "Development") return "development";
  if (v === "N/A") return "na";

  return "other";
}