/**
 * Claw Royale Smart Accounts Integration
 * 
 * Provides utilities for:
 * - Creating smart accounts
 * - Configuring delegations
 * - Gasless registration
 * - Batch operations
 */

const { ethers } = require('ethers')
const fs = require('fs')
const path = require('path')

// Contract ABIs (simplified - use actual ABIs in production)
const CLAW_ROYALE_SMART_ABI = [
  'function registerSmart(bytes32 _agentId, address _referrer, bytes _delegate) external',
  'function registerAndBet(bytes32 _agentId, uint256 _betAmount, address _referrer) external',
  'function configureDelegation(uint256 _maxBetAmount, uint256 _durationSeconds) external',
  'function fundPrizePool(uint256 _amount) external',
  'function claimPrize(uint256 _amount) external',
  'function getPlayerCount() view returns (uint256)',
  'function hasValidDelegation(address _account) view returns (bool)',
  'function getDelegationLimit(address _account) view returns (uint256)',
  'event PlayerRegistered(address indexed smartAccount, uint256 amount)',
  'event DelegationConfigured(address indexed account, uint256 maxBet, uint256 expiry)',
]

const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
]

/**
 * Create a MetaMask Smart Account for Claw Royale
 */
async function createSmartAccount(config) {
  const { 
    privateKey, 
    rpcUrl, 
    entryPointAddress = '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    factoryAddress = '0x69Aa2f9fe1572F1B640E1bbc512f5c3a734fc77c'
  } = config
  
  const provider = new ethers.JsonRpcProvider(rpcUrl)
  const wallet = new ethers.Wallet(privateKey, provider)
  
  // In production, use @metamask/smart-accounts-kit
  // This is a simplified placeholder
  console.log('🔵 Creating smart account for:', wallet.address)
  
  return {
    address: wallet.address,
    owner: wallet.address,
    provider,
    wallet
  }
}

/**
 * Configure delegation for betting permissions
 */
async function configureBettingDelegation(config) {
  const {
    smartAccountAddress,
    clawRoyaleAddress,
    maxBetUSDC,
    durationSeconds,
    rpcUrl,
    privateKey
  } = config
  
  const provider = new ethers.JsonRpcProvider(rpcUrl)
  const wallet = new ethers.Wallet(privateKey, provider)
  
  const clawRoyale = new ethers.Contract(clawRoyaleAddress, CLAW_ROYALE_SMART_ABI, wallet)
  
  const maxBetAmount = ethers.parseUnits(maxBetUSDC.toString(), 6) // USDC has 6 decimals
  
  console.log(`🍝 Configuring delegation: ${maxBetUSDC} USDC for ${durationSeconds}s`)
  
  const tx = await clawRoyale.configureDelegation(maxBetAmount, durationSeconds)
  await tx.wait()
  
  console.log('✅ Delegation configured:', tx.hash)
  return tx.hash
}

/**
 * Register agent with smart account (gasless via paymaster)
 */
async function registerSmartAccount(config) {
  const {
    agentId,
    referrer = ethers.ZeroAddress,
    clawRoyaleAddress,
    usdcAddress,
    rpcUrl,
    privateKey
  } = config
  
  const provider = new ethers.JsonRpcProvider(rpcUrl)
  const wallet = new ethers.Wallet(privateKey, provider)
  
  const clawRoyale = new ethers.Contract(clawRoyaleAddress, CLAW_ROYALE_SMART_ABI, wallet)
  const usdc = new ethers.Contract(usdcAddress, ERC20_ABI, wallet)
  
  // Approve USDC (for traditional flow - smart accounts may skip this with paymaster)
  const entryFee = ethers.parseUnits('5', 6)
  const approveTx = await usdc.approve(clawRoyaleAddress, entryFee)
  await approveTx.wait()
  
  // Register
  console.log('🔵 Registering smart account agent:', agentId)
  const registerTx = await clawRoyale.registerSmart(agentId, referrer, '0x')
  await registerTx.wait()
  
  console.log('✅ Registered successfully:', registerTx.hash)
  return registerTx.hash
}

/**
 * Register and bet in a single atomic transaction
 */
