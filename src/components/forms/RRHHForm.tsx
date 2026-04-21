'use client'

import { useState } from 'react'
import StarRating from '@/components/StarRating'
import { RRHHFields } from '@/types'

interface RRHHFormProps {
  initialValues?: Partial<RRHHFields>
  initialScore?: number
  initialObservations?: string
  onSubmit: (fields: RRHHFields, score: number, observations: string) => void
  loading?: boolean
  readonly?: boolean
}

const RADIO_OPTIONS = {
  siNoParcial: [
    { value: 'si', label: 'Sí' },
    { value: 'parcial', label: 'Parcial' },
    { value: 'no', label: 'No' },
  ],
  siNo: [
    { value: 'si', label: 'Sí' },
    { value: 'no', label: 'No' },
  ],
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
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border cursor-pointer transition-colors text-sm font-medium ${
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

export default function RRHHForm({
  initialValues,
  initialScore = 3,
  initialObservations = '',
  onSubmit,
  loading = false,
  readonly = false,
}: RRHHFormProps) {
  const [fields, setFields] = useState<RRHHFields>({
    documentacion_completa: initialValues?.documentacion_completa ?? 'si',
    legajo_correcto: initialValues?.legajo_correcto ?? 'si',
    firmo_contrato: initialValues?.firmo_contrato ?? 'si',
    actitud_ingreso: initialValues?.actitud_ingreso ?? 3,
  })
  const [score, setScore] = useState(initialScore)
  const [observations, setObservations] = useState(initialObservations)

  function set<K extends keyof RRHHFields>(key: K, value: RRHHFields[K]) {
    setFields(prev => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(fields, score, observations)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Documentación entregada */}
      <div>
        <label className="form-label">Documentación entregada completa</label>
        <RadioGroup
          name="documentacion_completa"
          value={fields.documentacion_completa}
          options={RADIO_OPTIONS.siNoParcial}
          onChange={v => set('documentacion_completa', v as RRHHFields['documentacion_completa'])}
          disabled={readonly || loading}
        />
      </div>

      {/* Legajo */}
      <div>
        <label className="form-label">Legajo armado correctamente</label>
        <RadioGroup
          name="legajo_correcto"
          value={fields.legajo_correcto}
          options={RADIO_OPTIONS.siNo}
          onChange={v => set('legajo_correcto', v as RRHHFields['legajo_correcto'])}
          disabled={readonly || loading}
        />
      </div>

      {/* Firmó contrato */}
      <div>
        <label className="form-label">Firmó contrato y recibo de sueldo</label>
        <RadioGroup
          name="firmo_contrato"
          value={fields.firmo_contrato}
          options={RADIO_OPTIONS.siNo}
          onChange={v => set('firmo_contrato', v as RRHHFields['firmo_contrato'])}
          disabled={readonly || loading}
        />
      </div>

      {/* Actitud ingreso */}
      <div>
        <label className="form-label">Actitud durante el proceso de ingreso</label>
        <StarRating
          value={fields.actitud_ingreso}
          onChange={v => set('actitud_ingreso', v)}
          readonly={readonly || loading}
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
          placeholder="Ingresá cualquier observación adicional sobre el ingresante…"
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
