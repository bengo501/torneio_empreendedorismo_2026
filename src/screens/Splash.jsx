import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => navigate('/home'), 2200)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh bg-surface gap-6 select-none">
      {/* Logo */}
      <div className="relative flex items-center justify-center">
        <span className="animate-pulse-ring absolute w-24 h-24 rounded-full bg-primary-500 opacity-30" />
        <div className="relative z-10 w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center shadow-2xl shadow-primary-900/60">
          <span className="text-5xl">🚀</span>
        </div>
      </div>

      {/* Name */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">
          Rot<span className="text-primary-400">AI</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400 font-medium tracking-widest uppercase">
          Melhor trajeto, melhor preço
        </p>
      </div>

      {/* Loading dots */}
      <div className="flex gap-2 mt-4">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-primary-500"
            style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}
