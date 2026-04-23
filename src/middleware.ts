import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login']
const ADMIN_ONLY_PATHS = ['/dashboard', '/new-hire', '/hire']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p))

  // Not authenticated — redirect to login
  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Authenticated + on login page — redirect to home
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone()
    const role = user.user_metadata?.role
    url.pathname = role === 'admin' ? '/dashboard' : '/feedback'
    return NextResponse.redirect(url)
  }

  // Admin-only routes
  if (user && ADMIN_ONLY_PATHS.some(p => pathname.startsWith(p))) {
    const role = user.user_metadata?.role
    if (role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/feedback'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
