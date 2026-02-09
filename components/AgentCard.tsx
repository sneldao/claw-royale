'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Crown, Target, Shield } from 'lucide-react'

interface AgentCardProps {
  agentName: string
  setAgentName: (name: string) => void
  isRegistered: boolean
  wins: number
  losses: number
  onRegister: () => void
}

export function AgentCard({ 
  agentName, setAgentName, isRegistered, wins, losses, onRegister 
}: AgentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-xl">
              👤
            </div>
            <div>
              <div>Your Agent</div>
              <div className={isRegistered ? 'text-neon-blue' : 'text-gray-500'}>
                {isRegistered ? agentName : 'Not registered'}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-neon-green/20 to-green-500/10 rounded-xl p-4 text-center border border-green-500/20"
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-neon-green" />
              </div>
              <div className="text-3xl font-black text-neon-green">{wins}</div>
              <div className="text-gray-500 text-xs uppercase">Wins</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-red-500/20 to-rose-500/10 rounded-xl p-4 text-center border border-red-500/20"
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-3xl font-black text-red-500">{losses}</div>
              <div className="text-gray-500 text-xs uppercase">Losses</div>
            </motion.div>
          </div>
          
          {/* Agent Name Input */}
          <div className="space-y-3 mb-4">
            <Input
              placeholder="Agent Name"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              disabled={isRegistered}
              className="bg-gray-800/50 border-gray-700 focus:border-neon-blue"
            />
          </div>
          
          {/* Register Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onRegister}
              disabled={isRegistered}
              className={`w-full py-6 text-lg font-bold ${
                isRegistered
                  ? 'bg-green-500/20 text-green-400 cursor-default'
                  : 'bg-gradient-to-r from-neon-blue to-neon-purple hover:opacity-90'
              }`}
            >
              {isRegistered ? (
                <>
                  <Target className="w-5 h-5 mr-2" />
                  ✓ Registered
                </>
              ) : (
                <>
                  🚀 Register Agent
                </>
              )}
            </Button>
          </motion.div>
          
          {/* Agent Info */}
          {isRegistered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700"
            >
              <div className="text-xs text-gray-500 uppercase mb-2">Agent Status</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                <span className="text-neon-green text-sm">Ready for battle</span>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
