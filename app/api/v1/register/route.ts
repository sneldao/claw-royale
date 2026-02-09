import { NextResponse } from "next/server";

// Claw Royale contract addresses (Base Sepolia)
const CONTRACTS = {
  clawRoyale: process.env.CLAW_ROYALE_ADDRESS || '0x54692fB23b005220F959B5A874054aD713519FBF',
  bettingPool: process.env.BETTING_POOL_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  usdc: process.env.USDC_ADDRESS || '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
};

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
    contracts: CONTRACTS,
    version: '1.0.0',
    network: 'base-sepolia',
  });
}
