import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Simple in-memory rate limiter
const rateMap = new Map<string, { count: number; reset: number }>()

function isRateLimited(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + windowMs })
    return false
  }
  if (entry.count >= limit) return true
  entry.count++
  return false
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'

  // Rate limit AI routes — max 10 per minute
  if (pathname.startsWith('/api/weekly-report') || pathname.startsWith('/api/ai-analysis')) {
    if (isRateLimited(ip + pathname, 10, 60 * 1000)) {
      return NextResponse.json({ error: 'Too many requests — please wait' }, { status: 429 })
    }
  }

  // Rate limit auth routes — max 20 per minute
  if (pathname.startsWith('/api/trades') || pathname.startsWith('/api/price')) {
    if (isRateLimited(ip + pathname, 20, 60 * 1000)) {
      return NextResponse.json({ error: 'Too many requests — please wait' }, { status: 429 })
    }
  }

  // Rate limit checkout — max 5 per minute
  if (pathname.startsWith('/api/lemonsqueezy/checkout')) {
    if (isRateLimited(ip + pathname, 5, 60 * 1000)) {
      return NextResponse.json({ error: 'Too many requests — please wait' }, { status: 429 })
    }
  }
  const publicRoutes = ['/', '/auth', '/reset-password', '/upgrade', '/privacy', '/terms', '/contact', '/faq']
  if (publicRoutes.some(r => pathname === r) || pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return NextResponse.next()
  }
  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/auth', request.url))
  const { data: profile } = await supabase.from('profiles').select('is_pro, trial_start_date').eq('id', user.id).single()
  if (profile && !profile.is_pro) {
    const trialStart = profile.trial_start_date ? new Date(profile.trial_start_date) : new Date()
    const diffDays = Math.floor((Date.now() - trialStart.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays >= 15 && pathname !== '/upgrade') {
      return NextResponse.redirect(new URL('/upgrade', request.url))
    }
  }
  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*', '/profile/:path*', '/settings/:path*', 
    '/accounts/:path*', '/trades/:path*',
    '/api/weekly-report/:path*', '/api/ai-analysis/:path*',
    '/api/trades/:path*', '/api/price/:path*',
    '/api/lemonsqueezy/checkout/:path*'
  ],
}
