/**
 * Deploy ClawRoyaleSmart contract with Smart Accounts integration
 */

const hre = require('hardhat')

async function main() {
  console.log('🍝 Deploying ClawRoyaleSmart with Smart Accounts...\n')
  
  // Get network
  const network = hre.network.name
  console.log('📍 Network:', network)
  
  // Get USDC address based on network
  const USDC_ADDRESSES = {
    baseSepolia: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    sepolia: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    mainnet: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  }
  
  const usdcAddress = USDC_ADDRESSES[network] || USDC_ADDRESSES.baseSepolia
  console.log('💵 USDC Address:', usdcAddress)
  
  // Deploy ClawRoyaleSmart
  const ClawRoyaleSmart = await hre.ethers.getContractFactory('ClawRoyaleSmart')
  const clawRoyaleSmart = await ClawRoyaleSmart.deploy(usdcAddress)
  
  await clawRoyaleSmart.waitForDeployment()
  const contractAddress = await clawRoyaleSmart.getAddress()
  
  console.log('\n✅ ClawRoyaleSmart deployed!')
  console.log('📄 Contract Address:', contractAddress)
  
  // Save deployment info
  const deployments = require('../deployments.json')
  deployments.clawRoyaleSmart = {
    address: contractAddress,
    usdc: usdcAddress,
    deployedAt: new Date().toISOString(),
    network
  }
  
  fs.writeFileSync(
    path.join(__dirname, '..', 'deployments.json'),
    JSON.stringify(deployments, null, 2)
  )
  
  console.log('\n📦 Deployment saved to deployments.json')
  console.log('\n🎯 Next Steps:')
  console.log('   1. Configure delegation permissions')
  console.log('   2. Register agents with smart accounts')
  console.log('   3. Fund prize pool')
  console.log('   4. Start tournament')
  
  return contractAddress
}

const fs = require('fs')
const path = require('path')

main()
  .then((address) => {
    console.log('\n🚀 Deployment complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Deployment failed:', error)
    process.exit(1)
  })
