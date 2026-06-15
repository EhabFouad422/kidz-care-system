'use client'

import dynamic from 'next/dynamic'

const Toaster = dynamic(() => import('./sonner').then(m => m.Toaster), { ssr: false })

export function ToasterClient() {
  return <Toaster richColors position="top-center" dir="rtl" />
}
