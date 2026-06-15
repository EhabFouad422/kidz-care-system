'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Plus, Calendar } from 'lucide-react'

interface Props {
  patientId: string
  patientName: string
}

export default function AddVisitDialog({ patientId, patientName }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    visit_date: today,
    weight_kg: '',
    length_cm: '',
    head_circumference_cm: '',
    temperature_c: '',
    chief_complaint: '',
    on_examination: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    next_visit_date: '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('clinic_id').eq('id', user!.id).single()

    const payload: Record<string, unknown> = {
      patient_id: patientId,
      clinic_id: profile?.clinic_id,
      visit_date: form.visit_date,
      created_by: user!.id,
    }

    if (form.weight_kg) payload.weight_kg = parseFloat(form.weight_kg)
    if (form.length_cm) payload.length_cm = parseFloat(form.length_cm)
    if (form.head_circumference_cm) payload.head_circumference_cm = parseFloat(form.head_circumference_cm)
    if (form.temperature_c) payload.temperature_c = parseFloat(form.temperature_c)
    if (form.chief_complaint) payload.chief_complaint = form.chief_complaint
    if (form.on_examination) payload.on_examination = form.on_examination
    if (form.diagnosis) payload.diagnosis = form.diagnosis
    if (form.treatment) payload.treatment = form.treatment
    if (form.notes) payload.notes = form.notes
    if (form.next_visit_date) payload.next_visit_date = form.next_visit_date

    const { data, error } = await supabase.from('visits').insert(payload).select().single()
    setLoading(false)

    if (error) {
      toast.error('حدث خطأ', { description: error.message })
    } else {
      toast.success('تم تسجيل الزيارة بنجاح')
      setOpen(false)
      router.push(`/dashboard/patients/${patientId}/visits/${data.id}`)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer transition-colors">
          <Plus className="w-4 h-4" />
          زيارة جديدة
        </span>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            تسجيل زيارة — {patientName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>تاريخ الزيارة *</Label>
            <Input type="date" value={form.visit_date} onChange={e => set('visit_date', e.target.value)} required dir="ltr" />
          </div>

          {/* Measurements */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">القياسات</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">الوزن (كجم)</Label>
                <Input type="number" step="0.1" value={form.weight_kg} onChange={e => set('weight_kg', e.target.value)} placeholder="5.2" dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">الطول (سم)</Label>
                <Input type="number" step="0.1" value={form.length_cm} onChange={e => set('length_cm', e.target.value)} placeholder="60" dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">محيط الرأس (سم)</Label>
                <Input type="number" step="0.1" value={form.head_circumference_cm} onChange={e => set('head_circumference_cm', e.target.value)} placeholder="38" dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">الحرارة (°م)</Label>
                <Input type="number" step="0.1" value={form.temperature_c} onChange={e => set('temperature_c', e.target.value)} placeholder="37.0" dir="ltr" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Clinical */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>الشكوى (C/O)</Label>
              <Textarea value={form.chief_complaint} onChange={e => set('chief_complaint', e.target.value)} placeholder="حمى، سعال، إسهال..." rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>الفحص (O/E)</Label>
              <Textarea value={form.on_examination} onChange={e => set('on_examination', e.target.value)} placeholder="الفحص السريري..." rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>التشخيص (Diagnosis)</Label>
              <Input value={form.diagnosis} onChange={e => set('diagnosis', e.target.value)} placeholder="التشخيص النهائي" />
            </div>
            <div className="space-y-1.5">
              <Label>العلاج (Treatment)</Label>
              <Textarea value={form.treatment} onChange={e => set('treatment', e.target.value)} placeholder="الأدوية والتعليمات..." rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>ملاحظات</Label>
              <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={1} />
            </div>
            <div className="space-y-1.5">
              <Label>موعد الزيارة التالية</Label>
              <Input type="date" value={form.next_visit_date} onChange={e => set('next_visit_date', e.target.value)} dir="ltr" />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {loading ? 'جارٍ الحفظ...' : 'حفظ الزيارة'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
