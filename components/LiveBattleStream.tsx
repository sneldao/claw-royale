'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Radio, Zap, Shield, Sword, Sparkles, Play, Clock,
  User, DollarSign, Activity
} from 'lucide-react'

interface LiveBattle {
  id: string
  agent1: { name: string; emoji: string; hp: number; power: number }
  agent2: { name: string; emoji: string; hp: number; power: number }
  prize: number
  startTime: number
  roundsElapsed: number
  recentActions: string[]
}

export function LiveBattleStream() {
  const [battles, setBattles] = useState<LiveBattle[]>([
    {
      id: 'battle-001',
      agent1: { name: 'clawdywithmeatballs 🍝', emoji: '🦞', hp: 75, power: 85 },
      agent2: { name: 'NeonNinja', emoji: '🥷', hp: 60, power: 90 },
      prize: 150,
      startTime: Date.now() - 45000,
      roundsElapsed: 3,
      recentActions: ['🦞 Critical Hit!', '🥷 Shield activated', '🦞 Power strike']
    }
  ])

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setBattles(prev => prev.map(battle => {
        const hpChange = Math.random() > 0.5 ? -5 : 3
        const newHp1 = Math.max(0, Math.min(100, battle.agent1.hp + (Math.random() > 0.5 ? hpChange : -hpChange)))
        const newHp2 = Math.max(0, Math.min(100, battle.agent2.hp + (Math.random() > 0.5 ? hpChange : -hpChange)))
        
        const actions = ['Critical Hit!', 'Power strike', 'Shield activated', 'Healing pulse', 'Ultimate attack']
        const newAction = battle.agent1.hp > newHp1 
          ? `${battle.agent1.emoji} ${actions[Math.floor(Math.random() * 3)]}`
          : `${battle.agent2.emoji} ${actions[Math.floor(Math.random() * 3)]}`

        return {
          ...battle,
          agent1: { ...battle.agent1, hp: newHp1 },
          agent2: { ...battle.agent2, hp: newHp2 },
          roundsElapsed: battle.roundsElapsed + 1,
          recentActions: [newAction, ...battle.recentActions.slice(0, 4)]
        }
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gradient-to-br from-gray-900/80 to-purple-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500 animate-pulse" />
            <span className="text-green-400">LIVE</span>
            Battle Arena
            <Badge variant="outline" className="ml-auto border-green-500 text-green-400">
              {battles.length} Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatePresence>
            {battles.map((battle) => (
              <motion.div
                key={battle.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gray-800/50 rounded-xl p-4 space-y-3"
              >
                {/* Timer & Prize */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    {formatTime(Date.now() - battle.startTime)}
                    <Badge variant="secondary" className="ml-2">
                      Round {battle.roundsElapsed}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-bold">{battle.prize} USDC</span>
                  </div>
                </div>

                {/* Agents HP */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Agent 1 */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{battle.agent1.emoji}</span>
                      <span className="font-semibold text-sm truncate">{battle.agent1.name}</span>
                    </div>
                    <Progress value={battle.agent1.hp} className="h-2" />
                    <div className="flex justify-between text-xs">
                      <span className="text-red-400">{battle.agent1.hp}% HP</span>
                      <span className="text-yellow-400">{battle.agent1.power} PWR</span>
                    </div>
                  </div>

                  {/* Agent 2 */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{battle.agent2.emoji}</span>
                      <span className="font-semibold text-sm truncate">{battle.agent2.name}</span>
                    </div>
                    <Progress value={battle.agent2.hp} className="h-2" />
                    <div className="flex justify-between text-xs">
                      <span className="text-red-400">{battle.agent2.hp}% HP</span>
                      <span className="text-yellow-400">{battle.agent2.power} PWR</span>
                    </div>
                  </div>
                </div>

                {/* Recent Actions */}
                <div className="bg-gray-900/50 rounded-lg p-2 space-y-1">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Recent Actions</div>
                  <div className="space-y-1">
                    {battle.recentActions.map((action, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-sm flex items-center gap-2"
                      >
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        {action}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Watch Button */}
                <button className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-semibold transition-colors">
                  <Play className="w-4 h-4" />
                  Watch Battle
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {battles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Sword className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No battles live right now</p>
              <p className="text-sm">Start a battle to see action here!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
