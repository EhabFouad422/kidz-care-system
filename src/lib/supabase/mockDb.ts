export interface Clinic {
  id: string
  name: string
  name_ar: string
  address?: string
  phone?: string
  created_at: string
}

export interface Profile {
  id: string
  clinic_id: string
  full_name: string
  role: 'doctor' | 'nurse' | 'secretary' | 'admin'
  phone?: string
  avatar_url?: string
  created_at: string
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
  created_by: string
  created_at: string
  updated_at: string
}

export interface Visit {
  id: string
  patient_id: string
  clinic_id: string
  visit_date: string
  visit_time: string
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
  created_by: string
  created_at: string
}

export interface VaccineSchedule {
  id: string
  clinic_id: string
  name: string
  name_ar: string
  due_age_months: number
  due_age_label: string
  description?: string
  sort_order: number
}

export interface PatientVaccination {
  id: string
  patient_id: string
  vaccine_schedule_id: string
  custom_name?: string
  custom_name_ar?: string
  given_date?: string
  given_age_months?: number
  batch_number?: string
  site?: string
  reaction?: string
  notes?: string
  status: 'pending' | 'given' | 'missed' | 'delayed'
  given_by?: string
  created_at: string
}

export interface Prescription {
  id: string
  visit_id: string
  patient_id: string
  items?: any[]
  file_url?: string
  file_name?: string
  created_by: string
  created_at: string
}

export interface MockDatabase {
  clinics: Clinic[]
  profiles: Profile[]
  vaccine_schedule: VaccineSchedule[]
  patients: Patient[]
  visits: Visit[]
  patient_vaccinations: PatientVaccination[]
  prescriptions: Prescription[]
}

const CLINIC_ID = '00000000-0000-0000-0000-000000000001'
const DOCTOR_ID = 'mock-user-id'

export const initialVaccineSchedule: VaccineSchedule[] = [
  { id: 'v1', clinic_id: CLINIC_ID, name: 'BCG + HepB', name_ar: 'BCG + التهاب الكبد ب', due_age_months: 0, due_age_label: 'عند الولادة', sort_order: 1 },
  { id: 'v2', clinic_id: CLINIC_ID, name: 'Penta + OPV + PCV + Rota', name_ar: 'خماسي + شلل فموي + رئوي + روتا', due_age_months: 2, due_age_label: 'شهر 2', sort_order: 2 },
  { id: 'v3', clinic_id: CLINIC_ID, name: 'Penta + OPV + PCV + Rota', name_ar: 'خماسي + شلل فموي + رئوي + روتا', due_age_months: 4, due_age_label: 'شهر 4', sort_order: 3 },
  { id: 'v4', clinic_id: CLINIC_ID, name: 'Penta + OPV + PCV + Rota', name_ar: 'خماسي + شلل فموي + رئوي + روتا', due_age_months: 6, due_age_label: 'شهر 6', sort_order: 4 },
  { id: 'v5', clinic_id: CLINIC_ID, name: 'OPV + HepA', name_ar: 'شلل فموي + التهاب الكبد أ', due_age_months: 9, due_age_label: 'شهر 9', sort_order: 5 },
  { id: 'v6', clinic_id: CLINIC_ID, name: 'MMR + Varicella', name_ar: 'حصبة نكاف حصبة ألمانية + جدري ماء', due_age_months: 12, due_age_label: 'سنة', sort_order: 6 },
  { id: 'v7', clinic_id: CLINIC_ID, name: 'Penta booster + OPV + PCV', name_ar: 'خماسي منشط + شلل فموي + رئوي', due_age_months: 15, due_age_label: 'سنة ونص', sort_order: 7 },
  { id: 'v8', clinic_id: CLINIC_ID, name: 'HepA 2nd dose', name_ar: 'التهاب الكبد أ جرعة ثانية', due_age_months: 18, due_age_label: 'سنة ونص', sort_order: 8 },
  { id: 'v9', clinic_id: CLINIC_ID, name: 'MMR 2nd + OPV + Varicella 2nd', name_ar: 'حصبة ثانية + شلل فموي + جدري ماء ثانية', due_age_months: 24, due_age_label: 'سنتين', sort_order: 9 },
]

