#!/usr/bin/env node

/**
 * Claw Royale Agent Registration Script
 * 
 * Usage:
 *   node scripts/register.js --agent-id 0x... [--referrer 0x...]
 * 
 * Environment:
 *   PRIVATE_KEY - Agent's private key (with USDC balance)
 *   RPC_URL - Base Sepolia RPC (default: https://sepolia.base.org)
 */

const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  // Parse arguments
  const args = process.argv.slice(2);
  const agentId = getArg(args, '--agent-id');
  const referrer = getArg(args, '--referrer') || ethers.ZeroAddress;
  
  if (!agentId) {
    console.error('Usage: node scripts/register.js --agent-id 0x... [--referrer 0x...]');
    console.error('\nRequired:');
    console.error('  --agent-id    Your ERC-8004 agent ID (bytes32)');
    console.error('\nOptional:');
    console.error('  --referrer    Address of agent who referred you');
    process.exit(1);
  }
  
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
  
  console.log(`\n🍝 Claw Royale Agent Registration`);
  console.log(`================================`);
  console.log(`Agent: ${wallet.address}`);
  console.log(`Agent ID: ${agentId}`);
  console.log(`Referrer: ${referrer}`);
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
  
  // Check USDC balance
  const balance = await usdcArtifact.balanceOf(wallet.address);
  const entryFee = await clawRoyale.entryFee();
  console.log(`USDC Balance: ${ethers.formatUnits(balance, 6)} USDC`);
  console.log(`Entry Fee: ${ethers.formatUnits(entryFee, 6)} USDC`);
  
  if (balance < entryFee) {
    console.error(`\n❌ Insufficient USDC balance!`);
    console.error(`Need ${ethers.formatUnits(entryFee, 6)} USDC, have ${ethers.formatUnits(balance, 6)}`);
    process.exit(1);
  }
  
  // Approve USDC
  console.log(`\n⏳ Approving USDC...`);
  const approveTx = await usdcArtifact.approve(config.contracts.ClawRoyale, entryFee);
  await approveTx.wait();
  console.log(`✅ Approved: ${approveTx.hash}`);
  
  // Register
  console.log(`\n⏳ Registering for tournament...`);
  const registerTx = await clawRoyale.register(agentId, referrer);
  const receipt = await registerTx.wait();
  
  console.log(`\n✅ Registration complete!`);
  console.log(`Transaction: ${receipt.hash}`);
  console.log(`\n📋 You are now registered for Claw Royale!`);
  console.log(`Waiting for tournament to start...\n`);
}

function getArg(args, name) {
  const idx = args.indexOf(name);
  if (idx === -1) return null;
  return args[idx + 1];
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
