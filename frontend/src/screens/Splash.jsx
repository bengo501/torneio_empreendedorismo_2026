import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Splash() {
  const navigate = useNavigate()
  useEffect(() => {
    const t = setTimeout(() => navigate('/login'), 2800)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh bg-dark-950 select-none relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute w-96 h-96 rounded-full bg-zippi-500/8 blur-3xl" />
      <div className="absolute w-48 h-48 rounded-full bg-zippi-400/5 blur-2xl translate-y-20" />

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="relative">
          <div className="animate-ripple absolute inset-0 w-20 h-20 rounded-3xl bg-zippi-400/20" />
          <div className="relative z-10 w-20 h-20 rounded-3xl bg-zippi-400 flex items-center justify-center shadow-2xl shadow-zippi-900/50">
            <span className="text-4xl">⚡</span>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-5xl font-black tracking-tight text-white">Tourio</h1>
          <p className="text-sm text-zippi-400/80 mt-1 font-semibold tracking-wide">
            Acesso urbano inteligente
          </p>
          <p className="text-xs text-dark-500 mt-2 font-medium max-w-[200px] leading-relaxed">
            Conectando pessoas à cidade com IA
          </p>
        </div>
      </div>

      {/* Bottom loader */}
      <div className="absolute bottom-14 flex flex-col items-center gap-3">
        <div className="w-48 h-0.5 bg-dark-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-zippi-400 rounded-full"
            style={{ animation: 'loadbar 2.5s ease forwards' }}
          />
        </div>
        <p className="text-xs text-dark-700 font-medium">
          MVP · Porto Alegre · 2026
        </p>
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
