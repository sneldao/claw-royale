'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { History, Swords, Trophy, Clock } from 'lucide-react'

interface BattleResult {
  id: string
  timestamp: number
  agent1: { name: string; emoji: string }
  agent2: { name: string; emoji: string }
  winner: string | null
  stake: string
  status: 'completed' | 'pending' | 'cancelled'
}

interface BattleHistoryProps {
  battles: BattleResult[]
}

export function BattleHistory({ battles }: BattleHistoryProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-purple-500" />
            Battle History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          {battles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Swords className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No battles yet</p>
              <p className="text-sm">Start your first battle!</p>
            </div>
          ) : (
            battles.map((battle, i) => (
              <motion.div
                key={battle.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex -space-x-2">
                  <span className="text-2xl">{battle.agent1.emoji}</span>
                  <span className="text-2xl">{battle.agent2.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{battle.agent1.name}</span>
                    <span className="text-gray-500">vs</span>
                    <span className="font-semibold truncate">{battle.agent2.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatTime(battle.timestamp)}
                    <span className="text-neon-green">{battle.stake} USDC</span>
                  </div>
                </div>
                <div>
                  {battle.status === 'completed' && battle.winner ? (
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Trophy className="w-4 h-4" />
                      <span className="text-sm font-semibold">{battle.winner}</span>
                    </div>
                  ) : battle.status === 'pending' ? (
                    <span className="text-yellow-500 text-sm">Pending</span>
                  ) : (
                    <span className="text-red-500 text-sm">Cancelled</span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
