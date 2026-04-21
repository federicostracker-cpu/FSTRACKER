'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { LogOut, LayoutDashboard, ClipboardList, UserPlus, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { UserRole, AREA_LABELS, AreaRole } from '@/types'
import { getAreaColorClass } from '@/lib/utils'

interface HeaderProps {
  role: UserRole
  userName?: string
  userEmail?: string
}

export default function Header({ role, userName, userEmail }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    toast('Sesión cerrada', { icon: '👋' })
    router.push('/login')
    router.refresh()
  }

  const isAdmin = role === 'admin'

  const navLinks = isAdmin
    ? [
        { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
        { href: '/new-hire', label: 'Nuevo Ingreso', icon: <UserPlus size={16} /> },
      ]
    : [
        { href: '/feedback', label: 'Mis Feedbacks', icon: <ClipboardList size={16} /> },
      ]

  return (
    <header className="sticky top-0 z-40 bg-navy-900/95 backdrop-blur border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href={isAdmin ? '/dashboard' : '/feedback'} className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center shadow shadow-orange-500/30">
            <span className="text-sm font-bold text-white">M</span>
          </div>
          <span className="font-semibold text-white hidden sm:block">MERA Solutions</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith(link.href)
                  ? 'bg-slate-700/80 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Role badge */}
          {role !== 'admin' && (
            <span className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getAreaColorClass(role as AreaRole)}`}>
              {AREA_LABELS[role as AreaRole]}
            </span>
          )}
          {role === 'admin' && (
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-orange-500/20 text-orange-300 border-orange-500/30">
              Admin
            </span>
          )}

          {/* User info + logout (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-slate-400 text-sm truncate max-w-[140px]">
              {userName || userEmail}
            </span>
            <button
              onClick={handleLogout}
              className="btn-ghost text-slate-500 hover:text-red-400 p-2 rounded-lg"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="md:hidden btn-ghost p-2"
            aria-label="Menú"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-700/50 bg-navy-900 px-4 py-3 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                pathname.startsWith(link.href)
                  ? 'bg-slate-700/80 text-white'
                  : 'text-slate-400'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-700/30 flex items-center justify-between px-3 py-2">
            <span className="text-slate-500 text-sm">{userEmail}</span>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-red-400 text-sm font-medium">
              <LogOut size={14} />
              Salir
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
