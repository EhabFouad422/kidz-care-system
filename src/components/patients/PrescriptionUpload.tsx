'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Upload, Loader2, ImageIcon } from 'lucide-react'

interface Props {
  visitId: string
  patientId: string
}

export default function PrescriptionUpload({ visitId, patientId }: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const router = useRouter()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview for images
    if (file.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(file))
    }

    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const ext = file.name.split('.').pop()
    const path = `prescriptions/${patientId}/${visitId}/${Date.now()}.${ext}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('prescriptions')
      .upload(path, file, { upsert: false })

    if (uploadError) {
      toast.error('فشل رفع الملف', { description: uploadError.message })
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('prescriptions').getPublicUrl(path)

    const { error } = await supabase.from('prescriptions').insert({
      visit_id: visitId,
      patient_id: patientId,
      file_url: publicUrl,
      file_name: file.name,
      created_by: user!.id,
    })

    setUploading(false)

    if (error) {
      toast.error('حدث خطأ', { description: error.message })
    } else {
      toast.success('تم رفع الروشتة بنجاح')
      setPreview(null)
      router.refresh()
    }
  }

  return (
    <div className="space-y-3">
      {preview && (
        <div className="rounded-lg overflow-hidden border border-gray-200">
          <img src={preview} alt="معاينة الروشتة" className="w-full max-h-48 object-contain bg-gray-50" />
        </div>
      )}

      <div
        className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-colors cursor-pointer"
        onClick={() => fileRef.current?.click()}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <p className="text-sm text-gray-500">جارٍ الرفع...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">رفع روشتة</p>
            <p className="text-xs text-gray-400">صورة أو PDF — اضغط للاختيار</p>
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFile}
        disabled={uploading}
      />
    </div>
  )
}
