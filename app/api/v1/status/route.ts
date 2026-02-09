import { NextResponse } from "next/server";

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
      clawRoyale: process.env.CLAW_ROYALE_ADDRESS || '0x54692fB23b005220F959B5A874054aD713519FBF',
      bettingPool: process.env.BETTING_POOL_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      usdc: process.env.USDC_ADDRESS || '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    },
  });
}
