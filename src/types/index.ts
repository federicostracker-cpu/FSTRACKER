export type UserRole = 'admin' | 'rrhh' | 'operaciones' | 'calidad' | 'capacitacion'
export type AreaRole = 'rrhh' | 'operaciones' | 'calidad' | 'capacitacion'
export type FeedbackStatus = 'pendiente' | 'completado'
export type Site = 'Olivos' | 'Parque Patricios'

export interface NewHire {
  id: string
  full_name: string
  dni: string
  entry_date: string
  position: string
  site: Site
  created_at: string
  created_by: string | null
}

export interface FeedbackEntry {
  id: string
  new_hire_id: string
  area: AreaRole
  submitted_by: string | null
  submitted_at: string | null
  score_overall: number | null
  feedback_fields: Record<string, unknown> | null
  observations: string | null
  status: FeedbackStatus
}

export interface NewHireWithFeedback extends NewHire {
  feedback_entries: FeedbackEntry[]
}

// ── RRHH ───────────────────────────────────────────────────────
export interface RRHHFields {
  documentacion_completa: 'si' | 'no' | 'parcial'
  legajo_correcto: 'si' | 'no'
  firmo_contrato: 'si' | 'no'
  actitud_ingreso: number
}

// ── OPERACIONES ────────────────────────────────────────────────
export interface OperacionesFields {
  presentacion_imagen: number
  puntualidad: 'si' | 'no'
  comprension_tareas: number
  relacion_equipo: number
  requiere_seguimiento: 'si' | 'no'
  motivo_seguimiento?: string
}

// ── CALIDAD ────────────────────────────────────────────────────
export interface CalidadFields {
  comprension_metricas: number
  actitud_monitoreo: number
  estandares_minimos: 'si' | 'no' | 'no_aplica'
  riesgo_abandono: 'bajo' | 'medio' | 'alto'
}

// ── CAPACITACIÓN ───────────────────────────────────────────────
export interface CapacitacionFields {
  asistencia: number
  nota_examen: number
  participacion: number
  aprobo_practica: 'si' | 'no' | 'pendiente'
}

export type AnyFeedbackFields =
  | RRHHFields
  | OperacionesFields
  | CalidadFields
  | CapacitacionFields

export const AREA_LABELS: Record<AreaRole, string> = {
  rrhh: 'RRHH',
  operaciones: 'Operaciones',
  calidad: 'Calidad',
  capacitacion: 'Capacitación',
}

export const AREA_COLORS: Record<AreaRole, string> = {
  rrhh: 'blue',
  operaciones: 'green',
  calidad: 'orange',
  capacitacion: 'purple',
}
