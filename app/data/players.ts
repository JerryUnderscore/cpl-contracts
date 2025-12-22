// app/data/players.ts

export type Player = {
  id: string;
  name: string;
  club: string;
  position?: string;
  contractEnd?: string;
  status?: string;
};

export const players: Player[] = [
  {
    id: "hfx-1",
    name: "Example Player",
    club: "HFX Wanderers",
    position: "MF",
    contractEnd: "2026",
    status: "Guaranteed",
  },
  {
    id: "forge-1",
    name: "Another Player",
    club: "Forge FC",
    position: "DF",
    contractEnd: "2025",
    status: "Option",
  },
];