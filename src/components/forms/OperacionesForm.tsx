'use client'

import { useState } from 'react'
import StarRating from '@/components/StarRating'
import { OperacionesFields } from '@/types'

interface OperacionesFormProps {
  initialValues?: Partial<OperacionesFields>
  initialScore?: number
  initialObservations?: string
  onSubmit: (fields: OperacionesFields, score: number, observations: string) => void
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

export default function OperacionesForm({
  initialValues,
  initialScore = 3,
  initialObservations = '',
  onSubmit,
  loading = false,
  readonly = false,
}: OperacionesFormProps) {
  const [fields, setFields] = useState<OperacionesFields>({
    presentacion_imagen: initialValues?.presentacion_imagen ?? 3,
    puntualidad: initialValues?.puntualidad ?? 'si',
    comprension_tareas: initialValues?.comprension_tareas ?? 3,
    relacion_equipo: initialValues?.relacion_equipo ?? 3,
    requiere_seguimiento: initialValues?.requiere_seguimiento ?? 'no',
    motivo_seguimiento: initialValues?.motivo_seguimiento ?? '',
  })
  const [score, setScore] = useState(initialScore)
  const [observations, setObservations] = useState(initialObservations)

  function set<K extends keyof OperacionesFields>(key: K, value: OperacionesFields[K]) {
    setFields(prev => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(fields, score, observations)
  }

  const siNo = [
    { value: 'si', label: 'Sí' },
    { value: 'no', label: 'No' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Presentación e imagen */}
      <div>
        <label className="form-label">Presentación e imagen personal</label>
        <StarRating
          value={fields.presentacion_imagen}
          onChange={v => set('presentacion_imagen', v)}
          readonly={readonly || loading}
        />
      </div>

      {/* Puntualidad */}
      <div>
        <label className="form-label">Puntualidad primer día</label>
        <RadioGroup
          name="puntualidad"
          value={fields.puntualidad}
          options={siNo}
          onChange={v => set('puntualidad', v as OperacionesFields['puntualidad'])}
          disabled={readonly || loading}
        />
      </div>

      {/* Comprensión de tareas */}
      <div>
        <label className="form-label">Comprensión de tareas básicas</label>
        <StarRating
          value={fields.comprension_tareas}
          onChange={v => set('comprension_tareas', v)}
          readonly={readonly || loading}
        />
      </div>

      {/* Relación con el equipo */}
      <div>
        <label className="form-label">Relación con el equipo</label>
        <StarRating
          value={fields.relacion_equipo}
          onChange={v => set('relacion_equipo', v)}
          readonly={readonly || loading}
        />
      </div>

      {/* Requiere seguimiento */}
      <div>
        <label className="form-label">¿Requiere seguimiento especial?</label>
        <RadioGroup
          name="requiere_seguimiento"
          value={fields.requiere_seguimiento}
          options={siNo}
          onChange={v => set('requiere_seguimiento', v as OperacionesFields['requiere_seguimiento'])}
          disabled={readonly || loading}
        />

        {fields.requiere_seguimiento === 'si' && (
          <div className="mt-3">
            <label className="form-label">Motivo del seguimiento</label>
            <input
              type="text"
              value={fields.motivo_seguimiento ?? ''}
              onChange={e => set('motivo_seguimiento', e.target.value)}
              disabled={readonly || loading}
              placeholder="Describí el motivo del seguimiento especial…"
              className="form-input"
              required={fields.requiere_seguimiento === 'si'}
            />
          </div>
        )}
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
          placeholder="Ingresá observaciones adicionales sobre el desempeño operativo…"
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
