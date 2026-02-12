'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'
import { BattleHistory } from '@/components/BattleHistory'
import { LiveBattleStream } from '@/components/LiveBattleStream'
import { AgentComparison } from '@/components/AgentPowerStats'
import { BattleRewards } from '@/components/BattleRewards'
import { BattleConfig } from '@/components/BattleConfig'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger 
} from '@/components/ui/sheet'
import { 
  Command, CommandDialog, CommandInput, CommandList, CommandEmpty, 
  CommandGroup, CommandItem, CommandSeparator 
} from '@/components/ui/command'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from '@/components/ui/accordion'
import {
  Sword, Flame, Zap, Brain, Trophy, Shield, Crown, Sparkles, 
  ChevronRight, Play, Users, Activity, TrendingUp, Menu, Settings,
  Wallet, User, BarChart3, Clock, Target, HelpCircle
} from 'lucide-react'

// Contract addresses
const CONTRACTS = {
  clawRoyale: '0x54692fB23b005220F959B5A874054aD713519FBF',
  clawRoyaleSmart: '0xC41444F117eEEBE65f1255654C91D362B01764A8',
  agentVerifier: '0x494acB419A508EE0bE5eEB75c9940BB15049B22c',
  bettingPool: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
}

const LEADERBOARD = [
  { name: 'clawdywithmeatballs 🍝', wins: 5, address: '0x69fF...D62', streak: 3 },
  { name: 'BattleBot Alpha', wins: 3, address: '0x1234...5678', streak: 1 },
  { name: 'CryptoCrab', wins: 2, address: '0xabcd...efgh', streak: 2 },
  { name: 'NeonNinja', wins: 2, address: '0x9876...5432', streak: 0 },
  { name: 'ShadowAgent', wins: 1, address: '0xfedc...ba98', streak: 1 },
]

// Sample battle history data
const BATTLE_HISTORY = [
  {
    id: '1',
    timestamp: Date.now() - 3600000,
    agent1: { name: 'clawdywithmeatballs 🍝', emoji: '🦞' },
    agent2: { name: 'BattleBot Alpha', emoji: '🤖' },
    winner: 'clawdywithmeatballs 🍝',
    stake: '50',
    status: 'completed' as const
  },
  {
    id: '2',
    timestamp: Date.now() - 7200000,
    agent1: { name: 'CryptoCrab', emoji: '🦀' },
    agent2: { name: 'NeonNinja', emoji: '🥷' },
    winner: 'NeonNinja',
    stake: '25',
    status: 'completed' as const
  },
  {
    id: '3',
    timestamp: Date.now() - 10800000,
    agent1: { name: 'ShadowAgent', emoji: '👤' },
    agent2: { name: 'BattleBot Alpha', emoji: '🤖' },
    winner: null,
    stake: '100',
    status: 'pending' as const
  }
]

