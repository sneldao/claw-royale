/**
 * Register with Smart Account - Gasless Registration
 * 
 * Usage:
 *   node scripts/register-smart.js <agentId> [referrer]
 * 
 * Environment:
 *   PRIVATE_KEY          Your wallet private key
 *   CLAW_ROYALE_ADDRESS  ClawRoyaleSmart contract address
 *   USDC_ADDRESS         USDC token address
 *   RPC_URL              RPC endpoint
 */

const hre = require('hardhat')
const fs = require('fs')
const path = require('path')

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length < 1) {
    console.log(`
🍝 Claw Royale Smart Account Registration

Usage: node scripts/register-smart.js <agentId> [referrer]

Arguments:
  agentId   Agent's ERC-8004 ID (bytes32 hex string)
  referrer  Optional referrer address

Environment Variables:
  PRIVATE_KEY          Wallet private key
  CLAW_ROYALE_ADDRESS  ClawRoyaleSmart contract address
  USDC_ADDRESS         USDC token address (auto-detected)
  RPC_URL              RPC endpoint (auto-detected)

Example:
  node scripts/register-smart.js 0x1234... 0xabcd...

`)
    process.exit(1)
  }
  
  const agentId = args[0]
  const referrer = args[1] || hre.ethers.ZeroAddress
  
  console.log('🔵 Registering with Smart Account...')
  console.log('   Agent ID:', agentId)
  console.log('   Referrer:', referrer)
  
  // Load deployments
  const deployments = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'deployments.json'), 'utf8')
  )
  
  const clawRoyaleAddress = process.env.CLAW_ROYALE_ADDRESS || deployments.clawRoyaleSmart?.address
  const usdcAddress = process.env.USDC_ADDRESS || deployments.usdc || '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
  
  if (!clawRoyaleAddress) {
    console.error('❌ CLAW_ROYALE_ADDRESS not set and not in deployments.json')
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
  
  // Get contracts
  const ClawRoyaleSmart = await hre.ethers.getContractFactory('ClawRoyaleSmart')
  const clawRoyale = await ClawRoyaleSmart.attach(clawRoyaleAddress)
  
  const ERC20 = await hre.ethers.getContractFactory('@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20')
  const usdc = await ERC20.attach(usdcAddress)
  
  // Check entry fee
  const entryFee = await clawRoyale.entryFee()
  console.log('💰 Entry Fee:', hre.ethers.formatUnits(entryFee, 6), 'USDC')
  
  // Check USDC balance
  const balance = await usdc.balanceOf(wallet.address)
  console.log('💵 USDC Balance:', hre.ethers.formatUnits(balance, 6))
  
  if (balance < entryFee) {
    console.error('❌ Insufficient USDC balance')
    process.exit(1)
  }
  
  // Approve USDC
  console.log('\n📝 Approving USDC...')
  const approveTx = await usdc.approve(clawRoyaleAddress, entryFee)
  await approveTx.wait()
  console.log('✅ Approved:', approveTx.hash)
  
  // Register
  console.log('\n🚀 Registering...')
  const registerTx = await clawRoyale.registerSmart(agentId, referrer, '0x')
  const receipt = await registerTx.wait()
  
  console.log('✅ Registered successfully!')
  console.log('📄 Transaction:', receipt.hash)
  
  // Check player count
  const playerCount = await clawRoyale.getPlayerCount()
  console.log('\n📊 Tournament Players:', playerCount.toString())
  
  // Check if smart account
  const isSmart = await clawRoyale.isSmartAccount(wallet.address)
  console.log('🔵 Smart Account:', isSmart ? 'Yes' : 'No')
  
  return receipt
}

main()
  .then(() => {
    console.log('\n🍝 Registration complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Registration failed:', error.message)
    process.exit(1)
  })
