import { loadDatabase, saveDatabase } from './mockDb'

async function getDb(): Promise<any> {
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/mock-db')
      if (res.ok) {
        const db = await res.json()
        localStorage.setItem('kids_care_mock_db', JSON.stringify(db))
        return db
      }
    } catch (e) {
      console.warn('API route /api/mock-db failed, reading from localStorage', e)
    }
    const local = localStorage.getItem('kids_care_mock_db')
    return local ? JSON.parse(local) : loadDatabase()
  }
  return loadDatabase()
}

async function setDb(db: any): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      await fetch('/api/mock-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(db)
      })
    } catch (e) {
      console.warn('Failed to post to API route /api/mock-db, writing to localStorage only', e)
    }
    localStorage.setItem('kids_care_mock_db', JSON.stringify(db))
    return
  }
  saveDatabase(db)
}

export class MockQueryBuilder {
  private tableName: string
  private filters: Array<(item: any) => boolean> = []
  private orderField: string | null = null
  private orderAscending: boolean = true
  private limitCount: number | null = null
  private isSingle: boolean = false
  private action: 'select' | 'insert' | 'update' | 'delete' = 'select'
  private payload: any = null

  constructor(tableName: string) {
    this.tableName = tableName
  }

  select(fields?: string, options?: { count?: string; head?: boolean }) {
    this.action = 'select'
    return this
  }

  insert(payload: any) {
    this.action = 'insert'
    this.payload = payload
    return this
  }

  update(payload: any) {
    this.action = 'update'
    this.payload = payload
    return this
  }

  delete() {
    this.action = 'delete'
    return this
  }

  eq(field: string, value: any) {
    this.filters.push(item => item[field] === value)
    return this
  }

  neq(field: string, value: any) {
    this.filters.push(item => item[field] !== value)
    return this
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderField = field
    this.orderAscending = options?.ascending ?? true
    return this
  }

  limit(count: number) {
    this.limitCount = count
    return this
  }

  single() {
    this.isSingle = true
    return this
  }

