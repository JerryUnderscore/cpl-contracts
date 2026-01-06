// app/lib/club-badges.ts
import { CLUB_BY_SLUG } from "./clubs";

// For clubs that should show a badge, but are NOT real club pages/nav items
const EXTRA_BADGE_FILES: Record<string, string> = {
  valour: "valour.svg",
};

export function getClubBadgeFile(slug?: string): string | undefined {
  const s = (slug ?? "").trim().toLowerCase();
  if (!s) return undefined;

  const fromCpl = CLUB_BY_SLUG[s]?.logoFile;
  if (fromCpl) return fromCpl;

  return EXTRA_BADGE_FILES[s];
}

export function isLinkableClubSlug(slug?: string): boolean {
  const s = (slug ?? "").trim().toLowerCase();
  return Boolean(s && CLUB_BY_SLUG[s]);
}