async function registerAndBet(config) {
  const {
    agentId,
    betAmountUSDC,
    referrer = ethers.ZeroAddress,
    clawRoyaleAddress,
    usdcAddress,
    rpcUrl,
    privateKey
  } = config
  
  const provider = new ethers.JsonRpcProvider(rpcUrl)
  const wallet = new ethers.Wallet(privateKey, provider)
  
  const clawRoyale = new ethers.Contract(clawRoyaleAddress, CLAW_ROYALE_SMART_ABI, wallet)
  const usdc = new ethers.Contract(usdcAddress, ERC20_ABI, wallet)
  
  const betAmount = ethers.parseUnits(betAmountUSDC.toString(), 6)
  const entryFee = ethers.parseUnits('5', 6)
  
  // Approve total (entry fee + bet)
  const totalAmount = entryFee + betAmount
  const approveTx = await usdc.approve(clawRoyaleAddress, totalAmount)
  await approveTx.wait()
  
  // Register and bet atomically
  console.log('🍝 Registering and placing bet:', betAmountUSDC, 'USDC')
  const tx = await clawRoyale.registerAndBet(agentId, betAmount, referrer)
  await tx.wait()
  
  console.log('✅ Register & bet complete:', tx.hash)
  return tx.hash
}

/**
 * Fund prize pool with delegation
 */
async function fundPrizePoolDelegated(config) {
  const {
    amountUSDC,
    clawRoyaleAddress,
    rpcUrl,
    privateKey
  } = config
  
  const provider = new ethers.JsonRpcProvider(rpcUrl)
  const wallet = new ethers.Wallet(privateKey, provider)
  
  const clawRoyale = new ethers.Contract(clawRoyaleAddress, CLAW_ROYALE_SMART_ABI, wallet)
  
  const amount = ethers.parseUnits(amountUSDC.toString(), 6)
  
  console.log('🟦 Funding prize pool:', amountUSDC, 'USDC')
  const tx = await clawRoyale.fundPrizePool(amount)
  await tx.wait()
  
  console.log('✅ Prize pool funded:', tx.hash)
  return tx.hash
}

/**
 * Claim prize gaslessly
 */
async function claimPrize(config) {
  const {
    amountUSDC,
    clawRoyaleAddress,
    rpcUrl,
    privateKey
  } = config
  
  const provider = new ethers.JsonRpcProvider(rpcUrl)
  const wallet = new ethers.Wallet(privateKey, provider)
  
  const clawRoyale = new ethers.Contract(clawRoyaleAddress, CLAW_ROYALE_SMART_ABI, wallet)
  
  const amount = ethers.parseUnits(amountUSDC.toString(), 6)
  
  console.log('🏆 Claiming prize:', amountUSDC, 'USDC')
  const tx = await clawRoyale.claimPrize(amount)
  await tx.wait()
  
  console.log('✅ Prize claimed:', tx.hash)
  return tx.hash
}

/**
 * Check delegation status
 */
async function getDelegationStatus(config) {
  const {
    smartAccountAddress,
    clawRoyaleAddress,
    rpcUrl
  } = config
  
  const provider = new ethers.JsonRpcProvider(rpcUrl)
  const clawRoyale = new ethers.Contract(clawRoyaleAddress, CLAW_ROYALE_SMART_ABI, provider)
  
  const hasDelegation = await clawRoyale.hasValidDelegation(smartAccountAddress)
  const limit = await clawRoyale.getDelegationLimit(smartAccountAddress)
  
  return {
    hasValidDelegation,
    maxBetUSDC: ethers.formatUnits(limit, 6)
  }
}

/**
 * Get tournament status
 */
