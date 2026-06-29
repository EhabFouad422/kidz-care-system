import { NextResponse } from 'next/server'
import { loadDatabase, saveDatabase } from '@/lib/supabase/mockDb'

export async function GET() {
  const db = loadDatabase()
  return NextResponse.json(db)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    saveDatabase(body)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
