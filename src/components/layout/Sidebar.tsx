'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, Calendar, Syringe, FileText,
  LogOut, Heart, Menu, X, Settings, Bell
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'الرئيسية', exact: true, color: 'text-violet-300' },
  { href: '/dashboard/patients', icon: Users, label: 'المرضى', color: 'text-sky-300' },
  { href: '/dashboard/visits', icon: Calendar, label: 'الزيارات', color: 'text-emerald-300' },
  { href: '/dashboard/vaccinations', icon: Syringe, label: 'التطعيمات', color: 'text-amber-300' },
  { href: '/dashboard/reminders', icon: Bell, label: 'التنبيهات', color: 'text-rose-300' },
  { href: '/dashboard/reports', icon: FileText, label: 'التقارير', color: 'text-slate-300' },
  { href: '/dashboard/settings/users', icon: Settings, label: 'المستخدمون', doctorOnly: true, color: 'text-pink-300' },
]

interface SidebarProps {
  userRole?: string
  userName?: string
}

export default function Sidebar({ userRole, userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('تم تسجيل الخروج')
    router.push('/login')
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const roleLabel = userRole === 'doctor' ? 'طبيب' : userRole === 'nurse' ? 'ممرضة' : 'سكرتيرة'
  const roleBg = userRole === 'doctor' ? 'bg-violet-500/30 text-violet-200' : userRole === 'nurse' ? 'bg-emerald-500/30 text-emerald-200' : 'bg-sky-500/30 text-sky-200'

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center shrink-0">
            <Heart className="w-4 h-4 text-white" fill="white" />
          </div>
          <div>
            <p className="font-extrabold text-white text-sm leading-none tracking-tight">Kidz Care</p>
            <p className="text-slate-400 text-xs mt-0.5">عيادة د. بولا</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-2 space-y-0.5 shrink-0">
        {navItems
          .filter(item => !(item as any).doctorOnly || userRole === 'doctor' || userRole === 'admin')
          .map(({ href, icon: Icon, label, exact, color }) => {
            const active = isActive(href, exact)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 group',
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                )}
              >
                <div className={cn(
                  'w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all',
                  active ? 'bg-white/15' : 'bg-white/5 group-hover:bg-white/10'
                )}>
                  <Icon className={cn('w-3.5 h-3.5', active ? 'text-white' : color)} />
                </div>
                {label}
                {active && <div className="mr-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
              </Link>
            )
          })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User */}
      <div className="px-2 pb-3 shrink-0">
        <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {userName?.charAt(0) ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{userName ?? 'مستخدم'}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium inline-block ${roleBg}`} style={{fontSize:'10px'}}>
                {roleLabel}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-3 h-3" />
            تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 bg-slate-900 flex items-center justify-between px-4 border-b border-white/10">
        <button onClick={() => setMobileOpen(true)} className="text-slate-400 hover:text-white p-1 transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-sm">Kidz Care</span>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" fill="white" />
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 bg-slate-900 h-full border-l border-white/10">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 left-4 text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col h-screen sticky top-0 shrink-0 bg-slate-900 border-l border-white/5 overflow-hidden" style={{ width: '230px' }}>
        <SidebarContent />
      </aside>
    </>
  )
}
