'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Mail, Lock } from 'lucide-react'
import Image from 'next/image'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error('خطأ في تسجيل الدخول', { description: 'تأكد من البريد الإلكتروني وكلمة المرور' })
    } else {
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-violet-500/10 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-pink-500/10 translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <Image src="/logo.png" alt="Dr. Bola Pediatric Clinic" width={320} height={150} style={{ objectFit: 'contain', height: '150px', width: 'auto' }} priority />
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white leading-snug">
              رعاية أفضل<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">لأطفال أصحاء</span>
            </h2>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              نظام متكامل لإدارة مرضى الأطفال وحديثي الولادة — سجلات طبية، تطعيمات، ومتابعة شاملة.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'سجلات المرضى', color: 'from-violet-500/20 to-violet-500/5 border-violet-500/20' },
              { label: 'جداول التطعيم', color: 'from-pink-500/20 to-pink-500/5 border-pink-500/20' },
              { label: 'إدارة الزيارات', color: 'from-sky-500/20 to-sky-500/5 border-sky-500/20' },
            ].map(({ label, color }) => (
              <div key={label} className={`bg-gradient-to-br ${color} border rounded-xl p-3 text-center`}>
                <p className="text-white text-xs font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-slate-600 text-xs">
          Dr. Bola Pediatric Clinic © {new Date().getFullYear()}
        </p>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <Image src="/logo.png" alt="Dr. Bola Pediatric Clinic" width={280} height={120} style={{ objectFit: 'contain', height: '120px', width: 'auto', margin: '0 auto' }} priority />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">مرحباً بك 👋</h2>
            <p className="text-slate-500 text-sm mt-1">سجّل دخولك للوصول إلى النظام</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-medium text-sm">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="doctor@clinic.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  dir="ltr"
                  className="pr-10 h-11 bg-white border-slate-200 focus:border-violet-400 text-left"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-700 font-medium text-sm">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  dir="ltr"
                  className="pr-10 h-11 bg-white border-slate-200 focus:border-violet-400"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white font-semibold transition-all"
            >
              {loading ? 'جارٍ تسجيل الدخول...' : 'دخول'}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400 lg:hidden">
            Dr. Bola Pediatric Clinic © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}
