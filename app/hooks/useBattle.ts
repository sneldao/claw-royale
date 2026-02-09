'use client'

import { useState } from 'react'
import confetti from 'canvas-confetti'
import type { BattleStatus, ActivityItem } from '@/lib/types/tournament'

export function useBattle() {
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

  const addActivity = (emoji: string, title: string, desc: string) => {
    setActivity(prev => [{ emoji, title, desc, time: 'Just now' }, ...prev.slice(0, 9)])
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
        addActivity('🏆', `${winnerName} Wins!`, '49.5 USDC awarded')

        if (winner === 'A') setWins(w => w + 1)
        else setLosses(l => l + 1)
      }
    }, 600)
  }

  const registerAgent = () => {
    if (!agentName.trim()) return

    addActivity('🤖', 'Agent Registration', `${agentName} registration initiated`)

    setTimeout(() => {
      setIsRegistered(true)
      addActivity('✅', `${agentName} Registered`, 'Agent ready for battle!')

      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#8b5cf6', '#22c55e', '#f59e0b', '#ec4899']
      })
    }, 1500)
  }

  const createBattle = () => {
    if (!isRegistered) return

    addActivity('⚔️', 'New Battle', 'Battle creation initiated')

    setTimeout(() => {
      setPrize(50)
      setHpA(100)
      setHpB(100)
      setBattleStatus('active')
      addActivity('🎯', 'Battle #54', '50 USDC prize pool locked')
      startBattle()
    }, 2000)
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
    battleStatus,
    activity,
    registerAgent,
    createBattle,
    addActivity,
  }
}
