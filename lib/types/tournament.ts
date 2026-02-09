export interface ActivityItem {
  emoji: string;
  title: string;
  desc: string;
  time: string;
}

export interface LeaderboardEntry {
  name: string;
  wins: number;
  address: string;
  streak: number;
}

export type BattleStatus = "idle" | "active" | "completed";

export type TournamentStatus = "open" | "active" | "closed";
