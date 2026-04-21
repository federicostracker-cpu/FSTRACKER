'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, CheckCircle2, Edit3, Calendar, MapPin, Briefcase, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/Header'
import AreaBadge from '@/components/AreaBadge'
import RRHHForm from '@/components/forms/RRHHForm'
import OperacionesForm from '@/components/forms/OperacionesForm'
import CalidadForm from '@/components/forms/CalidadForm'
import CapacitacionForm from '@/components/forms/CapacitacionForm'
import {
  AreaRole,
  FeedbackEntry,
  NewHire,
  RRHHFields,
  OperacionesFields,
  CalidadFields,
  CapacitacionFields,
  AREA_LABELS,
} from '@/types'
import { formatDate } from '@/lib/utils'

type AnyFields = RRHHFields | OperacionesFields | CalidadFields | CapacitacionFields

export default function FeedbackFormPage() {
  const router = useRouter()
  const params = useParams()
  const hireId = params.hireId as string

  const supabase = createClient()

  const [user, setUser] = useState<{ id: string; email?: string; role: AreaRole; name?: string } | null>(null)
  const [hire, setHire] = useState<NewHire | null>(null)
  const [entry, setEntry] = useState<FeedbackEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/login')
        return
      }

      const role = authUser.user_metadata?.role as AreaRole
      if (!['rrhh', 'operaciones', 'calidad', 'capacitacion'].includes(role)) {
        router.push('/feedback')
        return
      }

      setUser({
        id: authUser.id,
        email: authUser.email,
        role,
        name: authUser.user_metadata?.name,
      })

      // Load hire
      const { data: hireData, error: hireError } = await supabase
        .from('new_hires')
        .select('*')
        .eq('id', hireId)
        .single()

      if (hireError || !hireData) {
        toast.error('Ingresante no encontrado.')
        router.push('/feedback')
        return
      }

      setHire(hireData as NewHire)

      // Load feedback entry for this area
      const { data: entryData } = await supabase
        .from('feedback_entries')
        .select('*')
        .eq('new_hire_id', hireId)
        .eq('area', role)
        .single()

      setEntry(entryData as FeedbackEntry | null)
      setLoading(false)
    }

    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hireId])

  async function handleSubmit(fields: AnyFields, score: number, observations: string) {
    if (!user || !hire) return
    setSaving(true)

    try {
      const payload = {
        new_hire_id: hireId,
        area: user.role,
        submitted_by: user.id,
        submitted_at: new Date().toISOString(),
        score_overall: score,
        feedback_fields: fields,
        observations: observations.trim() || null,
        status: 'completado' as const,
      }

      const { data, error } = await supabase
        .from('feedback_entries')
        .upsert(payload, { onConflict: 'new_hire_id,area' })
        .select()
        .single()

      if (error) {
        console.error('Upsert error:', error)
        toast.error('Error al guardar el feedback. Intentá nuevamente.')
        return
      }

      setEntry(data as FeedbackEntry)
      setEditing(false)
      toast.success('Feedback enviado exitosamente')
    } catch (err) {
      console.error(err)
      toast.error('Error inesperado. Intentá nuevamente.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || !hire) return null

  const isCompleted = entry?.status === 'completado'

  const existingFields = entry?.feedback_fields as Record<string, unknown> | null

  return (
    <div className="min-h-screen bg-navy-900">
      <Header role={user.role} userName={user.name} userEmail={user.email} />

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <Link
          href="/feedback"
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          Volver a mis feedbacks
        </Link>

        {/* Hire info card */}
        <div className="card p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-orange-500/15 rounded-full flex items-center justify-center shrink-0">
              <User size={16} className="text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-white leading-tight">{hire.full_name}</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar size={11} /> Ingreso: {formatDate(hire.entry_date)}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Briefcase size={11} /> {hire.position}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin size={11} /> {hire.site}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form card */}
        <div className="card p-6 shadow-xl shadow-black/20">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <AreaBadge area={user.role} />
              <span className="text-slate-400 text-sm">Formulario de evaluación</span>
            </div>
            {isCompleted && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
              >
                <Edit3 size={14} />
                Editar
              </button>
            )}
          </div>

          {/* Completed banner */}
          {isCompleted && !editing && (
            <div className="flex items-center gap-2.5 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 mb-6">
              <CheckCircle2 size={18} className="text-green-400 shrink-0" />
              <div>
                <div className="text-green-300 font-semibold text-sm">Ya completado</div>
                <div className="text-green-400/70 text-xs">
                  El feedback de {AREA_LABELS[user.role]} ya fue enviado para este ingresante.
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          {user.role === 'rrhh' && (
            <RRHHForm
              initialValues={isCompleted ? (existingFields as Partial<RRHHFields>) : undefined}
              initialScore={entry?.score_overall ?? 3}
              initialObservations={entry?.observations ?? ''}
              onSubmit={(f, s, o) => handleSubmit(f, s, o)}
              loading={saving}
              readonly={isCompleted && !editing}
            />
          )}

          {user.role === 'operaciones' && (
            <OperacionesForm
              initialValues={isCompleted ? (existingFields as Partial<OperacionesFields>) : undefined}
              initialScore={entry?.score_overall ?? 3}
              initialObservations={entry?.observations ?? ''}
              onSubmit={(f, s, o) => handleSubmit(f, s, o)}
              loading={saving}
              readonly={isCompleted && !editing}
            />
          )}

          {user.role === 'calidad' && (
            <CalidadForm
              initialValues={isCompleted ? (existingFields as Partial<CalidadFields>) : undefined}
              initialScore={entry?.score_overall ?? 3}
              initialObservations={entry?.observations ?? ''}
              onSubmit={(f, s, o) => handleSubmit(f, s, o)}
              loading={saving}
              readonly={isCompleted && !editing}
            />
          )}

          {user.role === 'capacitacion' && (
            <CapacitacionForm
              initialValues={isCompleted ? (existingFields as Partial<CapacitacionFields>) : undefined}
              initialScore={entry?.score_overall ?? 3}
              initialObservations={entry?.observations ?? ''}
              onSubmit={(f, s, o) => handleSubmit(f, s, o)}
              loading={saving}
              readonly={isCompleted && !editing}
            />
          )}

          {isCompleted && editing && (
            <button
              onClick={() => setEditing(false)}
              className="btn-ghost w-full mt-3 text-slate-500"
            >
              Cancelar edición
            </button>
          )}
        </div>

        {/* Void spacer */}
        <div className="h-8" />
      </main>
    </div>
  )
}
