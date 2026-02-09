'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ActivityItem {
  emoji: string
  title: string
  desc: string
  time: string
}

interface ActivityFeedProps {
  activity: ActivityItem[]
}

export function ActivityFeed({ activity }: ActivityFeedProps) {
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="text-2xl">📜</div>
          Live Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
          {activity.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg"
            >
              <div className="text-2xl">{item.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{item.title}</div>
                <div className="text-gray-500 text-sm truncate">{item.desc}</div>
              </div>
              <div className="text-gray-600 text-xs whitespace-nowrap">{item.time}</div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
