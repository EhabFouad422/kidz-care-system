import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Calendar, Search } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function VisitsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { date } = await searchParams
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const filterDate = date ?? today

  const { data: visits } = await supabase
    .from('visits')
    .select('*, patients(full_name, patient_number, gender)')
    .eq('visit_date', filterDate)
    .order('visit_time', { ascending: false })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">الزيارات</h1>
        <p className="text-sm text-gray-500">
          {filterDate === today ? 'زيارات اليوم' : `زيارات ${formatDate(filterDate)}`} — {visits?.length ?? 0} زيارة
        </p>
      </div>

      <form method="GET" className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
          <Input type="date" name="date" defaultValue={filterDate} className="max-w-xs" dir="ltr" />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          عرض
        </button>
      </form>

      {visits && visits.length > 0 ? (
        <div className="space-y-2">
          {visits.map((v: any) => (
            <Link key={v.id} href={`/dashboard/patients/${v.patient_id}/visits/${v.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${v.patients?.gender === 'female' ? 'bg-pink-400' : 'bg-blue-400'}`}>
                        {v.patients?.full_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{v.patients?.full_name}</p>
                        <p className="text-xs text-gray-400">{v.patients?.patient_number}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      {v.diagnosis && (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">{v.diagnosis}</Badge>
                      )}
                      {v.chief_complaint && !v.diagnosis && (
                        <span className="text-xs text-gray-500">{v.chief_complaint}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">لا توجد زيارات في هذا التاريخ</p>
        </div>
      )}
    </div>
  )
}
