export type HonourKey =
  | "northStarCup"
  | "cplShield"
  | "playoffs"
  | "woodenSpoon";
  
export const HONOUR_ICONS: Record<HonourKey, { src: string; alt: string }> = {
  northStarCup: { src: "/icons/north-star-cup.png", alt: "North Star Cup" },
  cplShield: { src: "/icons/cpl-shield.png", alt: "CPL Shield" },
  playoffs: { src: "/icons/playoffs.png", alt: "Playoffs" },
  woodenSpoon: { src: "/icons/wooden-spoon.png", alt: "Wooden Spoon" },
};