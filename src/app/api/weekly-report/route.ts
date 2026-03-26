import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient as createSupabase } from '@supabase/supabase-js'
import { getWinRate, getPnLByPair, getStrategyWinRate, calcDisciplineScore } from '@/lib/trading'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const period = searchParams.get('period') || 'weekly'
  const lang = searchParams.get('lang') || 'fr'
  const forceNew = searchParams.get('forceNew') === 'true'

  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 401 })

  const supabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const now = new Date()
  let startDate: string
  const endDate = now.toISOString().split('T')[0]

  if (period === 'monthly') {
    startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  } else {
    const sunday = new Date()
    sunday.setDate(sunday.getDate() - sunday.getDay())
    sunday.setHours(0, 0, 0, 0)
    startDate = sunday.toISOString().split('T')[0]
  }

  // Return cached report if exists
  if (!forceNew) {
    const { data: existing } = await supabase
      .from('reports').select('*').eq('user_id', userId)
      .eq('period', period).eq('period_start', startDate).eq('lang', lang)
      .order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (existing) {
      return NextResponse.json({ report: existing.report, stats: existing.stats, savedAt: existing.created_at, fromCache: true })
    }
  }

  const { data: trades, error } = await supabase
    .from('trades').select('*').eq('user_id', userId)
    .gte('date', startDate).order('date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!trades || trades.length === 0) {
    return NextResponse.json({
      report: '',
      stats: { winRate: 0, totalPnL: 0, revengeCount: 0, stratBreaks: 0, disciplineScore: 100, trades: 0 }
    })
  }

  const winRate = getWinRate(trades)
  const totalPnL = trades.reduce((s: number, t: any) => s + (t.pnl || 0), 0)
  const revengeCount = trades.filter((t: any) => t.is_revenge).length
  const stratBreaks = trades.filter((t: any) => t.is_strategy_break).length
  const disciplineScore = calcDisciplineScore(trades)
  const pairStats = getPnLByPair(trades)
  const stratStats = getStrategyWinRate(trades)
  const bestPair = Object.entries(pairStats).sort((a: any, b: any) => b[1].winRate - a[1].winRate)[0]
  const worstPair = Object.entries(pairStats).sort((a: any, b: any) => a[1].winRate - b[1].winRate)[0]
  const stats = { winRate, totalPnL, revengeCount, stratBreaks, disciplineScore, trades: trades.length }
  const periodLabel = period === 'weekly' ? 'week' : 'month'

  const langMap: Record<string, string> = {
    fr: 'Write entirely in French.',
    en: 'Write entirely in English.',
    ar: 'Write in Darija (Moroccan Arabic mixed with French).',
    darija: 'Write in Darija (Moroccan Arabic mixed with French).',
  }

  const prompt = `You are an elite professional trading coach and performance analyst. ${langMap[lang] || langMap.fr}

═══════════════════════════════════════
${periodLabel.toUpperCase()} PERFORMANCE REPORT
Period: ${startDate} → ${endDate}
═══════════════════════════════════════

CORE METRICS:
- Total Trades: ${trades.length}
- Win Rate: ${winRate}%
- Net P&L: ${totalPnL.toFixed(2)}
- Discipline Score: ${disciplineScore}/100
- Revenge Trades: ${revengeCount}
- Strategy Breaks: ${stratBreaks}
- Best Pair: ${bestPair?.[0]} (${(bestPair?.[1] as any)?.winRate}% WR)
- Worst Pair: ${worstPair?.[0]} (${(worstPair?.[1] as any)?.winRate}% WR)

STRATEGY BREAKDOWN:
${Object.entries(stratStats).map(([s, d]: any) => `• ${s}: ${d.winRate}% win rate (${d.total} trades)`).join('\n') || '• No data'}

TRADE LOG:
${trades.map((t: any) => `[${t.date}] ${t.pair} ${t.direction} → ${t.result?.toUpperCase()} | P&L: ${t.pnl} | Lot: ${t.lot_size} | RR: 1:${t.planned_rr}${t.is_revenge ? ' ⚠️ REVENGE' : ''}`).join('\n')}

Write a comprehensive, professional trading report with the following structure. Be specific, data-driven, and actionable:

## 📊 PERFORMANCE OVERVIEW
(2-3 sentences summarizing the week with key numbers)

## ✅ STRENGTHS THIS ${periodLabel.toUpperCase()}
(3 specific positives with data to back them up)

## ⚠️ AREAS FOR IMPROVEMENT
(2-3 honest, specific problem patterns with examples from the trade log)

## 🎯 ACTION PLAN FOR NEXT ${periodLabel.toUpperCase()}
1. [Specific action with measurable goal]
2. [Specific action with measurable goal]
3. [Specific action with measurable goal]

## 💪 COACH'S MESSAGE
(1-2 motivational sentences tailored to their specific performance)

Be direct, professional, and specific. Use the actual trade data. Max ${period === 'monthly' ? '500' : '350'} words.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: period === 'monthly' ? 900 : 650,
      messages: [{ role: 'user', content: prompt }]
    })
    const report = response.content[0].type === 'text' ? response.content[0].text : ''

    return NextResponse.json({ report, stats, savedAt: new Date().toISOString(), fromCache: false })
  } catch (err: any) {
    return NextResponse.json({ error: 'AI error: ' + err.message }, { status: 500 })
  }
}
