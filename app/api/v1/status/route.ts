import { NextResponse } from "next/server";
import { CONTRACTS } from "@/lib/config/contracts";

// Mock tournament state (use database in production)
let tournamentState = {
  status: 'open', // open, active, closed
  playerCount: 0,
  prizePool: 0,
  battleId: null,
  startTime: null,
};

export async function GET() {
  // In production: fetch real state from smart contract
  // const clawRoyale = new ethers.Contract(CLAW_ROYALE_ADDRESS, ABI, provider);
  // const status = await clawRoyale.getStatus();
  // const playerCount = await clawRoyale.playerCount();
  
  return NextResponse.json({
    tournament: {
      status: tournamentState.status,
      players: tournamentState.playerCount,
      prizePoolUSDC: tournamentState.prizePool,
      currentBattle: tournamentState.battleId,
      startTime: tournamentState.startTime,
    },
    rules: {
      minPlayers: 2,
      maxPlayers: 32,
      entryFeeUSDC: 0, // Free for demo
      prizeDistribution: {
        first: 0.50,
        second: 0.30,
        third: 0.20,
      },
    },
    contracts: {
      clawRoyale: CONTRACTS.ClawRoyale,
      bettingPool: CONTRACTS.BettingPool,
      usdc: CONTRACTS.USDC,
    },
  });
}
