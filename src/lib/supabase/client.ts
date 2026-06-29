import { createBrowserClient } from '@supabase/ssr'
import { mockClient } from './mockClient'

export function createClient() {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return mockClient as any
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

