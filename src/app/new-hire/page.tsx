'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/Header'
import { User } from '@supabase/supabase-js'

export default function NewHirePage() {
  const router = useRouter()
  const supabase = createClient()

  const [authUser, setAuthUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    dni: '',
    entry_date: new Date().toISOString().split('T')[0],
    position: '',
    site: 'Olivos' as 'Olivos' | 'Parque Patricios',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || user.user_metadata?.role !== 'admin') {
        router.push('/feedback')
        return
      }
      setAuthUser(user)
    })
  }, [supabase, router])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!authUser) return
    setLoading(true)

    try {
      const { error } = await supabase.from('new_hires').insert({
        full_name: form.full_name.trim(),
        dni: form.dni.trim(),
        entry_date: form.entry_date,
        position: form.position.trim(),
        site: form.site,
        created_by: authUser.id,
      })

      if (error) {
        console.error('Insert error:', error)
        toast.error('Error al registrar el ingresante. Intentá nuevamente.')
        return
      }

      toast.success(`${form.full_name} registrado exitosamente`)
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error('Error inesperado. Intentá nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!authUser) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-900">
      <Header
        role="admin"
        userName={authUser.user_metadata?.name}
        userEmail={authUser.email}
      />

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          Volver al dashboard
        </Link>

        <div className="card p-7 shadow-xl shadow-black/20">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-10 h-10 bg-orange-500/15 rounded-xl flex items-center justify-center">
              <UserPlus size={20} className="text-orange-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Nuevo Ingresante</h1>
              <p className="text-slate-400 text-sm">Completá los datos del nuevo empleado</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label" htmlFor="full_name">
                Nombre completo <span className="text-orange-400">*</span>
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                value={form.full_name}
                onChange={handleChange}
                disabled={loading}
                placeholder="Ej: María González"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="dni">
                DNI <span className="text-orange-400">*</span>
              </label>
              <input
                id="dni"
                name="dni"
                type="text"
                required
                value={form.dni}
                onChange={handleChange}
                disabled={loading}
                placeholder="Ej: 35.123.456"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="entry_date">
                Fecha de ingreso <span className="text-orange-400">*</span>
              </label>
              <input
                id="entry_date"
                name="entry_date"
                type="date"
                required
                value={form.entry_date}
                onChange={handleChange}
                disabled={loading}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="position">
                Puesto <span className="text-orange-400">*</span>
              </label>
              <input
                id="position"
                name="position"
                type="text"
                required
                value={form.position}
                onChange={handleChange}
                disabled={loading}
                placeholder="Ej: Agente de Atención al Cliente"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="site">
                Sede <span className="text-orange-400">*</span>
              </label>
              <select
                id="site"
                name="site"
                required
                value={form.site}
                onChange={handleChange}
                disabled={loading}
                className="form-select"
              >
                <option value="Olivos">Olivos</option>
                <option value="Parque Patricios">Parque Patricios</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Registrando…
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Registrar ingresante
                  </>
                )}
              </button>
              <Link href="/dashboard" className="btn-secondary">
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
