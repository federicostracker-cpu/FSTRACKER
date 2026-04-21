import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AreaRole } from '@/types'

const VALID_AREAS: AreaRole[] = ['rrhh', 'operaciones', 'calidad', 'capacitacion']

export async function GET(
  _req: NextRequest,
  { params }: { params: { hireId: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const role = user.user_metadata?.role as string
  const isAdmin = role === 'admin'

  const query = supabase
    .from('feedback_entries')
    .select('*')
    .eq('new_hire_id', params.hireId)

  if (!isAdmin && VALID_AREAS.includes(role as AreaRole)) {
    query.eq('area', role)
  } else if (!isAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Error al obtener feedback' }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { hireId: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const role = user.user_metadata?.role as string
  if (!VALID_AREAS.includes(role as AreaRole) && role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const body = await req.json()
  const { area, score_overall, feedback_fields, observations } = body

  if (!area || !VALID_AREAS.includes(area)) {
    return NextResponse.json({ error: 'Área inválida' }, { status: 400 })
  }

  // Non-admin users can only update their own area
  if (role !== 'admin' && area !== role) {
    return NextResponse.json({ error: 'No autorizado para esta área' }, { status: 403 })
  }

  if (score_overall != null && (score_overall < 1 || score_overall > 5)) {
    return NextResponse.json({ error: 'Puntaje debe ser entre 1 y 5' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('feedback_entries')
    .upsert({
      new_hire_id: params.hireId,
      area,
      submitted_by: user.id,
      submitted_at: new Date().toISOString(),
      score_overall,
      feedback_fields,
      observations: observations ?? null,
      status: 'completado',
    }, { onConflict: 'new_hire_id,area' })
    .select()
    .single()

  if (error) {
    console.error('Feedback upsert error:', error)
    return NextResponse.json({ error: 'Error al guardar feedback' }, { status: 500 })
  }

  return NextResponse.json({ data })
}
