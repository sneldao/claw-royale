'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Zap, Shield, Sword, Brain, Flame, Wind, Sparkles,
  TrendingUp, Target, Crosshair, Activity
} from 'lucide-react'

interface AgentStats {
  name: string
  emoji: string
  power: number
  defense: number
  speed: number
  intelligence: number
  specialAbility: string
  winRate: number
  totalBattles: number
  streak: number
  element: 'fire' | 'water' | 'electric' | 'psychic'
}

interface AgentPowerStatsProps {
  agent: AgentStats
}

const ELEMENT_COLORS = {
  fire: { bg: 'from-red-500/20 to-orange-500/20', border: 'border-red-500', text: 'text-red-400', accent: 'fire' },
  water: { bg: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500', text: 'text-blue-400', accent: 'water' },
  electric: { bg: 'from-yellow-500/20 to-purple-500/20', border: 'border-yellow-500', text: 'text-yellow-400', accent: 'electric' },
  psychic: { bg: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500', text: 'text-purple-400', accent: 'psychic' }
}

const ELEMENT_ICONS = {
  fire: Flame,
  water: Wind,
  electric: Zap,
  psychic: Brain
}

export function AgentPowerStats({ agent }: AgentPowerStatsProps) {
  const colors = ELEMENT_COLORS[agent.element]
  const ElementIcon = ELEMENT_ICONS[agent.element]

  const statBars = [
    { label: 'Power', value: agent.power, icon: Sword, color: 'bg-red-500' },
    { label: 'Defense', value: agent.defense, icon: Shield, color: 'bg-blue-500' },
    { label: 'Speed', value: agent.speed, icon: Wind, color: 'bg-green-500' },
    { label: 'Intelligence', value: agent.intelligence, icon: Brain, color: 'bg-purple-500' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className={`bg-gradient-to-br ${colors.bg} ${colors.border} border`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="text-4xl">{agent.emoji}</div>
            <div>
              <div className="flex items-center gap-2">
                {agent.name}
                <Badge variant="outline" className={colors.text}>
                  <ElementIcon className="w-3 h-3 mr-1" />
                  {agent.element}
                </Badge>
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Power Rating: <span className="font-bold text-white">{agent.power}</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {statBars.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="bg-gray-800/50 rounded-lg p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <stat.icon className={`w-4 h-4 ${stat.color.replace('bg-', 'text-')}`} />
                    <span className="text-sm text-gray-300">{stat.label}</span>
                  </div>
                  <span className="font-bold">{stat.value}</span>
                </div>
                <Progress value={stat.value} className="h-2" />
              </motion.div>
            ))}
          </div>

          {/* Special Ability */}
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-semibold">Special Ability</span>
            </div>
            <div className="text-lg font-medium">{agent.specialAbility}</div>
          </div>

          {/* Battle Record */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{agent.winRate}%</div>
              <div className="text-xs text-gray-400">Win Rate</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">{agent.totalBattles}</div>
              <div className="text-xs text-gray-400">Battles</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-400">{agent.streak}🔥</div>
              <div className="text-xs text-gray-400">Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function AgentComparison() {
  const agents: AgentStats[] = [
    {
      name: 'clawdywithmeatballs 🍝',
      emoji: '🦞',
      power: 85,
      defense: 72,
      speed: 68,
      intelligence: 90,
      specialAbility: 'Critical Surge',
      winRate: 83,
      totalBattles: 12,
      streak: 5,
      element: 'psychic'
    },
    {
      name: 'BattleBot Alpha',
      emoji: '🤖',
      power: 92,
      defense: 65,
      speed: 78,
      intelligence: 75,
      specialAbility: 'Overdrive',
      winRate: 67,
      totalBattles: 9,
      streak: 2,
      element: 'electric'
    },
    {
      name: 'CryptoCrab',
      emoji: '🦀',
      power: 70,
      defense: 95,
      speed: 45,
      intelligence: 60,
      specialAbility: 'Iron Shell',
      winRate: 55,
      totalBattles: 20,
      streak: 1,
      element: 'water'
    }
  ]

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-red-500" />
          Agent Power Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={agents[0].name} className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            {agents.slice(0, 3).map((agent) => (
              <TabsTrigger key={agent.name} value={agent.name} className="text-xs">
                {agent.emoji} {agent.name.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>
          {agents.map((agent) => (
            <TabsContent key={agent.name} value={agent.name} className="mt-4">
              <AgentPowerStats agent={agent} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
