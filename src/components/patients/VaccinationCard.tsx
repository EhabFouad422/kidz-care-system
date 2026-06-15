'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { CheckCircle2, Clock, AlertCircle, XCircle, Edit } from 'lucide-react'
import { vaccinationStatusColor, vaccinationStatusLabel, formatDate } from '@/lib/utils'
import type { PatientVaccination } from '@/types'

const statusIcons: Record<string, React.ReactNode> = {
  given: <CheckCircle2 className="w-4 h-4 text-green-600" />,
  pending: <Clock className="w-4 h-4 text-yellow-500" />,
  delayed: <AlertCircle className="w-4 h-4 text-orange-500" />,
  missed: <XCircle className="w-4 h-4 text-red-500" />,
}

interface Props {
  patientId: string
  vaccinations: PatientVaccination[]
}

export default function VaccinationCard({ patientId, vaccinations }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [editing, setEditing] = useState<PatientVaccination | null>(null)
  const [form, setForm] = useState({ status: '', given_date: '', batch_number: '', notes: '' })
  const [loading, setLoading] = useState(false)

  function openEdit(v: PatientVaccination) {
    setEditing(v)
    setForm({
      status: v.status,
      given_date: v.given_date ?? '',
      batch_number: v.batch_number ?? '',
      notes: v.notes ?? '',
    })
  }

  async function handleSave() {
    if (!editing) return
    setLoading(true)
    const payload: Record<string, unknown> = { status: form.status }
    if (form.given_date) payload.given_date = form.given_date
    if (form.batch_number) payload.batch_number = form.batch_number
    if (form.notes) payload.notes = form.notes
    if (form.status === 'given' && !form.given_date) payload.given_date = new Date().toISOString().split('T')[0]

    const { error } = await supabase.from('patient_vaccinations').update(payload).eq('id', editing.id)
    setLoading(false)
    if (error) {
      toast.error('حدث خطأ', { description: error.message })
    } else {
      toast.success('تم تحديث التطعيم')
      setEditing(null)
      router.refresh()
    }
  }

  const given = vaccinations.filter(v => v.status === 'given').length
  const total = vaccinations.length
  const pct = total > 0 ? Math.round((given / total) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">التطعيمات المكتملة</span>
          <span className="text-sm font-bold text-gray-900">{given}/{total}</span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-1">{pct}% مكتمل</p>
      </div>

      {/* Vaccination List */}
      <div className="space-y-2">
        {vaccinations.map(v => (
          <div key={v.id} className="flex items-center gap-3 bg-white rounded-xl border p-3 hover:border-gray-200">
            <div className="shrink-0">{statusIcons[v.status]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {v.vaccine_schedule?.name_ar ?? v.custom_name_ar ?? v.custom_name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400">
                  {v.vaccine_schedule?.due_age_label}
                </span>
                {v.given_date && (
                  <span className="text-xs text-green-600">• تم: {formatDate(v.given_date)}</span>
                )}
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

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">
              {editing?.vaccine_schedule?.name_ar ?? editing?.custom_name_ar}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>الحالة</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v ?? '' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="given">تم التطعيم</SelectItem>
                  <SelectItem value="pending">لم يتم بعد</SelectItem>
                  <SelectItem value="delayed">مؤجل</SelectItem>
                  <SelectItem value="missed">فائت</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(form.status === 'given' || form.status === 'delayed') && (
              <div className="space-y-1.5">
                <Label>تاريخ التطعيم</Label>
                <Input type="date" value={form.given_date} onChange={e => setForm(f => ({ ...f, given_date: e.target.value }))} dir="ltr" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>رقم الدفعة (Batch)</Label>
              <Input value={form.batch_number} onChange={e => setForm(f => ({ ...f, batch_number: e.target.value }))} placeholder="اختياري" dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>ملاحظات</Label>
              <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="ردود فعل، تأجيل بسبب..." />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {loading ? 'جارٍ الحفظ...' : 'حفظ'}
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
