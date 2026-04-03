import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { user_id, email } = await req.json()
  
  const priceId = process.env.PADDLE_PRICE_ID
  const apiKey = process.env.PADDLE_API_KEY

  const res = await fetch('https://api.paddle.com/transactions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [{ price_id: priceId, quantity: 1 }],
      customer: { email },
      custom_data: { user_id },
      checkout: {
        url: 'https://tradis.live/upgrade'
      }
    }),
  })

  const data = await res.json()
  console.log('Paddle response:', JSON.stringify(data))
  
  console.log('Full data:', JSON.stringify(data?.data))
  const checkoutUrl = data?.data?.checkout?.url
  if (!checkoutUrl) {
    return NextResponse.json({ error: 'Failed to create checkout', details: data }, { status: 500 })
  }
  
  return NextResponse.json({ url: checkoutUrl })
}
