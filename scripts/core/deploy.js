const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Claw Royale contracts...\n");
  
  // Addresses for Base Sepolia (lowercase - ethers will checksum)
  const USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // USDC on Base Sepolia
  const AGENT_REGISTRY = "0x00000000fc1237824fb747abde0ff18990e59b7e"; // Placeholder
  
  // Deploy AgentVerifier
  console.log("Deploying AgentVerifier...");
  const AgentVerifier = await ethers.getContractFactory("AgentVerifier");
  const agentVerifier = await AgentVerifier.deploy(AGENT_REGISTRY);
  await agentVerifier.waitForDeployment();
  console.log(`AgentVerifier: ${await agentVerifier.getAddress()}`);
  
  // Deploy ClawRoyale
  console.log("\nDeploying ClawRoyale...");
  const ClawRoyale = await ethers.getContractFactory("ClawRoyale");
  const clawRoyale = await ClawRoyale.deploy(USDC, await agentVerifier.getAddress());
  await clawRoyale.waitForDeployment();
  console.log(`ClawRoyale: ${await clawRoyale.getAddress()}`);
  
  // Deploy BettingPool
  console.log("\nDeploying BettingPool...");
  const BettingPool = await ethers.getContractFactory("BettingPool");
  const bettingPool = await BettingPool.deploy(USDC);
  await bettingPool.waitForDeployment();
  console.log(`BettingPool: ${await bettingPool.getAddress()}`);
  
  console.log("\n=== Deployment Complete ===");
  console.log("AgentVerifier:", await agentVerifier.getAddress());
  console.log("ClawRoyale:", await clawRoyale.getAddress());
  console.log("BettingPool:", await bettingPool.getAddress());
  
  // Save addresses for frontend
  const fs = require("fs");
  const config = {
    chainId: 84532,
    contracts: {
      USDC: USDC,
      AgentVerifier: await agentVerifier.getAddress(),
      ClawRoyale: await clawRoyale.getAddress(),
      BettingPool: await bettingPool.getAddress()
    }
  };
  fs.writeFileSync("deployments.json", JSON.stringify(config, null, 2));
  console.log("\nAddresses saved to deployments.json");
}

main().catch(console.error);
