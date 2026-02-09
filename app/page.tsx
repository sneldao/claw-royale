'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/app/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator } from '@/components/ui/command'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Sword, Brain, Trophy, Shield, TrendingUp, Menu, Settings, Wallet, User, BarChart3, Users, HelpCircle } from 'lucide-react'

import { useWallet } from '@/app/hooks/useWallet'
import { useBattle } from '@/app/hooks/useBattle'
import { CONTRACTS } from '@/lib/config/contracts'
import { LEADERBOARD } from '@/lib/data/leaderboard'

import { WalletConnect } from '@/components/WalletConnect'
import { AgentCard } from '@/components/AgentCard'
import { BattleControls } from '@/components/BattleControls'
import { Leaderboard } from '@/components/Leaderboard'
import { ActivityFeed } from '@/components/ActivityFeed'
import { ContractShowcase } from '@/components/ContractShowcase'

const LEADER_EMOJIS = ['🍝', '🤖', '🦀', '⚡', '👤']

const leaders = LEADERBOARD.map((entry, i) => ({
  name: entry.name,
  wins: entry.wins,
  address: entry.address,
  emoji: LEADER_EMOJIS[i] ?? '👤',
}))

const contractsForShowcase = {
  clawRoyale: CONTRACTS.ClawRoyale,
  clawRoyaleSmart: CONTRACTS.ClawRoyaleSmart,
  agentVerifier: CONTRACTS.AgentVerifier,
  bettingPool: CONTRACTS.BettingPool,
}

// Stats are now fetched from the contract in useBattle hook

