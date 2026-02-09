'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Zap, Trophy, Users } from 'lucide-react'

interface StatsCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
  delay?: number
}

export function StatsCard({ icon, label, value, color, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="bg-gray-900/30 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-4xl font-black ${color}`}>{value}</div>
              <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                {icon} {label}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
