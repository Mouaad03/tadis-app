import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
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
  matcher: ['/dashboard/:path*', '/profile/:path*', '/settings/:path*', '/accounts/:path*', '/trades/:path*'],
}