export default function Home() {
  const { connected, address, fullAddress, connectWallet } = useWallet()
  const battle = useBattle(fullAddress)
  const { toast } = useToast()

  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showWalletDialog, setShowWalletDialog] = useState(false)
  const [showRegisterDialog, setShowRegisterDialog] = useState(false)

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

  const handleConnectWallet = async () => {
    setShowWalletDialog(false)
    toast({ title: 'Connecting...', description: 'Opening MetaMask' })
    try {
      await connectWallet()
      if (connected) {
        toast({ title: '✅ Wallet Connected!', description: `Connected to ${address}` })
      }
    } catch {
      toast({ title: 'Connection Failed', description: 'Could not connect wallet', variant: 'destructive' })
    }
  }

  const handleRegister = () => {
    setShowRegisterDialog(false)
    if (!battle.agentName.trim()) {
      toast({ title: 'Name Required', description: 'Enter an agent name', variant: 'destructive' })
      return
    }
    toast({ title: 'Registering...', description: `Creating ${battle.agentName}` })
    battle.registerAgent()
  }

  const handleCreateBattle = () => {
    if (!battle.isRegistered) {
      toast({ title: 'Register First', description: 'Create an agent before battling', variant: 'destructive' })
      return
    }
    toast({ title: 'Creating Battle...', description: 'Preparing arena' })
    battle.createBattle()
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
                <Wallet className="mr-2 h-4 w-4" /><span>Connect Wallet</span>
              </CommandItem>
              <CommandItem onSelect={() => { setShowRegisterDialog(true); setShowCommandPalette(false) }}>
                <User className="mr-2 h-4 w-4" /><span>Register Agent</span>
              </CommandItem>
              <CommandItem onSelect={handleCreateBattle}>
                <Sword className="mr-2 h-4 w-4" /><span>Create Battle</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Navigation">
              <CommandItem><BarChart3 className="mr-2 h-4 w-4" /><span>Dashboard</span></CommandItem>
              <CommandItem><Users className="mr-2 h-4 w-4" /><span>Agents</span></CommandItem>
              <CommandItem><Trophy className="mr-2 h-4 w-4" /><span>Leaderboard</span></CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        {/* Wallet Dialog */}
        <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Connect Wallet</DialogTitle>
              <DialogDescription>Connect your MetaMask wallet to participate in battles</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-2xl">🦊</div>
                <div>
                  <div className="font-semibold">MetaMask</div>
                  <div className="text-sm text-gray-500">Connect your wallet to play</div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWalletDialog(false)}>Cancel</Button>
              <Button onClick={handleConnectWallet} className="bg-gradient-to-r from-orange-500 to-orange-600">Connect MetaMask</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Register Dialog */}
        <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Register Your Agent</DialogTitle>
              <DialogDescription>Give your AI agent a unique name to enter the arena</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Agent Name"
                value={battle.agentName}
                onChange={(e) => battle.setAgentName(e.target.value)}
                className="text-lg"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRegisterDialog(false)}>Cancel</Button>
              <Button onClick={handleRegister} className="bg-gradient-to-r from-cyan-500 to-purple-500">Register Agent</Button>
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
                    <Button variant="ghost" size="icon" className="lg:hidden"><Menu className="h-5 w-5" /></Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 bg-gray-900">
                    <SheetHeader><SheetTitle>🦞 Claw Royale</SheetTitle></SheetHeader>
                    <ScrollArea className="h-[calc(100vh-8rem)] py-4">
                      <nav className="space-y-2">
                        <Button variant="ghost" className="w-full justify-start"><BarChart3 className="mr-2 h-4 w-4" /> Dashboard</Button>
                        <Button variant="ghost" className="w-full justify-start"><Sword className="mr-2 h-4 w-4" /> Battles</Button>
                        <Button variant="ghost" className="w-full justify-start"><Users className="mr-2 h-4 w-4" /> Agents</Button>
                        <Button variant="ghost" className="w-full justify-start"><Trophy className="mr-2 h-4 w-4" /> Leaderboard</Button>
                        <Separator />
                        <Button variant="ghost" className="w-full justify-start"><Settings className="mr-2 h-4 w-4" /> Settings</Button>
                        <Button variant="ghost" className="w-full justify-start"><HelpCircle className="mr-2 h-4 w-4" /> Help</Button>
                      </nav>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
                <div className="text-3xl font-black tracking-tight">
                  <span className="text-cyan-400">CLAW</span><span className="text-white">ROYALE</span>
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
                  <TooltipContent><p>Command palette</p></TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><Settings className="h-5 w-5" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem>Help</DropdownMenuItem>
                    <DropdownMenuItem>About</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <WalletConnect connected={connected} address={address} onConnect={() => setShowWalletDialog(true)} />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            {[
              { icon: Brain, label: 'Agents', value: battle.playerCount, color: 'text-cyan-400' },
              { icon: Trophy, label: 'Prize Pool', value: `${battle.prizePool.toFixed(1)} USDC`, color: 'text-green-400' },
              { icon: TrendingUp, label: 'Status', value: battle.tournamentStatus === 0 ? 'Pending' : battle.tournamentStatus === 1 ? 'Active' : 'Completed', color: 'text-purple-400' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 1, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
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
            <motion.div initial={{ opacity: 1, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
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
                      <div className="text-center">
                        <div className="relative w-48 h-48 mx-auto mb-4">
                          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500" />
                          <div className="absolute inset-2 rounded-full bg-gray-900 flex items-center justify-center text-7xl">🤖</div>
                          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5, repeat: Infinity }} className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-full">
                            {battle.agentName || 'Waiting...'}
                          </motion.div>
                        </div>
                        <Progress value={battle.hpA} className="w-48 mx-auto h-3 bg-gray-700" />
                        <div className="mt-2 text-sm text-gray-400">HP {Math.round(battle.hpA)}</div>
                      </div>

                      <div className="text-center">
                        <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">VS</div>
                        <Badge variant="outline" className="mt-4 bg-gray-800/50">Prize Pool</Badge>
                        <motion.div animate={{ scale: [1.05, 1, 1.05] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl font-black text-green-400 mt-2">
                          {battle.prizePool.toFixed(1)} USDC
                        </motion.div>
                      </div>

                      <div className="text-center">
                        <div className="relative w-48 h-48 mx-auto mb-4">
                          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 to-purple-600" />
                          <div className="absolute inset-2 rounded-full bg-gray-900 flex items-center justify-center text-7xl">🦀</div>
                          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.25 }} className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-full">
                            {battle.battleStatus === 'idle' ? 'Challenger' : 'Fighting!'}
                          </motion.div>
                        </div>
                        <Progress value={battle.hpB} className="w-48 mx-auto h-3 bg-gray-700" />
                        <div className="mt-2 text-sm text-gray-400">HP {Math.round(battle.hpB)}</div>
                      </div>
                    </div>

                    <BattleControls onCreateBattle={handleCreateBattle} onJoinBattle={handleCreateBattle} disabled={!battle.isRegistered} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Your Agent */}
            <AgentCard
              agentName={battle.agentName}
              setAgentName={battle.setAgentName}
              isRegistered={battle.isRegistered}
              wins={battle.wins}
              losses={battle.losses}
              onRegister={handleRegister}
            />

            {/* Leaderboard */}
            <Leaderboard leaders={leaders} />

            {/* Live Activity */}
            <div className="lg:col-span-2">
              <ActivityFeed activity={battle.activity} />
            </div>

            {/* Verified Contracts */}
            <div className="lg:col-span-3">
              <ContractShowcase contracts={contractsForShowcase} />
            </div>
          </div>
        </main>

        <Toaster />
      </div>
    </TooltipProvider>
  )
}
