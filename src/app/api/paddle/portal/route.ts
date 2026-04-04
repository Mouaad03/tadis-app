import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('paddle_customer_id')
    .eq('id', user.id)
    .single()

  console.log('Profile:', profile)

  if (!profile?.paddle_customer_id) {
    return NextResponse.json({ error: 'No Paddle customer found' }, { status: 404 })
  }

  const response = await fetch(
    `https://api.paddle.com/customers/${profile.paddle_customer_id}/portal-sessions`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    }
  )

  const data = await response.json()
  console.log('Paddle response:', JSON.stringify(data))

  const portalUrl = data?.data?.urls?.general?.overview

  if (!portalUrl) return NextResponse.json({ error: 'Failed to generate portal URL', paddle: data }, { status: 500 })

  return NextResponse.json({ url: portalUrl })
}
