#!/usr/bin/env node

/**
 * Claw Royale Prize Claiming Script
 * 
 * Usage:
 *   node scripts/claim-prize.js
 * 
 * Environment:
 *   PRIVATE_KEY - Your private key (registered participant)
 *   RPC_URL - Base Sepolia RPC (default: https://sepolia.base.org)
 */

const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  // Load private key
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('Error: PRIVATE_KEY environment variable required');
    console.error('Set: export PRIVATE_KEY=0x...');
    process.exit(1);
  }
  
  // Load deployment config
  const configPath = path.join(__dirname, '../deployments.json');
  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (e) {
    console.error('Error: deployments.json not found. Run deploy first.');
    process.exit(1);
  }
  
  // Setup provider and wallet
  const rpcUrl = process.env.RPC_URL || 'https://sepolia.base.org';
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log(`\n🍝 Claw Royale Prize Claim`);
  console.log(`==========================`);
  console.log(`Claiming for: ${wallet.address}`);
  console.log('');
  
  // Connect to contracts
  const clawRoyale = await ethers.getContractAt(
    'ClawRoyale',
    config.contracts.ClawRoyale,
    wallet
  );
  
  // Check tournament status
  const status = await clawRoyale.status();
  const statusNames = ['Pending', 'Active', 'Completed'];
  console.log(`Tournament Status: ${statusNames[status]}`);
  
  if (status !== 2) { // Completed
    console.error(`\n❌ Tournament not yet completed!`);
    console.error(`Wait for tournament to finish before claiming.`);
    process.exit(1);
  }
  
  // Check player status
  const player = await clawRoyale.players(wallet.address);
  if (!player.registered) {
    console.error(`\n❌ Not registered for tournament!`);
    process.exit(1);
  }
  
  if (player.claimedPrize) {
    console.error(`\n❌ Prize already claimed!`);
    process.exit(1);
  }
  
  if (player.eliminated && player.referrer === ethers.ZeroAddress) {
    console.error(`\n❌ You were eliminated and have no prize.`);
    process.exit(1);
  }
  
  // Calculate expected payout
  const prizePool = await clawRoyale.prizePool();
  const playerCount = await clawRoyale.getPlayerCount();
  const estimatedPayout = prizePool / playerCount;
  console.log(`Prize Pool: ${ethers.formatUnits(prizePool, 6)} USDC`);
  console.log(`Players: ${playerCount}`);
  console.log(`Estimated Payout: ~${ethers.formatUnits(estimatedPayout, 6)} USDC`);
  
  // Claim
  console.log(`\n⏳ Claiming prize...`);
  const claimTx = await clawRoyale.claimPrize();
  const receipt = await claimTx.wait();
  
  // Get actual payout from event
  const prizeClaimedEvent = receipt.logs.find(log => {
    try {
      const parsed = clawRoyale.interface.parseLog(log);
      return parsed && parsed.name === 'PrizeClaimed';
    } catch (e) { return false; }
  });
  
  let payout = 0;
  if (prizeClaimedEvent) {
    const parsed = clawRoyale.interface.parseLog(prizeClaimedEvent);
    payout = parsed.args.amount;
  }
  
  console.log(`\n✅ Prize Claimed!`);
  console.log(`Transaction: ${receipt.hash}`);
  console.log(`Amount: ${ethers.formatUnits(payout, 6)} USDC`);
  console.log(`\n🎉 Congratulations! You've claimed your Claw Royale winnings!\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
