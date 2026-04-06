import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = createClient()
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const { data: profiles } = await supabase.from('profiles').select('id, email, full_name, lang, risk_percent')
  console.log('Profiles found:', profiles?.length)
  if (!profiles?.length) return NextResponse.json({ ok: true, generated: 0 })
  const today = new Date()
  const sunday = new Date(today)
  sunday.setDate(today.getDate() - today.getDay())
  const monday = new Date(sunday)
  monday.setDate(sunday.getDate() - 6)
  const periodStart = monday.toISOString().split('T')[0]
  const periodEnd = sunday.toISOString().split('T')[0]
  let generated = 0
  for (const profile of profiles) {
    try {
      const { data: existing } = await supabase.from('weekly_reports').select('id').eq('user_id', profile.id).eq('period_start', periodStart).single()
      if (existing) continue
      const { data: trades } = await supabase.from('trades').select('*').eq('user_id', profile.id).gte('date', periodStart).lte('date', periodEnd)
      console.log('Trades for user', profile.id, ':', trades?.length, 'period:', periodStart, '-', periodEnd)
      if (!trades?.length) continue
      const wins = trades.filter(t => t.result === 'win').length
      const losses = trades.filter(t => t.result === 'loss').length
      const totalPnL = trades.reduce((s, t) => s + (t.pnl || 0), 0)
      const winRate = Math.round((wins / trades.length) * 100)
      const revengeCount = trades.filter(t => t.is_revenge).length
      const stratBreaks = trades.filter(t => t.is_strategy_break).length
      const avgDiscipline = Math.round(trades.reduce((s, t) => s + (t.discipline_score || 100), 0) / trades.length)
      const stats = { trades: trades.length, wins, losses, totalPnL, winRate, revengeCount, stratBreaks, disciplineScore: avgDiscipline }
      const lang = profile.lang || 'en'
      const langInstructions: Record<string, string> = { en: 'Write in English.', fr: 'Écris en français.', ar: 'اكتب باللغة العربية.', es: 'Escribe en español.' }
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: `You are a trading coach. ${langInstructions[lang] || langInstructions.en}\n\nGenerate a weekly coaching report:\n- Trades: ${trades.length} (${wins} wins, ${losses} losses)\n- Win Rate: ${winRate}%\n- Net P&L: $${totalPnL.toFixed(2)}\n- Discipline Score: ${avgDiscipline}/100\n- Revenge Trades: ${revengeCount}\n- Strategy Breaks: ${stratBreaks}\n- Period: ${periodStart} to ${periodEnd}\n\nWrite 3 sections:\n1. Performance Summary\n2. Key Weaknesses\n3. Action Plan for next week\n\nBe direct and motivating. Max 300 words.` }]
      })
      const reportText = message.content[0].type === 'text' ? message.content[0].text : ''
      await supabase.from('weekly_reports').insert({ user_id: profile.id, period_type: 'weekly', period_start: periodStart, period_end: periodEnd, report: reportText, stats, lang })
      await supabase.from('notifications').insert({ user_id: profile.id, type: 'weekly_report', title: lang === 'fr' ? '📊 Rapport hebdomadaire disponible' : lang === 'ar' ? '📊 التقرير الأسبوعي جاهز' : '📊 Weekly Report Ready', message: lang === 'fr' ? 'Votre rapport hebdomadaire est prêt!' : lang === 'ar' ? 'تقرير أسبوعي جاهز!' : 'Your weekly report is ready!', read: false })
      generated++
    } catch(e) { console.error('Error for user', profile.id, e) }
  }
  return NextResponse.json({ ok: true, generated })
}
