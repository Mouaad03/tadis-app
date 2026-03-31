import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { customer_id, user_id, full_name, email, subject, message } = await req.json()

  const supabase = createClient()
  await supabase.from('support_tickets').insert({
    customer_id, user_id, full_name, email, subject, message
  })

  const resendKey = process.env.RESEND_API_KEY
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'TRADIS Support <onboarding@resend.dev>',
      to: 'mouaadboumaaza0@gmail.com',
      subject: `[${customer_id}] ${subject}`,
      html: `<h2>New Support Ticket</h2><p><b>Customer ID:</b> ${customer_id}</p><p><b>Name:</b> ${full_name}</p><p><b>Email:</b> ${email}</p><p><b>Subject:</b> ${subject}</p><p><b>Message:</b></p><p>${message}</p>`,
      reply_to: email,
    }),
  })

  return NextResponse.json({ success: true })
}
