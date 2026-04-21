import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const body = await req.json()
  const { full_name, dni, entry_date, position, site } = body

  if (!full_name || !dni || !entry_date || !position || !site) {
    return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 })
  }

  if (!['Olivos', 'Parque Patricios'].includes(site)) {
    return NextResponse.json({ error: 'Sede inválida' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('new_hires')
    .insert({ full_name, dni, entry_date, position, site, created_by: user.id })
    .select()
    .single()

  if (error) {
    console.error('New hire insert error:', error)
    return NextResponse.json({ error: 'Error al crear el ingresante' }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('new_hires')
    .select('*, feedback_entries(*)')
    .order('entry_date', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Error al obtener ingresantes' }, { status: 500 })
  }

  return NextResponse.json({ data })
}
