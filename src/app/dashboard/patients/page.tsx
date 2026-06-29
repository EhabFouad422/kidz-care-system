import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Baby } from 'lucide-react'
import Link from 'next/link'
import { formatAge, genderLabel } from '@/lib/utils'

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('patients')
    .select('id, patient_number, full_name, date_of_birth, gender, phone, father_name, is_active')
    .order('created_at', { ascending: false })

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,patient_number.ilike.%${q}%,father_name.ilike.%${q}%,phone.ilike.%${q}%`)
  }

  const { data: patients } = await query.limit(100)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">المرضى</h1>
          <p className="text-sm text-slate-500">{patients?.length ?? 0} مريض مسجّل</p>
        </div>
        <Link href="/dashboard/patients/new">
          <Button className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 gap-2 font-semibold">
            <Plus className="w-4 h-4" />
            مريض جديد
          </Button>
        </Link>
      </div>

      {/* Search */}
      <form method="GET" className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          name="q"
          defaultValue={q}
          placeholder="ابحث بالاسم أو رقم المريض أو الهاتف..."
          className="pr-10 h-11 bg-white border-slate-200 focus:border-violet-400"
        />
      </form>

      {/* List */}
      {patients && patients.length > 0 ? (
        <div className="space-y-2">
          {patients.map((p: any) => (
            <Link key={p.id} href={`/dashboard/patients/${p.id}`}>
              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-violet-200 transition-all cursor-pointer group">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                  p.gender === 'female'
                    ? 'bg-gradient-to-br from-pink-400 to-rose-500'
                    : 'bg-gradient-to-br from-sky-400 to-blue-600'
                }`}>
                  {p.full_name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 text-sm group-hover:text-violet-700 transition-colors">{p.full_name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.gender === 'female' ? 'bg-pink-50 text-pink-600' : 'bg-sky-50 text-sky-600'
                    }`}>
                      {genderLabel(p.gender)}
                    </span>
                    {!p.is_active && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 font-medium">غير نشط</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-slate-400">{formatAge(p.date_of_birth)}</span>
                    {p.father_name && <span className="text-xs text-slate-400">• ولي الأمر: {p.father_name}</span>}
                  </div>
                </div>

                <div className="text-left shrink-0 hidden sm:block">
                  <p className="text-xs font-mono font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">{p.patient_number}</p>
                  {p.phone && <p className="text-xs text-slate-400 mt-1 text-center" dir="ltr">{p.phone}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
            <Baby className="w-10 h-10 text-violet-400" />
          </div>
          <p className="text-base font-semibold text-slate-500">{q ? 'لا توجد نتائج لبحثك' : 'لا يوجد مرضى حتى الآن'}</p>
          {!q && (
            <Link href="/dashboard/patients/new">
              <Button className="mt-4 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800">
                إضافة أول مريض
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
