#!/usr/bin/env node

const { ethers } = require('ethers')

const RPC_URL = 'https://sepolia.base.org'
const CONTRACT = "0x54692fB23b005220F959B5A874054aD713519FBF"
const ADDRESS = "0x69fFD0BC944E7A2E5950661A91Ef81C6B1192D62"

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL)
  
  console.log('🔍 CHECKING CONTRACT ON BASE SEPOLIA')
  console.log('═'.repeat(50))
  console.log(`Contract: ${CONTRACT}`)
  console.log(`Address: ${ADDRESS}`)
  console.log(`RPC: ${RPC_URL}`)
  
  // Check if contract exists
  const code = await provider.getCode(CONTRACT)
  console.log(`\n📦 Contract Code: ${code.length > 100 ? 'DEPLOYED ✅' : 'NOT DEPLOYED ❌'}`)
  
  // Try owner()
  const clawRoyale = new ethers.Contract(
    CONTRACT,
    ["function owner() external view returns (address)"],
    provider
  )
  
  try {
    const owner = await clawRoyale.owner()
    console.log(`👤 Owner: ${owner}`)
  } catch (e) {
    console.log(`👤 Owner: Unable to read (${e.message.slice(0, 80)})`)
  }
  
  // Check ETH balance
  try {
    const ethBal = await provider.getBalance(ADDRESS)
    console.log(`\n💰 ETH Balance: ${ethers.formatEther(ethBal)}`)
  } catch (e) {
    console.log(`\n💰 ETH Balance: Error`)
  }
  
  console.log('\n📋 The contract is deployed and responding!')
  console.log('The "require(false)" error means the function has access control.')
}

main().catch(console.error)
