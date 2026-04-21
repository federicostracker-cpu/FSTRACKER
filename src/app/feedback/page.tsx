import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import AreaBadge from '@/components/AreaBadge'
import { AreaRole, AREA_LABELS } from '@/types'
import { formatDate, getStatusBadgeClass } from '@/lib/utils'
import { ClipboardList, CheckCircle2 } from 'lucide-react'

export default async function FeedbackListPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const role = user.user_metadata?.role as AreaRole | 'admin'
  if (role === 'admin') redirect('/dashboard')
  if (!['rrhh', 'operaciones', 'calidad', 'capacitacion'].includes(role)) redirect('/login')

  const area = role as AreaRole

  // Get all feedback entries for this area, with new hire data
  const { data: entries, error } = await supabase
    .from('feedback_entries')
    .select(`
      *,
      new_hires (*)
    `)
    .eq('area', area)
    .order('status', { ascending: false }) // pendiente sorts after completado descending → pendiente first

  if (error) {
    console.error('Feedback list error:', error)
  }

  const allEntries = entries ?? []
  const pending = allEntries.filter(e => e.status === 'pendiente')
  const completed = allEntries.filter(e => e.status === 'completado')

  return (
    <div className="min-h-screen bg-navy-900">
      <Header
        role={area}
        userName={user.user_metadata?.name}
        userEmail={user.email}
      />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Page header */}
        <div className="mb-7">
          <div className="flex items-center gap-3 mb-1">
            <AreaBadge area={area} />
            <h1 className="text-xl font-bold text-white">Mis Feedbacks</h1>
          </div>
          <p className="text-slate-400 text-sm">
            {AREA_LABELS[area]} · {allEntries.length} ingresante{allEntries.length !== 1 ? 's' : ''} asignado{allEntries.length !== 1 ? 's' : ''}
          </p>
        </div>

        {allEntries.length === 0 ? (
          <div className="card text-center py-16">
            <ClipboardList size={40} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">Sin ingresantes asignados</p>
            <p className="text-slate-500 text-sm mt-1">
              Cuando el admin registre nuevos ingresos, aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending section */}
            {pending.length > 0 && (
              <div>
                <h2 className="section-title mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  Pendientes ({pending.length})
                </h2>
                <div className="space-y-2">
                  {pending.map(entry => (
                    <FeedbackCard
                      key={entry.id}
                      entry={entry}
                      area={area}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed section */}
            {completed.length > 0 && (
              <div>
                <h2 className="section-title mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  Completados ({completed.length})
                </h2>
                <div className="space-y-2">
                  {completed.map(entry => (
                    <FeedbackCard
                      key={entry.id}
                      entry={entry}
                      area={area}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

interface FeedbackEntry {
  id: string
  new_hire_id: string
  area: string
  status: string
  score_overall: number | null
  new_hires: {
    id: string
    full_name: string
    dni: string
    entry_date: string
    position: string
    site: string
  } | null
}

function FeedbackCard({ entry, area }: { entry: FeedbackEntry; area: AreaRole }) {
  const hire = entry.new_hires
  if (!hire) return null
  const isCompleted = entry.status === 'completado'

  return (
    <Link href={`/feedback/${hire.id}`} className="block">
      <div className={`card p-4 hover:border-slate-600 transition-all hover:bg-slate-800/80 ${
        isCompleted ? 'opacity-75' : ''
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {isCompleted && (
                <CheckCircle2 size={14} className="text-green-400 shrink-0" />
              )}
              <span className={`font-semibold truncate ${isCompleted ? 'text-slate-300' : 'text-white'}`}>
                {hire.full_name}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-x-3">
              <span>DNI {hire.dni}</span>
              <span>{hire.position}</span>
              <span>Ingreso: {formatDate(hire.entry_date)}</span>
              <span>{hire.site}</span>
            </div>
          </div>
          <div className="shrink-0">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(entry.status as 'pendiente' | 'completado')}`}>
              {isCompleted ? 'Completado' : 'Pendiente'}
            </span>
          </div>
        </div>

        {isCompleted && entry.score_overall != null && (
          <div className="mt-2 flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className={`text-xs ${i < entry.score_overall! ? 'text-orange-400' : 'text-slate-700'}`}>
                ★
              </span>
            ))}
            <span className="text-xs text-slate-500 ml-1">{entry.score_overall}/5</span>
          </div>
        )}
      </div>
    </Link>
  )
}
