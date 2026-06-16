export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import PatientSearch from '@/components/patients/PatientSearch'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar userRole={profile?.role} userName={profile?.full_name} />
      <main className="flex-1 flex flex-col min-w-0 pt-14 lg:pt-0">
        <div className="hidden lg:flex items-center justify-between px-6 py-3 bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
          <PatientSearch />
          <div className="text-xs text-slate-400 font-medium">
            {new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
        <div className="flex-1 p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
