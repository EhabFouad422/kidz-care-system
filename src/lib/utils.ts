import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInMonths, differenceInYears, format, parseISO } from 'date-fns'
import { ar } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calcAgeMonths(dob: string): number {
  return differenceInMonths(new Date(), parseISO(dob))
}

export function formatAge(dob: string): string {
  const months = calcAgeMonths(dob)
  if (months < 1) return 'أقل من شهر'
  if (months < 24) return `${months} شهر`
  const years = differenceInYears(new Date(), parseISO(dob))
  const remainingMonths = months - years * 12
  if (remainingMonths === 0) return `${years} سنة`
  return `${years} سنة و ${remainingMonths} شهر`
}

export function formatDate(date: string, fmt = 'dd/MM/yyyy'): string {
  try { return format(parseISO(date), fmt) } catch { return date }
}

export function formatDateAr(date: string): string {
  try { return format(parseISO(date), 'd MMMM yyyy', { locale: ar }) } catch { return date }
}

export function genderLabel(g: 'male' | 'female'): string {
  return g === 'male' ? 'ذكر' : 'أنثى'
}

export function birthModeLabel(mode?: string): string {
  if (!mode) return '-'
  return ({ normal: 'طبيعية', cs: 'قيصرية', assisted: 'مساعدة' } as Record<string,string>)[mode] ?? mode
}

export function vaccinationStatusColor(status: string): string {
  return ({
    given: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    missed: 'bg-red-100 text-red-700 border-red-200',
    delayed: 'bg-orange-100 text-orange-700 border-orange-200',
  } as Record<string,string>)[status] ?? 'bg-gray-100 text-gray-700'
}

export function vaccinationStatusLabel(status: string): string {
  return ({
    given: 'تم التطعيم',
    pending: 'لم يتم بعد',
    missed: 'فائت',
    delayed: 'مؤجل',
  } as Record<string,string>)[status] ?? status
}
