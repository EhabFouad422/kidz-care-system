'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ArrowRight, Save, Baby, Heart, Users, Stethoscope, Activity } from 'lucide-react'
import Link from 'next/link'

function SectionHeader({ icon, title, color }: { icon: React.ReactNode; title: string; color: string }) {
  return (
    <div className={`flex items-center gap-3 px-5 py-3.5 rounded-t-2xl ${color}`}>
      <div className="w-8 h-8 bg-white/30 rounded-xl flex items-center justify-center shrink-0">
        {icon}
      </div>
      <span className="font-bold text-white text-sm">{title}</span>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-slate-600">
        {label}{required && <span className="text-red-400 mr-1">*</span>}
      </Label>
      {children}
    </div>
  )
}

const inputCls = "h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 transition-all text-sm"

export default function NewPatientPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    full_name: '', date_of_birth: '', gender: '',
    birth_place: '', birth_mode: '', gestational_age_weeks: '',
    birth_weight_grams: '', birth_length_cm: '', birth_head_circumference_cm: '',
    nicu_days: '', father_name: '', mother_name: '',
    phone: '', phone2: '', address: '',
    dietary_history: '', family_history: '', allergies: '', notes: '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name || !form.date_of_birth || !form.gender) {
      toast.error('يرجى ملء الحقول المطلوبة'); return
    }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('clinic_id').eq('id', user!.id).single()
    const payload: Record<string, unknown> = {
      full_name: form.full_name, date_of_birth: form.date_of_birth,
      gender: form.gender, clinic_id: profile?.clinic_id, created_by: user!.id,
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
    if (error) { toast.error('حدث خطأ', { description: error.message }) }
    else { toast.success('تم إضافة المريض بنجاح'); router.push(`/dashboard/patients/${data.id}`) }
  }

  return (
    <div className="w-full space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/patients">
          <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
            <ArrowRight className="w-4 h-4 text-slate-600" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="text-2xl">🧒</span>
            تسجيل مريض جديد
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">أدخل بيانات الطفل بالكامل</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg">
            <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
            الحقول المطلوبة
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Grid Layout: 2 columns on lg ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {/* ── 1. Basic Info ── */}
          <div className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white">
            <SectionHeader
              icon={<Baby className="w-4 h-4 text-white" />}
              title="البيانات الأساسية"
              color="bg-gradient-to-l from-blue-600 to-blue-500"
            />
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="اسم الطفل كاملاً" required>
                  <Input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="الاسم الرباعي" className={inputCls} required />
                </Field>
              </div>
              <Field label="تاريخ الميلاد" required>
                <Input type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} className={inputCls} required dir="ltr" />
              </Field>
              <Field label="الجنس" required>
                <Select value={form.gender} onValueChange={v => set('gender', v ?? '')}>
                  <SelectTrigger className={inputCls}><SelectValue placeholder="اختر الجنس" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="male">👦 ذكر</SelectItem>
                    <SelectItem value="female">👧 أنثى</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>

          {/* ── 2. Birth Info ── */}
          <div className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white">
            <SectionHeader
              icon={<Heart className="w-4 h-4 text-white" />}
              title="بيانات الولادة"
              color="bg-gradient-to-l from-rose-500 to-pink-500"
            />
            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <Field label="مكان الولادة">
                  <Input value={form.birth_place} onChange={e => set('birth_place', e.target.value)} placeholder="مستشفى المنشية" className={inputCls} />
                </Field>
              </div>
              <Field label="طريقة الولادة">
                <Select value={form.birth_mode} onValueChange={v => set('birth_mode', v ?? '')}>
                  <SelectTrigger className={inputCls}><SelectValue placeholder="اختر" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="normal">طبيعية</SelectItem>
                    <SelectItem value="cs">قيصرية</SelectItem>
                    <SelectItem value="assisted">مساعدة</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="عمر الحمل (أسبوع)">
                <Input type="number" min="24" max="42" value={form.gestational_age_weeks} onChange={e => set('gestational_age_weeks', e.target.value)} placeholder="38" className={inputCls} dir="ltr" />
              </Field>
              <Field label="الوزن عند الولادة (جرام)">
                <Input type="number" value={form.birth_weight_grams} onChange={e => set('birth_weight_grams', e.target.value)} placeholder="3200" className={inputCls} dir="ltr" />
              </Field>
              <Field label="الطول عند الولادة (سم)">
                <Input type="number" step="0.1" value={form.birth_length_cm} onChange={e => set('birth_length_cm', e.target.value)} placeholder="50" className={inputCls} dir="ltr" />
              </Field>
              <Field label="محيط الرأس (سم)">
                <Input type="number" step="0.1" value={form.birth_head_circumference_cm} onChange={e => set('birth_head_circumference_cm', e.target.value)} placeholder="34" className={inputCls} dir="ltr" />
              </Field>
              <Field label="أيام NICU">
                <Input type="number" min="0" value={form.nicu_days} onChange={e => set('nicu_days', e.target.value)} placeholder="0" className={inputCls} dir="ltr" />
              </Field>
            </div>
          </div>

          {/* ── 3. Family & Contact ── */}
          <div className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white">
            <SectionHeader
              icon={<Users className="w-4 h-4 text-white" />}
              title="بيانات الأسرة والتواصل"
              color="bg-gradient-to-l from-violet-600 to-purple-500"
            />
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="اسم الأب">
                <Input value={form.father_name} onChange={e => set('father_name', e.target.value)} placeholder="اسم الأب" className={inputCls} />
              </Field>
              <Field label="اسم الأم">
                <Input value={form.mother_name} onChange={e => set('mother_name', e.target.value)} placeholder="اسم الأم" className={inputCls} />
              </Field>
              <Field label="رقم الهاتف الأول">
                <Input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="01xxxxxxxxx" className={inputCls} dir="ltr" />
              </Field>
              <Field label="رقم الهاتف الثاني">
                <Input type="tel" value={form.phone2} onChange={e => set('phone2', e.target.value)} placeholder="01xxxxxxxxx" className={inputCls} dir="ltr" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="العنوان">
                  <Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="المدينة، الحي، الشارع..." className={inputCls} />
                </Field>
              </div>
            </div>
          </div>

          {/* ── 4. Medical History ── */}
          <div className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white">
            <SectionHeader
              icon={<Stethoscope className="w-4 h-4 text-white" />}
              title="التاريخ الطبي"
              color="bg-gradient-to-l from-emerald-600 to-teal-500"
            />
            <div className="p-5 space-y-4">
              <Field label="التاريخ الغذائي">
                <Textarea value={form.dietary_history} onChange={e => set('dietary_history', e.target.value)} placeholder="رضاعة طبيعية / صناعية، عمر الفطام..." rows={2} className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 transition-all text-sm resize-none" />
              </Field>
              <Field label="التاريخ العائلي">
                <Textarea value={form.family_history} onChange={e => set('family_history', e.target.value)} placeholder="أمراض وراثية، أمراض مزمنة في الأسرة..." rows={2} className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 transition-all text-sm resize-none" />
              </Field>
              <Field label="الحساسية (Allergies)">
                <Input value={form.allergies} onChange={e => set('allergies', e.target.value)} placeholder="حساسية أدوية أو طعام..." className={inputCls} />
              </Field>
              <Field label="ملاحظات">
                <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="أي ملاحظات إضافية..." rows={2} className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 transition-all text-sm resize-none" />
              </Field>
            </div>
          </div>

        </div>

        {/* ── Action Bar ── */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
          <Button
            type="submit"
            disabled={loading}
            className="h-11 px-8 bg-gradient-to-l from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-xl shadow-md shadow-blue-200 font-semibold text-sm gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                جارٍ الحفظ...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                حفظ بيانات المريض
              </>
            )}
          </Button>
          <Link href="/dashboard/patients">
            <Button type="button" variant="outline" className="h-11 px-6 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm">
              إلغاء
            </Button>
          </Link>
          <p className="mr-auto text-xs text-slate-400 hidden sm:block">
            الحقول المطلوبة: الاسم، تاريخ الميلاد، الجنس
          </p>
        </div>

      </form>
    </div>
  )
}
