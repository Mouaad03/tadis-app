import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { to, name, subject, reply, customer_id } = await req.json()
  const resendKey = process.env.RESEND_API_KEY

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'TRADIS Support <support@tradis.live>',
      to: 'mouaadboumaaza0@gmail.com',
      subject: `Re: ${subject}`,
      html: `<h2>Reply from TRADIS Support</h2><p>Hi ${name},</p><p>${reply}</p><br><p>Best regards,<br>TRADIS Support Team<br>${customer_id ? `Your ID: ${customer_id}` : ''}</p>`,
      reply_to: 'mouaadboumaaza0@gmail.com',
    }),
  })

  return NextResponse.json({ success: true })
}
