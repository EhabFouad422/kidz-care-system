'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { ArrowRight, Save, Baby } from 'lucide-react'
import Link from 'next/link'

export default function NewPatientPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    full_name: '',
    date_of_birth: '',
    gender: '',
    birth_place: '',
    birth_mode: '',
    gestational_age_weeks: '',
    birth_weight_grams: '',
    birth_length_cm: '',
    birth_head_circumference_cm: '',
    nicu_days: '',
    father_name: '',
    mother_name: '',
    phone: '',
    phone2: '',
    address: '',
    dietary_history: '',
    family_history: '',
    allergies: '',
    notes: '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name || !form.date_of_birth || !form.gender) {
      toast.error('يرجى ملء الحقول المطلوبة')
      return
    }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('clinic_id').eq('id', user!.id).single()

    const payload: Record<string, unknown> = {
      full_name: form.full_name,
      date_of_birth: form.date_of_birth,
      gender: form.gender,
      clinic_id: profile?.clinic_id,
      created_by: user!.id,
    }

    if (form.birth_place) payload.birth_place = form.birth_place
    if (form.birth_mode) payload.birth_mode = form.birth_mode
    if (form.gestational_age_weeks) payload.gestational_age_weeks = parseInt(form.gestational_age_weeks)
    if (form.birth_weight_grams) payload.birth_weight_grams = parseInt(form.birth_weight_grams)
    if (form.birth_length_cm) payload.birth_length_cm = parseFloat(form.birth_length_cm)
    if (form.birth_head_circumference_cm) payload.birth_head_circumference_cm = parseFloat(form.birth_head_circumference_cm)
    if (form.nicu_days) payload.nicu_days = parseInt(form.nicu_days)
    if (form.father_name) payload.father_name = form.father_name
    if (form.mother_name) payload.mother_name = form.mother_name
    if (form.phone) payload.phone = form.phone
    if (form.phone2) payload.phone2 = form.phone2
    if (form.address) payload.address = form.address
    if (form.dietary_history) payload.dietary_history = form.dietary_history
    if (form.family_history) payload.family_history = form.family_history
    if (form.allergies) payload.allergies = form.allergies
    if (form.notes) payload.notes = form.notes

    const { data, error } = await supabase.from('patients').insert(payload).select().single()
    setLoading(false)

    if (error) {
      toast.error('حدث خطأ', { description: error.message })
    } else {
      toast.success('تم إضافة المريض بنجاح')
      router.push(`/dashboard/patients/${data.id}`)
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/patients">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Baby className="w-5 h-5 text-blue-600" />
            تسجيل مريض جديد
          </h1>
          <p className="text-sm text-gray-500">أدخل بيانات الطفل</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">البيانات الأساسية *</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label>اسم الطفل كاملاً *</Label>
              <Input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="الاسم الرباعي" required />
            </div>
            <div className="space-y-1.5">
              <Label>تاريخ الميلاد *</Label>
              <Input type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} required dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>الجنس *</Label>
              <Select value={form.gender} onValueChange={v => set('gender', v ?? '')}>
                <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">ذكر</SelectItem>
                  <SelectItem value="female">أنثى</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Birth Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">بيانات الولادة</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>مكان الولادة</Label>
              <Input value={form.birth_place} onChange={e => set('birth_place', e.target.value)} placeholder="مثال: مستشفى المنشية" />
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
              <Input type="number" min="24" max="42" value={form.gestational_age_weeks} onChange={e => set('gestational_age_weeks', e.target.value)} placeholder="38" dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>الوزن عند الولادة (جرام)</Label>
              <Input type="number" value={form.birth_weight_grams} onChange={e => set('birth_weight_grams', e.target.value)} placeholder="3200" dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>الطول عند الولادة (سم)</Label>
              <Input type="number" step="0.1" value={form.birth_length_cm} onChange={e => set('birth_length_cm', e.target.value)} placeholder="50" dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>محيط الرأس (سم)</Label>
              <Input type="number" step="0.1" value={form.birth_head_circumference_cm} onChange={e => set('birth_head_circumference_cm', e.target.value)} placeholder="34" dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>أيام NICU</Label>
              <Input type="number" min="0" value={form.nicu_days} onChange={e => set('nicu_days', e.target.value)} placeholder="0" dir="ltr" />
            </div>
          </CardContent>
        </Card>

        {/* Family Contact */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">بيانات الأسرة والتواصل</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>اسم الأب</Label>
              <Input value={form.father_name} onChange={e => set('father_name', e.target.value)} placeholder="اسم الأب" />
            </div>
            <div className="space-y-1.5">
              <Label>اسم الأم</Label>
              <Input value={form.mother_name} onChange={e => set('mother_name', e.target.value)} placeholder="اسم الأم" />
            </div>
            <div className="space-y-1.5">
              <Label>رقم الهاتف</Label>
              <Input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="01xxxxxxxxx" dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>رقم هاتف آخر</Label>
              <Input type="tel" value={form.phone2} onChange={e => set('phone2', e.target.value)} placeholder="01xxxxxxxxx" dir="ltr" />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>العنوان</Label>
              <Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="العنوان" />
            </div>
          </CardContent>
        </Card>

        {/* Medical History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">التاريخ الطبي</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>التاريخ الغذائي (Dietary History)</Label>
              <Textarea value={form.dietary_history} onChange={e => set('dietary_history', e.target.value)} placeholder="رضاعة طبيعية / صناعية، عمر الفطام..." rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>التاريخ العائلي</Label>
              <Textarea value={form.family_history} onChange={e => set('family_history', e.target.value)} placeholder="أمراض وراثية، أمراض مزمنة في الأسرة..." rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>الحساسية (Allergies)</Label>
              <Input value={form.allergies} onChange={e => set('allergies', e.target.value)} placeholder="حساسية أدوية أو طعام..." />
            </div>
            <div className="space-y-1.5">
              <Label>ملاحظات</Label>
              <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="أي ملاحظات إضافية..." rows={2} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 pb-6">
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Save className="w-4 h-4" />
            {loading ? 'جارٍ الحفظ...' : 'حفظ المريض'}
          </Button>
          <Link href="/dashboard/patients">
            <Button type="button" variant="outline">إلغاء</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
