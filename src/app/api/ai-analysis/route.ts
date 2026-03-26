import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Trade } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { trade, recentTrades } = await req.json() as { trade: Trade; recentTrades: Trade[] }

  const prompt = `You are a professional trading coach analyzing a trader's behavior and discipline.

CURRENT TRADE:
- Pair: ${trade.pair} ${trade.direction}
- Result: ${trade.result.toUpperCase()} | PnL: $${trade.pnl}
- Planned RR: 1:${trade.planned_rr || '?'} | Actual RR: 1:${trade.actual_rr || '?'}
- Strategy: ${trade.strategy || 'Not specified'}
- Was Revenge Trade: ${trade.is_revenge ? 'YES ⚠️' : 'No'}
- Strategy Break: ${trade.is_strategy_break ? 'YES ⚠️' : 'No'}
- Mood (1-5): ${trade.mood || '?'}
- Notes: ${trade.notes || 'None'}

LAST 5 TRADES CONTEXT:
${recentTrades.slice(-5).map((t, i) => `${i + 1}. ${t.pair} ${t.direction} — ${t.result} | PnL: $${t.pnl} | Revenge: ${t.is_revenge} | StratBreak: ${t.is_strategy_break}`).join('\n')}

Provide a SHORT, direct coaching feedback (max 4 sentences) in Darija (Moroccan Arabic mixed with French). Be honest, specific, and actionable. 
- If revenge trade: be firm but supportive
- If clean trade win: brief positive reinforcement  
- If clean trade loss: focus on what was good (respected rules) vs outcome
- Always end with ONE specific action for next trade
Format: plain text, no bullets, no markdown.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }]
  })

  const feedback = response.content[0].type === 'text' ? response.content[0].text : ''

  // Save feedback to trade
  await supabase.from('trades').update({ ai_feedback: feedback }).eq('id', trade.id)

  return NextResponse.json({ feedback })
}