export const initialPatients: Patient[] = [
  {
    id: 'p-youssef',
    clinic_id: CLINIC_ID,
    patient_number: 'P-01001',
    full_name: 'يوسف أحمد علي',
    date_of_birth: '2025-08-15',
    gender: 'male',
    birth_place: 'القاهرة',
    birth_mode: 'normal',
    gestational_age_weeks: 39,
    birth_weight_grams: 3200,
    birth_length_cm: 50,
    birth_head_circumference_cm: 35,
    father_name: 'أحمد علي',
    mother_name: 'سارة محمد',
    phone: '01503779566',
    address: 'مصر الجديدة، القاهرة',
    dietary_history: 'رضاعة طبيعية',
    family_history: 'لا يوجد أمراض وراثية',
    allergies: 'لا يوجد',
    notes: 'حالة الطفل جيدة ومتابع باستمرار',
    is_active: true,
    created_by: DOCTOR_ID,
    created_at: '2025-08-15T10:00:00Z',
    updated_at: '2025-08-15T10:00:00Z'
  },
  {
    id: 'p-maria',
    clinic_id: CLINIC_ID,
    patient_number: 'P-01002',
    full_name: 'ماريا مينا جرجس',
    date_of_birth: '2024-06-15',
    gender: 'female',
    birth_place: 'الجيزة',
    birth_mode: 'cs',
    gestational_age_weeks: 38,
    birth_weight_grams: 2900,
    birth_length_cm: 48,
    birth_head_circumference_cm: 34,
    father_name: 'مينا جرجس',
    mother_name: 'مارينا يوسف',
    phone: '01234567890',
    address: 'الدقي، الجيزة',
    dietary_history: 'رضاعة صناعية',
    family_history: 'حساسية صدر لدى الأب',
    allergies: 'حساسية ألبان خفيفة',
    notes: 'تحتاج لمتابعة الوزن ونمو العظام',
    is_active: true,
    created_by: DOCTOR_ID,
    created_at: '2024-06-15T11:00:00Z',
    updated_at: '2024-06-15T11:00:00Z'
  },
  {
    id: 'p-nour',
    clinic_id: CLINIC_ID,
    patient_number: 'P-01003',
    full_name: 'نور علي حسن',
    date_of_birth: '2026-03-15',
    gender: 'male',
    birth_place: 'القليوبية',
    birth_mode: 'normal',
    gestational_age_weeks: 40,
    birth_weight_grams: 3500,
    birth_length_cm: 51,
    birth_head_circumference_cm: 36,
    father_name: 'علي حسن',
    mother_name: 'فاطمة أحمد',
    phone: '01112223334',
    address: 'بنها، القليوبية',
    dietary_history: 'رضاعة طبيعية',
    family_history: 'لا يوجد',
    allergies: 'لا يوجد',
    notes: 'الطفل في مرحلة نمو طبيعية',
    is_active: true,
    created_by: DOCTOR_ID,
    created_at: '2026-03-15T09:00:00Z',
    updated_at: '2026-03-15T09:00:00Z'
  }
]

export const initialVisits: Visit[] = [
  {
    id: 'v-youssef-1',
    patient_id: 'p-youssef',
    clinic_id: CLINIC_ID,
    visit_date: new Date().toISOString().split('T')[0],
    visit_time: '18:30:00',
    weight_kg: 9.5,
    length_cm: 72,
    head_circumference_cm: 44.5,
    temperature_c: 38.5,
    chief_complaint: 'سخونة شديدة ورشح مستمر منذ يومين',
    on_examination: 'احتقان واضح في اللوزتين مع تهيج بالصدر وسماع أزيز خفيف',
    diagnosis: 'التهاب حاد بالشعب الهوائية ونزلات برد شديدة',
    treatment: '1. خافض حرارة باراسيتامول 2.5 مل كل 6 ساعات\n2. نقط للأنف محلول ملحي عند اللزوم\n3. شراب موسع للشعب 2 مل مرتين يومياً لمدة 5 أيام',
    notes: 'يرجى مراجعة العيادة بعد 3 أيام إذا لم تتحسن الحرارة',
    next_visit_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_by: DOCTOR_ID,
    created_at: new Date().toISOString()
  },
  {
    id: 'v-maria-1',
    patient_id: 'p-maria',
    clinic_id: CLINIC_ID,
    visit_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    visit_time: '19:15:00',
    weight_kg: 12.0,
    length_cm: 86,
    head_circumference_cm: 47.0,
    temperature_c: 37.0,
    chief_complaint: 'متابعة نمو دورية وكشف عام',
    on_examination: 'الصدر نظيف، الحلق طبيعي، التطور الحركي والعقلي ممتاز ومتوافق مع السن',
    diagnosis: 'فحص نمو روتيني وسليم تماماً',
    treatment: 'الاستمرار على التغذية السليمة وفيتامين د قطرات يومياً',
    notes: 'الزيارة القادمة للتطعيم الدوري',
    next_visit_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_by: DOCTOR_ID,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'v-nour-1',
    patient_id: 'p-nour',
    clinic_id: CLINIC_ID,
    visit_date: new Date().toISOString().split('T')[0],
    visit_time: '17:00:00',
    weight_kg: 5.8,
    length_cm: 60,
    head_circumference_cm: 39.5,
    temperature_c: 37.2,
    chief_complaint: 'مغص شديد وبكاء مستمر ليلاً',
    on_examination: 'انتفاخ بسيط بالبطن مع وجود غازات، لا يوجد فتق أو مشاكل عضوية أخرى',
    diagnosis: 'تقلصات معوية وغازات شائعة لحديثي الولادة',
    treatment: '1. نقط دينتينوكس 5 قطرات بعد الرضاعة 3 مرات يومياً\n2. تمارين خفيفة للبطن وتقليل بلع الهواء أثناء الرضاعة',
    notes: 'تنظيم مواعيد الرضاعة وتجشؤ الطفل بعد كل رضعة',
    created_by: DOCTOR_ID,
    created_at: new Date().toISOString()
  }
]

