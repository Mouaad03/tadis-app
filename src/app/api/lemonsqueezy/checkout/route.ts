import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  
  // Try auth first
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fallback: get from body
  const body = await req.json().catch(() => ({}))
  const userId = user?.id || body?.user_id
  const userEmail = user?.email || body?.email

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('email, full_name').eq('id', userId).single()

  const storeId = process.env.LEMONSQUEEZY_STORE_ID
  const variantId = process.env.LEMONSQUEEZY_VARIANT_ID
  const apiKey = process.env.LEMONSQUEEZY_API_KEY

  const reqBody = {
    data: {
      type: 'checkouts',
      attributes: {
        checkout_data: {
          email: profile?.email || userEmail || '',
          name: profile?.full_name || '',
          custom: { user_id: userId },
        },
        product_options: {
          redirect_url: 'http://localhost:3000/dashboard?upgraded=true',
        },
      },
      relationships: {
        store: { data: { type: 'stores', id: String(storeId) } },
        variant: { data: { type: 'variants', id: String(variantId) } },
      },
    },
  }

  const res = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json',
    },
    body: JSON.stringify(reqBody),
  })

  const data = await res.json()
  const checkoutUrl = data?.data?.attributes?.url

  if (!checkoutUrl) {
    console.error('LS error:', JSON.stringify(data))
    return NextResponse.json({ error: 'Failed to create checkout', details: data }, { status: 500 })
  }
  return NextResponse.json({ url: checkoutUrl })
}
