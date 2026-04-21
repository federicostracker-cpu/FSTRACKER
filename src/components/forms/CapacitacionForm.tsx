'use client'

import { useState } from 'react'
import StarRating from '@/components/StarRating'
import { CapacitacionFields } from '@/types'

interface CapacitacionFormProps {
  initialValues?: Partial<CapacitacionFields>
  initialScore?: number
  initialObservations?: string
  onSubmit: (fields: CapacitacionFields, score: number, observations: string) => void
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

export default function CapacitacionForm({
  initialValues,
  initialScore = 3,
  initialObservations = '',
  onSubmit,
  loading = false,
  readonly = false,
}: CapacitacionFormProps) {
  const [fields, setFields] = useState<CapacitacionFields>({
    asistencia: initialValues?.asistencia ?? 100,
    nota_examen: initialValues?.nota_examen ?? 7,
    participacion: initialValues?.participacion ?? 3,
    aprobo_practica: initialValues?.aprobo_practica ?? 'pendiente',
  })
  const [score, setScore] = useState(initialScore)
  const [observations, setObservations] = useState(initialObservations)

  function set<K extends keyof CapacitacionFields>(key: K, value: CapacitacionFields[K]) {
    setFields(prev => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(fields, score, observations)
  }

  const asistenciaColor =
    fields.asistencia >= 80
      ? 'text-green-400'
      : fields.asistencia >= 60
      ? 'text-yellow-400'
      : 'text-red-400'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Asistencia al curso */}
      <div>
        <label className="form-label">
          Asistencia al curso de inducción
          <span className={`ml-2 font-bold ${asistenciaColor}`}>{fields.asistencia}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={fields.asistencia}
          onChange={e => set('asistencia', Number(e.target.value))}
          disabled={readonly || loading}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500 disabled:opacity-60 mt-2"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Nota del examen */}
      <div>
        <label className="form-label">Nota del examen de inducción (0–10)</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={10}
            step={0.5}
            value={fields.nota_examen}
            onChange={e => set('nota_examen', Number(e.target.value))}
            disabled={readonly || loading}
            className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500 disabled:opacity-60"
          />
          <div className="w-14 text-center">
            <span
              className={`text-2xl font-bold ${
                fields.nota_examen >= 7
                  ? 'text-green-400'
                  : fields.nota_examen >= 4
                  ? 'text-yellow-400'
                  : 'text-red-400'
              }`}
            >
              {fields.nota_examen}
            </span>
            <span className="text-slate-500 text-xs block">/10</span>
          </div>
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>

      {/* Participación en clase */}
      <div>
        <label className="form-label">Participación en clase</label>
        <StarRating
          value={fields.participacion}
          onChange={v => set('participacion', v)}
          readonly={readonly || loading}
        />
      </div>

      {/* Aprobó evaluación práctica */}
      <div>
        <label className="form-label">Aprobó la evaluación práctica</label>
        <RadioGroup
          name="aprobo_practica"
          value={fields.aprobo_practica}
          options={[
            { value: 'si', label: 'Sí' },
            { value: 'no', label: 'No' },
            { value: 'pendiente', label: 'Pendiente' },
          ]}
          onChange={v => set('aprobo_practica', v as CapacitacionFields['aprobo_practica'])}
          disabled={readonly || loading}
        />
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
          placeholder="Ingresá observaciones sobre el proceso de capacitación e inducción…"
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
