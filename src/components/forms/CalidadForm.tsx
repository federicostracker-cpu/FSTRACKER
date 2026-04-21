'use client'

import { useState } from 'react'
import StarRating from '@/components/StarRating'
import { CalidadFields } from '@/types'

interface CalidadFormProps {
  initialValues?: Partial<CalidadFields>
  initialScore?: number
  initialObservations?: string
  onSubmit: (fields: CalidadFields, score: number, observations: string) => void
  loading?: boolean
  readonly?: boolean
}

function RadioGroup({
  name,
  value,
  options,
  onChange,
  disabled,
}: {
  name: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <label
          key={opt.value}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${
            value === opt.value
              ? 'bg-orange-500/20 border-orange-500/50 text-orange-200'
              : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
          } ${disabled ? 'opacity-60 cursor-default' : ''}`}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            disabled={disabled}
            className="sr-only"
          />
          <span
            className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
              value === opt.value ? 'border-orange-400' : 'border-slate-500'
            }`}
          >
            {value === opt.value && (
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            )}
          </span>
          {opt.label}
        </label>
      ))}
    </div>
  )
}

export default function CalidadForm({
  initialValues,
  initialScore = 3,
  initialObservations = '',
  onSubmit,
  loading = false,
  readonly = false,
}: CalidadFormProps) {
  const [fields, setFields] = useState<CalidadFields>({
    comprension_metricas: initialValues?.comprension_metricas ?? 3,
    actitud_monitoreo: initialValues?.actitud_monitoreo ?? 3,
    estandares_minimos: initialValues?.estandares_minimos ?? 'si',
    riesgo_abandono: initialValues?.riesgo_abandono ?? 'bajo',
  })
  const [score, setScore] = useState(initialScore)
  const [observations, setObservations] = useState(initialObservations)

  function set<K extends keyof CalidadFields>(key: K, value: CalidadFields[K]) {
    setFields(prev => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(fields, score, observations)
  }

  const riesgoColors: Record<string, string> = {
    bajo: 'bg-green-500/20 border-green-500/50 text-green-200',
    medio: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200',
    alto: 'bg-red-500/20 border-red-500/50 text-red-200',
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Comprensión métricas */}
      <div>
        <label className="form-label">Comprensión de métricas de calidad</label>
        <StarRating
          value={fields.comprension_metricas}
          onChange={v => set('comprension_metricas', v)}
          readonly={readonly || loading}
        />
      </div>

      {/* Actitud frente al monitoreo */}
      <div>
        <label className="form-label">Actitud frente al monitoreo</label>
        <StarRating
          value={fields.actitud_monitoreo}
          onChange={v => set('actitud_monitoreo', v)}
          readonly={readonly || loading}
        />
      </div>

      {/* Estándares mínimos */}
      <div>
        <label className="form-label">
          Cumplió con los estándares mínimos en primeras llamadas
        </label>
        <RadioGroup
          name="estandares_minimos"
          value={fields.estandares_minimos}
          options={[
            { value: 'si', label: 'Sí' },
            { value: 'no', label: 'No' },
            { value: 'no_aplica', label: 'No aplica' },
          ]}
          onChange={v => set('estandares_minimos', v as CalidadFields['estandares_minimos'])}
          disabled={readonly || loading}
        />
      </div>

      {/* Riesgo de abandono */}
      <div>
        <label className="form-label">Riesgo de abandono temprano</label>
        <div className="flex flex-wrap gap-2">
          {(['bajo', 'medio', 'alto'] as const).map(nivel => (
            <label
              key={nivel}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border cursor-pointer text-sm font-medium capitalize transition-colors ${
                fields.riesgo_abandono === nivel
                  ? riesgoColors[nivel]
                  : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
              } ${(readonly || loading) ? 'opacity-60 cursor-default' : ''}`}
            >
              <input
                type="radio"
                name="riesgo_abandono"
                value={nivel}
                checked={fields.riesgo_abandono === nivel}
                onChange={() => set('riesgo_abandono', nivel)}
                disabled={readonly || loading}
                className="sr-only"
              />
              <span
                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                  fields.riesgo_abandono === nivel
                    ? nivel === 'bajo' ? 'border-green-400' : nivel === 'medio' ? 'border-yellow-400' : 'border-red-400'
                    : 'border-slate-500'
                }`}
              >
                {fields.riesgo_abandono === nivel && (
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    nivel === 'bajo' ? 'bg-green-400' : nivel === 'medio' ? 'bg-yellow-400' : 'bg-red-400'
                  }`} />
                )}
              </span>
              {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <hr className="border-slate-700/50" />

      {/* Puntaje general */}
      <div>
        <label className="form-label">Puntaje general del ingresante</label>
        <StarRating
          value={score}
          onChange={setScore}
          readonly={readonly || loading}
          size="lg"
        />
      </div>

      {/* Observaciones */}
      <div>
        <label className="form-label">Observaciones</label>
        <textarea
          value={observations}
          onChange={e => setObservations(e.target.value)}
          disabled={readonly || loading}
          rows={4}
          placeholder="Ingresá observaciones sobre calidad de atención y desempeño en llamadas…"
          className="form-input resize-none"
        />
      </div>

      {!readonly && (
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Guardando…
            </span>
          ) : (
            'Enviar feedback'
          )}
        </button>
      )}
    </form>
  )
}
