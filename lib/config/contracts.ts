export interface Contracts {
  USDC: string;
  AgentVerifier: string;
  ClawRoyale: string;
  BettingPool: string;
  ClawRoyaleSmart: string;
}

export const CONTRACTS: Contracts = {
  USDC: process.env.USDC_ADDRESS || "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  AgentVerifier: process.env.AGENT_VERIFIER_ADDRESS || "0x494acB419A508EE0bE5eEB75c9940BB15049B22c",
  ClawRoyale: process.env.CLAW_ROYALE_ADDRESS || "0x54692fB23b005220F959B5A874054aD713519FBF",
  BettingPool: process.env.BETTING_POOL_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  ClawRoyaleSmart: process.env.CLAW_ROYALE_SMART_ADDRESS || "0xC41444F117eEE255654C91BE65f1D362B01764A8",
};

export const USDC_ADDRESS = CONTRACTS.USDC;
export const AGENT_VERIFIER_ADDRESS = CONTRACTS.AgentVerifier;
export const CLAW_ROYALE_ADDRESS = CONTRACTS.ClawRoyale;
export const BETTING_POOL_ADDRESS = CONTRACTS.BettingPool;
export const CLAW_ROYALE_SMART_ADDRESS = CONTRACTS.ClawRoyaleSmart;
