import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { mockClient } from './mockClient'

export async function createClient() {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return mockClient as any
  }
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

