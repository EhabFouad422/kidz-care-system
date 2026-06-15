'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Syringe, Search, CheckCircle2, Clock, AlertCircle,
  XCircle, Edit, User, Hash, ChevronLeft
} from 'lucide-react'
import { vaccinationStatusColor, vaccinationStatusLabel, formatDate, formatAge } from '@/lib/utils'
import type { Patient, PatientVaccination } from '@/types'

const statusIcons: Record<string, React.ReactNode> = {
  given:   <CheckCircle2 className="w-4 h-4 text-green-600" />,
  pending: <Clock className="w-4 h-4 text-yellow-500" />,
  delayed: <AlertCircle className="w-4 h-4 text-orange-500" />,
  missed:  <XCircle className="w-4 h-4 text-red-500" />,
}

export default function VaccinationsPage() {
  const supabase = createClient()

  // Search state
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [searching, setSearching] = useState(false)

  // Selected patient
  const [patient, setPatient] = useState<Patient | null>(null)
  const [vaccinations, setVaccinations] = useState<PatientVaccination[]>([])
  const [loadingVax, setLoadingVax] = useState(false)

  // Edit dialog
  const [editing, setEditing] = useState<PatientVaccination | null>(null)
  const [editForm, setEditForm] = useState({ status: '', given_date: '', batch_number: '', notes: '' })
  const [saving, setSaving] = useState(false)

  // Search patients
  const searchPatients = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return }
    setSearching(true)
    const { data } = await supabase
      .from('patients')
      .select('id, patient_number, full_name, date_of_birth, gender')
      .or(`full_name.ilike.%${q}%,patient_number.ilike.%${q}%`)
      .order('full_name')
      .limit(10)
    setSearchResults((data ?? []) as Patient[])
    setSearching(false)
  }, [supabase])

  useEffect(() => {
    const t = setTimeout(() => searchPatients(query), 300)
    return () => clearTimeout(t)
  }, [query, searchPatients])

  // Load patient vaccinations
  async function selectPatient(p: Patient) {
    setPatient(p)
    setSearchResults([])
    setQuery('')
    setLoadingVax(true)
    const { data } = await supabase
      .from('patient_vaccinations')
      .select('*, vaccine_schedule(*)')
      .eq('patient_id', p.id)
      .order('vaccine_schedule(sort_order)', { ascending: true })
    setVaccinations((data ?? []) as PatientVaccination[])
    setLoadingVax(false)
  }

  function openEdit(v: PatientVaccination) {
    setEditing(v)
    setEditForm({
      status: v.status,
      given_date: v.given_date ?? '',
      batch_number: v.batch_number ?? '',
      notes: v.notes ?? '',
    })
  }

  async function saveEdit() {
    if (!editing) return
    setSaving(true)
    const payload: Record<string, unknown> = { status: editForm.status }
    if (editForm.given_date) payload.given_date = editForm.given_date
    else if (editForm.status === 'given') payload.given_date = new Date().toISOString().split('T')[0]
    if (editForm.batch_number) payload.batch_number = editForm.batch_number
    if (editForm.notes) payload.notes = editForm.notes

    const { error } = await supabase.from('patient_vaccinations').update(payload).eq('id', editing.id)
    setSaving(false)

    if (error) { toast.error('حدث خطأ'); return }
    toast.success('تم تحديث التطعيم ✓')
    setEditing(null)
    // Refresh
    setVaccinations(prev => prev.map(v =>
      v.id === editing.id ? { ...v, ...payload, status: editForm.status } as PatientVaccination : v
    ))
  }

  const given = vaccinations.filter(v => v.status === 'given').length
  const total = vaccinations.length

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">التطعيمات</h1>
        <p className="text-sm text-gray-500">ابحث عن المريض بالاسم أو الكود لعرض جدول تطعيماته</p>
      </div>

      {/* Search box */}
      {!patient && (
        <div className="relative">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="اكتب اسم الطفل أو كوده مثل P-01000..."
              className="pr-10 text-base h-12"
              autoFocus
            />
          </div>

          {/* Results dropdown */}
          {(searchResults.length > 0 || searching) && (
            <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
              {searching ? (
                <div className="p-4 text-center text-sm text-gray-400">جارٍ البحث...</div>
              ) : (
                searchResults.map(p => (
                  <button
                    key={p.id}
                    onClick={() => selectPatient(p as Patient)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-right border-b border-gray-50 last:border-0"
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${p.gender === 'female' ? 'bg-pink-400' : 'bg-blue-400'}`}>
                      {p.full_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{p.full_name}</p>
                      <p className="text-xs text-gray-400">{formatAge(p.date_of_birth)}</p>
                    </div>
                    <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded-md shrink-0">
                      {p.patient_number}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}

          {query.length > 0 && searchResults.length === 0 && !searching && (
            <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-4 text-center text-sm text-gray-400">
              لا توجد نتائج
            </div>
          )}
        </div>
      )}

      {/* Patient selected */}
      {patient && (
        <div className="space-y-4">
          {/* Patient card */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold ${patient.gender === 'female' ? 'bg-pink-400' : 'bg-blue-500'}`}>
                    {patient.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{patient.full_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">{patient.patient_number}</span>
                      <span className="text-xs text-gray-500">{formatAge(patient.date_of_birth)}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setPatient(null); setVaccinations([]) }} className="gap-1 text-gray-500">
                  <ChevronLeft className="w-4 h-4" />
                  تغيير
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          {!loadingVax && total > 0 && (
            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">التطعيمات المكتملة</span>
                <span className="text-sm font-bold text-gray-900">{given} / {total}</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${total ? (given / total) * 100 : 0}%` }} />
              </div>
              <div className="flex gap-3 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />تمت ({vaccinations.filter(v => v.status === 'given').length})</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />معلقة ({vaccinations.filter(v => v.status === 'pending').length})</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />مؤجلة ({vaccinations.filter(v => v.status === 'delayed').length})</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />فائتة ({vaccinations.filter(v => v.status === 'missed').length})</span>
              </div>
            </div>
          )}

          {/* Vaccination list */}
          {loadingVax ? (
            <div className="text-center py-10 text-gray-400">
              <Syringe className="w-8 h-8 mx-auto mb-2 animate-pulse" />
              <p className="text-sm">جارٍ تحميل التطعيمات...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {vaccinations.map(v => (
                <div key={v.id}
                  className={`flex items-center gap-3 bg-white rounded-xl border p-3.5 transition-colors
                    ${v.status === 'given' ? 'border-green-100' : v.status === 'missed' ? 'border-red-100' : 'border-gray-100'}`}>
                  <div className="shrink-0">{statusIcons[v.status]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">
                      {(v as any).vaccine_schedule?.name_ar ?? v.custom_name_ar ?? v.custom_name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-gray-400">{(v as any).vaccine_schedule?.due_age_label}</span>
                      {v.given_date && <span className="text-xs text-green-600">• تم بتاريخ: {formatDate(v.given_date)}</span>}
                      {v.batch_number && <span className="text-xs text-gray-400">• batch: {v.batch_number}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={`text-xs border ${vaccinationStatusColor(v.status)}`}>
                      {vaccinationStatusLabel(v.status)}
                    </Badge>
                    <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(v)}>
                      <Edit className="w-3.5 h-3.5 text-gray-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!patient && !query && (
        <div className="text-center py-16 text-gray-300">
          <Syringe className="w-16 h-16 mx-auto mb-3" />
          <p className="text-base font-medium text-gray-400">ابحث عن مريض لعرض تطعيماته</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">
              {(editing as any)?.vaccine_schedule?.name_ar ?? editing?.custom_name_ar}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>الحالة</Label>
              <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v ?? '' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="given">✅ تم التطعيم</SelectItem>
                  <SelectItem value="pending">⏳ لم يتم بعد</SelectItem>
                  <SelectItem value="delayed">⚠️ مؤجل</SelectItem>
                  <SelectItem value="missed">❌ فائت</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>تاريخ التطعيم</Label>
              <Input type="date" value={editForm.given_date}
                onChange={e => setEditForm(f => ({ ...f, given_date: e.target.value }))} dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>رقم الدفعة (Batch No.)</Label>
              <Input value={editForm.batch_number} dir="ltr"
                onChange={e => setEditForm(f => ({ ...f, batch_number: e.target.value }))}
                placeholder="اختياري" />
            </div>
            <div className="space-y-1.5">
              <Label>ملاحظات</Label>
              <Input value={editForm.notes}
                onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="ردود فعل، ملاحظات..." />
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={saveEdit} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {saving ? 'جارٍ الحفظ...' : 'حفظ'}
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
