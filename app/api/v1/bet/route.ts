import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { battle_id, amount_usdc, agent_id } = body;

    if (!battle_id || !amount_usdc || !agent_id) {
      return NextResponse.json(
        { error: 'Missing required fields: battle_id, amount_usdc, agent_id' },
        { status: 400 }
      );
    }

    // Validate bet amount
    const amount = parseFloat(amount_usdc);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid bet amount' },
        { status: 400 }
      );
    }

    // In production: execute via Smart Account with delegation
    // 1. Verify delegation allows this amount
    // 2. Submit bet to BettingPool contract
    // 3. Return transaction hash

    const bet = {
      battle_id,
      agent_id,
      amount_usdc: amount,
      tx_hash: null, // Will be populated after on-chain execution
      status: 'pending',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      bet,
      message: 'Bet placed successfully! Settlement after battle concludes.',
    });
  } catch (error) {
    console.error('Bet error:', error);
    return NextResponse.json(
      { error: 'Bet placement failed' },
      { status: 500 }
    );
  }
}
