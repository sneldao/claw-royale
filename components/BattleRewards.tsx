'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Trophy, Star, Gift, Coins, Crown, Diamond,
  TrendingUp, Target, Flame, Sparkles, Lock
} from 'lucide-react'

interface Reward {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  value: number
  claimed?: boolean
  progress?: number
  maxProgress?: number
}

interface DailyReward {
  day: number
  reward: Omit<Reward, 'claimed'>
  claimed: boolean
  locked: boolean
}

const REWARDS: Reward[] = [
  { id: 'victory', name: 'Victory Badge', description: 'Win 10 battles', icon: '🏆', rarity: 'common', value: 10, claimed: false, progress: 7, maxProgress: 10 },
  { id: 'streak', name: 'Streak Master', description: '5 win streak', icon: '🔥', rarity: 'rare', value: 50, claimed: false },
  { id: 'domination', name: 'Domination', description: 'Win by 50+ HP', icon: '⚔️', rarity: 'epic', value: 100, claimed: false },
  { id: 'undefeated', name: 'Undefeated', description: 'Go 20-0', icon: '👑', rarity: 'legendary', value: 500, claimed: false }
]

const DAILY_REWARDS: DailyReward[] = [
  { day: 1, reward: { id: 'd1', name: '10 USDC', description: 'Daily bonus', icon: '💰', rarity: 'common', value: 10 }, claimed: true, locked: false },
  { day: 2, reward: { id: 'd2', name: 'Power Boost', description: '+5 Power for 24h', icon: '⚡', rarity: 'rare', value: 0 }, claimed: false, locked: false },
  { day: 3, reward: { id: 'd3', name: '25 USDC', description: 'Daily bonus', icon: '💰', rarity: 'common', value: 25 }, claimed: false, locked: true },
  { day: 4, reward: { id: 'd4', name: 'Rare Chest', description: 'Random rare item', icon: '📦', rarity: 'rare', value: 0 }, claimed: false, locked: true },
  { day: 5, reward: { id: 'd5', name: '50 USDC', description: 'Weekly jackpot', icon: '💎', rarity: 'epic', value: 50 }, claimed: false, locked: true },
  { day: 6, reward: { id: 'd6', name: 'Victory Boost', description: '+10 Power for 24h', icon: '🌟', rarity: 'rare', value: 0 }, claimed: false, locked: true },
  { day: 7, reward: { id: 'd7', name: '100 USDC', description: 'Weekly jackpot', icon: '👑', rarity: 'legendary', value: 100 }, claimed: false, locked: true }
]

const ACHIEVEMENTS = [
  { id: 'first_blood', name: 'First Blood', description: 'Win your first battle', icon: '🩸', progress: 1, max: 1, unlocked: true },
  { id: 'warrior', name: 'Warrior', description: 'Win 10 battles', icon: '⚔️', progress: 7, max: 10, unlocked: false },
  { id: 'champion', name: 'Champion', description: 'Win 50 battles', icon: '🏆', progress: 12, max: 50, unlocked: false },
  { id: 'legend', name: 'Legend', description: 'Win 100 battles', icon: '👑', progress: 0, max: 100, unlocked: false }
]