async function getTournamentStatus(config) {
  const {
    clawRoyaleAddress,
    rpcUrl
  } = config
  
  const provider = new ethers.JsonRpcProvider(rpcUrl)
  const clawRoyale = new ethers.Contract(clawRoyaleAddress, CLAW_ROYALE_SMART_ABI, provider)
  
  const playerCount = await clawRoyale.getPlayerCount()
  const STATUS_NAMES = ['Pending', 'Active', 'Completed']
  const status = await clawRoyale.status()
  
  return {
    status: STATUS_NAMES[status],
    playerCount: playerCount.toString()
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2)
  const command = args[0]
  
  const loadConfig = () => {
    const configPath = path.join(__dirname, '..', 'config.json')
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'))
    }
    return {}
  }
  
  const config = loadConfig()
  const PRIVATE_KEY = process.env.PRIVATE_KEY || config.privateKey
  const RPC_URL = process.env.RPC_URL || config.rpcUrl || 'https://sepolia.base.org'
  const CLAW_ROYALE_ADDRESS = process.env.CLAW_ROYALE_ADDRESS || config.clawRoyaleAddress
  const USDC_ADDRESS = process.env.USDC_ADDRESS || config.usdcAddress || '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
  
  switch (command) {
    case 'register':
      registerSmartAccount({
        agentId: args[1],
        clawRoyaleAddress: CLAW_ROYALE_ADDRESS,
        usdcAddress: USDC_ADDRESS,
        rpcUrl: RPC_URL,
        privateKey: PRIVATE_KEY
      }).then(() => process.exit(0))
      break
      
    case 'delegate':
      configureBettingDelegation({
        smartAccountAddress: args[1],
        clawRoyaleAddress: CLAW_ROYALE_ADDRESS,
        maxBetUSDC: parseFloat(args[2]),
        durationSeconds: parseInt(args[3]),
        rpcUrl: RPC_URL,
        privateKey: PRIVATE_KEY
      }).then(() => process.exit(0))
      break
      
    case 'register-bet':
      registerAndBet({
        agentId: args[1],
        betAmountUSDC: parseFloat(args[2]),
        clawRoyaleAddress: CLAW_ROYALE_ADDRESS,
        usdcAddress: USDC_ADDRESS,
        rpcUrl: RPC_URL,
        privateKey: PRIVATE_KEY
      }).then(() => process.exit(0))
      break
      
    case 'fund':
      fundPrizePoolDelegated({
        amountUSDC: parseFloat(args[1]),
        clawRoyaleAddress: CLAW_ROYALE_ADDRESS,
        rpcUrl: RPC_URL,
        privateKey: PRIVATE_KEY
      }).then(() => process.exit(0))
      break
      
    case 'claim':
      claimPrize({
        amountUSDC: parseFloat(args[1]),
        clawRoyaleAddress: CLAW_ROYALE_ADDRESS,
        rpcUrl: RPC_URL,
        privateKey: PRIVATE_KEY
      }).then(() => process.exit(0))
      break
      
    case 'status':
      getTournamentStatus({
        clawRoyaleAddress: CLAW_ROYALE_ADDRESS,
        rpcUrl: RPC_URL
      }).then(status => {
        console.log('📊 Tournament Status:', status)
        process.exit(0)
      })
      break
      
    case 'delegation':
      getDelegationStatus({
        smartAccountAddress: args[1],
        clawRoyaleAddress: CLAW_ROYALE_ADDRESS,
        rpcUrl: RPC_URL
      }).then(status => {
        console.log('📋 Delegation Status:', status)
        process.exit(0)
      })
      break
      
    default:
      console.log(`
🍝 Claw Royale Smart Accounts CLI

Commands:
  register <agentId>          Register with smart account
  delegate <account> <maxBet> <seconds>  Configure betting delegation
  register-bet <agentId> <betUSDC>  Register and bet atomically
  fund <amountUSDC>           Fund prize pool
  claim <amountUSDC>          Claim prize
  status                      Get tournament status
  delegation <account>        Check delegation status

Environment Variables:
  PRIVATE_KEY              Wallet private key
  RPC_URL                  RPC endpoint (default: Base Sepolia)
  CLAW_ROYALE_ADDRESS      ClawRoyaleSmart contract
  USDC_ADDRESS             USDC token address
`)
      process.exit(1)
  }
}

module.exports = {
  createSmartAccount,
  configureBettingDelegation,
  registerSmartAccount,
  registerAndBet,
  fundPrizePoolDelegated,
  claimPrize,
  getDelegationStatus,
  getTournamentStatus
}
