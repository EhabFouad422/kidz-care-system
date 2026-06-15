import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'doctor' && profile?.role !== 'admin') {
    return NextResponse.json({ error: 'ليس لديك صلاحية' }, { status: 403 })
  }

  const body = await req.json()
  const { email, password, full_name, role, phone, clinic_id, permissions } = body

  // Use admin client to create user
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 })
  }

  // Convert permissions array to object { view_patients: true, ... }
  const permissionsObj = Array.isArray(permissions)
    ? Object.fromEntries(permissions.map((p: string) => [p, true]))
    : {}

  const { error: profileError } = await adminClient.from('profiles').insert({
    id: newUser.user.id,
    clinic_id,
    full_name,
    role,
    phone: phone || null,
    permissions: permissionsObj,
  })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