export const initialVaccinations: PatientVaccination[] = [
  // Youssef (10 months old): BCG (0m), Penta 1/2/3 (2m,4m,6m), OPV (9m) given. MMR (12m) pending.
  { id: 'vac-y-1', patient_id: 'p-youssef', vaccine_schedule_id: 'v1', status: 'given', given_date: '2025-08-16', given_age_months: 0, notes: 'تطعيم سليم دون أعراض جانبية', created_at: '2025-08-16T12:00:00Z' },
  { id: 'vac-y-2', patient_id: 'p-youssef', vaccine_schedule_id: 'v2', status: 'given', given_date: '2025-10-15', given_age_months: 2, notes: 'حرارة خفيفة 38.0 درجة وتلاشت', created_at: '2025-10-15T12:00:00Z' },
  { id: 'vac-y-3', patient_id: 'p-youssef', vaccine_schedule_id: 'v3', status: 'given', given_date: '2025-12-15', given_age_months: 4, notes: 'تطعيم سليم', created_at: '2025-12-15T12:00:00Z' },
  { id: 'vac-y-4', patient_id: 'p-youssef', vaccine_schedule_id: 'v4', status: 'given', given_date: '2026-02-15', given_age_months: 6, notes: 'تطعيم سليم', created_at: '2026-02-15T12:00:00Z' },
  { id: 'vac-y-5', patient_id: 'p-youssef', vaccine_schedule_id: 'v5', status: 'given', given_date: '2026-05-15', given_age_months: 9, notes: 'تطعيم سليم في موعده', created_at: '2026-05-15T12:00:00Z' },
  { id: 'vac-y-6', patient_id: 'p-youssef', vaccine_schedule_id: 'v6', status: 'pending', created_at: '2026-06-29T12:00:00Z' },
  { id: 'vac-y-7', patient_id: 'p-youssef', vaccine_schedule_id: 'v7', status: 'pending', created_at: '2026-06-29T12:00:00Z' },
  { id: 'vac-y-8', patient_id: 'p-youssef', vaccine_schedule_id: 'v8', status: 'pending', created_at: '2026-06-29T12:00:00Z' },
  { id: 'vac-y-9', patient_id: 'p-youssef', vaccine_schedule_id: 'v9', status: 'pending', created_at: '2026-06-29T12:00:00Z' },

  // Maria (2 years old): BCG (0m), 2m, 4m, 6m, 9m, 12m, 15m, 18m given. MMR 2nd (24m) pending/due.
  { id: 'vac-m-1', patient_id: 'p-maria', vaccine_schedule_id: 'v1', status: 'given', given_date: '2024-06-16', given_age_months: 0, created_at: '2024-06-16T12:00:00Z' },
  { id: 'vac-m-2', patient_id: 'p-maria', vaccine_schedule_id: 'v2', status: 'given', given_date: '2024-08-15', given_age_months: 2, created_at: '2024-08-15T12:00:00Z' },
  { id: 'vac-m-3', patient_id: 'p-maria', vaccine_schedule_id: 'v3', status: 'given', given_date: '2024-10-15', given_age_months: 4, created_at: '2024-10-15T12:00:00Z' },
  { id: 'vac-m-4', patient_id: 'p-maria', vaccine_schedule_id: 'v4', status: 'given', given_date: '2024-12-15', given_age_months: 6, created_at: '2024-12-15T12:00:00Z' },
  { id: 'vac-m-5', patient_id: 'p-maria', vaccine_schedule_id: 'v5', status: 'given', given_date: '2025-03-15', given_age_months: 9, created_at: '2025-03-15T12:00:00Z' },
  { id: 'vac-m-6', patient_id: 'p-maria', vaccine_schedule_id: 'v6', status: 'given', given_date: '2025-06-15', given_age_months: 12, created_at: '2025-06-15T12:00:00Z' },
  { id: 'vac-m-7', patient_id: 'p-maria', vaccine_schedule_id: 'v7', status: 'given', given_date: '2025-09-15', given_age_months: 15, created_at: '2025-09-15T12:00:00Z' },
  { id: 'vac-m-8', patient_id: 'p-maria', vaccine_schedule_id: 'v8', status: 'given', given_date: '2025-12-15', given_age_months: 18, created_at: '2025-12-15T12:00:00Z' },
  { id: 'vac-m-9', patient_id: 'p-maria', vaccine_schedule_id: 'v9', status: 'pending', created_at: '2026-06-29T12:00:00Z' },

  // Nour (3 months old): BCG (0m), Penta (2m) given. 4m, 6m, 9m, 12m, 15m, 18m, 24m pending.
  { id: 'vac-n-1', patient_id: 'p-nour', vaccine_schedule_id: 'v1', status: 'given', given_date: '2026-03-16', given_age_months: 0, created_at: '2026-03-16T12:00:00Z' },
  { id: 'vac-n-2', patient_id: 'p-nour', vaccine_schedule_id: 'v2', status: 'given', given_date: '2026-05-15', given_age_months: 2, created_at: '2026-05-15T12:00:00Z' },
  { id: 'vac-n-3', patient_id: 'p-nour', vaccine_schedule_id: 'v3', status: 'pending', created_at: '2026-06-29T12:00:00Z' },
  { id: 'vac-n-4', patient_id: 'p-nour', vaccine_schedule_id: 'v4', status: 'pending', created_at: '2026-06-29T12:00:00Z' },
  { id: 'vac-n-5', patient_id: 'p-nour', vaccine_schedule_id: 'v5', status: 'pending', created_at: '2026-06-29T12:00:00Z' },
  { id: 'vac-n-6', patient_id: 'p-nour', vaccine_schedule_id: 'v6', status: 'pending', created_at: '2026-06-29T12:00:00Z' },
  { id: 'vac-n-7', patient_id: 'p-nour', vaccine_schedule_id: 'v7', status: 'pending', created_at: '2026-06-29T12:00:00Z' },
  { id: 'vac-n-8', patient_id: 'p-nour', vaccine_schedule_id: 'v8', status: 'pending', created_at: '2026-06-29T12:00:00Z' },
  { id: 'vac-n-9', patient_id: 'p-nour', vaccine_schedule_id: 'v9', status: 'pending', created_at: '2026-06-29T12:00:00Z' },
]

