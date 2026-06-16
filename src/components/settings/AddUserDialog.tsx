'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { UserPlus, ShieldCheck, User, Mail, Lock, Phone, Stethoscope, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props { clinicId: string }

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

const ROLE_DEFAULTS: Record<string, string[]> = {
  doctor:    ALL_PERMISSIONS.map(p => p.key),
  nurse:     ['view_patients', 'add_patients', 'view_visits', 'add_visits', 'upload_prescriptions', 'view_vaccinations', 'update_vaccinations'],
  secretary: ['view_patients', 'add_patients', 'edit_patients', 'view_visits', 'view_vaccinations', 'view_reports'],
}

const ROLE_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  doctor:    { label: 'طبيب',      color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200',   icon: '👨‍⚕️' },
  nurse:     { label: 'ممرضة',     color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', icon: '👩‍⚕️' },
  secretary: { label: 'سكرتيرة',  color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200', icon: '💼' },
}

const GROUP_ICONS: Record<string, string> = {
  'المرضى':      '🧒',
  'الزيارات':    '📋',
  'التطعيمات':   '💉',
  'التقارير':    '📊',
  'الإدارة':     '⚙️',
}

const groups = [...new Set(ALL_PERMISSIONS.map(p => p.group))]

export default function AddUserDialog({ clinicId }: Props) {
  const [open, setOpen]           = useState(false)
  const [loading, setLoading]     = useState(false)
  const [expanded, setExpanded]   = useState<string[]>([])
  const router = useRouter()

  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: '', phone: '' })
  const [permissions, setPermissions] = useState<string[]>([])

  function handleRoleChange(role: string) {
    setForm(f => ({ ...f, role }))
    setPermissions(ROLE_DEFAULTS[role] ?? [])
    setExpanded(groups)
  }

  function togglePerm(key: string) {
    setPermissions(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key])
  }

  function toggleGroup(group: string) {
    const keys = ALL_PERMISSIONS.filter(p => p.group === group).map(p => p.key)
    const allSel = keys.every(k => permissions.includes(k))
    setPermissions(prev => allSel ? prev.filter(k => !keys.includes(k)) : [...new Set([...prev, ...keys])])
  }

  function toggleExpand(group: string) {
    setExpanded(prev => prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name || !form.email || !form.password || !form.role) {
      toast.error('يرجى ملء جميع الحقول المطلوبة'); return
    }
    if (form.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return
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
    setExpanded([])
    router.refresh()
  }

  const roleMeta = form.role ? ROLE_META[form.role] : null

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-gradient-to-l from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md shadow-blue-200 gap-2 rounded-xl px-5"
      >
        <UserPlus className="w-4 h-4" />
        إضافة مستخدم
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto p-0 gap-0 rounded-2xl border-0 shadow-2xl">

          {/* Header */}
          <div className="bg-gradient-to-l from-blue-600 to-blue-500 px-6 py-5 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-white text-base font-bold">إضافة مستخدم جديد</DialogTitle>
                <p className="text-blue-100 text-xs mt-0.5">أضف عضواً جديداً لفريق العيادة</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* Name + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-500" /> الاسم الكامل <span className="text-red-400">*</span>
                </Label>
                <Input
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="د. أحمد محمد"
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-500" /> البريد الإلكتروني <span className="text-red-400">*</span>
                </Label>
                <Input
                  type="email" dir="ltr"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="user@clinic.com"
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 transition-all text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-500" /> كلمة المرور <span className="text-red-400">*</span>
                </Label>
                <Input
                  type="password" dir="ltr"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-blue-500" /> الدور الوظيفي <span className="text-red-400">*</span>
                </Label>
                <Select value={form.role} onValueChange={v => handleRoleChange(v ?? '')}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white">
                    <SelectValue placeholder="اختر الدور..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {Object.entries(ROLE_META).map(([val, meta]) => (
                      <SelectItem key={val} value={val} className="rounded-lg my-0.5">
                        <span className="flex items-center gap-2">
                          <span>{meta.icon}</span>
                          <span className="font-medium">{meta.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-500" /> رقم الهاتف
                </Label>
                <Input
                  type="tel" dir="ltr"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="01xxxxxxxxx"
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 transition-all"
                />
              </div>
            </div>

            {/* Role badge */}
            {roleMeta && (
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold ${roleMeta.bg} ${roleMeta.color}`}>
                <span className="text-base">{roleMeta.icon}</span>
                <span>{roleMeta.label}</span>
                <span className="mr-auto text-xs font-normal opacity-70">{permissions.length} صلاحية محددة من {ALL_PERMISSIONS.length}</span>
              </div>
            )}

            {/* Permissions */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-bold text-slate-700">الصلاحيات</span>
              </div>

              {form.role ? (
                <div className="space-y-2">
                  {groups.map(group => {
                    const groupPerms = ALL_PERMISSIONS.filter(p => p.group === group)
                    const allSel     = groupPerms.every(p => permissions.includes(p.key))
                    const someSel    = groupPerms.some(p => permissions.includes(p.key))
                    const isOpen     = expanded.includes(group)

                    return (
                      <div key={group} className="border border-slate-200 rounded-xl overflow-hidden">
                        {/* Group row */}
                        <div
                          className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${allSel ? 'bg-blue-50' : someSel ? 'bg-slate-50' : 'bg-white'} hover:bg-slate-50`}
                          onClick={() => toggleExpand(group)}
                        >
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); toggleGroup(group) }}
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all
                              ${allSel ? 'bg-blue-600 border-blue-600' : someSel ? 'bg-blue-100 border-blue-400' : 'border-slate-300 bg-white'}`}
                          >
                            {allSel && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                            {someSel && !allSel && <div className="w-2 h-0.5 bg-blue-600 rounded" />}
                          </button>
                          <span className="text-sm">{GROUP_ICONS[group]}</span>
                          <span className="text-sm font-semibold text-slate-700 flex-1">{group}</span>
                          <span className="text-xs text-slate-400">
                            {groupPerms.filter(p => permissions.includes(p.key)).length}/{groupPerms.length}
                          </span>
                          {isOpen
                            ? <ChevronUp className="w-4 h-4 text-slate-400" />
                            : <ChevronDown className="w-4 h-4 text-slate-400" />
                          }
                        </div>

                        {/* Individual perms */}
                        {isOpen && (
                          <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-2 space-y-1">
                            {groupPerms.map(p => (
                              <label key={p.key} className="flex items-center gap-3 py-1.5 cursor-pointer group">
                                <button
                                  type="button"
                                  onClick={() => togglePerm(p.key)}
                                  className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all
                                    ${permissions.includes(p.key) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white group-hover:border-blue-400'}`}
                                >
                                  {permissions.includes(p.key) && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                                </button>
                                <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">{p.label}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                  <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">اختر الدور الوظيفي أولاً لتظهر الصلاحيات</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-11 bg-gradient-to-l from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-xl shadow-md shadow-blue-200 font-semibold text-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    جارٍ الإضافة...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    إضافة المستخدم
                  </span>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="h-11 px-5 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
