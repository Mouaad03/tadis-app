import { Trade } from '@/types'

export function calcDisciplineScore(trades: Trade[]): number {
  let score = 100
  trades.forEach(t => {
    if (t.is_revenge) score -= 20
    if (t.is_strategy_break) score -= 10
    if (t.is_overtrading) score -= 15
  })
  return Math.max(0, score)
}

export function calcLotSize(balance: number, riskPercent: number, slPips: number): number {
  const riskAmount = balance * (riskPercent / 100)
  const pipValue = 10 // standard lot
  return parseFloat((riskAmount / (slPips * pipValue)).toFixed(2))
}

export function calcRR(entry: number, sl: number, tp: number): number {
  const slDist = Math.abs(entry - sl)
  const tpDist = Math.abs(tp - entry)
  return parseFloat((tpDist / slDist).toFixed(2))
}

export function calcSlPips(entry: number, sl: number): number {
  return Math.round(Math.abs(entry - sl) * 10000)
}

export function isRevengeTrade(lastLossTime: Date | null, currentTime: Date): boolean {
  if (!lastLossTime) return false
  const diffMs = currentTime.getTime() - lastLossTime.getTime()
  return diffMs < 30 * 60 * 1000 // 30 min
}

export function detectOvertrading(tradesToday: number, maxAllowed: number): boolean {
  return tradesToday >= maxAllowed
}

export function getWinRate(trades: Trade[]): number {
  if (!trades.length) return 0
  return Math.round((trades.filter(t => t.result === 'win').length / trades.length) * 100)
}

export function getPnLByPair(trades: Trade[]): Record<string, { pnl: number; winRate: number; total: number }> {
  const pairs: Record<string, { wins: number; total: number; pnl: number }> = {}
  trades.forEach(t => {
    if (!pairs[t.pair]) pairs[t.pair] = { wins: 0, total: 0, pnl: 0 }
    pairs[t.pair].total++
    pairs[t.pair].pnl += t.pnl
    if (t.result === 'win') pairs[t.pair].wins++
  })
  return Object.fromEntries(
    Object.entries(pairs).map(([pair, data]) => [
      pair,
      { pnl: data.pnl, winRate: Math.round((data.wins / data.total) * 100), total: data.total }
    ])
  )
}

export function getStrategyWinRate(trades: Trade[]): Record<string, { winRate: number; total: number }> {
  const strats: Record<string, { wins: number; total: number }> = {}
  trades.filter(t => t.strategy).forEach(t => {
    if (!strats[t.strategy!]) strats[t.strategy!] = { wins: 0, total: 0 }
    strats[t.strategy!].total++
    if (t.result === 'win') strats[t.strategy!].wins++
  })
  return Object.fromEntries(
    Object.entries(strats).map(([s, d]) => [s, { winRate: Math.round((d.wins / d.total) * 100), total: d.total }])
  )
}
