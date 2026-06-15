'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, Phone, MessageCircle, Calendar, Syringe, Clock, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react'
import { formatAge } from '@/lib/utils'

interface VisitReminder {
  type: 'visit'
  patientId: string
  patientName: string
  patientNumber: string
  phone: string | null
  phone2: string | null
  fatherName: string | null
  nextVisitDate: string
  daysUntil: number
  visitType?: string
}

interface VaccinationReminder {
  type: 'vaccination'
  patientId: string
  patientName: string
  patientNumber: string
  phone: string | null
  phone2: string | null
  fatherName: string | null
  vaccineName: string
  dueAgeMonths: number
  dueAgeLabel: string
  daysUntil: number
  dueDate: string
  status: string
}

type Reminder = VisitReminder | VaccinationReminder

function daysFromNow(dateStr: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(dateStr)
  d.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function addMonths(dateStr: string, months: number) {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split('T')[0]
}

function formatDateAr(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })
}

function whatsappMessage(r: Reminder) {
  if (r.type === 'visit') {
    return encodeURIComponent(
      `السلام عليكم ورحمة الله،\nنذكركم بموعد زيارة الطفل *${r.patientName}* في عيادة د. بولا لطب الأطفال.\n📅 الموعد: ${formatDateAr(r.nextVisitDate)}\n\nنرجو الحضور في الوقت المحدد. جزاكم الله خيرًا 🌟`
    )
  } else {
    return encodeURIComponent(
      `السلام عليكم ورحمة الله،\nنذكركم بموعد تطعيم الطفل *${r.patientName}*.\n💉 التطعيم: *${r.vaccineName}*\n📅 الموعد المقترح: ${formatDateAr(r.dueDate)}\n\nيُرجى الحضور لإتمام جدول التطعيمات في أقرب وقت. جزاكم الله خيرًا 🌟`
    )
  }
}

