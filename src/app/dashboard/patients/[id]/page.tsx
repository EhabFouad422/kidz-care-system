import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowRight, Calendar, Syringe, FileText, Edit,
  Weight, Ruler, Brain
} from 'lucide-react'
import Link from 'next/link'
import {
  formatAge, formatDate, genderLabel, birthModeLabel,
  vaccinationStatusColor, vaccinationStatusLabel
} from '@/lib/utils'
import AddVisitDialog from '@/components/patients/AddVisitDialog'
import VaccinationCard from '@/components/patients/VaccinationCard'

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: patient }, { data: visits }, { data: vaccinations }] = await Promise.all([
    supabase.from('patients').select('*').eq('id', id).single(),
    supabase.from('visits').select('*, prescriptions(id, file_url, file_name, items)').eq('patient_id', id).order('visit_date', { ascending: false }),
    supabase.from('patient_vaccinations').select('*, vaccine_schedule(*)').eq('patient_id', id).order('vaccine_schedule(sort_order)', { ascending: true }),
  ])

  if (!patient) notFound()

  const givenVaccines = vaccinations?.filter((v: any) => v.status === 'given').length ?? 0
  const totalVaccines = vaccinations?.length ?? 0
  const vaccPct = totalVaccines ? Math.round((givenVaccines / totalVaccines) * 100) : 0


  return (
    <div className="space-y-5 w-full">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/dashboard/patients">
          <Button variant="ghost" size="icon" className="shrink-0 mt-1 hover:bg-slate-100">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">{patient.full_name}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
              patient.gender === 'female' ? 'bg-pink-100 text-pink-600' : 'bg-sky-100 text-sky-600'
            }`}>
              {genderLabel(patient.gender)}
            </span>
            <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
              {patient.patient_number}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">{formatAge(patient.date_of_birth)} — {formatDate(patient.date_of_birth)}</p>
        </div>
        <Link href={`/dashboard/patients/${id}/edit`}>
          <Button variant="outline" size="sm" className="gap-1.5 hidden sm:flex border-slate-200 hover:border-violet-300 hover:text-violet-600">
            <Edit className="w-3.5 h-3.5" /> تعديل
          </Button>
        </Link>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {patient.birth_weight_grams && (
          <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 rounded-2xl p-5 text-center">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 flex items-center justify-center mx-auto mb-2.5">
              <Weight className="w-5 h-5 text-sky-600" />
            </div>
            <p className="text-xs text-slate-500">وزن الولادة</p>
            <p className="font-bold text-slate-800 text-base mt-0.5">{patient.birth_weight_grams} جم</p>
          </div>
        )}
        {patient.birth_length_cm && (
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-2xl p-5 text-center">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-2.5">
              <Ruler className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-xs text-slate-500">الطول</p>
            <p className="font-bold text-slate-800 text-base mt-0.5">{patient.birth_length_cm} سم</p>
          </div>
        )}
        {patient.birth_head_circumference_cm && (
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-2xl p-5 text-center">
            <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-2.5">
              <Brain className="w-5 h-5 text-violet-600" />
            </div>
            <p className="text-xs text-slate-500">محيط الرأس</p>
            <p className="font-bold text-slate-800 text-base mt-0.5">{patient.birth_head_circumference_cm} سم</p>
          </div>
        )}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5 text-center">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-2.5">
            <Syringe className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-xs text-slate-500">التطعيمات</p>
          <p className="font-bold text-slate-800 text-base mt-0.5">{givenVaccines}/{totalVaccines}</p>
          <div className="mt-1.5 h-1.5 bg-amber-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${vaccPct}%` }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="visits">
        <TabsList className="grid grid-cols-3 w-full bg-slate-100 rounded-xl p-1 h-auto">
          <TabsTrigger value="visits" className="gap-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-violet-700 py-2">
            <Calendar className="w-3.5 h-3.5" />
            الزيارات ({visits?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="vaccinations" className="gap-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-600 py-2">
            <Syringe className="w-3.5 h-3.5" />
            التطعيمات
          </TabsTrigger>
          <TabsTrigger value="info" className="gap-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-700 py-2">
            <FileText className="w-3.5 h-3.5" />
            الملف
          </TabsTrigger>
        </TabsList>

        {/* VISITS TAB */}
        <TabsContent value="visits" className="space-y-3 mt-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-400">{visits?.length ?? 0} زيارة مسجلة</p>
            <AddVisitDialog patientId={id} patientName={patient.full_name} />
          </div>

          {visits && visits.length > 0 ? (
            <div className="space-y-2.5">
              {visits.map((visit: any) => (
                <Link key={visit.id} href={`/dashboard/patients/${id}/visits/${visit.id}`}>
                  <div className="bg-white rounded-2xl border border-slate-100 hover:border-violet-200 transition-all p-4 cursor-pointer group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-violet-400" />
                          <span className="text-sm font-bold text-slate-800 group-hover:text-violet-700 transition-colors">{formatDate(visit.visit_date)}</span>
                          {visit.next_visit_date && (
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                              موعد تالٍ: {formatDate(visit.next_visit_date)}
                            </span>
                          )}
                        </div>
                        {visit.chief_complaint && (
                          <p className="text-sm text-slate-600 mb-1">
                            <span className="font-semibold text-slate-700">الشكوى: </span>
                            {visit.chief_complaint}
                          </p>
                        )}
                        {visit.diagnosis && (
                          <p className="text-sm">
                            <span className="font-semibold text-slate-700">التشخيص: </span>
                            <span className="text-violet-700">{visit.diagnosis}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {visit.weight_kg && (
                          <span className="text-xs bg-slate-50 text-slate-500 px-2 py-0.5 rounded-lg font-medium">{visit.weight_kg} كجم</span>
                        )}
                        {visit.prescriptions?.length > 0 && (
                          <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg font-medium">
                            روشتة ✓
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-14">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm text-slate-400">لا توجد زيارات بعد</p>
            </div>
          )}
        </TabsContent>

        {/* VACCINATIONS TAB */}
        <TabsContent value="vaccinations" className="mt-4">
          <VaccinationCard patientId={id} vaccinations={vaccinations ?? []} />
        </TabsContent>

        {/* INFO TAB */}
        <TabsContent value="info" className="mt-4">
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/50">
                <p className="text-sm font-semibold text-slate-600">بيانات الولادة</p>
              </div>
              <div className="p-5 grid grid-cols-2 gap-4 text-sm">
                <InfoRow label="مكان الولادة" value={patient.birth_place} />
                <InfoRow label="طريقة الولادة" value={birthModeLabel(patient.birth_mode)} />
                <InfoRow label="عمر الحمل" value={patient.gestational_age_weeks ? `${patient.gestational_age_weeks} أسبوع` : undefined} />
                <InfoRow label="أيام NICU" value={patient.nicu_days ? `${patient.nicu_days} يوم` : patient.nicu_days === 0 ? 'لا' : undefined} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/50">
                <p className="text-sm font-semibold text-slate-600">الأسرة والتواصل</p>
              </div>
              <div className="p-5 grid grid-cols-2 gap-4 text-sm">
                <InfoRow label="اسم الأب" value={patient.father_name} />
                <InfoRow label="اسم الأم" value={patient.mother_name} />
                <InfoRow label="هاتف 1" value={patient.phone} dir="ltr" />
                <InfoRow label="هاتف 2" value={patient.phone2} dir="ltr" />
                {patient.address && <div className="col-span-2"><InfoRow label="العنوان" value={patient.address} /></div>}
              </div>
            </div>

            {(patient.dietary_history || patient.family_history || patient.allergies || patient.notes) && (
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/50">
                  <p className="text-sm font-semibold text-slate-600">التاريخ الطبي</p>
                </div>
                <div className="p-5 space-y-3 text-sm">
                  {patient.dietary_history && <InfoRow label="التاريخ الغذائي" value={patient.dietary_history} block />}
                  {patient.family_history && <InfoRow label="التاريخ العائلي" value={patient.family_history} block />}
                  {patient.allergies && <InfoRow label="الحساسية" value={patient.allergies} block />}
                  {patient.notes && <InfoRow label="ملاحظات" value={patient.notes} block />}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function InfoRow({ label, value, dir, block }: { label: string; value?: string | null; dir?: string; block?: boolean }) {
  if (!value) return null
  return (
    <div>
      <span className="text-xs text-slate-400 font-medium">{label}</span>
      <p className="text-slate-800 font-semibold mt-0.5" dir={dir}>{value}</p>
    </div>
  )
}