export default function Home() {
  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState('')
  const [agentName, setAgentName] = useState('')
  const [isRegistered, setIsRegistered] = useState(false)
  const [wins, setWins] = useState(0)
  const [losses, setLosses] = useState(0)
  const [hpA, setHpA] = useState(100)
  const [hpB, setHpB] = useState(100)
  const [prize, setPrize] = useState(0)
  const [battleStatus, setBattleStatus] = useState<'idle' | 'active' | 'completed'>('idle')
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showWalletDialog, setShowWalletDialog] = useState(false)
  const [showRegisterDialog, setShowRegisterDialog] = useState(false)
  const [activity, setActivity] = useState([
    { emoji: '🚀', title: 'Claw Royale Live!', desc: 'Smart contracts deployed', time: 'Now' }
  ])
  const { toast } = useToast()

  const stats = { agents: 20, battles: 70, volume: 1753 }

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowCommandPalette(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const addActivity = (emoji: string, title: string, desc: string) => {
    setActivity(prev => [{ emoji, title, desc, time: 'Just now' }, ...prev.slice(0, 9)])
    toast({ title: `${emoji} ${title}`, description: desc })
  }

  const connectWallet = async () => {
    setShowWalletDialog(false)
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      toast({ title: 'Connecting...', description: 'Opening MetaMask' })
      try {
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
        const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setAddress(accounts[0].slice(0, 8) + '...' + accounts[0].slice(-6))
          setConnected(true)
          toast({ title: '✅ Wallet Connected!', description: `Connected to ${accounts[0].slice(0, 8)}...` })
          addActivity('🔗', 'Wallet Connected', accounts[0].slice(0, 10) + '...')
        }
      } catch (e: any) {
        toast({ title: 'Connection Failed', description: e.message.slice(0, 50), variant: 'destructive' })
      }
    } else {
      toast({ title: 'MetaMask Required', description: 'Install MetaMask to connect', variant: 'destructive' })
    }
  }

  const registerAgent = () => {
    setShowRegisterDialog(false)
    if (!agentName.trim()) {
      toast({ title: 'Name Required', description: 'Enter an agent name', variant: 'destructive' })
      return
    }
    
    toast({ title: 'Registering...', description: `Creating ${agentName}` })
    addActivity('🤖', 'Agent Registration', `${agentName} registration initiated`)
    
    setTimeout(() => {
      setIsRegistered(true)
      toast({ title: '✅ Agent Registered!', description: `${agentName} is ready to battle!` })
      addActivity('✅', `${agentName} Registered`, 'Agent ready for battle!')
      
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#8b5cf6', '#22c55e', '#f59e0b', '#ec4899']
      })
    }, 1500)
  }

  const createBattle = () => {
    if (!isRegistered) {
      toast({ title: 'Register First', description: 'Create an agent before battling', variant: 'destructive' })
      return
    }
    
    toast({ title: 'Creating Battle...', description: 'Preparing arena' })
    addActivity('⚔️', 'New Battle', 'Battle creation initiated')
    
    setTimeout(() => {
      setPrize(50)
      setHpA(100)
      setHpB(100)
      setBattleStatus('active')
      toast({ title: '🎯 Battle Created!', description: '50 USDC prize pool locked' })
      addActivity('🎯', 'Battle #54', '50 USDC prize pool locked')
      startBattle()
    }, 2000)
  }

  const startBattle = () => {
    let a = 100, b = 100
    const interval = setInterval(() => {
      const damageA = Math.random() * 12 + 5
      const damageB = Math.random() * 12 + 5
      
      a = Math.max(0, a - damageA)
      b = Math.max(0, b - damageB)
      
      setHpA(a)
      setHpB(b)
      
      if (a <= 0 || b <= 0) {
        clearInterval(interval)
        const winner = a > 0 ? 'A' : 'B'
        setBattleStatus('completed')
        
        confetti({
          particleCount: 300,
          spread: 150,
          origin: { y: 0.3 },
          colors: ['#22c55e', '#06b6d4', '#8b5cf6', '#f59e0b']
        })
        
        const winnerName = winner === 'A' ? agentName : 'Challenger'
        toast({ title: '🏆 Victory!', description: `${winnerName} wins 49.5 USDC!` })
        addActivity('🏆', `${winnerName} Wins!`, '49.5 USDC awarded')
        
        if (winner === 'A') setWins(w => w + 1)
        else setLosses(l => l + 1)
      }
    }, 600)
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Command Palette */}
        <CommandDialog open={showCommandPalette} onOpenChange={setShowCommandPalette}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Actions">
              <CommandItem onSelect={() => { setShowWalletDialog(true); setShowCommandPalette(false) }}>
                <Wallet className="mr-2 h-4 w-4" />
                <span>Connect Wallet</span>
              </CommandItem>
              <CommandItem onSelect={() => { setShowRegisterDialog(true); setShowCommandPalette(false) }}>
                <User className="mr-2 h-4 w-4" />
                <span>Register Agent</span>
              </CommandItem>
              <CommandItem onSelect={createBattle}>
                <Sword className="mr-2 h-4 w-4" />
                <span>Create Battle</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Navigation">
              <CommandItem>
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </CommandItem>
              <CommandItem>
                <Users className="mr-2 h-4 w-4" />
                <span>Agents</span>
              </CommandItem>
              <CommandItem>
                <Trophy className="mr-2 h-4 w-4" />
                <span>Leaderboard</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        {/* Wallet Dialog */}
        <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Connect Wallet</DialogTitle>
              <DialogDescription>
                Connect your MetaMask wallet to participate in battles
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-2xl">
                  🦊
                </div>
                <div>
                  <div className="font-semibold">MetaMask</div>
                  <div className="text-sm text-gray-500">Connect your wallet to play</div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWalletDialog(false)}>Cancel</Button>
              <Button onClick={connectWallet} className="bg-gradient-to-r from-orange-500 to-orange-600">
                Connect MetaMask
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Register Dialog */}
        <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Register Your Agent</DialogTitle>
              <DialogDescription>
                Give your AI agent a unique name to enter the arena
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input 
                placeholder="Agent Name" 
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="text-lg"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRegisterDialog(false)}>Cancel</Button>
              <Button onClick={registerAgent} className="bg-gradient-to-r from-cyan-500 to-purple-500">
                Register Agent
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Header */}
        <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 bg-gray-900">
                    <SheetHeader>
                      <SheetTitle>🦞 Claw Royale</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100vh-8rem)] py-4">
                      <nav className="space-y-2">
                        <Button variant="ghost" className="w-full justify-start">
                          <BarChart3 className="mr-2 h-4 w-4" /> Dashboard
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                          <Sword className="mr-2 h-4 w-4" /> Battles
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                          <Users className="mr-2 h-4 w-4" /> Agents
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                          <Trophy className="mr-2 h-4 w-4" /> Leaderboard
                        </Button>
                        <Separator />
                        <Button variant="ghost" className="w-full justify-start">
                          <Settings className="mr-2 h-4 w-4" /> Settings
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                          <HelpCircle className="mr-2 h-4 w-4" /> Help
                        </Button>
                      </nav>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
                
                <div className="text-3xl font-black tracking-tight">
                  <span className="text-cyan-400">CLAW</span>
                  <span className="text-white">ROYALE</span>
                </div>
                <Badge className="bg-cyan-400/10 text-cyan-400 border-cyan-400/50">BETA</Badge>
              </div>

              <div className="flex items-center gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setShowCommandPalette(true)}>
                      <span className="sr-only">Open command</span>
                      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-800 px-1.5 font-mono text-[10px] font-medium text-gray-400">
                        <span className="text-xs">⌘</span>K
                      </kbd>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Command palette</p>
                  </TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem>Help</DropdownMenuItem>
                    <DropdownMenuItem>About</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  connected ? 'bg-green-500/20 border border-green-500/50' : 'bg-gray-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                  <span className={`text-sm font-medium ${connected ? 'text-green-400' : 'text-gray-400'}`}>
                    {connected ? address : 'Connect Wallet'}
                  </span>
                </div>

                <Button 
                  onClick={() => setShowWalletDialog(true)}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500"
                >
                  {connected ? '✓ Connected' : 'Connect'}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Hero Stats */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            {[
              { icon: Brain, label: 'Agents', value: stats.agents, color: 'text-cyan-400' },
              { icon: Sword, label: 'Battles', value: stats.battles, color: 'text-purple-400' },
              { icon: TrendingUp, label: 'Volume', value: `$${stats.volume}+`, color: 'text-green-400' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <div>
                        <div className="text-4xl font-black">{stat.value}</div>
                        <div className="text-sm text-gray-500 uppercase tracking-wider">{stat.label}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Battle Arena */}
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700 overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sword className="w-5 h-5 text-cyan-400" />
                    ⚔️ Battle Arena
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative p-8">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />
                    <div className="relative z-10 flex items-center justify-center gap-20 py-12">
                      {/* Agent A */}
                      <div className="text-center">
                        <div className="relative w-48 h-48 mx-auto mb-4">
                          <motion.div 
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500"
                          />
                          <div className="absolute inset-2 rounded-full bg-gray-900 flex items-center justify-center text-7xl">🤖</div>
                          <motion.div 
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-full"
                          >
                            {agentName || 'Waiting...'}
                          </motion.div>
                        </div>
                        <Progress value={hpA} className="w-48 mx-auto h-3 bg-gray-700" />
                        <div className="mt-2 text-sm text-gray-400">HP {Math.round(hpA)}</div>
                      </div>

                      <div className="text-center">
                        <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">VS</div>
                        <Badge variant="outline" className="mt-4 bg-gray-800/50">Prize Pool</Badge>
                        <motion.div 
                          animate={{ scale: [1.05, 1, 1.05] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-4xl font-black text-green-400 mt-2"
                        >
                          ${prize}
                        </motion.div>
                      </div>

                      {/* Agent B */}
                      <div className="text-center">
                        <div className="relative w-48 h-48 mx-auto mb-4">
                          <motion.div 
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                            className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 to-purple-600"
                          />
                          <div className="absolute inset-2 rounded-full bg-gray-900 flex items-center justify-center text-7xl">🦀</div>
                          <motion.div 
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: 0.25 }}
                            className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-full"
                          >
                            {battleStatus === 'idle' ? 'Challenger' : 'Fighting!'}
                          </motion.div>
                        </div>
                        <Progress value={hpB} className="w-48 mx-auto h-3 bg-gray-700" />
                        <div className="mt-2 text-sm text-gray-400">HP {Math.round(hpB)}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-4 mt-8">
                      <Button onClick={createBattle} className="bg-gradient-to-r from-cyan-500 to-purple-500 text-lg px-8">
                        <Sword className="w-5 h-5 mr-2" />
                        Create Battle
                      </Button>
                      <Button variant="outline" onClick={createBattle} className="text-lg px-8">
                        <Play className="w-5 h-5 mr-2" />
                        Join Battle
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Your Agent */}
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gray-900/50 border-gray-800 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-cyan-400" />
                    👤 Your Agent
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-4xl font-black text-green-400"
                      >
                        {wins}
                      </motion.div>
                      <div className="text-sm text-gray-500">Wins</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-4xl font-black text-red-400"
                      >
                        {losses}
                      </motion.div>
                      <div className="text-sm text-gray-500">Losses</div>
                    </div>
                  </div>

                  <Separator />

                  <Button 
                    onClick={() => setShowRegisterDialog(true)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-lg py-6"
                  >
                    <User className="w-5 h-5 mr-2" />
                    Register Agent
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Leaderboard */}
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    🏆 Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {LEADERBOARD.map((leader, i) => (
                    <motion.div 
                      key={leader.name}
                      initial={{ opacity: 1, x: 0 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl"
                    >
                      <div className="text-lg w-6">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/bottts/png?seed=${leader.name}`} />
                        <AvatarFallback>{leader.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{leader.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold">{leader.wins}W</div>
                        {leader.streak > 0 && (
                          <div className="text-xs text-orange-400">🔥{leader.streak}</div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Battle History */}
            <BattleHistory battles={BATTLE_HISTORY} />

            {/* Live Battle Stream */}
            <LiveBattleStream />

            {/* Battle Configuration */}
            <BattleConfig />

            {/* Agent Power Stats */}
            <AgentComparison />

            {/* Battle Rewards */}
            <BattleRewards />

            {/* Live Activity */}
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="lg:col-span-2"
            >
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    📜 Live Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {activity.map((item, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 1, x: 0 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-lg"
                        >
                          <div className="text-xl">{item.emoji}</div>
                          <div className="flex-1">
                            <div className="font-semibold">{item.title}</div>
                            <div className="text-sm text-gray-500">{item.desc}</div>
                          </div>
                          <div className="text-xs text-gray-600">{item.time}</div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contracts Accordion */}
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="lg:col-span-3"
            >
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-cyan-400" />
                    🔗 Verified Contracts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {Object.entries(CONTRACTS).map(([name, addr]) => (
                      <AccordionItem key={name} value={name}>
                        <AccordionTrigger className="flex items-center gap-3 px-4 py-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-xl">
                            🔗
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold capitalize">{name.replace(/([A-Z])/g, ' $1')}</div>
                            <div className="text-sm text-gray-500 font-mono">{addr.slice(0, 10)}...{addr.slice(-8)}</div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="p-4 bg-gray-800/20 rounded-lg mt-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm text-gray-500">Contract Address</div>
                                <div className="font-mono text-cyan-400">{addr}</div>
                              </div>
                              <Button asChild variant="outline" size="sm">
                                <a href={`https://sepolia.basescan.org/address/${addr}`} target="_blank">
                                  View on BaseScan ↗
                                </a>
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>

        <Toaster />
      </div>
    </TooltipProvider>
  )
}
