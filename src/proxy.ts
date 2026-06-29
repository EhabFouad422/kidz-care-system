import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    const hasMockSession = request.cookies.has('sb-mock-session')
    const isAuthPage = request.nextUrl.pathname.startsWith('/login')

    if (!hasMockSession) {
      if (isAuthPage) {
        return supabaseResponse
      }
      // Auto login: set mock session cookie and redirect to dashboard
      const response = NextResponse.redirect(new URL('/dashboard', request.url))
      response.cookies.set('sb-mock-session', 'mock-user-id', { path: '/', maxAge: 31536000 })
      return response
    }

    if (hasMockSession && isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/login')

  if (!user && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}

