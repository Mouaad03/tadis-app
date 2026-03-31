import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json()

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }

  // Save f Supabase
  const supabase = createClient()
  await supabase.from('contact_messages').insert({ name, email, message })

  // Send email via Resend
  const resendKey = process.env.RESEND_API_KEY
  const contactEmail = process.env.CONTACT_EMAIL

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'TRADIS <support@tradis.live>',
      to: 'mouaadboumaaza0@gmail.com',
      subject: `New message from ${name}`,
      html: `<h2>New Contact Message</h2><p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Message:</b></p><p>${message}</p>`,
      reply_to: email,
    }),
  })
  const resendData = await resendRes.json()
  console.log('Resend response:', JSON.stringify(resendData))

  return NextResponse.json({ success: true })
}
