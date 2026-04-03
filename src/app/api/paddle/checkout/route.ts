import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { user_id, email } = await req.json()
  
  const priceId = process.env.PADDLE_PRICE_ID
  const apiKey = process.env.PADDLE_API_KEY

  // Use price-based checkout URL directly
  const res = await fetch(`https://api.paddle.com/prices/${priceId}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  })

  const data = await res.json()
  console.log('Price data:', JSON.stringify(data))

  // Return direct checkout URL
  const checkoutUrl = `https://checkout.paddle.com/checkout/custom/connect?product=${priceId}&email=${encodeURIComponent(email || '')}&passthrough=${encodeURIComponent(JSON.stringify({ user_id }))}`
  
  return NextResponse.json({ url: checkoutUrl })
}
