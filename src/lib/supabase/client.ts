import { createBrowserClient } from '@supabase/ssr'
import { mockClient } from './mockClient'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true' || !url || url.includes('ycuqmajjzovzpuaohkdk') || url.includes('xxxx')

  if (isMock) {
    return mockClient as any
  }
  return createBrowserClient(
    url!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

