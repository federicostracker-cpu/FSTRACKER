import { AreaRole, AREA_LABELS } from '@/types'

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getAreaLabel(area: AreaRole): string {
  return AREA_LABELS[area] ?? area
}

export function getAreaColorClass(area: AreaRole): string {
  const map: Record<AreaRole, string> = {
    rrhh: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    operaciones: 'bg-green-500/20 text-green-300 border-green-500/30',
    calidad: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    capacitacion: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  }
  return map[area] ?? 'bg-slate-700 text-slate-300'
}

export function getAreaDotClass(area: AreaRole): string {
  const map: Record<AreaRole, string> = {
    rrhh: 'bg-blue-400',
    operaciones: 'bg-green-400',
    calidad: 'bg-orange-400',
    capacitacion: 'bg-purple-400',
  }
  return map[area] ?? 'bg-slate-400'
}

export function getStatusBadgeClass(status: 'pendiente' | 'completado' | 'sin_enviar'): string {
  const map = {
    completado: 'bg-green-500/20 text-green-300 border border-green-500/30',
    pendiente: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    sin_enviar: 'bg-slate-700/60 text-slate-400 border border-slate-600/30',
  }
  return map[status]
}

export function escapeCSV(value: unknown): string {
  const str = value == null ? '' : String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}
