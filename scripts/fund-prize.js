#!/usr/bin/env node

/**
 * Claw Royale Prize Pool Funding Script
 * 
 * Usage:
 *   node scripts/fund-prize.js --amount 5000000
 * 
 * Environment:
 *   PRIVATE_KEY - Funders private key (with USDC)
 *   RPC_URL - Base Sepolia RPC
 */

const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  const amountUSDC = getArgAmount(process.argv.slice(2), '--amount');
  
  if (!amountUSDC) {
    console.error('Usage: node scripts/fund-prize.js --amount 5000000');
    console.error('\nExample:');
    console.error('  node scripts/fund-prize.js --amount 5000000   # 5 USDC');
    process.exit(1);
  }
  
  // Load private key
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('Error: PRIVATE_KEY environment variable required');
    process.exit(1);
  }
  
  // Load deployment config
  const configPath = path.join(__dirname, '../deployments.json');
  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (e) {
    console.error('Error: deployments.json not found.');
    process.exit(1);
  }
  
  const rpcUrl = process.env.RPC_URL || 'https://sepolia.base.org';
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log(`\n🍝 Claw Royale Prize Pool Funding`);
  console.log(`===================================`);
  console.log(`Funder: ${wallet.address}`);
  console.log(`Amount: ${ethers.formatUnits(amountUSDC, 6)} USDC`);
  console.log('');
  
  // Connect to contracts
  const usdcArtifact = await ethers.getContractAt(
    'IERC20',
    config.contracts.USDC,
    wallet
  );
  
  const clawRoyale = await ethers.getContractAt(
    'ClawRoyale',
    config.contracts.ClawRoyale,
    wallet
  );
  
  // Check balance
  const balance = await usdcArtifact.balanceOf(wallet.address);
  console.log(`Your USDC Balance: ${ethers.formatUnits(balance, 6)} USDC`);
  
  if (balance < amountUSDC) {
    console.error(`\n❌ Insufficient balance!`);
    process.exit(1);
  }
  
  // Current prize pool
  const currentPool = await clawRoyale.prizePool();
  console.log(`Current Prize Pool: ${ethers.formatUnits(currentPool, 6)} USDC`);
  
  // Approve
  console.log(`\n⏳ Approving USDC...`);
  const approveTx = await usdcArtifact.approve(config.contracts.ClawRoyale, amountUSDC);
  await approveTx.wait();
  console.log(`✅ Approved`);
  
  // Deposit
  console.log(`\n⏳ Funding prize pool...`);
  const fundTx = await clawRoyale.fundPrizePool(amountUSDC);
  const receipt = await fundTx.wait();
  
  const newPool = await clawRoyale.prizePool();
  
  console.log(`\n✅ Prize Pool Funded!`);
  console.log(`Transaction: ${receipt.hash}`);
  console.log(`New Prize Pool: ${ethers.formatUnits(newPool, 6)} USDC`);
  console.log(`\n💰 The prize pool is now bigger! Better win! 🍝\n`);
}

function getArgAmount(args, name) {
  const idx = args.indexOf(name);
  if (idx === -1) return null;
  const val = args[idx + 1];
  // Support both raw (5000000) and decimal (5.0) formats
  if (val.includes('.')) {
    return ethers.parseUnits(val, 6);
  }
  return BigInt(val);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