export const initialPrescriptions: Prescription[] = [
  {
    id: 'pr-youssef-1',
    visit_id: 'v-youssef-1',
    patient_id: 'p-youssef',
    items: [
      { drug: 'باراسيتامول شراب', dose: '2.5 مل', frequency: 'عند اللزوم أو كل 6 ساعات', duration: '3 أيام', notes: 'خافض للحرارة ومسكن للآلام' },
      { drug: 'محلول ملحي نقط للأنف', dose: 'بختين في كل فتحة أنف', frequency: 'قبل الرضاعة وعند الحاجة', duration: '5 أيام', notes: 'لتسليك الأنف وتسهيل التنفس' },
      { drug: 'شراب موسع للشعب (سالبوتامول)', dose: '2 مل', frequency: 'مرتين يومياً', duration: '5 أيام', notes: 'في حالة زيادة الكحة أو السعال' }
    ],
    created_by: DOCTOR_ID,
    created_at: new Date().toISOString()
  }
]

export const initialDatabase: MockDatabase = {
  clinics: [
    { id: CLINIC_ID, name: 'Dr. Bola Pediatric Clinic', name_ar: 'عيادة د. بولا لطب الأطفال', created_at: '2026-06-15T12:00:00Z' }
  ],
  profiles: [
    { id: DOCTOR_ID, clinic_id: CLINIC_ID, full_name: 'د. بولا فتح الله عزيز', role: 'doctor', created_at: '2026-06-15T12:00:00Z' }
  ],
  vaccine_schedule: initialVaccineSchedule,
  patients: initialPatients,
  visits: initialVisits,
  patient_vaccinations: initialVaccinations,
  prescriptions: initialPrescriptions
}

export function loadDatabase(): MockDatabase {
  if (typeof window !== 'undefined') {
    const localData = localStorage.getItem('kids_care_mock_db')
    if (localData) {
      try {
        return JSON.parse(localData)
      } catch (e) {
        console.error('Error parsing localStorage mock DB', e)
      }
    }
    localStorage.setItem('kids_care_mock_db', JSON.stringify(initialDatabase))
    return initialDatabase
  }

  // Server-side: use globalThis to persist database in memory across requests/hots
  const g = globalThis as any
  if (!g.kids_care_mock_db) {
    g.kids_care_mock_db = JSON.parse(JSON.stringify(initialDatabase))
  }
  return g.kids_care_mock_db
}

export function saveDatabase(db: MockDatabase) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kids_care_mock_db', JSON.stringify(db))
    return
  }

  const g = globalThis as any
  g.kids_care_mock_db = db
}
