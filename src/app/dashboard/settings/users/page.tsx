import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import AddUserDialog from '@/components/settings/AddUserDialog'

const roleLabel: Record<string, string> = {
  doctor: 'طبيب',
  nurse: 'ممرضة',
  secretary: 'سكرتيرة',
  admin: 'مدير',
}

const roleStyle: Record<string, string> = {
  doctor: 'bg-violet-100 text-violet-700',
  nurse: 'bg-emerald-100 text-emerald-700',
  secretary: 'bg-sky-100 text-sky-700',
  admin: 'bg-rose-100 text-rose-700',
}

const roleAvatar: Record<string, string> = {
  doctor: 'from-violet-500 to-purple-700',
  nurse: 'from-emerald-400 to-teal-600',
  secretary: 'from-sky-400 to-blue-600',
  admin: 'from-rose-400 to-pink-600',
}

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('role, clinic_id')
    .eq('id', user!.id)
    .single()

  if (myProfile?.role !== 'doctor' && myProfile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .eq('clinic_id', myProfile.clinic_id)
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-violet-600" />
            إدارة المستخدمين
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">{users?.length ?? 0} مستخدم في العيادة</p>
        </div>
        <AddUserDialog clinicId={myProfile.clinic_id!} />
      </div>

      <div className="space-y-3">
        {users?.map((u: any) => (
          <div
            key={u.id}
            className={`bg-white rounded-2xl border transition-all p-4 ${
              u.id === user!.id ? 'border-violet-200' : 'border-slate-100 hover:border-slate-200'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${roleAvatar[u.role] ?? 'from-slate-400 to-slate-600'} flex items-center justify-center text-white font-bold text-base shrink-0`}>
                {u.full_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-800">{u.full_name}</span>
                  {u.id === user!.id && (
                    <span className="text-xs bg-violet-100 text-violet-600 font-semibold px-2 py-0.5 rounded-full">أنت</span>
                  )}
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${roleStyle[u.role] ?? 'bg-slate-100 text-slate-600'}`}>
                    {roleLabel[u.role] ?? u.role}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  انضم {formatDate(u.created_at)}
                  {u.phone && <span> • <span dir="ltr">{u.phone}</span></span>}
                </p>
              </div>
              {u.permissions && Object.keys(u.permissions).length > 0 && (
                <div className="shrink-0 text-center hidden sm:block">
                  <p className="text-2xl font-bold text-slate-700">{Object.keys(u.permissions).length}</p>
                  <p className="text-xs text-slate-400">صلاحية</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