  // Handle direct awaits
  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      const res = await this.execute()
      if (onfulfilled) return onfulfilled(res)
      return res
    } catch (e) {
      if (onrejected) return onrejected(e)
      throw e
    }
  }

  private async execute() {
    const db = await getDb()
    let data: any[] = db[this.tableName] || []

    if (this.action === 'select') {
      let result = [...data]
      
      // Apply filters
      for (const filter of this.filters) {
        result = result.filter(filter)
      }

      // Apply sorting
      if (this.orderField) {
        const field = this.orderField
        const asc = this.orderAscending
        result.sort((a, b) => {
          const valA = a[field]
          const valB = b[field]
          if (valA === undefined || valA === null) return 1
          if (valB === undefined || valB === null) return -1
          if (typeof valA === 'string') {
            return asc ? valA.localeCompare(valB) : valB.localeCompare(valA)
          }
          return asc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1)
        })
      }

      // Apply limit
      if (this.limitCount !== null) {
        result = result.slice(0, this.limitCount)
      }

      // Handle joins (relation populating)
      result = result.map(item => {
        const newItem = { ...item }
        
        // Join Patient
        if (newItem.patient_id) {
          const patient = db.patients.find((p: any) => p.id === newItem.patient_id)
          if (patient) {
            newItem.patients = {
              full_name: patient.full_name,
              patient_number: patient.patient_number,
              phone: patient.phone,
              phone2: patient.phone2,
              father_name: patient.father_name,
              date_of_birth: patient.date_of_birth,
              gender: patient.gender,
              ...patient
            }
          }
        }

        // Join Vaccine Schedule
        if (newItem.vaccine_schedule_id) {
          const schedule = db.vaccine_schedule.find((s: any) => s.id === newItem.vaccine_schedule_id)
          if (schedule) {
            newItem.vaccine_schedule = { ...schedule }
          }
        }

        // Join Prescriptions
        if (this.tableName === 'visits') {
          const prescriptions = db.prescriptions.filter((p: any) => p.visit_id === newItem.id)
          newItem.prescriptions = prescriptions
        }

        return newItem
      })

      if (this.isSingle) {
        return { data: result[0] || null, error: null, count: result.length }
      }

      return { data: result, error: null, count: result.length }
    }

    if (this.action === 'insert') {
      const newItems = Array.isArray(this.payload) ? this.payload : [this.payload]
      const inserted: any[] = []

      for (const item of newItems) {
        const newItem = {
          id: item.id || `mock-id-${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString(),
          ...item
        }

        if (this.tableName === 'patients' && !newItem.patient_number) {
          const lastNum = data.reduce((max, p) => {
            const num = parseInt(p.patient_number?.replace('P-', '') || '0')
            return num > max ? num : max
          }, 1000)
          newItem.patient_number = `P-${(lastNum + 1).toString().padStart(5, '0')}`
        }

        inserted.push(newItem)
        data.push(newItem)
      }

      if (this.tableName === 'patients') {
        const schedule = db.vaccine_schedule || []
        for (const patient of inserted) {
          const newVaccinations = schedule.map((v: any, index: number) => ({
            id: `vac-auto-${patient.id}-${v.id}-${index}`,
            patient_id: patient.id,
            vaccine_schedule_id: v.id,
            status: 'pending',
            created_at: new Date().toISOString()
          }))
          db.patient_vaccinations = [...(db.patient_vaccinations || []), ...newVaccinations]
        }
      }

      db[this.tableName] = data
      await setDb(db)

      const returnData = this.isSingle ? inserted[0] : inserted
      return { data: returnData, error: null }
    }

    if (this.action === 'update') {
      const updatedData = data.map(item => {
        let matches = true
        for (const filter of this.filters) {
          if (!filter(item)) {
            matches = false
            break
          }
        }
        if (matches) {
          return { ...item, ...this.payload, updated_at: new Date().toISOString() }
        }
        return item
      })

      db[this.tableName] = updatedData
      await setDb(db)

      const updatedItems = updatedData.filter(item => {
        let matches = true
        for (const filter of this.filters) {
          if (!filter(item)) {
            matches = false
            break
          }
        }
        return matches
      })

      const returnData = this.isSingle ? updatedItems[0] : updatedItems
      return { data: returnData, error: null }
    }

    if (this.action === 'delete') {
      const remainingData = data.filter(item => {
        let matches = true
        for (const filter of this.filters) {
          if (!filter(item)) {
            matches = false
            break
          }
        }
        return !matches
      })

      db[this.tableName] = remainingData
      await setDb(db)

      return { data: null, error: null }
    }

    return { data: null, error: null }
  }
}

export const mockStorage = {
  from(bucketName: string) {
    return {
      async upload(path: string, file: any) {
        return { data: { path, fullPath: `${bucketName}/${path}` }, error: null }
      },
      getPublicUrl(path: string) {
        const publicUrl = `https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400`
        return { data: { publicUrl } }
      },
      async remove(paths: string[]) {
        return { data: paths, error: null }
      }
    }
  }
}

export const mockAuth = {
  async getUser(token?: string) {
    return {
      data: {
        user: {
          id: 'mock-user-id',
          email: 'dr.bola@clinic.com',
          user_metadata: {},
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        }
      },
      error: null
    }
  },

  async getSession() {
    const { data: { user } } = await this.getUser()
    return {
      data: {
        session: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user
        }
      },
      error: null
    }
  },

  async signInWithPassword({ email, password }: any) {
    if (typeof document !== 'undefined') {
      document.cookie = 'sb-mock-session=mock-user-id; path=/; max-age=31536000'
    }
    return {
      data: {
        user: {
          id: 'mock-user-id',
          email: 'dr.bola@clinic.com'
        },
        session: {
          access_token: 'mock-access-token',
          user: {
            id: 'mock-user-id',
            email: 'dr.bola@clinic.com'
          }
        }
      },
      error: null
    }
  },

  async signOut() {
    if (typeof document !== 'undefined') {
      document.cookie = 'sb-mock-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
    return { error: null }
  }
}

export const mockClient = {
  auth: mockAuth,
  storage: mockStorage,
  from(tableName: string) {
    return new MockQueryBuilder(tableName)
  }
}
