import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Splash() {
  const navigate = useNavigate()
  useEffect(() => {
    const t = setTimeout(() => navigate('/login'), 2400)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh bg-dark-950 select-none relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute w-72 h-72 rounded-full bg-zippi-500/10 blur-3xl" />

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="relative">
          <div className="animate-ripple absolute inset-0 w-20 h-20 rounded-3xl bg-zippi-400/20" />
          <div className="relative z-10 w-20 h-20 rounded-3xl bg-zippi-400 flex items-center justify-center shadow-2xl shadow-zippi-900/50">
            <span className="text-4xl">⚡</span>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-5xl font-black tracking-tight text-white">Zippi</h1>
          <p className="text-sm text-dark-400 mt-1 font-medium tracking-wider">
            Transporte inteligente
          </p>
        </div>
      </div>

      {/* Bottom loader */}
      <div className="absolute bottom-16 flex flex-col items-center gap-3">
        <div className="w-48 h-0.5 bg-dark-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-zippi-400 rounded-full"
            style={{ animation: 'loadbar 2.2s ease forwards' }}
          />
        </div>
        <p className="text-xs text-dark-600 font-medium">v1.0 · Protótipo</p>
      </div>

      <style>{`
        @keyframes loadbar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  )
}
