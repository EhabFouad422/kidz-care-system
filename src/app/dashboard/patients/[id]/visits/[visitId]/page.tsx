import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, FileText, Thermometer, Weight, Ruler, Brain } from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatDateAr } from '@/lib/utils'
import PrescriptionUpload from '@/components/patients/PrescriptionUpload'
import PrescriptionList from '@/components/patients/PrescriptionList'

export default async function VisitDetailPage({ params }: { params: Promise<{ id: string; visitId: string }> }) {
  const { id, visitId } = await params
  const supabase = await createClient()

  const { data: visit } = await supabase
    .from('visits')
    .select('*, patients(full_name, patient_number)')
    .eq('id', visitId)
    .single()

  if (!visit) notFound()

  const { data: prescriptions } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('visit_id', visitId)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/patients/${id}`}>
          <Button variant="ghost" size="icon" className="hover:bg-slate-100">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-bold text-slate-900">زيارة {formatDateAr(visit.visit_date)}</h1>
          <p className="text-sm text-slate-400">{visit.patients?.full_name} — <span className="font-mono">{visit.patients?.patient_number}</span></p>
        </div>
      </div>

      {/* Measurements */}
      {(visit.weight_kg || visit.length_cm || visit.head_circumference_cm || visit.temperature_c) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {visit.weight_kg && (
            <Measure icon={<Weight className="w-4 h-4 text-sky-600" />} label="الوزن" value={`${visit.weight_kg} كجم`} from="from-sky-50" to="to-blue-50" border="border-sky-100" iconBg="bg-sky-100" />
          )}
          {visit.length_cm && (
            <Measure icon={<Ruler className="w-4 h-4 text-emerald-600" />} label="الطول" value={`${visit.length_cm} سم`} from="from-emerald-50" to="to-green-50" border="border-emerald-100" iconBg="bg-emerald-100" />
          )}
          {visit.head_circumference_cm && (
            <Measure icon={<Brain className="w-4 h-4 text-violet-600" />} label="محيط الرأس" value={`${visit.head_circumference_cm} سم`} from="from-violet-50" to="to-purple-50" border="border-violet-100" iconBg="bg-violet-100" />
          )}
          {visit.temperature_c && (
            <Measure icon={<Thermometer className="w-4 h-4 text-rose-500" />} label="الحرارة" value={`${visit.temperature_c}°م`} from="from-rose-50" to="to-red-50" border="border-rose-100" iconBg="bg-rose-100" />
          )}
        </div>
      )}

      {/* Clinical Notes */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-50 bg-slate-50/50">
          <h2 className="text-sm font-semibold text-slate-700">التقرير الطبي</h2>
        </div>
        <div className="p-5 space-y-3">
          <ClinicalRow label="الشكوى (C/O)" value={visit.chief_complaint} color="bg-slate-50" />
          <ClinicalRow label="الفحص (O/E)" value={visit.on_examination} color="bg-slate-50" />
          <ClinicalRow label="التشخيص" value={visit.diagnosis} color="bg-violet-50" textColor="text-violet-800" highlight />
          <ClinicalRow label="العلاج" value={visit.treatment} color="bg-emerald-50" textColor="text-emerald-800" />
          <ClinicalRow label="ملاحظات" value={visit.notes} color="bg-slate-50" />
          {visit.next_visit_date && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-400">الزيارة التالية: </span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-semibold mr-1">
                {formatDate(visit.next_visit_date)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Prescriptions */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <h2 className="text-sm font-semibold text-slate-700">الروشتات</h2>
          {(prescriptions?.length ?? 0) > 0 && (
            <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">{prescriptions?.length}</span>
          )}
        </div>
        <div className="p-4 space-y-3">
          {prescriptions && prescriptions.length > 0 && (
            <PrescriptionList prescriptions={prescriptions} />
          )}
          <PrescriptionUpload visitId={visitId} patientId={id} />
        </div>
      </div>
    </div>
  )
}

function Measure({ icon, label, value, from, to, border, iconBg }: {
  icon: React.ReactNode; label: string; value: string
  from: string; to: string; border: string; iconBg: string
}) {
  return (
    <div className={`bg-gradient-to-br ${from} ${to} border ${border} rounded-2xl p-3.5 text-center`}>
      <div className={`w-8 h-8 ${iconBg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
        {icon}
      </div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-bold text-slate-800 text-sm mt-0.5">{value}</p>
    </div>
  )
}

function ClinicalRow({ label, value, color, textColor, highlight }: {
  label: string; value?: string | null; color: string; textColor?: string; highlight?: boolean
}) {
  if (!value) return null
  return (
    <div className={`p-3.5 rounded-xl ${color} ${highlight ? 'border border-violet-100' : ''}`}>
      <p className="text-xs text-slate-400 font-medium mb-1">{label}</p>
      <p className={`text-sm font-semibold ${textColor ?? 'text-slate-700'}`}>{value}</p>
    </div>
  )
}
