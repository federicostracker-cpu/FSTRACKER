import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import StarRating from '@/components/StarRating'
import AreaBadge from '@/components/AreaBadge'
import { NewHireWithFeedback, AreaRole, FeedbackEntry } from '@/types'
import { formatDate, formatDateTime, getStatusBadgeClass, getAreaLabel } from '@/lib/utils'
import { ArrowLeft, Calendar, MapPin, User, Briefcase, FileText } from 'lucide-react'

const AREAS: AreaRole[] = ['rrhh', 'operaciones', 'calidad', 'capacitacion']

function FieldValue({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm text-slate-200 font-medium">{value ?? '—'}</span>
    </div>
  )
}

function RRHHSummary({ fields }: { fields: Record<string, unknown> }) {
  const map: Record<string, string> = { si: 'Sí', no: 'No', parcial: 'Parcial' }
  return (
    <div className="grid grid-cols-2 gap-3">
      <FieldValue label="Documentación completa" value={map[fields.documentacion_completa as string] ?? '—'} />
      <FieldValue label="Legajo correcto" value={map[fields.legajo_correcto as string] ?? '—'} />
      <FieldValue label="Firmó contrato" value={map[fields.firmo_contrato as string] ?? '—'} />
      <FieldValue
        label="Actitud ingreso"
        value={
          <StarRating value={Number(fields.actitud_ingreso) || 0} readonly size="sm" />
        }
      />
    </div>
  )
}

function OperacionesSummary({ fields }: { fields: Record<string, unknown> }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <FieldValue
        label="Presentación e imagen"
        value={<StarRating value={Number(fields.presentacion_imagen) || 0} readonly size="sm" />}
      />
      <FieldValue label="Puntualidad" value={fields.puntualidad === 'si' ? 'Sí' : 'No'} />
      <FieldValue
        label="Comprensión de tareas"
        value={<StarRating value={Number(fields.comprension_tareas) || 0} readonly size="sm" />}
      />
      <FieldValue
        label="Relación con el equipo"
        value={<StarRating value={Number(fields.relacion_equipo) || 0} readonly size="sm" />}
      />
      <FieldValue
        label="Requiere seguimiento"
        value={fields.requiere_seguimiento === 'si' ? 'Sí' : 'No'}
      />
      {fields.requiere_seguimiento === 'si' && Boolean(fields.motivo_seguimiento) && (
        <FieldValue label="Motivo" value={String(fields.motivo_seguimiento)} />
      )}
    </div>
  )
}

function CalidadSummary({ fields }: { fields: Record<string, unknown> }) {
  const riesgoColors: Record<string, string> = {
    bajo: 'text-green-400',
    medio: 'text-yellow-400',
    alto: 'text-red-400',
  }
  const esMap: Record<string, string> = { si: 'Sí', no: 'No', no_aplica: 'No aplica' }
  return (
    <div className="grid grid-cols-2 gap-3">
      <FieldValue
        label="Comprensión de métricas"
        value={<StarRating value={Number(fields.comprension_metricas) || 0} readonly size="sm" />}
      />
      <FieldValue
        label="Actitud frente al monitoreo"
        value={<StarRating value={Number(fields.actitud_monitoreo) || 0} readonly size="sm" />}
      />
      <FieldValue
        label="Estándares mínimos"
        value={esMap[fields.estandares_minimos as string] ?? '—'}
      />
      <FieldValue
        label="Riesgo de abandono"
        value={
          <span className={`capitalize font-semibold ${riesgoColors[fields.riesgo_abandono as string] ?? ''}`}>
            {String(fields.riesgo_abandono ?? '—')}
          </span>
        }
      />
    </div>
  )
}

function CapacitacionSummary({ fields }: { fields: Record<string, unknown> }) {
  const pracMap: Record<string, string> = { si: 'Sí', no: 'No', pendiente: 'Pendiente' }
  return (
    <div className="grid grid-cols-2 gap-3">
      <FieldValue label="Asistencia al curso" value={`${fields.asistencia ?? '—'}%`} />
      <FieldValue label="Nota del examen" value={`${fields.nota_examen ?? '—'} / 10`} />
      <FieldValue
        label="Participación en clase"
        value={<StarRating value={Number(fields.participacion) || 0} readonly size="sm" />}
      />
      <FieldValue
        label="Aprobó evaluación práctica"
        value={pracMap[fields.aprobo_practica as string] ?? '—'}
      />
    </div>
  )
}