function urgencyStyle(days: number) {
  if (days < 0) return { badge: 'bg-red-100 text-red-700 border-red-200', border: 'border-red-200', icon: '🔴' }
  if (days === 0) return { badge: 'bg-orange-100 text-orange-700 border-orange-200', border: 'border-orange-200', icon: '🟠' }
  if (days <= 3) return { badge: 'bg-amber-100 text-amber-700 border-amber-200', border: 'border-amber-200', icon: '🟡' }
  return { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', border: 'border-slate-100', icon: '🟢' }
}

function daysLabel(days: number) {
  if (days < 0) return `متأخر ${Math.abs(days)} يوم`
  if (days === 0) return 'اليوم!'
  if (days === 1) return 'غداً'
  return `بعد ${days} أيام`
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'visit' | 'vaccination'>('all')
  const [range, setRange] = useState(7)
  const supabase = createClient()

  async function loadReminders() {
    setLoading(true)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const future = new Date(today)
    future.setDate(future.getDate() + range)
    const past = new Date(today)
    past.setDate(past.getDate() - 3)

    const todayStr = today.toISOString().split('T')[0]
    const futureStr = future.toISOString().split('T')[0]
    const pastStr = past.toISOString().split('T')[0]

    // Visit reminders: next_visit_date within range (including overdue up to 3 days)
    const { data: visits } = await supabase
      .from('visits')
      .select('id, next_visit_date, patients(id, full_name, patient_number, phone, phone2, father_name)')
      .not('next_visit_date', 'is', null)
      .gte('next_visit_date', pastStr)
      .lte('next_visit_date', futureStr)
      .order('next_visit_date', { ascending: true })

    const visitReminders: VisitReminder[] = (visits ?? []).map((v: any) => ({
      type: 'visit',
      patientId: v.patients.id,
      patientName: v.patients.full_name,
      patientNumber: v.patients.patient_number,
      phone: v.patients.phone,
      phone2: v.patients.phone2,
      fatherName: v.patients.father_name,
      nextVisitDate: v.next_visit_date,
      daysUntil: daysFromNow(v.next_visit_date),
    }))

    // Vaccination reminders: pending vaccinations where due date is within range
    const { data: vaccinations } = await supabase
      .from('patient_vaccinations')
      .select('id, status, patients(id, full_name, patient_number, phone, phone2, father_name, date_of_birth), vaccine_schedule(name_ar, due_age_months, due_age_label)')
      .in('status', ['pending', 'delayed'])
      .order('vaccine_schedule(due_age_months)', { ascending: true })

    const vacReminders: VaccinationReminder[] = []
    for (const v of (vaccinations ?? [])) {
      const p = (v as any).patients
      const vs = (v as any).vaccine_schedule
      if (!p || !vs) continue

      const dueDate = addMonths(p.date_of_birth, vs.due_age_months)
      const days = daysFromNow(dueDate)

      // Show if overdue (up to 30 days past) or due within range
      if (days >= -30 && days <= range) {
        vacReminders.push({
          type: 'vaccination',
          patientId: p.id,
          patientName: p.full_name,
          patientNumber: p.patient_number,
          phone: p.phone,
          phone2: p.phone2,
          fatherName: p.father_name,
          vaccineName: vs.name_ar,
          dueAgeMonths: vs.due_age_months,
          dueAgeLabel: vs.due_age_label,
          daysUntil: days,
          dueDate,
          status: v.status,
        })
      }
    }

    const all: Reminder[] = [...visitReminders, ...vacReminders]
      .sort((a, b) => a.daysUntil - b.daysUntil)

    setReminders(all)
    setLoading(false)
  }

  useEffect(() => { loadReminders() }, [range])

  const filtered = filter === 'all' ? reminders : reminders.filter(r => r.type === filter)
  const visitCount = reminders.filter(r => r.type === 'visit').length
  const vacCount = reminders.filter(r => r.type === 'vaccination').length
  const urgentCount = reminders.filter(r => r.daysUntil <= 1).length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-violet-600" />
            التنبيهات والمواعيد
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">مواعيد الزيارات والتطعيمات القادمة</p>
        </div>
        <button
          onClick={loadReminders}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-violet-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-violet-50"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          تحديث
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white text-center">
          <p className="text-violet-200 text-xs leading-tight">زيارات قادمة</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1">{visitCount}</p>
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-violet-300 mt-1 mx-auto" />
        </div>
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white text-center">
          <p className="text-amber-100 text-xs leading-tight">تطعيمات مستحقة</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1">{vacCount}</p>
          <Syringe className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200 mt-1 mx-auto" />
        </div>
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white text-center">
          <p className="text-red-100 text-xs leading-tight">عاجل (اليوم/غداً)</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1">{urgentCount}</p>
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-200 mt-1 mx-auto" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex bg-slate-100 rounded-xl p-1 gap-0.5">
          {[
            { key: 'all', label: 'الكل' },
            { key: 'visit', label: 'زيارات' },
            { key: 'vaccination', label: 'تطعيمات' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === key ? 'bg-white text-violet-700' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mr-auto">
          <span className="text-xs text-slate-400">نطاق التنبيه:</span>
          <div className="flex bg-slate-100 rounded-xl p-1 gap-0.5">
            {[7, 14, 30].map(d => (
              <button
                key={d}
                onClick={() => setRange(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  range === d ? 'bg-white text-violet-700' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {d} يوم
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">جارٍ تحميل التنبيهات...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="font-semibold text-slate-600">لا توجد تنبيهات في هذه الفترة</p>
          <p className="text-sm text-slate-400 mt-1">جرّب توسيع نطاق التنبيه</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((r, i) => {
            const style = urgencyStyle(r.daysUntil)
            const phone = r.phone ?? r.phone2
            const waLink = phone ? `https://wa.me/2${phone.replace(/^0/, '')}?text=${whatsappMessage(r)}` : null
            const callLink = phone ? `tel:${phone}` : null

            return (
              <div
                key={i}
                className={`bg-white rounded-2xl border ${style.border} p-4 transition-all`}
              >
                <div className="flex items-start gap-4">
                  {/* Type icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    r.type === 'visit' ? 'bg-violet-50' : 'bg-amber-50'
                  }`}>
                    {r.type === 'visit'
                      ? <Calendar className="w-5 h-5 text-violet-600" />
                      : <Syringe className="w-5 h-5 text-amber-600" />
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800">{r.patientName}</span>
                      <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg">{r.patientNumber}</span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${style.badge}`}>
                        {style.icon} {daysLabel(r.daysUntil)}
                      </span>
                    </div>

                    {r.type === 'visit' ? (
                      <div className="mt-1.5 space-y-0.5">
                        <p className="text-sm text-slate-600">
                          <span className="font-semibold text-violet-700">📅 موعد الزيارة: </span>
                          {formatDateAr(r.nextVisitDate)}
                        </p>
                        {r.fatherName && (
                          <p className="text-xs text-slate-400">ولي الأمر: {r.fatherName}</p>
                        )}
                      </div>
                    ) : (
                      <div className="mt-1.5 space-y-0.5">
                        <p className="text-sm text-slate-600">
                          <span className="font-semibold text-amber-700">💉 التطعيم: </span>
                          {r.vaccineName}
                          <span className="text-xs text-slate-400 mr-2">({r.dueAgeLabel})</span>
                        </p>
                        <p className="text-xs text-slate-400">
                          الموعد المقترح: {formatDateAr(r.dueDate)}
                          {r.status === 'delayed' && <span className="text-orange-500 mr-2">• مؤجل</span>}
                        </p>
                        {r.fatherName && (
                          <p className="text-xs text-slate-400">ولي الأمر: {r.fatherName}</p>
                        )}
                      </div>
                    )}

                    {/* Contact buttons */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {phone ? (
                        <>
                          {waLink && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20bc5a] text-white text-xs font-semibold rounded-xl transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              واتساب
                            </a>
                          )}
                          <a
                            href={callLink!}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-xl transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            اتصال
                          </a>
                          <span className="text-xs text-slate-400 font-mono" dir="ltr">{phone}</span>
                          {r.phone2 && r.phone2 !== r.phone && (
                            <a
                              href={`tel:${r.phone2}`}
                              className="flex items-center gap-1 text-xs text-slate-400 hover:text-sky-600 transition-colors"
                            >
                              <Phone className="w-3 h-3" />
                              <span dir="ltr">{r.phone2}</span>
                            </a>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-rose-400 bg-rose-50 px-2 py-1 rounded-lg">⚠️ لا يوجد رقم هاتف</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
