import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_PASSWORD = 'Tr@d1s#Admin$2026!'

export async function POST(req: NextRequest) {
  const { password, search } = await req.json()
  
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (search) {
    const { data: p } = await supabase.from('profiles').select('*')
      .or(`customer_id.eq.${search},email.eq.${search}`)
      .single()
    
    if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
    const { data: trades } = await supabase.from('trades').select('*').eq('user_id', p.id).order('created_at', { ascending: false }).limit(20)
    const { data: tickets } = await supabase.from('support_tickets').select('*').eq('user_id', p.id).order('created_at', { ascending: false })
    
    return NextResponse.json({ profile: p, trades: trades || [], tickets: tickets || [] })
  }

  const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  return NextResponse.json({ users: data || [] })
}