function FeedbackCard({ entry, area }: { entry: FeedbackEntry | undefined; area: AreaRole }) {
  if (!entry || entry.status === 'pendiente' && !entry.feedback_fields) {
    return (
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <AreaBadge area={area} />
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            entry ? getStatusBadgeClass('pendiente') : getStatusBadgeClass('sin_enviar')
          }`}>
            {entry ? 'Pendiente' : 'Sin iniciar'}
          </span>
        </div>
        <p className="text-slate-500 text-sm italic">
          {getAreaLabel(area)} aún no envió su feedback.
        </p>
      </div>
    )
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <AreaBadge area={area} />
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(entry.status)}`}>
          {entry.status === 'completado' ? 'Completado' : 'Pendiente'}
        </span>
      </div>

      {/* Area-specific fields */}
      {entry.feedback_fields && (
        <div className="mb-4">
          {area === 'rrhh' && <RRHHSummary fields={entry.feedback_fields} />}
          {area === 'operaciones' && <OperacionesSummary fields={entry.feedback_fields} />}
          {area === 'calidad' && <CalidadSummary fields={entry.feedback_fields} />}
          {area === 'capacitacion' && <CapacitacionSummary fields={entry.feedback_fields} />}
        </div>
      )}

      {/* Overall score */}
      {entry.score_overall != null && (
        <div className="mb-3">
          <span className="text-xs text-slate-500 block mb-1">Puntaje general</span>
          <StarRating value={entry.score_overall} readonly size="sm" />
        </div>
      )}

      {/* Observations */}
      {entry.observations && (
        <div className="mt-3 p-3 bg-slate-700/30 rounded-lg">
          <span className="text-xs text-slate-500 block mb-1">Observaciones</span>
          <p className="text-sm text-slate-300 leading-relaxed">{entry.observations}</p>
        </div>
      )}

      {/* Footer */}
      {entry.submitted_at && (
        <div className="mt-3 pt-3 border-t border-slate-700/40 text-xs text-slate-500">
          Enviado el {formatDateTime(entry.submitted_at)}
        </div>
      )}
    </div>
  )
}

export default async function HireSummaryPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') {
    redirect('/feedback')
  }

  const { data: hire, error } = await supabase
    .from('new_hires')
    .select(`*, feedback_entries (*)`)
    .eq('id', params.id)
    .single()

  if (error || !hire) {
    notFound()
  }

  const hireData = hire as NewHireWithFeedback

  return (
    <div className="min-h-screen bg-navy-900">
      <Header role="admin" userName={user.user_metadata?.name} userEmail={user.email} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          Volver al dashboard
        </Link>

        {/* Hire header card */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-orange-500/15 rounded-full flex items-center justify-center">
                  <User size={20} className="text-orange-400" />
                </div>
                <h1 className="text-xl font-bold text-white">{hireData.full_name}</h1>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3 pl-1">
                <div className="flex items-center gap-1.5 text-sm text-slate-400">
                  <FileText size={14} className="text-slate-500" />
                  DNI {hireData.dni}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-400">
                  <Calendar size={14} className="text-slate-500" />
                  Ingreso: {formatDate(hireData.entry_date)}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-400">
                  <Briefcase size={14} className="text-slate-500" />
                  {hireData.position}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-400">
                  <MapPin size={14} className="text-slate-500" />
                  {hireData.site}
                </div>
              </div>
            </div>
            <Link
              href={`/api/export?hire_id=${hireData.id}`}
              className="btn-secondary text-sm flex items-center gap-1.5 whitespace-nowrap self-start"
            >
              Exportar CSV
            </Link>
          </div>
        </div>

        {/* Feedback cards grid */}
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Feedback por área
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {AREAS.map(area => {
            const entry = hireData.feedback_entries?.find(f => f.area === area)
            return <FeedbackCard key={area} entry={entry} area={area} />
          })}
        </div>
      </main>
    </div>
  )
}
