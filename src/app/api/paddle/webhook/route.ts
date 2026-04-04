import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  console.log('Paddle webhook:', JSON.stringify(body))

  const eventType = body?.event_type
  const customData = body?.data?.custom_data
  const userId = customData?.user_id
  const paddleCustomerId = body?.data?.customer_id
  const paddleSubscriptionId = body?.data?.id

  if (!userId) return NextResponse.json({ ok: true })

  const supabase = createClient()

  if (eventType === 'subscription.activated' || eventType === 'transaction.completed') {
    await supabase.from('profiles').update({ 
      is_pro: true,
      paddle_customer_id: paddleCustomerId,
      paddle_subscription_id: paddleSubscriptionId
    }).eq('id', userId)
    console.log('User upgraded:', userId)
  }

  if (eventType === 'subscription.canceled' || eventType === 'subscription.past_due') {
    await supabase.from('profiles').update({ 
      is_pro: false,
      paddle_subscription_id: null
    }).eq('id', userId)
    console.log('User downgraded:', userId)
  }

  return NextResponse.json({ ok: true })
}
