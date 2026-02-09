const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("ClawRoyale", function() {
  let clawRoyale;
  let agentVerifier;
  let usdc;
  let owner;
  let player1;
  let player2;
  
  before(async function() {
    [owner, player1, player2] = await ethers.getSigners();
    
    // Deploy mock USDC
    const MockToken = await ethers.getContractFactory("contracts/mocks/MockERC20.sol:MockERC20");
    usdc = await MockToken.deploy("USDC", "USDC", 6);
    await usdc.waitForDeployment();
    
    // Deploy mock AgentVerifier
    const MockVerifier = await ethers.getContractFactory("contracts/mocks/MockAgentVerifier.sol:MockAgentVerifier");
    agentVerifier = await MockVerifier.deploy();
    await agentVerifier.waitForDeployment();
    
    // Deploy ClawRoyale
    const ClawRoyale = await ethers.getContractFactory("ClawRoyale");
    clawRoyale = await ClawRoyale.deploy(await usdc.getAddress(), await agentVerifier.getAddress());
    await clawRoyale.waitForDeployment();
  });
  
  it("Should allow player registration", async function() {
    // Mint USDC to players
    await usdc.mint(player1.address, ethers.parseUnits("10", 6));
    await usdc.mint(player2.address, ethers.parseUnits("10", 6));
    
    // Approve
    await usdc.connect(player1).approve(await clawRoyale.getAddress(), ethers.parseUnits("5", 6));
    await usdc.connect(player2).approve(await clawRoyale.getAddress(), ethers.parseUnits("5", 6));
    
    // Register
    await agentVerifier.setVerified(player1.address, true);
    await agentVerifier.setVerified(player2.address, true);
    
    await clawRoyale.connect(player1).register(ethers.id("agent1"));
    await clawRoyale.connect(player2).register(ethers.id("agent2"));
    
    const playerCount = await clawRoyale.playerList(0);
    expect(playerCount).to.equal(player1.address);
  });
  
  it("Should start tournament", async function() {
    await clawRoyale.startTournament();
    expect(await clawRoyale.status()).to.equal(1); // Active
  });
});

describe("MockERC20", function() {
  let token;
  
  before(async function() {
    const MockToken = await ethers.getContractFactory("contracts/mocks/MockERC20.sol:MockERC20");
    token = await MockToken.deploy("Test", "TEST", 18);
    await token.waitForDeployment();
  });
  
  it("Should mint tokens", async function() {
    const [_, user] = await ethers.getSigners();
    await token.mint(user.address, ethers.parseEther("1000"));
    expect(await token.balanceOf(user.address)).to.equal(ethers.parseEther("1000"));
  });
});
