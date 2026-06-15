'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ArrowRight, Save } from 'lucide-react'
import Link from 'next/link'
import type { Patient } from '@/types'

export default function EditPatientForm({ patient }: { patient: Patient }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    full_name: patient.full_name ?? '',
    date_of_birth: patient.date_of_birth ?? '',
    gender: patient.gender ?? '',
    birth_place: patient.birth_place ?? '',
    birth_mode: patient.birth_mode ?? '',
    gestational_age_weeks: patient.gestational_age_weeks?.toString() ?? '',
    birth_weight_grams: patient.birth_weight_grams?.toString() ?? '',
    birth_length_cm: patient.birth_length_cm?.toString() ?? '',
    birth_head_circumference_cm: patient.birth_head_circumference_cm?.toString() ?? '',
    nicu_days: patient.nicu_days?.toString() ?? '',
    father_name: patient.father_name ?? '',
    mother_name: patient.mother_name ?? '',
    phone: patient.phone ?? '',
    phone2: patient.phone2 ?? '',
    address: patient.address ?? '',
    dietary_history: patient.dietary_history ?? '',
    family_history: patient.family_history ?? '',
    allergies: patient.allergies ?? '',
    notes: patient.notes ?? '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const payload: Record<string, unknown> = {
      full_name: form.full_name,
      date_of_birth: form.date_of_birth,
      gender: form.gender,
      birth_place: form.birth_place || null,
      birth_mode: form.birth_mode || null,
      gestational_age_weeks: form.gestational_age_weeks ? parseInt(form.gestational_age_weeks) : null,
      birth_weight_grams: form.birth_weight_grams ? parseInt(form.birth_weight_grams) : null,
      birth_length_cm: form.birth_length_cm ? parseFloat(form.birth_length_cm) : null,
      birth_head_circumference_cm: form.birth_head_circumference_cm ? parseFloat(form.birth_head_circumference_cm) : null,
      nicu_days: form.nicu_days ? parseInt(form.nicu_days) : null,
      father_name: form.father_name || null,
      mother_name: form.mother_name || null,
      phone: form.phone || null,
      phone2: form.phone2 || null,
      address: form.address || null,
      dietary_history: form.dietary_history || null,
      family_history: form.family_history || null,
      allergies: form.allergies || null,
      notes: form.notes || null,
    }

    const { error } = await supabase.from('patients').update(payload).eq('id', patient.id)
    setLoading(false)

    if (error) {
      toast.error('حدث خطأ', { description: error.message })
    } else {
      toast.success('تم تحديث بيانات المريض')
      router.push(`/dashboard/patients/${patient.id}`)
      router.refresh()
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/patients/${patient.id}`}>
          <Button variant="ghost" size="icon"><ArrowRight className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">تعديل بيانات المريض</h1>
          <p className="text-sm text-gray-500">{patient.full_name} — {patient.patient_number}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm text-gray-600">البيانات الأساسية</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label>الاسم *</Label>
              <Input value={form.full_name} onChange={e => set('full_name', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>تاريخ الميلاد *</Label>
              <Input type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} required dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>الجنس *</Label>
              <Select value={form.gender} onValueChange={v => set('gender', v ?? '')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">ذكر</SelectItem>
                  <SelectItem value="female">أنثى</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm text-gray-600">بيانات الولادة</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>مكان الولادة</Label>
              <Input value={form.birth_place} onChange={e => set('birth_place', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>طريقة الولادة</Label>
              <Select value={form.birth_mode} onValueChange={v => set('birth_mode', v ?? '')}>
                <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">طبيعية</SelectItem>
                  <SelectItem value="cs">قيصرية</SelectItem>
                  <SelectItem value="assisted">مساعدة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>عمر الحمل (أسبوع)</Label>
              <Input type="number" value={form.gestational_age_weeks} onChange={e => set('gestational_age_weeks', e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>الوزن (جرام)</Label>
              <Input type="number" value={form.birth_weight_grams} onChange={e => set('birth_weight_grams', e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>الطول (سم)</Label>
              <Input type="number" step="0.1" value={form.birth_length_cm} onChange={e => set('birth_length_cm', e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>محيط الرأس (سم)</Label>
              <Input type="number" step="0.1" value={form.birth_head_circumference_cm} onChange={e => set('birth_head_circumference_cm', e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>أيام NICU</Label>
              <Input type="number" value={form.nicu_days} onChange={e => set('nicu_days', e.target.value)} dir="ltr" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm text-gray-600">الأسرة والتواصل</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>اسم الأب</Label><Input value={form.father_name} onChange={e => set('father_name', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>اسم الأم</Label><Input value={form.mother_name} onChange={e => set('mother_name', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>هاتف 1</Label><Input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} dir="ltr" /></div>
            <div className="space-y-1.5"><Label>هاتف 2</Label><Input type="tel" value={form.phone2} onChange={e => set('phone2', e.target.value)} dir="ltr" /></div>
            <div className="sm:col-span-2 space-y-1.5"><Label>العنوان</Label><Input value={form.address} onChange={e => set('address', e.target.value)} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm text-gray-600">التاريخ الطبي</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5"><Label>التاريخ الغذائي</Label><Textarea value={form.dietary_history} onChange={e => set('dietary_history', e.target.value)} rows={2} /></div>
            <div className="space-y-1.5"><Label>التاريخ العائلي</Label><Textarea value={form.family_history} onChange={e => set('family_history', e.target.value)} rows={2} /></div>
            <div className="space-y-1.5"><Label>الحساسية</Label><Input value={form.allergies} onChange={e => set('allergies', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>ملاحظات</Label><Textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} /></div>
          </CardContent>
        </Card>

        <div className="flex gap-3 pb-6">
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Save className="w-4 h-4" />
            {loading ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
          </Button>
          <Link href={`/dashboard/patients/${patient.id}`}>
            <Button type="button" variant="outline">إلغاء</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
