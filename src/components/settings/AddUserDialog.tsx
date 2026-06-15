'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { UserPlus, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props { clinicId: string }

// All available permissions
const ALL_PERMISSIONS = [
  { key: 'view_patients',        label: 'عرض المرضى',              group: 'المرضى' },
  { key: 'add_patients',         label: 'إضافة مرضى جدد',          group: 'المرضى' },
  { key: 'edit_patients',        label: 'تعديل بيانات المرضى',      group: 'المرضى' },
  { key: 'view_visits',          label: 'عرض الزيارات',             group: 'الزيارات' },
  { key: 'add_visits',           label: 'إضافة زيارات',             group: 'الزيارات' },
  { key: 'add_diagnosis',        label: 'إضافة تشخيص وعلاج',        group: 'الزيارات' },
  { key: 'upload_prescriptions', label: 'رفع الروشتات',             group: 'الزيارات' },
  { key: 'view_vaccinations',    label: 'عرض التطعيمات',            group: 'التطعيمات' },
  { key: 'update_vaccinations',  label: 'تحديث حالة التطعيمات',     group: 'التطعيمات' },
  { key: 'view_reports',         label: 'عرض التقارير',             group: 'التقارير' },
  { key: 'manage_users',         label: 'إدارة المستخدمين',         group: 'الإدارة' },
]

// Default permissions per role
const ROLE_DEFAULTS: Record<string, string[]> = {
  doctor: ALL_PERMISSIONS.map(p => p.key),
  nurse: ['view_patients', 'add_patients', 'view_visits', 'add_visits', 'upload_prescriptions', 'view_vaccinations', 'update_vaccinations'],
  secretary: ['view_patients', 'add_patients', 'edit_patients', 'view_visits', 'view_vaccinations', 'view_reports'],
}

const groups = [...new Set(ALL_PERMISSIONS.map(p => p.group))]

export default function AddUserDialog({ clinicId }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: '', phone: '' })
  const [permissions, setPermissions] = useState<string[]>([])

  function handleRoleChange(role: string) {
    setForm(f => ({ ...f, role }))
    setPermissions(ROLE_DEFAULTS[role] ?? [])
  }

  function togglePerm(key: string) {
    setPermissions(prev =>
      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
    )
  }

  function toggleGroup(group: string) {
    const groupKeys = ALL_PERMISSIONS.filter(p => p.group === group).map(p => p.key)
    const allSelected = groupKeys.every(k => permissions.includes(k))
    if (allSelected) {
      setPermissions(prev => prev.filter(k => !groupKeys.includes(k)))
    } else {
      setPermissions(prev => [...new Set([...prev, ...groupKeys])])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name || !form.email || !form.password || !form.role) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }
    if (form.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setLoading(true)
    const res = await fetch('/api/users/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, clinic_id: clinicId, permissions }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) { toast.error('حدث خطأ', { description: data.error }); return }

    toast.success(`تم إضافة ${form.full_name} بنجاح`)
    setOpen(false)
    setForm({ full_name: '', email: '', password: '', role: '', phone: '' })
    setPermissions([])
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700 gap-2">
        <UserPlus className="w-4 h-4" />
        إضافة مستخدم
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-600" />
              إضافة مستخدم جديد
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic info */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>الاسم الكامل *</Label>
                <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="د. أحمد محمد" required />
              </div>
              <div className="space-y-1.5">
                <Label>البريد الإلكتروني *</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="user@clinic.com" dir="ltr" required />
              </div>
              <div className="space-y-1.5">
                <Label>كلمة المرور *</Label>
                <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="6 أحرف على الأقل" dir="ltr" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>الدور الوظيفي *</Label>
                  <Select value={form.role} onValueChange={v => handleRoleChange(v ?? '')}>
                    <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">👨‍⚕️ طبيب</SelectItem>
                      <SelectItem value="nurse">👩‍⚕️ ممرضة</SelectItem>
                      <SelectItem value="secretary">💼 سكرتيرة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>رقم الهاتف</Label>
                  <Input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="01xxxxxxxxx" dir="ltr" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Permissions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-semibold text-gray-800">الصلاحيات</p>
                <span className="text-xs text-gray-400 mr-auto">{permissions.length} صلاحية محددة</span>
              </div>

              {form.role ? (
                <div className="space-y-3">
                  {groups.map(group => {
                    const groupPerms = ALL_PERMISSIONS.filter(p => p.group === group)
                    const allSelected = groupPerms.every(p => permissions.includes(p.key))
                    const someSelected = groupPerms.some(p => permissions.includes(p.key))

                    return (
                      <div key={group} className="bg-gray-50 rounded-xl p-3 space-y-2">
                        {/* Group header */}
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            ref={el => { if (el) el.indeterminate = someSelected && !allSelected }}
                            onChange={() => toggleGroup(group)}
                            className="w-4 h-4 accent-blue-600 rounded"
                          />
                          <span className="text-xs font-bold text-gray-700">{group}</span>
                        </label>

                        {/* Individual permissions */}
                        <div className="space-y-1.5 mr-5">
                          {groupPerms.map(p => (
                            <label key={p.key} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={permissions.includes(p.key)}
                                onChange={() => togglePerm(p.key)}
                                className="w-3.5 h-3.5 accent-blue-600 rounded"
                              />
                              <span className="text-xs text-gray-600">{p.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-400">
                  اختر الدور الوظيفي أولاً لتظهر الصلاحيات
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {loading ? 'جارٍ الإضافة...' : 'إضافة المستخدم'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
