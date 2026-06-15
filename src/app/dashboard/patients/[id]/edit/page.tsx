import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditPatientForm from '@/components/patients/EditPatientForm'

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: patient } = await supabase.from('patients').select('*').eq('id', id).single()
  if (!patient) notFound()
  return <EditPatientForm patient={patient} />
}
