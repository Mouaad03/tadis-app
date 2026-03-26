import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const payload = JSON.parse(body)

  const eventName = payload?.meta?.event_name
  const userId = payload?.meta?.custom_data?.user_id

  if (!userId) return NextResponse.json({ ok: true })

  const supabase = createClient()

  if (eventName === 'subscription_created' || eventName === 'subscription_resumed' || eventName === 'order_created') {
    await supabase.from('profiles').update({ is_pro: true }).eq('id', userId)
  }

  if (eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
    await supabase.from('profiles').update({ is_pro: false }).eq('id', userId)
  }

  return NextResponse.json({ ok: true })
}
