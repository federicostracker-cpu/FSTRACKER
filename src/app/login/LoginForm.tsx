'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (error) {
        toast.error('Credenciales incorrectas. Verific├í tu email y contrase├▒a.')
        return
      }

      const role = data.user?.user_metadata?.role
      toast.success('Sesi├│n iniciada correctamente')

      if (role === 'admin') {
        router.push('/dashboard')
      } else {
        router.push('/feedback')
      }

      router.refresh()
    } catch {
      toast.error('Error inesperado. Intent├í nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-navy-900 px-4">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-500 rounded-2xl shadow-lg shadow-orange-500/30 mb-4">
            <span className="text-2xl font-bold text-white">M</span>
          </div>
          <h1 className="text-2xl font-bold text-white">MERA Solutions</h1>
          <p className="text-slate-400 text-sm mt-1">Sistema de Seguimiento de Ingresos</p>
        </div>

        {/* Card */}
        <div className="card p-7 shadow-2xl shadow-black/30">
          <h2 className="text-lg font-semibold text-white mb-6">Iniciar sesi├│n</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="usuario@mera.com"
                className="form-input"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="form-label">
                Contrase├▒a
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="ÔÇóÔÇóÔÇóÔÇóÔÇóÔÇóÔÇóÔÇó"
                  className="form-input pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2 mt-1"
              disabled={loading}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          MERA Solutions ┬À Uso interno exclusivo
        </p>
      </div>
    </div>
  )
}
