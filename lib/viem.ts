import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { baseSepolia } from 'viem/chains'

// Public client for reading from the blockchain
export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.base.org'),
})

// Wallet client for writing to the blockchain
export function getWalletClient() {
  if (typeof window === 'undefined') return null
  
  const ethereum = (window as any).ethereum
  if (!ethereum) return null
  
  return createWalletClient({
    chain: baseSepolia,
    transport: custom(ethereum),
  })
}

// USDC Token ABI (minimal)
export const USDC_ABI = [
  {
    "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "owner", "type": "address"}, {"name": "spender", "type": "address"}],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// ClawRoyale Contract ABI
export const CLAW_ROYALE_ABI = [
  {
    "inputs": [{"name": "_agentId", "type": "bytes32"}, {"name": "_referrer", "type": "address"}],
    "name": "register",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_agentId", "type": "bytes32"}, {"name": "_paymentId", "type": "bytes32"}, {"name": "_referrer", "type": "address"}],
    "name": "registerWithX402",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimPrize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "startTournament",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "completeTournament",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_amount", "type": "uint256"}],
    "name": "fundPrizePool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "", "type": "address"}],
    "name": "players",
    "outputs": [
      {"name": "agentId", "type": "bytes32"},
      {"name": "ethAddress", "type": "address"},
      {"name": "score", "type": "uint256"},
      {"name": "eliminated", "type": "bool"},
      {"name": "registered", "type": "bool"},
      {"name": "referrer", "type": "address"},
      {"name": "claimedPrize", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "prizePool",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "entryFee",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "status",
    "outputs": [{"name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPlayerCount",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "_matchId", "type": "uint256"}, {"name": "_p1Score", "type": "uint256"}, {"name": "_p2Score", "type": "uint256"}],
    "name": "submitResult",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "agentId", "type": "bytes32"},
      {"indexed": true, "name": "ethAddress", "type": "address"},
      {"indexed": true, "name": "referrer", "type": "address"}
    ],
    "name": "PlayerRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "player", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"}
    ],
    "name": "PrizeClaimed",
    "type": "event"
  }
] as const

// BettingPool Contract ABI
export const BETTING_POOL_ABI = [
  {
    "inputs": [{"name": "_matchId", "type": "uint256"}, {"name": "_amount", "type": "uint256"}, {"name": "_forPlayer1", "type": "bool"}],
    "name": "placeBet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_matchId", "type": "uint256"}],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "", "type": "uint256"}],
    "name": "totalPoolP1",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "", "type": "uint256"}],
    "name": "totalPoolP2",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "_matchId", "type": "uint256"}, {"name": "", "type": "address"}],
    "name": "bets",
    "outputs": [
      {"name": "player", "type": "address"},
      {"name": "amount", "type": "uint256"},
      {"name": "matchId", "type": "uint256"},
      {"name": "claimed", "type": "bool"},
      {"name": "forPlayer1", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resultSet",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "matchResult",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const
