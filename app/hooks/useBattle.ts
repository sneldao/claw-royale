'use client'

import { useState, useEffect, useCallback } from 'react'
import confetti from 'canvas-confetti'
import { parseUnits, formatUnits, keccak256, toBytes, stringToHex } from 'viem'
import type { BattleStatus, ActivityItem } from '@/lib/types/tournament'
import { publicClient, getWalletClient, CLAW_ROYALE_ABI, USDC_ABI } from '@/lib/viem'
import { CLAW_ROYALE_ADDRESS, USDC_ADDRESS } from '@/lib/config/contracts'
import { baseSepolia } from 'viem/chains'

export function useBattle(userAddress?: string) {
  const [agentName, setAgentName] = useState('')
  const [isRegistered, setIsRegistered] = useState(false)
  const [wins, setWins] = useState(0)
  const [losses, setLosses] = useState(0)
  const [hpA, setHpA] = useState(100)
  const [hpB, setHpB] = useState(100)
  const [prize, setPrize] = useState(0)
  const [battleStatus, setBattleStatus] = useState<BattleStatus>('idle')
  const [activity, setActivity] = useState<ActivityItem[]>([
    { emoji: '🚀', title: 'Claw Royale Live!', desc: 'Smart contracts deployed', time: 'Now' }
  ])
  const [prizePool, setPrizePool] = useState(0)
  const [playerCount, setPlayerCount] = useState(0)
  const [tournamentStatus, setTournamentStatus] = useState(0) // 0=Pending, 1=Active, 2=Completed
  const [isLoading, setIsLoading] = useState(false)

  const addActivity = (emoji: string, title: string, desc: string) => {
    setActivity(prev => [{ emoji, title, desc, time: 'Just now' }, ...prev.slice(0, 9)])
  }

  // Fetch contract data
  const fetchContractData = useCallback(async () => {
    try {
      const [pool, count, status] = await Promise.all([
        publicClient.readContract({
          address: CLAW_ROYALE_ADDRESS as `0x${string}`,
          abi: CLAW_ROYALE_ABI,
          functionName: 'prizePool',
        }),
        publicClient.readContract({
          address: CLAW_ROYALE_ADDRESS as `0x${string}`,
          abi: CLAW_ROYALE_ABI,
          functionName: 'getPlayerCount',
        }),
        publicClient.readContract({
          address: CLAW_ROYALE_ADDRESS as `0x${string}`,
          abi: CLAW_ROYALE_ABI,
          functionName: 'status',
        }),
      ])
      
      setPrizePool(Number(formatUnits(pool, 6)))
      setPlayerCount(Number(count))
      setTournamentStatus(Number(status))
    } catch (error) {
      console.error('Error fetching contract data:', error)
    }
  }, [])

  // Check if user is registered
  const checkRegistration = useCallback(async () => {
    if (!userAddress) return
    
    try {
      const player = await publicClient.readContract({
        address: CLAW_ROYALE_ADDRESS as `0x${string}`,
        abi: CLAW_ROYALE_ABI,
        functionName: 'players',
        args: [userAddress as `0x${string}`],
      })
      
      setIsRegistered(player[4]) // registered field is at index 4
    } catch (error) {
      console.error('Error checking registration:', error)
    }
  }, [userAddress])

  // Initial data fetch
  useEffect(() => {
    fetchContractData()
    checkRegistration()
    
    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      fetchContractData()
      checkRegistration()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [fetchContractData, checkRegistration])

  const registerAgent = async () => {
    if (!agentName.trim() || !userAddress) return
    
    setIsLoading(true)
    addActivity('🤖', 'Agent Registration', `${agentName} registration initiated`)
    
    try {
      const walletClient = getWalletClient()
      if (!walletClient) {
        throw new Error('Wallet not connected')
      }

      const [account] = await walletClient.getAddresses()
      
      // Generate agent ID from name
      const agentId = keccak256(stringToHex(agentName))
      
      // First approve USDC spending
      const entryFee = parseUnits('5', 6) // 5 USDC
      
      addActivity('⏳', 'Approving USDC', 'Please approve USDC spending...')
      
      const approveHash = await walletClient.writeContract({
        address: USDC_ADDRESS as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [CLAW_ROYALE_ADDRESS as `0x${string}`, entryFee],
        account,
        chain: baseSepolia,
      })
      
      await publicClient.waitForTransactionReceipt({ hash: approveHash })
      
      addActivity('✅', 'USDC Approved', 'Now registering agent...')
      
      // Then register
      const registerHash = await walletClient.writeContract({
        address: CLAW_ROYALE_ADDRESS as `0x${string}`,
        abi: CLAW_ROYALE_ABI,
        functionName: 'register',
        args: [agentId, '0x0000000000000000000000000000000000000000' as `0x${string}`], // no referrer
        account,
        chain: baseSepolia,
      })
      
      await publicClient.waitForTransactionReceipt({ hash: registerHash })
      
      setIsRegistered(true)
      addActivity('✅', `${agentName} Registered`, 'Agent ready for battle!')
      
      // Refresh data
      fetchContractData()
      
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#8b5cf6', '#22c55e', '#f59e0b', '#ec4899']
      })
    } catch (error) {
      console.error('Registration error:', error)
      addActivity('❌', 'Registration Failed', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const claimPrize = async () => {
    if (!userAddress) return
    
    setIsLoading(true)
    addActivity('💰', 'Claiming Prize', 'Initiating prize claim...')
    
    try {
      const walletClient = getWalletClient()
      if (!walletClient) {
        throw new Error('Wallet not connected')
      }

      const [account] = await walletClient.getAddresses()
      
      const hash = await walletClient.writeContract({
        address: CLAW_ROYALE_ADDRESS as `0x${string}`,
        abi: CLAW_ROYALE_ABI,
        functionName: 'claimPrize',
        account,
        chain: baseSepolia,
      })
      
      await publicClient.waitForTransactionReceipt({ hash })
      
      addActivity('🎉', 'Prize Claimed!', 'USDC transferred to your wallet')
      
      confetti({
        particleCount: 300,
        spread: 150,
        origin: { y: 0.3 },
        colors: ['#22c55e', '#06b6d4', '#8b5cf6', '#f59e0b']
      })
      
      // Refresh data
      fetchContractData()
    } catch (error) {
      console.error('Claim error:', error)
      addActivity('❌', 'Claim Failed', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const createBattle = () => {
    // This would create a new battle/match
    // For now, we simulate the battle visualization
    if (!isRegistered) return

    addActivity('⚔️', 'New Battle', 'Battle creation initiated')

    setTimeout(() => {
      setPrize(50)
      setHpA(100)
      setHpB(100)
      setBattleStatus('active')
      addActivity('🎯', 'Battle Started', `${prizePool.toFixed(1)} USDC prize pool`)
      startBattle()
    }, 2000)
  }

  const startBattle = () => {
    let a = 100, b = 100
    const interval = setInterval(() => {
      const damageA = Math.random() * 12 + 5
      const damageB = Math.random() * 12 + 5

      a = Math.max(0, a - damageA)
      b = Math.max(0, b - damageB)

      setHpA(a)
      setHpB(b)

      if (a <= 0 || b <= 0) {
        clearInterval(interval)
        const winner = a > 0 ? 'A' : 'B'
        setBattleStatus('completed')

        confetti({
          particleCount: 300,
          spread: 150,
          origin: { y: 0.3 },
          colors: ['#22c55e', '#06b6d4', '#8b5cf6', '#f59e0b']
        })

        const winnerName = winner === 'A' ? agentName : 'Challenger'
        addActivity('🏆', `${winnerName} Wins!`, 'Battle completed')

        if (winner === 'A') setWins(w => w + 1)
        else setLosses(l => l + 1)
      }
    }, 600)
  }

  return {
    agentName,
    setAgentName,
    isRegistered,
    wins,
    losses,
    hpA,
    hpB,
    prize,
    prizePool,
    playerCount,
    tournamentStatus,
    battleStatus,
    activity,
    isLoading,
    registerAgent,
    createBattle,
    claimPrize,
    addActivity,
    refreshData: fetchContractData,
  }
}
