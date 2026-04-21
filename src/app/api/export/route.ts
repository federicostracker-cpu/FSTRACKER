import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { NewHireWithFeedback, AreaRole } from '@/types'
import { escapeCSV, formatDate } from '@/lib/utils'

const AREAS: AreaRole[] = ['rrhh', 'operaciones', 'calidad', 'capacitacion']
const AREA_LABELS: Record<AreaRole, string> = {
  rrhh: 'RRHH',
  operaciones: 'Operaciones',
  calidad: 'Calidad',
  capacitacion: 'Capacitación',
}

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const hireId = searchParams.get('hire_id')

  let query = supabase
    .from('new_hires')
    .select('*, feedback_entries(*)')
    .order('entry_date', { ascending: false })

  if (hireId) {
    query = query.eq('id', hireId)
  }

  const { data: hires, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Error al obtener datos' }, { status: 500 })
  }

  const rows: string[] = []

  // Build header
  const headers = [
    'Nombre',
    'DNI',
    'Fecha de ingreso',
    'Puesto',
    'Sede',
    'Estado general',
    ...AREAS.flatMap(area => [
      `${AREA_LABELS[area]} - Estado`,
      `${AREA_LABELS[area]} - Puntaje`,
      `${AREA_LABELS[area]} - Observaciones`,
    ]),
  ]
  rows.push(headers.map(escapeCSV).join(','))

  // Build data rows
  for (const hire of (hires as NewHireWithFeedback[])) {
    const entries = hire.feedback_entries ?? []

    const allCompleted = AREAS.every(a =>
      entries.find(e => e.area === a)?.status === 'completado'
    )
    const anyStarted = AREAS.some(a =>
      entries.find(e => e.area === a)
    )

    const overallStatus = allCompleted
      ? 'Completo'
      : anyStarted
      ? 'Parcial'
      : 'Sin iniciar'

    const areaData = AREAS.flatMap(area => {
      const entry = entries.find(e => e.area === area)
      if (!entry) return ['Sin iniciar', '', '']
      return [
        entry.status === 'completado' ? 'Completado' : 'Pendiente',
        entry.score_overall?.toString() ?? '',
        entry.observations ?? '',
      ]
    })

    const row = [
      hire.full_name,
      hire.dni,
      formatDate(hire.entry_date),
      hire.position,
      hire.site,
      overallStatus,
      ...areaData,
    ]

    rows.push(row.map(escapeCSV).join(','))
  }

  const csv = '﻿' + rows.join('\r\n') // BOM for Excel UTF-8 compatibility

  const filename = hireId
    ? `feedback-${hireId}.csv`
    : `feedback-ingresos-${new Date().toISOString().split('T')[0]}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
