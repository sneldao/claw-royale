'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

interface Leader {
  name: string
  wins: number
  emoji: string
  address: string
}

interface LeaderboardProps {
  leaders: Leader[]
}

export function Leaderboard({ leaders }: LeaderboardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {leaders.map((leader, i) => (
            <motion.div
              key={leader.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
            >
              <div className="text-xl w-8">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
              </div>
              <div className="text-2xl">{leader.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{leader.name}</div>
                <div className="text-gray-500 text-xs">{leader.address}</div>
              </div>
              <div className="text-neon-green font-bold">{leader.wins}W</div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}
