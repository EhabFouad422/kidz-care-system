'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, X } from 'lucide-react'
import { formatAge, genderLabel } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function PatientSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    const { data } = await supabase
      .from('patients')
      .select('id, patient_number, full_name, date_of_birth, gender, father_name, phone')
      .or(`full_name.ilike.%${q}%,patient_number.ilike.%${q}%,father_name.ilike.%${q}%,phone.ilike.%${q}%`)
      .eq('is_active', true)
      .order('full_name')
      .limit(8)
    setResults(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    const t = setTimeout(() => search(query), 250)
    return () => clearTimeout(t)
  }, [query, search])

  function selectPatient(id: string) {
    setQuery('')
    setResults([])
    setOpen(false)
    router.push(`/dashboard/patients/${id}`)
  }

  return (
    <div className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <Input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="بحث سريع: اسم، كود، هاتف..."
          className="pr-9 pl-8 bg-white"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]) }}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && (results.length > 0 || loading) && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 w-full min-w-[320px] bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
            {loading ? (
              <div className="p-3 text-center text-sm text-gray-400">جارٍ البحث...</div>
            ) : (
              <>
                <div className="px-3 py-2 bg-gray-50 border-b">
                  <p className="text-xs text-gray-500">{results.length} نتيجة لـ "{query}"</p>
                </div>
                {results.map(p => (
                  <button key={p.id} onClick={() => selectPatient(p.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 transition-colors text-right border-b border-gray-50 last:border-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${p.gender === 'female' ? 'bg-pink-400' : 'bg-blue-400'}`}>
                      {p.full_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{p.full_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">{formatAge(p.date_of_birth)}</span>
                        {p.father_name && <span className="text-xs text-gray-400">• {p.father_name}</span>}
                      </div>
                    </div>
                    <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded shrink-0">{p.patient_number}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
