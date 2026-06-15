export type UserRole = 'doctor' | 'nurse' | 'secretary' | 'admin'

export interface Profile {
  id: string
  clinic_id: string
  full_name: string
  role: UserRole
  phone?: string
  avatar_url?: string
  created_at: string
}

export interface Clinic {
  id: string
  name: string
  name_ar?: string
  address?: string
  phone?: string
}

export interface Patient {
  id: string
  clinic_id: string
  patient_number: string
  full_name: string
  date_of_birth: string
  gender: 'male' | 'female'
  birth_place?: string
  birth_mode?: 'normal' | 'cs' | 'assisted'
  gestational_age_weeks?: number
  birth_weight_grams?: number
  birth_length_cm?: number
  birth_head_circumference_cm?: number
  nicu_days?: number
  father_name?: string
  mother_name?: string
  phone?: string
  phone2?: string
  address?: string
  dietary_history?: string
  family_history?: string
  allergies?: string
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Visit {
  id: string
  patient_id: string
  clinic_id: string
  visit_date: string
  visit_time?: string
  weight_kg?: number
  length_cm?: number
  head_circumference_cm?: number
  temperature_c?: number
  chief_complaint?: string
  on_examination?: string
  diagnosis?: string
  treatment?: string
  notes?: string
  next_visit_date?: string
  created_by?: string
  created_at: string
}

export interface PrescriptionItem {
  drug: string
  dose: string
  frequency: string
  duration: string
  notes?: string
}

export interface Prescription {
  id: string
  visit_id: string
  patient_id: string
  items?: PrescriptionItem[]
  file_url?: string
  file_name?: string
  created_by?: string
  created_at: string
}

export interface VaccineSchedule {
  id: string
  name: string
  name_ar: string
  due_age_months: number
  due_age_label: string
  description?: string
  sort_order: number
}

export type VaccinationStatus = 'pending' | 'given' | 'missed' | 'delayed'

export interface PatientVaccination {
  id: string
  patient_id: string
  vaccine_schedule_id?: string
  custom_name?: string
  custom_name_ar?: string
  given_date?: string
  given_age_months?: number
  batch_number?: string
  site?: string
  reaction?: string
  notes?: string
  status: VaccinationStatus
  given_by?: string
  created_at: string
  vaccine_schedule?: VaccineSchedule
}

export interface PatientWithAge extends Patient {
  age_months: number
  age_display: string
}
