export type ContractType = "Guaranteed" | "Option" | "Loan" | "Unknown";

export type Player = {
  id: string;
  name: string;
  club: string;
  position?: string;
  contractEnd?: string;
  contractType: ContractType; // required
  source?: string;
  notes?: string;
};

export const players: Player[] = [
  {
    id: "hfx-thomas-meilleur-giguere",
    name: "Thomas Meilleur-Giguère",
    club: "HFX Wanderers",
    position: "DF",
    contractEnd: "2026",
    contractType: "Guaranteed",
    source: "HFX roster update (club article)",
    notes: "Guaranteed for 2026 per club roster update.",
  },
  // (you can paste the rest of the HFX list after this)
];