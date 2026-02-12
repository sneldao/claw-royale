'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Settings, Sword, Coins, Users, Zap, Shield, Clock,
  ChevronDown, ChevronUp, Play, Lock, Unlock
} from 'lucide-react'

interface BattleConfig {
  stakeAmount: number
  rounds: number
  autoStart: boolean
  privateBattle: boolean
  selectedOpponent: string | null
}

const OPPONENTS = [
  { id: '1', name: 'BattleBot Alpha', emoji: '🤖', power: 92, available: true },
  { id: '2', name: 'CryptoCrab', emoji: '🦀', power: 70, available: true },
  { id: '3', name: 'NeonNinja', emoji: '🥷', power: 85, available: true },
  { id: '4', name: 'ShadowAgent', emoji: '👤', power: 78, available: false },
  { id: '5', name: 'Random Opponent', emoji: '🎲', power: 0, available: true }
]

export function BattleConfig() {
  const [config, setConfig] = useState<BattleConfig>({
    stakeAmount: 25,
    rounds: 5,
    autoStart: false,
    privateBattle: false,
    selectedOpponent: null
  })
  const [showAdvanced, setShowAdvanced] = useState(false)

  const maxStake = 500
  const maxRounds = 10

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sword className="w-5 h-5 text-orange-500" />
            Battle Configuration
          </CardTitle>
          <CardDescription>Set up your battle parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stake Amount */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-yellow-400" />
                Stake Amount (USDC)
              </Label>
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400">
                {config.stakeAmount} USDC
              </Badge>
            </div>
            <Slider
              value={[config.stakeAmount]}
              onValueChange={([value]) => setConfig(prev => ({ ...prev, stakeAmount: value }))}
              min={5}
              max={maxStake}
              step={5}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>5 USDC</span>
              <span>{maxStake} USDC</span>
            </div>
          </div>

          {/* Number of Rounds */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                Battle Rounds
              </Label>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400">
                {config.rounds} Rounds
              </Badge>
            </div>
            <Slider
              value={[config.rounds]}
              onValueChange={([value]) => setConfig(prev => ({ ...prev, rounds: value }))}
              min={1}
              max={maxRounds}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 Round</span>
              <span>{maxRounds} Rounds</span>
            </div>
          </div>

          {/* Advanced Settings Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            {showAdvanced ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide Advanced Settings
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show Advanced Settings
              </>
            )}
          </button>

          {/* Advanced Settings */}
          <motion.div
            initial={false}
            animate={{ height: showAdvanced ? 'auto' : 0, opacity: showAdvanced ? 1 : 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-2">
              {/* Auto Start */}
              <div className="flex items-center justify-between py-2">
                <Label className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Auto-start Battle
                </Label>
                <Switch
                  checked={config.autoStart}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoStart: checked }))}
                />
              </div>

              {/* Private Battle */}
              <div className="flex items-center justify-between py-2">
                <Label className="flex items-center gap-2">
                  {config.privateBattle ? (
                    <Lock className="w-4 h-4 text-purple-400" />
                  ) : (
                    <Unlock className="w-4 h-4 text-green-400" />
                  )}
                  Private Battle
                </Label>
                <Switch
                  checked={config.privateBattle}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, privateBattle: checked }))}
                />
              </div>
            </div>
          </motion.div>

          {/* Opponent Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-400" />
              Select Opponent
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {OPPONENTS.map((opponent) => (
                <button
                  key={opponent.id}
                  onClick={() => opponent.available && setConfig(prev => ({ ...prev, selectedOpponent: opponent.id }))}
                  disabled={!opponent.available}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    config.selectedOpponent === opponent.id
                      ? 'bg-green-500/20 border-green-500/50'
                      : opponent.available
                      ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                      : 'bg-gray-900/30 border-gray-800 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span className="text-2xl">{opponent.emoji}</span>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{opponent.name}</div>
                    {opponent.available ? (
                      <div className="text-xs text-gray-400">Power: {opponent.power}</div>
                    ) : (
                      <div className="text-xs text-red-400">Busy in another battle</div>
                    )}
                  </div>
                  {opponent.id === '5' && (
                    <Badge className="bg-purple-500/20 text-purple-400">Random</Badge>
                  )}
                  {config.selectedOpponent === opponent.id && (
                    <Badge className="bg-green-500 text-white">Selected</Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Total Stake Display */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total Stake (You + Opponent)</span>
              <span className="text-2xl font-bold text-yellow-400">{config.stakeAmount * 2} USDC</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Winner takes: {(config.stakeAmount * 2) * 0.95} USDC (5% fee)
            </div>
          </div>

          {/* Start Battle Button */}
          <Button
            className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400"
            disabled={!config.selectedOpponent}
          >
            <Play className="w-5 h-5 mr-2" />
            Start Battle
          </Button>

          {!config.selectedOpponent && (
            <p className="text-center text-sm text-gray-500">
              Select an opponent to start
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
