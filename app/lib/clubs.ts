// app/lib/clubs.ts

export type ClubInfo = {
  slug: string;

  // Full name used on pages
  name: string;

  // Shorter label used in header nav
  navLabel: string;

  // Logo file inside /public/clubs (svg or png both fine)
  logoFile: string;

  // Club header info
  location: string;
  stadium: string;
  capacity: number;
  joined: number;
  headCoach: string;

  // Brand colours
  colors: {
    primary: string;   // hex without '#', e.g. "582B83"
    secondary: string; // stored for later
  };
};

// West → East order (as requested)
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

export const CLUBS: ClubInfo[] = [
  {
    slug: "pacific",
    name: "Pacific FC",
    navLabel: "Pacific",
    logoFile: "pacific.svg",
    location: "Langford, British Columbia",
    stadium: "Starlight Stadium",
    capacity: 6000,
    joined: 2019,
    headCoach: "James Merriman",
    colors: { primary: "582B83", secondary: "00B7BD" },
  },
  {
    slug: "vancouver",
    name: "Vancouver FC",
    navLabel: "Vancouver",
    logoFile: "vancouver.png",
    location: "Langley, British Columbia",
    stadium: "Willoughby Community Park Stadium",
    capacity: 6560,
    joined: 2023,
    headCoach: "Martin Nash",
    colors: { primary: "FA2B2B", secondary: "1E1E1E" },
  },
  {
    slug: "cavalry",
    name: "Cavalry FC",
    navLabel: "Cavalry",
    logoFile: "cavalry.svg",
    location: "Foothills County, Alberta",
    stadium: "ATCO Field",
    capacity: 6000,
    joined: 2019,
    headCoach: "Tommy Wheeldon Jr.",
    colors: { primary: "335526", secondary: "DA291C" },
  },
  {
    slug: "forge",
    name: "Forge FC",
    navLabel: "Forge",
    logoFile: "forge.svg",
    location: "Hamilton, Ontario",
    stadium: "Hamilton Stadium",
    capacity: 23218,
    joined: 2019,
    headCoach: "Bobby Smyrniotis",
    colors: { primary: "DC4505", secondary: "53565A" },
  },
  {
    slug: "inter-toronto",
    name: "Inter Toronto FC",
    navLabel: "Inter Toronto",
    logoFile: "toronto.png",
    location: "Toronto, Ontario",
    stadium: "York Lions Stadium",
    capacity: 4000,
    joined: 2019,
    headCoach: "Mauro Eustáquio",
    colors: { primary: "FCBF0D", secondary: "0E3353" },
  },
  {
    slug: "atletico-ottawa",
    name: "Atlético Ottawa",
    navLabel: "Atlético Ottawa",
    logoFile: "ottawa.svg",
    location: "Ottawa, Ontario",
    stadium: "TD Place Stadium",
    capacity: 6419,
    joined: 2020,
    headCoach: "Diego Mejía",
    colors: { primary: "E41C2E", secondary: "102F51" },
  },
  {
    slug: "supra",
    name: "FC Supra du Québec",
    navLabel: "Supra du Quebec",
    logoFile: "supra.png",
    location: "Laval, Quebec",
    stadium: "Stade Boréale",
    capacity: 5581,
    joined: 2026,
    headCoach: "Nicholas Razzaghi",
    colors: { primary: "E53431", secondary: "041747" },
  },
  {
    slug: "hfx-wanderers",
    name: "HFX Wanderers FC",
    navLabel: "Wanderers",
    logoFile: "wanderers.svg",
    location: "Halifax, Nova Scotia",
    stadium: "Wanderers Grounds",
    capacity: 7500,
    joined: 2019,
    headCoach: "Vanni Sartini",
    colors: { primary: "00E2FE", secondary: "05204A" },
  },
];

// Handy lookup
export const CLUB_BY_SLUG: Record<string, ClubInfo> = Object.fromEntries(
  CLUBS.map((c) => [c.slug, c] as const)
);