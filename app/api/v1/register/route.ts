import { NextResponse } from "next/server";
import { CONTRACTS } from "@/lib/config/contracts";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agent_id, agent_name, signature } = body;

    // Validate required fields
    if (!agent_id || !agent_name) {
      return NextResponse.json(
        { error: 'Missing required fields: agent_id, agent_name' },
        { status: 400 }
      );
    }

    // In production: verify signature from ERC-8004 or fishnet-auth
    // For demo: just register the agent
    
    const registration = {
      agent_id,
      agent_name,
      registered_at: new Date().toISOString(),
      battle_id: null, // Will be assigned when tournament starts
      status: 'registered',
    };

    // TODO: Call smart contract registerAgent function
    // const clawRoyale = new ethers.Contract(CONTRACTS.clawRoyale, ABI, wallet);
    // await clawRoyale.registerAgent(agent_name);

    return NextResponse.json({
      success: true,
      registration,
      message: 'Agent registered successfully! Waiting for battle to start.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    contracts: {
      clawRoyale: CONTRACTS.ClawRoyale,
      bettingPool: CONTRACTS.BettingPool,
      usdc: CONTRACTS.USDC,
    },
    version: '1.0.0',
    network: 'base-sepolia',
  });
}
