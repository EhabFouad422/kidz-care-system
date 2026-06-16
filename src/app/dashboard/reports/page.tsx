'use client'

export const dynamic = 'force-dynamic'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  FileText, Users, Calendar, Syringe, Download, Printer,
  FileSpreadsheet, Filter, CheckCircle2, BarChart3, TrendingUp,
  Baby, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatAge } from '@/lib/utils'

// ── helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d?: string | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ar-EG', { day: 'numeric', month: 'numeric', year: 'numeric' })
}

function genderAr(g?: string) { return g === 'female' ? 'أنثى' : 'ذكر' }
function birthModeAr(m?: string) {
  return m === 'cs' ? 'قيصرية' : m === 'normal' ? 'طبيعي' : m === 'assisted' ? 'بمساعدة' : ''
}
function vacStatusAr(s: string) {
  return s === 'given' ? 'تم' : s === 'pending' ? 'لم يتم' : s === 'delayed' ? 'مؤجل' : 'فائت'
}

function toCSV(headers: string[], rows: string[][]): string {
  const escape = (v: string) => `"${(v ?? '').replace(/"/g, '""')}"`
  return [headers, ...rows].map(r => r.map(escape).join(',')).join('\n')
}

function downloadCSV(content: string, filename: string) {
  const BOM = '﻿'
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function printHTML(html: string, title: string) {
  const win = window.open('', '_blank')!
  win.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 12px; color: #1e293b; padding: 24px; }
      h1 { font-size: 18px; color: #1e293b; margin-bottom: 4px; }
      .subtitle { font-size: 11px; color: #64748b; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th { background: #f1f5f9; color: #475569; font-size: 11px; padding: 8px 10px; text-align: right; border-bottom: 2px solid #e2e8f0; }
      td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
      tr:nth-child(even) td { background: #f8fafc; }
      .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 600; }
      .given { background:#dcfce7; color:#15803d; }
      .pending { background:#fef9c3; color:#a16207; }
      .delayed { background:#ffedd5; color:#c2410c; }
      .missed { background:#fee2e2; color:#b91c1c; }
      .female { background:#fce7f3; color:#be185d; }
      .male { background:#e0f2fe; color:#0369a1; }
      .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #7c3aed; padding-bottom:12px; margin-bottom:16px; }
      .logo { font-size:20px; font-weight:900; color:#7c3aed; }
      .meta { font-size:10px; color:#94a3b8; text-align:left; }
      @media print { body { padding: 12px; } }
    </style>
  </head><body>${html}</body></html>`)
  win.document.close()
  setTimeout(() => win.print(), 400)
}

// ── report configs ────────────────────────────────────────────────────────────

const REPORT_TYPES = [
  { id: 'patients',     icon: Users,          label: 'قائمة المرضى',       color: 'from-violet-500 to-purple-700',  desc: 'بيانات جميع المرضى المسجلين' },
  { id: 'visits',       icon: Calendar,       label: 'سجل الزيارات',        color: 'from-emerald-400 to-teal-600',   desc: 'جميع الزيارات مع التشخيص والعلاج' },
  { id: 'vaccinations', icon: Syringe,        label: 'حالة التطعيمات',      color: 'from-amber-400 to-orange-500',   desc: 'تطعيمات كل مريض ومدى اكتمالها' },
  { id: 'reminders',    icon: Calendar,       label: 'مواعيد مستحقة',       color: 'from-rose-400 to-pink-600',      desc: 'زيارات وتطعيمات خلال الفترة المختارة' },
  { id: 'combined',     icon: FileText,       label: 'تقرير شامل',          color: 'from-slate-600 to-slate-800',    desc: 'كل البيانات في ملف واحد' },
] as const

type ReportId = typeof REPORT_TYPES[number]['id']

// ── main component ─────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const supabase = createClient()
  const [selected, setSelected] = useState<ReportId>('patients')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [statsLoaded, setStatsLoaded] = useState(false)

  // Load quick stats on mount
  const loadStats = useCallback(async () => {
    const [
      { count: totalP }, { count: totalV }, { count: givenVax }, { count: pendingVax },
      { data: genders }
    ] = await Promise.all([
      supabase.from('patients').select('*', { count: 'exact', head: true }),
      supabase.from('visits').select('*', { count: 'exact', head: true }),
      supabase.from('patient_vaccinations').select('*', { count: 'exact', head: true }).eq('status', 'given'),
      supabase.from('patient_vaccinations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('patients').select('gender'),
    ])
    const males = genders?.filter(p => p.gender === 'male').length ?? 0
    const females = genders?.filter(p => p.gender === 'female').length ?? 0
    setStats({ totalP, totalV, givenVax, pendingVax, males, females })
    setStatsLoaded(true)
  }, [])

  if (!statsLoaded) { loadStats() }

  // ── PATIENTS ──
  async function exportPatients(format: 'csv' | 'pdf') {
    let q = supabase.from('patients').select('*').order('created_at', { ascending: false })
    if (dateFrom) q = q.gte('created_at', dateFrom)
    if (dateTo)   q = q.lte('created_at', dateTo + 'T23:59:59')
    const { data } = await q
    if (!data?.length) return alert('لا توجد بيانات')

    const headers = ['الكود', 'الاسم', 'الجنس', 'تاريخ الميلاد', 'العمر', 'اسم الأب', 'اسم الأم', 'الهاتف', 'هاتف 2', 'العنوان', 'الوزن(جم)', 'الطول(سم)', 'طريقة الولادة', 'NICU', 'تاريخ التسجيل']
    const rows = data.map(p => [
      p.patient_number, p.full_name, genderAr(p.gender), fmtDate(p.date_of_birth),
      formatAge(p.date_of_birth), p.father_name ?? '', p.mother_name ?? '',
      p.phone ?? '', p.phone2 ?? '', p.address ?? '',
      p.birth_weight_grams?.toString() ?? '', p.birth_length_cm?.toString() ?? '',
      birthModeAr(p.birth_mode), p.nicu_days?.toString() ?? '0', fmtDate(p.created_at),
    ])

    if (format === 'csv') {
      downloadCSV(toCSV(headers, rows), `patients_${Date.now()}.csv`)
    } else {
      const tableRows = rows.map(r => `<tr>
        <td>${r[0]}</td><td><strong>${r[1]}</strong></td>
        <td><span class="badge ${r[2] === 'أنثى' ? 'female' : 'male'}">${r[2]}</span></td>
        <td>${r[3]}</td><td>${r[4]}</td><td>${r[5]}</td>
        <td>${r[6]}</td><td dir="ltr">${r[7]}</td><td>${r[14]}</td>
      </tr>`).join('')
      printHTML(`
        <div class="header">
          <div><div class="logo">Kidz Care</div><div class="subtitle">عيادة د. بولا لطب الأطفال</div></div>
          <div class="meta">قائمة المرضى<br>${new Date().toLocaleDateString('ar-EG')}<br>الإجمالي: ${data.length} مريض</div>
        </div>
        <table><thead><tr><th>الكود</th><th>الاسم</th><th>الجنس</th><th>الميلاد</th><th>العمر</th><th>الأب</th><th>الأم</th><th>الهاتف</th><th>التسجيل</th></tr></thead>
        <tbody>${tableRows}</tbody></table>
      `, 'قائمة المرضى')
    }
  }

  // ── VISITS ──
  async function exportVisits(format: 'csv' | 'pdf') {
    let q = supabase.from('visits').select('*, patients(full_name, patient_number, phone)').order('visit_date', { ascending: false })
    if (dateFrom) q = q.gte('visit_date', dateFrom)
    if (dateTo)   q = q.lte('visit_date', dateTo)
    const { data } = await q
    if (!data?.length) return alert('لا توجد بيانات')

    const headers = ['كود المريض', 'اسم المريض', 'تاريخ الزيارة', 'الشكوى', 'الفحص', 'التشخيص', 'العلاج', 'الوزن(كجم)', 'الطول(سم)', 'الحرارة', 'الزيارة التالية', 'ملاحظات']
    const rows = data.map((v: any) => [
      v.patients?.patient_number ?? '', v.patients?.full_name ?? '',
      fmtDate(v.visit_date), v.chief_complaint ?? '', v.on_examination ?? '',
      v.diagnosis ?? '', v.treatment ?? '',
      v.weight_kg?.toString() ?? '', v.length_cm?.toString() ?? '',
      v.temperature_c?.toString() ?? '', fmtDate(v.next_visit_date), v.notes ?? '',
    ])

    if (format === 'csv') {
      downloadCSV(toCSV(headers, rows), `visits_${Date.now()}.csv`)
    } else {
      const tableRows = rows.map(r => `<tr>
        <td>${r[0]}</td><td><strong>${r[1]}</strong></td><td>${r[2]}</td>
        <td>${r[3]}</td><td>${r[5] ? `<strong>${r[5]}</strong>` : ''}</td>
        <td>${r[6]}</td><td>${r[7] ? r[7]+' كجم' : ''}</td><td>${r[10] ? '📅 '+r[10] : ''}</td>
      </tr>`).join('')
      printHTML(`
        <div class="header">
          <div><div class="logo">Kidz Care</div><div class="subtitle">عيادة د. بولا لطب الأطفال</div></div>
          <div class="meta">سجل الزيارات<br>${new Date().toLocaleDateString('ar-EG')}<br>الإجمالي: ${data.length} زيارة</div>
        </div>
        <table><thead><tr><th>الكود</th><th>المريض</th><th>التاريخ</th><th>الشكوى</th><th>التشخيص</th><th>العلاج</th><th>الوزن</th><th>الموعد التالي</th></tr></thead>
        <tbody>${tableRows}</tbody></table>
      `, 'سجل الزيارات')
    }
  }

  // ── VACCINATIONS ──
  async function exportVaccinations(format: 'csv' | 'pdf') {
    const { data } = await supabase
      .from('patient_vaccinations')
      .select('*, patients(full_name, patient_number, date_of_birth, phone), vaccine_schedule(name_ar, due_age_label, due_age_months)')
      .order('vaccine_schedule(due_age_months)', { ascending: true })
    if (!data?.length) return alert('لا توجد بيانات')

    const headers = ['كود المريض', 'اسم المريض', 'عمر المريض', 'هاتف', 'اسم التطعيم', 'العمر المقرر', 'الحالة', 'تاريخ التطعيم', 'رقم الدفعة', 'ملاحظات']
    const rows = data.map((v: any) => [
      v.patients?.patient_number ?? '', v.patients?.full_name ?? '',
      formatAge(v.patients?.date_of_birth), v.patients?.phone ?? '',
      v.vaccine_schedule?.name_ar ?? v.custom_name_ar ?? '',
      v.vaccine_schedule?.due_age_label ?? '',
      vacStatusAr(v.status), fmtDate(v.given_date),
      v.batch_number ?? '', v.notes ?? '',
    ])

    if (format === 'csv') {
      downloadCSV(toCSV(headers, rows), `vaccinations_${Date.now()}.csv`)
    } else {
      const tableRows = rows.map(r => `<tr>
        <td>${r[0]}</td><td><strong>${r[1]}</strong></td><td>${r[2]}</td>
        <td>${r[4]}</td><td>${r[5]}</td>
        <td><span class="badge ${r[6] === 'تم' ? 'given' : r[6] === 'مؤجل' ? 'delayed' : r[6] === 'فائت' ? 'missed' : 'pending'}">${r[6]}</span></td>
        <td>${r[7]}</td>
      </tr>`).join('')
      printHTML(`
        <div class="header">
          <div><div class="logo">Kidz Care</div><div class="subtitle">عيادة د. بولا لطب الأطفال</div></div>
          <div class="meta">تقرير التطعيمات<br>${new Date().toLocaleDateString('ar-EG')}</div>
        </div>
        <table><thead><tr><th>الكود</th><th>المريض</th><th>العمر</th><th>التطعيم</th><th>الموعد</th><th>الحالة</th><th>تاريخ التطعيم</th></tr></thead>
        <tbody>${tableRows}</tbody></table>
      `, 'تقرير التطعيمات')
    }
  }

  // ── REMINDERS (due visits & vaccinations) ──
  async function exportReminders(format: 'csv' | 'pdf') {
    const from = dateFrom || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
    const to   = dateTo   || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

    const [{ data: visits }, { data: vax }] = await Promise.all([
      supabase.from('visits').select('next_visit_date, patients(full_name, patient_number, phone, father_name)')
        .not('next_visit_date', 'is', null).gte('next_visit_date', from).lte('next_visit_date', to).order('next_visit_date'),
      supabase.from('patient_vaccinations').select('*, patients(full_name, patient_number, phone, father_name, date_of_birth), vaccine_schedule(name_ar, due_age_months, due_age_label)')
        .in('status', ['pending', 'delayed']),
    ])

    const visitRows = (visits ?? []).map((v: any) => [
      'زيارة', v.patients?.patient_number ?? '', v.patients?.full_name ?? '',
      v.patients?.father_name ?? '', v.patients?.phone ?? '',
      fmtDate(v.next_visit_date), '', '',
    ])

    const today = new Date(); today.setHours(0,0,0,0)
    const toDate = new Date(to)
    const fromDate = new Date(from)
    const vacRows = (vax ?? []).filter((v: any) => {
      if (!v.vaccine_schedule || !v.patients) return false
      const due = new Date(v.patients.date_of_birth)
      due.setMonth(due.getMonth() + v.vaccine_schedule.due_age_months)
      return due >= fromDate && due <= toDate
    }).map((v: any) => {
      const due = new Date(v.patients.date_of_birth)
      due.setMonth(due.getMonth() + v.vaccine_schedule.due_age_months)
      return ['تطعيم', v.patients.patient_number, v.patients.full_name,
        v.patients.father_name ?? '', v.patients.phone ?? '',
        due.toLocaleDateString('ar-EG'), v.vaccine_schedule.name_ar, v.vaccine_schedule.due_age_label]
    })

    const allRows = [...visitRows, ...vacRows]
    if (!allRows.length) return alert('لا توجد مواعيد في هذه الفترة')

    const headers = ['النوع', 'الكود', 'المريض', 'ولي الأمر', 'الهاتف', 'الموعد', 'التطعيم', 'العمر المقرر']

    if (format === 'csv') {
      downloadCSV(toCSV(headers, allRows), `reminders_${Date.now()}.csv`)
    } else {
      const tableRows = allRows.map(r => `<tr>
        <td><span class="badge ${r[0] === 'زيارة' ? 'male' : 'pending'}">${r[0]}</span></td>
        <td>${r[1]}</td><td><strong>${r[2]}</strong></td><td>${r[3]}</td>
        <td dir="ltr">${r[4]}</td><td><strong>${r[5]}</strong></td><td>${r[6]}</td>
      </tr>`).join('')
      printHTML(`
        <div class="header">
          <div><div class="logo">Kidz Care</div><div class="subtitle">عيادة د. بولا لطب الأطفال</div></div>
          <div class="meta">تقرير المواعيد المستحقة<br>من ${fmtDate(from)} إلى ${fmtDate(to)}<br>الإجمالي: ${allRows.length}</div>
        </div>
        <table><thead><tr><th>النوع</th><th>الكود</th><th>المريض</th><th>ولي الأمر</th><th>الهاتف</th><th>الموعد</th><th>التطعيم</th></tr></thead>
        <tbody>${tableRows}</tbody></table>
      `, 'المواعيد المستحقة')
    }
  }

  // ── COMBINED ──
  async function exportCombined(format: 'csv' | 'pdf') {
    setLoading(true)
    const [{ data: patients }, { data: visits }, { data: vax }] = await Promise.all([
      supabase.from('patients').select('*').order('created_at', { ascending: false }),
      supabase.from('visits').select('*, patients(full_name, patient_number)').order('visit_date', { ascending: false }),
      supabase.from('patient_vaccinations').select('*, patients(full_name, patient_number), vaccine_schedule(name_ar, due_age_label)').eq('status', 'given'),
    ])
    setLoading(false)

    if (format === 'csv') {
      const sections = [
        '## المرضى ##',
        toCSV(['الكود','الاسم','الجنس','الميلاد','الأب','الهاتف','التسجيل'],
          (patients??[]).map(p => [p.patient_number,p.full_name,genderAr(p.gender),fmtDate(p.date_of_birth),p.father_name??'',p.phone??'',fmtDate(p.created_at)])),
        '', '## الزيارات ##',
        toCSV(['كود المريض','المريض','التاريخ','الشكوى','التشخيص','العلاج'],
          (visits??[]).map((v:any) => [v.patients?.patient_number??'',v.patients?.full_name??'',fmtDate(v.visit_date),v.chief_complaint??'',v.diagnosis??'',v.treatment??''])),
        '', '## التطعيمات المكتملة ##',
        toCSV(['كود المريض','المريض','التطعيم','العمر المقرر','تاريخ التطعيم'],
          (vax??[]).map((v:any) => [v.patients?.patient_number??'',v.patients?.full_name??'',v.vaccine_schedule?.name_ar??'',v.vaccine_schedule?.due_age_label??'',fmtDate(v.given_date)])),
      ]
      downloadCSV(sections.join('\n'), `kidz_care_full_report_${Date.now()}.csv`)
    } else {
      printHTML(`
        <div class="header">
          <div><div class="logo">Kidz Care</div><div class="subtitle">عيادة د. بولا لطب الأطفال</div></div>
          <div class="meta">التقرير الشامل<br>${new Date().toLocaleDateString('ar-EG')}</div>
        </div>
        <h2 style="margin:20px 0 8px;color:#7c3aed;font-size:14px;border-bottom:2px solid #e9d5ff;padding-bottom:4px">👥 المرضى (${patients?.length ?? 0})</h2>
        <table><thead><tr><th>الكود</th><th>الاسم</th><th>الجنس</th><th>الميلاد</th><th>الأب</th><th>الهاتف</th><th>تسجيل</th></tr></thead>
        <tbody>${(patients??[]).map(p=>`<tr><td>${p.patient_number}</td><td><strong>${p.full_name}</strong></td>
          <td><span class="badge ${p.gender==='female'?'female':'male'}">${genderAr(p.gender)}</span></td>
          <td>${fmtDate(p.date_of_birth)}</td><td>${p.father_name??''}</td><td dir="ltr">${p.phone??''}</td><td>${fmtDate(p.created_at)}</td></tr>`).join('')}</tbody></table>
        <h2 style="margin:24px 0 8px;color:#059669;font-size:14px;border-bottom:2px solid #a7f3d0;padding-bottom:4px">📅 الزيارات (${visits?.length ?? 0})</h2>
        <table><thead><tr><th>الكود</th><th>المريض</th><th>التاريخ</th><th>الشكوى</th><th>التشخيص</th><th>العلاج</th></tr></thead>
        <tbody>${(visits??[]).map((v:any)=>`<tr><td>${v.patients?.patient_number??''}</td><td><strong>${v.patients?.full_name??''}</strong></td>
          <td>${fmtDate(v.visit_date)}</td><td>${v.chief_complaint??''}</td><td>${v.diagnosis??''}</td><td>${v.treatment??''}</td></tr>`).join('')}</tbody></table>
        <h2 style="margin:24px 0 8px;color:#d97706;font-size:14px;border-bottom:2px solid #fde68a;padding-bottom:4px">💉 التطعيمات المكتملة (${vax?.length ?? 0})</h2>
        <table><thead><tr><th>الكود</th><th>المريض</th><th>التطعيم</th><th>الموعد المقرر</th><th>تاريخ التطعيم</th></tr></thead>
        <tbody>${(vax??[]).map((v:any)=>`<tr><td>${v.patients?.patient_number??''}</td><td><strong>${v.patients?.full_name??''}</strong></td>
          <td>${v.vaccine_schedule?.name_ar??''}</td><td>${v.vaccine_schedule?.due_age_label??''}</td><td>${fmtDate(v.given_date)}</td></tr>`).join('')}</tbody></table>
      `, 'التقرير الشامل - Kidz Care')
    }
  }

  async function handleExport(format: 'csv' | 'pdf') {
    setLoading(true)
    try {
      if (selected === 'patients')     await exportPatients(format)
      else if (selected === 'visits')  await exportVisits(format)
      else if (selected === 'vaccinations') await exportVaccinations(format)
      else if (selected === 'reminders')    await exportReminders(format)
      else if (selected === 'combined')     await exportCombined(format)
    } finally {
      setLoading(false)
    }
  }

  const currentReport = REPORT_TYPES.find(r => r.id === selected)!

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-violet-600" />
          التقارير والتصدير
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">تصدير بيانات العيادة بصيغة Excel أو PDF</p>
      </div>

      {/* Quick stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'المرضى',         value: stats.totalP ?? 0,    icon: Users,         color: 'text-violet-600', iconBg: 'bg-violet-100', gradient: 'from-violet-50 to-purple-50', border: 'border-violet-100' },
            { label: 'الزيارات',       value: stats.totalV ?? 0,    icon: Calendar,      color: 'text-emerald-600', iconBg: 'bg-emerald-100', gradient: 'from-emerald-50 to-teal-50', border: 'border-emerald-100' },
            { label: 'تطعيمات تمت',   value: stats.givenVax ?? 0,  icon: CheckCircle2,  color: 'text-green-600',   iconBg: 'bg-green-100',   gradient: 'from-green-50 to-emerald-50', border: 'border-green-100' },
            { label: 'تطعيمات معلقة', value: stats.pendingVax ?? 0, icon: Syringe,       color: 'text-amber-600',   iconBg: 'bg-amber-100',   gradient: 'from-amber-50 to-orange-50', border: 'border-amber-100' },
          ].map(s => (
            <div key={s.label} className={`bg-gradient-to-br ${s.gradient} rounded-2xl border ${s.border} p-5 text-center`}>
              <div className={`w-11 h-11 ${s.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-3xl font-bold text-slate-800">{s.value.toLocaleString('en-US')}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Report selector */}
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-3">اختر نوع التقرير</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {REPORT_TYPES.map(r => (
            <button
              key={r.id}
              onClick={() => setSelected(r.id)}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-right transition-all ${
                selected === r.id
                  ? 'border-violet-400 bg-violet-50'
                  : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center shrink-0`}>
                <r.icon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-bold ${selected === r.id ? 'text-violet-700' : 'text-slate-700'}`}>{r.label}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{r.desc}</p>
              </div>
              {selected === r.id && (
                <CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0 mr-auto" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Date filter */}
      {(selected === 'patients' || selected === 'visits' || selected === 'reminders' || selected === 'combined') && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            تصفية بالتاريخ (اختياري)
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">من تاريخ</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-violet-400" dir="ltr" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">إلى تاريخ</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-violet-400" dir="ltr" />
            </div>
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(''); setDateTo('') }}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors mt-5">
                مسح الفلتر
              </button>
            )}
          </div>
        </div>
      )}

      {/* Export buttons */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <p className="text-sm font-semibold text-slate-700 mb-4">
          تصدير: <span className="text-violet-700">{currentReport.label}</span>
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => handleExport('csv')}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-sm rounded-xl transition-all disabled:opacity-60"
          >
            <FileSpreadsheet className="w-4 h-4" />
            تصدير Excel / CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white font-semibold text-sm rounded-xl transition-all disabled:opacity-60"
          >
            <Printer className="w-4 h-4" />
            طباعة / PDF
          </button>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              جارٍ التجهيز...
            </div>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-3">
          • Excel/CSV: يفتح مباشرةً في Microsoft Excel مع دعم كامل للغة العربية<br />
          • PDF: يفتح نافذة طباعة — اختر "حفظ كـ PDF" من إعدادات الطابعة
        </p>
      </div>

      {/* Gender stats */}
      {stats && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-4">توزيع المرضى بالجنس</p>
          <div className="space-y-3">
            {[
              { label: 'ذكور', count: stats.males, color: 'bg-sky-400', text: 'text-sky-600', bg: 'bg-sky-50' },
              { label: 'إناث', count: stats.females, color: 'bg-pink-400', text: 'text-pink-600', bg: 'bg-pink-50' },
            ].map(item => {
              const total = (stats.males + stats.females) || 1
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <span className={`text-xs font-semibold ${item.text} w-10`}>{item.label}</span>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.count / total * 100}%` }} />
                  </div>
                  <span className="text-xs text-slate-500 w-20 text-left">{item.count} ({Math.round(item.count / total * 100)}%)</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
