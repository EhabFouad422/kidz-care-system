import { createClient } from '@/lib/supabase/server'
import { Users, Calendar, Syringe, Baby, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { formatAge } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user!.id)
    .single()

  const [
    { count: totalPatients },
    { count: todayVisits },
    { count: pendingVaccinations },
    { data: recentPatients },
    { data: todayVisitsList },
  ] = await Promise.all([
    supabase.from('patients').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('visits').select('*', { count: 'exact', head: true }).eq('visit_date', new Date().toISOString().split('T')[0]),
    supabase.from('patient_vaccinations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('patients').select('id, full_name, patient_number, date_of_birth, gender').order('created_at', { ascending: false }).limit(5),
    supabase.from('visits').select('id, patient_id, visit_date, chief_complaint, patients(full_name, patient_number)').eq('visit_date', new Date().toISOString().split('T')[0]).order('visit_time', { ascending: false }).limit(5),
  ])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'صباح الخير'
    return 'مساء الخير'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {greeting()}، {profile?.full_name?.split(' ')[0] ?? 'دكتور'} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/patients">
          <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-violet-500 to-purple-700 text-white transition-all hover:-translate-y-0.5 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-200 text-sm font-medium">إجمالي المرضى</p>
                <p className="text-4xl font-bold mt-1">{totalPatients ?? 0}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/10" />
          </div>
        </Link>

        <Link href="/dashboard/visits">
          <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-emerald-400 to-teal-600 text-white transition-all hover:-translate-y-0.5 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">زيارات اليوم</p>
                <p className="text-4xl font-bold mt-1">{todayVisits ?? 0}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <Calendar className="w-7 h-7" />
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/10" />
          </div>
        </Link>

        <Link href="/dashboard/vaccinations">
          <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-amber-400 to-orange-500 text-white transition-all hover:-translate-y-0.5 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">تطعيمات معلقة</p>
                <p className="text-4xl font-bold mt-1">{pendingVaccinations ?? 0}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <Syringe className="w-7 h-7" />
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/10" />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Today's Visits */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="font-semibold text-slate-800 text-sm">زيارات اليوم</span>
              {(todayVisits ?? 0) > 0 && (
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">{todayVisits}</span>
              )}
            </div>
            <Link href="/dashboard/visits" className="text-xs text-slate-400 hover:text-emerald-600 flex items-center gap-1 transition-colors">
              الكل <ArrowLeft className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-3">
            {todayVisitsList && todayVisitsList.length > 0 ? (
              <div className="space-y-1.5">
                {todayVisitsList.map((v: any) => (
                  <Link key={v.id} href={`/dashboard/patients/${v.patient_id}`}>
                    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <span className="text-emerald-700 font-bold text-xs">{v.patients?.full_name?.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-800">{v.patients?.full_name}</p>
                          <p className="text-xs text-slate-400">{v.chief_complaint ?? 'زيارة متابعة'}</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-slate-400 group-hover:text-emerald-600 transition-colors">{v.patients?.patient_number}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-300">
                <Calendar className="w-10 h-10 mx-auto mb-2" />
                <p className="text-sm text-slate-400">لا توجد زيارات اليوم</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                <Baby className="w-4 h-4 text-violet-600" />
              </div>
              <span className="font-semibold text-slate-800 text-sm">آخر المرضى المضافين</span>
            </div>
            <Link href="/dashboard/patients" className="text-xs text-slate-400 hover:text-violet-600 flex items-center gap-1 transition-colors">
              الكل <ArrowLeft className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-3">
            {recentPatients && recentPatients.length > 0 ? (
              <div className="space-y-1.5">
                {recentPatients.map((p: any) => (
                  <Link key={p.id} href={`/dashboard/patients/${p.id}`}>
                    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${p.gender === 'female' ? 'bg-gradient-to-br from-pink-400 to-rose-500' : 'bg-gradient-to-br from-sky-400 to-blue-500'}`}>
                          {p.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-800">{p.full_name}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${p.gender === 'female' ? 'bg-pink-50 text-pink-600' : 'bg-sky-50 text-sky-600'}`}>
                              {p.gender === 'female' ? 'أنثى' : 'ذكر'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{formatAge(p.date_of_birth)}</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-slate-400 group-hover:text-violet-600 transition-colors">{p.patient_number}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-300">
                <Users className="w-10 h-10 mx-auto mb-2" />
                <p className="text-sm text-slate-400">لا يوجد مرضى حتى الآن</p>
                <Link href="/dashboard/patients/new" className="text-violet-600 text-sm hover:underline mt-1 block">
                  إضافة أول مريض
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
