import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import { NewHireWithFeedback, AreaRole } from '@/types'
import { formatDate, getAreaLabel, getStatusBadgeClass } from '@/lib/utils'
import { UserPlus, Download, Users, CheckCircle2, Clock } from 'lucide-react'

const AREAS: AreaRole[] = ['rrhh', 'operaciones', 'calidad', 'capacitacion']

function StatusDot({ status }: { status: 'completado' | 'pendiente' | 'sin_enviar' }) {
  const colors = {
    completado: 'bg-green-400',
    pendiente: 'bg-yellow-400',
    sin_enviar: 'bg-slate-600',
  }
  const labels = {
    completado: 'Completado',
    pendiente: 'Pendiente',
    sin_enviar: 'Sin iniciar',
  }
  return (
    <div className="flex flex-col items-center gap-1" title={labels[status]}>
      <div className={`w-3 h-3 rounded-full ${colors[status]}`} />
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') {
    redirect('/feedback')
  }

  const { data: hires, error } = await supabase
    .from('new_hires')
    .select(`
      *,
      feedback_entries (*)
    `)
    .order('entry_date', { ascending: false })

  if (error) {
    console.error('Dashboard fetch error:', error)
  }

  const hiresData = (hires as NewHireWithFeedback[]) ?? []

  // Summary stats
  const totalHires = hiresData.length
  const completedHires = hiresData.filter(h =>
    h.feedback_entries?.every(f => f.status === 'completado')
  ).length
  const pendingHires = totalHires - completedHires

  function getHireAreaStatus(hire: NewHireWithFeedback, area: AreaRole) {
    const entry = hire.feedback_entries?.find(f => f.area === area)
    if (!entry) return 'sin_enviar'
    return entry.status === 'completado' ? 'completado' : 'pendiente'
  }

  function getOverallStatus(hire: NewHireWithFeedback) {
    if (!hire.feedback_entries?.length) return 'sin_enviar'
    const all = AREAS.map(a => getHireAreaStatus(hire, a))
    if (all.every(s => s === 'completado')) return 'completado'
    if (all.some(s => s === 'completado' || s === 'pendiente')) return 'pendiente'
    return 'sin_enviar'
  }

  return (
    <div className="min-h-screen bg-navy-900">
      <Header
        role="admin"
        userName={user.user_metadata?.name}
        userEmail={user.email}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard de Ingresos</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Seguimiento de feedback por área para todos los ingresantes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/api/export"
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Download size={15} />
              Exportar CSV
            </Link>
            <Link
              href="/new-hire"
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <UserPlus size={15} />
              Nuevo ingreso
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="card p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500/15 rounded-xl flex items-center justify-center">
              <Users size={20} className="text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{totalHires}</div>
              <div className="text-slate-400 text-sm">Total ingresantes</div>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-500/15 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={20} className="text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{completedHires}</div>
              <div className="text-slate-400 text-sm">Feedback completo</div>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-yellow-500/15 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{pendingHires}</div>
              <div className="text-slate-400 text-sm">Pendientes</div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {/* Legend */}
          <div className="px-5 py-3.5 border-b border-slate-700/50 flex flex-wrap items-center gap-4">
            <span className="section-title">Ingresantes</span>
            <div className="flex items-center gap-4 ml-auto">
              {([
                { status: 'completado', label: 'Completado' },
                { status: 'pendiente', label: 'Pendiente' },
                { status: 'sin_enviar', label: 'Sin iniciar' },
              ] as const).map(({ status, label }) => (
                <div key={status} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <StatusDot status={status} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {hiresData.length === 0 ? (
            <div className="text-center py-16">
              <Users size={40} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">Sin ingresantes registrados</p>
              <p className="text-slate-500 text-sm mt-1">
                Creá el primer ingresante con el botón &ldquo;Nuevo ingreso&rdquo;
              </p>
              <Link href="/new-hire" className="btn-primary inline-flex items-center gap-2 mt-4 text-sm">
                <UserPlus size={15} />
                Nuevo ingreso
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Ingresante
                    </th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                      Fecha
                    </th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                      Sede
                    </th>
                    {AREAS.map(area => (
                      <th
                        key={area}
                        className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                      >
                        {getAreaLabel(area)}
                      </th>
                    ))}
                    <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {hiresData.map(hire => {
                    const overall = getOverallStatus(hire)
                    return (
                      <tr
                        key={hire.id}
                        className="hover:bg-slate-700/20 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <Link href={`/hire/${hire.id}`} className="group">
                            <div className="font-medium text-white group-hover:text-orange-400 transition-colors">
                              {hire.full_name}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              DNI {hire.dni} · {hire.position}
                            </div>
                          </Link>
                        </td>
                        <td className="px-3 py-3.5 text-sm text-slate-400 hidden sm:table-cell whitespace-nowrap">
                          {formatDate(hire.entry_date)}
                        </td>
                        <td className="px-3 py-3.5 text-sm text-slate-400 hidden md:table-cell">
                          {hire.site}
                        </td>
                        {AREAS.map(area => (
                          <td key={area} className="px-3 py-3.5 text-center">
                            <div className="flex justify-center">
                              <StatusDot status={getHireAreaStatus(hire, area)} />
                            </div>
                          </td>
                        ))}
                        <td className="px-3 py-3.5 text-center hidden sm:table-cell">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(overall)}`}>
                            {overall === 'completado' ? 'Completo' : overall === 'pendiente' ? 'Parcial' : 'Sin iniciar'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
