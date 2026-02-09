'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sword, Trophy, Users } from 'lucide-react'

interface BattleControlsProps {
  onCreateBattle: () => void
  onJoinBattle: () => void
  disabled: boolean
}

export function BattleControls({ onCreateBattle, onJoinBattle, disabled }: BattleControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center gap-4 mt-8"
    >
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={onCreateBattle}
          disabled={disabled}
          className="bg-gradient-to-r from-neon-blue to-neon-purple hover:opacity-90 text-lg px-8 py-6"
        >
          <Sword className="w-5 h-5 mr-2" />
          Create Battle
        </Button>
      </motion.div>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          onClick={onJoinBattle}
          disabled={disabled}
          className="text-lg px-8 py-6 border-gray-600 hover:bg-gray-800"
        >
          <Trophy className="w-5 h-5 mr-2" />
          Join Battle
        </Button>
      </motion.div>
    </motion.div>
  )
}
