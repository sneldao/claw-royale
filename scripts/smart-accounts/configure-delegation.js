/**
 * Configure Betting Delegation
 * 
 * Sets up delegation permissions allowing ClawRoyale to execute
 * bets on behalf of the agent within specified limits.
 * 
 * Usage:
 *   node scripts/configure-delegation.js <maxBetUSDC> <durationSeconds>
 * 
 * Example:
 *   node scripts/configure-delegation.js 50 86400
 *   # Allow up to 50 USDC in bets for 24 hours
 */

const hre = require('hardhat')
const fs = require('fs')
const path = require('path')

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length < 2) {
    console.log(`
🍝 Configure Betting Delegation

Sets up delegation permissions for automated betting within limits.

Usage: node scripts/configure-delegation.js <maxBetUSDC> <durationSeconds>

Arguments:
  maxBetUSDC     Maximum bet amount in USDC (e.g., 50)
  durationSeconds How long delegation is valid (e.g., 86400 = 24 hours)

Environment Variables:
  PRIVATE_KEY          Wallet private key
  CLAW_ROYALE_ADDRESS  ClawRoyaleSmart contract address
  RPC_URL              RPC endpoint

Example:
  node scripts/configure-delegation.js 50 86400
  # Allow up to 50 USDC in bets for 24 hours

  node scripts/configure-delegation.js 100 3600
  # Allow up to 100 USDC in bets for 1 hour

`)
    process.exit(1)
  }
  
  const maxBetUSDC = parseFloat(args[0])
  const durationSeconds = parseInt(args[1])
  
  if (isNaN(maxBetUSDC) || maxBetUSDC <= 0) {
    console.error('❌ Invalid maxBetUSDC:', args[0])
    process.exit(1)
  }
  
  if (isNaN(durationSeconds) || durationSeconds <= 0) {
    console.error('❌ Invalid durationSeconds:', args[1])
    process.exit(1)
  }
  
  console.log('🍝 Configuring Betting Delegation')
  console.log('   Max Bet:', maxBetUSDC, 'USDC')
  console.log('   Duration:', durationSeconds, 'seconds')
  
  // Load deployments
  const deployments = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'deployments.json'), 'utf8')
  )
  
  const clawRoyaleAddress = process.env.CLAW_ROYALE_ADDRESS || deployments.clawRoyaleSmart?.address
  
  if (!clawRoyaleAddress) {
    console.error('❌ CLAW_ROYALE_ADDRESS not set')
    process.exit(1)
  }
  
  // Get signer
  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) {
    console.error('❌ PRIVATE_KEY not set')
    process.exit(1)
  }
  
  const wallet = new hre.ethers.Wallet(privateKey, hre.ethers.provider)
  console.log('\n👛 Wallet:', wallet.address)
  
  // Get contract
  const ClawRoyaleSmart = await hre.ethers.getContractFactory('ClawRoyaleSmart')
  const clawRoyale = await ClawRoyaleSmart.attach(clawRoyaleAddress)
  
  // Convert to units
  const maxBetAmount = hre.ethers.parseUnits(maxBetUSDC.toString(), 6)
  
  console.log('\n🚀 Configuring delegation...')
  const tx = await clawRoyale.configureDelegation(maxBetAmount, durationSeconds)
  const receipt = await tx.wait()
  
  console.log('✅ Delegation configured!')
  console.log('📄 Transaction:', receipt.hash)
  
  // Check status
  const hasDelegation = await clawRoyale.hasValidDelegation(wallet.address)
  const limit = await clawRoyale.getDelegationLimit(wallet.address)
  
  console.log('\n📋 Delegation Status:')
  console.log('   Has Valid Delegation:', hasDelegation ? 'Yes' : 'No')
  console.log('   Max Bet Limit:', hre.ethers.formatUnits(limit, 6), 'USDC')
  
  return receipt
}

main()
  .then(() => {
    console.log('\n🍝 Delegation configured!')
    console.log('🎯 Your agent can now place bets up to the configured limit.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed:', error.message)
    process.exit(1)
  })
