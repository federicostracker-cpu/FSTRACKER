import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'MERA Solutions — Seguimiento de Ingresos',
  description: 'Sistema interno de feedback de incorporación para MERA Solutions',
  robots: 'noindex, nofollow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-navy-900 text-slate-100 antialiased">
        {children}
        <Toaster
          position="top-right"
          gutter={8}
          containerStyle={{ top: 64 }}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1E293B',
              color: '#F1F5F9',
              border: '1px solid rgba(71,85,105,0.5)',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '500',
              padding: '12px 16px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
            },
            success: {
              iconTheme: { primary: '#22C55E', secondary: '#F8FAFC' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#F8FAFC' },
            },
          }}
        />
      </body>
    </html>
  )
}
