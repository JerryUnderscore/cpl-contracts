// app/lib/clubs.ts
// Branding + navigation only. All factual club metadata lives in clubs_meta.

export type ClubBrand = {
  slug: string;

  // Short label used in header/nav (curated)
  navLabel: string;

  // Logo file inside /public/clubs
  logoFile: string;

  // Brand colours (hex without '#')
  colors: {
    primary: string;
    secondary: string;
  };

  // Optional: some clubs need light/dark swap behavior for their badge
  // (e.g., Vancouver has different assets in light vs dark mode)
  logoSwap?: {
    light: string;
    dark: string;
  };
};

// West → East order (active CPL clubs only, as requested)
export const CLUB_ORDER_WEST_EAST: string[] = [
  "pacific",
  "vancouver",
  "cavalry",
  "forge",
  "inter-toronto",
  "atletico-ottawa",
  "supra",
  "hfx-wanderers",
];

// Active clubs only (defunct clubs like valour/edmonton are NOT in nav/order)
export const CLUB_BRANDS: ClubBrand[] = [
  {
    slug: "pacific",
    navLabel: "Pacific",
    logoFile: "pacific.svg",
    colors: { primary: "582B83", secondary: "00B7BD" },
  },
  {
    slug: "vancouver",
    navLabel: "Vancouver",
    logoFile: "vancouver.png",
    logoSwap: { light: "vancouver.png", dark: "vancouver-dark.png" },
    colors: { primary: "505256", secondary: "FA2B2B" },
  },
  {
    slug: "cavalry",
    navLabel: "Cavalry",
    logoFile: "cavalry.svg",
    colors: { primary: "335526", secondary: "DA291C" },
  },
  {
    slug: "forge",
    navLabel: "Forge",
    logoFile: "forge.svg",
    colors: { primary: "DC4505", secondary: "53565A" },
  },
  {
    slug: "inter-toronto",
    navLabel: "Inter Toronto",
    logoFile: "toronto.png",
    colors: { primary: "FCBF0D", secondary: "91999D" },
  },
  {
    slug: "atletico-ottawa",
    navLabel: "Atlético Ottawa",
    logoFile: "ottawa.svg",
    colors: { primary: "E41C2E", secondary: "FFFFFF" },
  },
  {
    slug: "supra",
    navLabel: "Supra du Quebec",
    logoFile: "supra.png",
    colors: { primary: "E53431", secondary: "041747" },
  },
  {
    slug: "hfx-wanderers",
    navLabel: "HFX Wanderers",
    logoFile: "wanderers.svg",
    colors: { primary: "00E2FE", secondary: "F4D258" },
  },
  {
    slug: "edmonton",
    navLabel: "FC Edmonton",
    logoFile: "edmonton.svg",
    colors: { primary: "004C97", secondary: "0C2340" },
  },
  {
    slug: "valour",
    navLabel: "Valour FC",
    logoFile: "valour.svg",
    colors: { primary: "B9975C", secondary: "7C2529" },
  },
];

// Handy lookup
export const CLUB_BY_SLUG: Record<string, ClubBrand> = Object.fromEntries(
  CLUB_BRANDS.map((c) => [c.slug, c] as const)
);