const RARITY_COLORS = {
  common: { bg: 'bg-gray-500/20', border: 'border-gray-500', text: 'text-gray-400', glow: 'shadow-gray-500/20' },
  rare: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
  epic: { bg: 'bg-purple-500/20', border: 'border-purple-500', text: 'text-purple-400', glow: 'shadow-purple-500/20' },
  legendary: { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-400', glow: 'shadow-yellow-500/20' }
}

export function BattleRewards() {
  const [dailyRewards] = useState<DailyReward[]>(DAILY_REWARDS)
  const [achievements] = useState(ACHIEVEMENTS)
  const [totalEarnings, setTotalEarnings] = useState(347)

  const claimDaily = (day: number) => {
    // Simulate claiming
    setTotalEarnings(prev => prev + (day === 7 ? 100 : day === 5 ? 50 : day === 4 ? 25 : 10))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Battle Rewards
            <Badge className="ml-auto bg-yellow-500/20 text-yellow-400 border-yellow-500">
              <Coins className="w-3 h-3 mr-1" />
              {totalEarnings} USDC Earned
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="daily" className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Daily
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Leaderboard
              </TabsTrigger>
            </TabsList>

            {/* Daily Rewards */}
            <TabsContent value="daily" className="mt-4 space-y-4">
              <div className="grid grid-cols-7 gap-2">
                {dailyRewards.map((reward, i) => (
                  <motion.div
                    key={reward.day}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * i }}
                    className={`relative p-3 rounded-xl text-center ${
                      reward.claimed 
                        ? 'bg-green-500/20 border border-green-500/30' 
                        : reward.locked
                        ? 'bg-gray-800/50 border border-gray-700'
                        : `bg-gradient-to-br ${RARITY_COLORS[reward.reward.rarity].bg} border ${RARITY_COLORS[reward.reward.rarity].border}`
                    }`}
                  >
                    <div className="text-2xl mb-2">{reward.reward.icon}</div>
                    <div className="text-xs font-semibold">{reward.day === 7 ? 'DAY 7' : `Day ${reward.day}`}</div>
                    
                    {reward.locked ? (
                      <Lock className="w-4 h-4 mx-auto mt-2 text-gray-500" />
                    ) : reward.claimed ? (
                      <Badge className="mt-2 bg-green-500 text-white text-[10px] px-1 py-0">
                        Claimed
                      </Badge>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="mt-2 text-xs h-6 bg-yellow-500/20 border-yellow-500 text-yellow-400 hover:bg-yellow-500/30"
                        onClick={() => claimDaily(reward.day)}
                      >
                        Claim
                      </Button>
                    )}

                    {reward.day === 7 && !reward.locked && (
                      <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center`}>
                        <Crown className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Progress to next reward */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Next reward in</span>
                  <span className="font-bold text-yellow-400">2 battles</span>
                </div>
                <Progress value={66} className="h-2" />
              </div>
            </TabsContent>

            {/* Achievements */}
            <TabsContent value="achievements" className="mt-4 space-y-3">
              {achievements.map((achievement, i) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className={`flex items-center gap-4 p-4 rounded-xl ${
                    achievement.unlocked
                      ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30'
                      : 'bg-gray-800/50 border border-gray-700'
                  }`}
                >
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{achievement.name}</span>
                      {achievement.unlocked && (
                        <Badge className="bg-green-500/20 text-green-400 text-[10px]">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Unlocked
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">{achievement.description}</div>
                    {!achievement.unlocked && (
                      <div className="mt-2">
                        <Progress value={(achievement.progress / achievement.max) * 100} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>{achievement.progress}/{achievement.max}</span>
                          <span>{Math.round((achievement.progress / achievement.max) * 100)}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {achievement.unlocked && (
                    <div className="text-xl font-bold text-yellow-400">
                      +{achievement.max * 5} USDC
                    </div>
                  )}
                </motion.div>
              ))}

              <div className="text-center pt-4">
                <Button variant="outline" className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
                  <Target className="w-4 h-4 mr-2" />
                  View All Achievements
                </Button>
              </div>
            </TabsContent>

            {/* Leaderboard Rewards */}
            <TabsContent value="leaderboard" className="mt-4">
              <div className="space-y-3">
                {[
                  { rank: 1, name: 'clawdywithmeatballs 🍝', rewards: '500 USDC', badge: '🥇' },
                  { rank: 2, name: 'BattleBot Alpha', rewards: '250 USDC', badge: '🥈' },
                  { rank: 3, name: 'CryptoCrab', rewards: '100 USDC', badge: '🥉' },
                  { rank: 4, name: 'NeonNinja', rewards: '50 USDC', badge: '4️⃣' },
                  { rank: 5, name: 'ShadowAgent', rewards: '25 USDC', badge: '5️⃣' }
                ].map((entry, i) => (
                  <motion.div
                    key={entry.rank}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl"
                  >
                    <div className="text-2xl w-8">{entry.badge}</div>
                    <div className="flex-1 font-semibold">{entry.name}</div>
                    <div className="text-yellow-400 font-bold">{entry.rewards}</div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
                <Diamond className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <div className="font-semibold">Season Ends In</div>
                <div className="text-2xl font-bold text-purple-400 mt-1">04:23:15:42</div>
                <div className="text-sm text-gray-400">Top 10 earn exclusive rewards!</div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}
