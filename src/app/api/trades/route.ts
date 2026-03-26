import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { calcDisciplineScore, detectOvertrading } from '@/lib/trading'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')
  const week = searchParams.get('week')
  const month = searchParams.get('month')

  let query = supabase.from('trades').select('*').eq('user_id', user.id)

  if (date) {
    query = query.eq('date', date)
  } else if (week === 'true') {
    const monday = new Date()
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
    query = query.gte('date', monday.toISOString().split('T')[0])
  } else if (month) {
    const [y, m] = month.split('-')
    query = query.gte('date', `${y}-${m}-01`).lte('date', `${y}-${m}-31`)
  }

  const { data: trades } = await query.order('created_at', { ascending: false })
  return NextResponse.json({ trades: trades || [] })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const today = body.date || new Date().toISOString().split('T')[0]

  const { data: existing } = await supabase.from('trades').select('id').eq('user_id', user.id).eq('date', today)
  const { data: profile } = await supabase.from('profiles').select('max_daily_trades').eq('id', user.id).single()
  const maxTrades = profile?.max_daily_trades || 5

  if (existing && existing.length >= maxTrades) {
    return NextResponse.json({ error: 'Max trades reached' }, { status: 400 })
  }

  const tradeData = {
    user_id: user.id,
    ...body,
    date: today,
  }

  const { data, error } = await supabase.from('trades').insert(tradeData).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ trade: data })
}
