'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { FileText, Trash2, Eye, AlertTriangle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Prescription {
  id: string
  file_url?: string
  file_name?: string
  created_at: string
}

export default function PrescriptionList({ prescriptions: initial }: { prescriptions: Prescription[] }) {
  const [prescriptions, setPrescriptions] = useState(initial)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  async function handleDelete(p: Prescription) {
    setDeleting(p.id)

    // Delete file from storage if exists
    if (p.file_url) {
      const path = p.file_url.split('/prescriptions/')[1]
      if (path) {
        await supabase.storage.from('prescriptions').remove([path])
      }
    }

    // Delete record from DB
    const { error } = await supabase.from('prescriptions').delete().eq('id', p.id)
    setDeleting(null)

    if (error) {
      toast.error('فشل الحذف', { description: error.message })
      return
    }

    toast.success('تم حذف الروشتة')
    setPrescriptions(prev => prev.filter(x => x.id !== p.id))
    setConfirmId(null)
    router.refresh()
  }

  if (prescriptions.length === 0) return null

  const toDelete = prescriptions.find(p => p.id === confirmId)

  return (
    <>
      <div className="space-y-2">
        {prescriptions.map(p => (
          <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{p.file_name ?? 'روشتة'}</p>
                <p className="text-xs text-gray-400">{formatDate(p.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {p.file_url && (
                <a href={p.file_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="text-xs gap-1 h-7">
                    <Eye className="w-3 h-3" /> عرض
                  </Button>
                </a>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmId(p.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirm Delete Dialog */}
      <Dialog open={!!confirmId} onOpenChange={o => !o && setConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              تأكيد الحذف
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              هل أنت متأكد من حذف الروشتة
              <span className="font-semibold text-gray-800"> "{toDelete?.file_name ?? 'روشتة'}" </span>؟
              لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => toDelete && handleDelete(toDelete)}
                disabled={!!deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'جارٍ الحذف...' : 'نعم، احذف'}
              </Button>
              <Button variant="outline" onClick={() => setConfirmId(null)} className="flex-1">
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
