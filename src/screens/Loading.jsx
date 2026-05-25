import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const STEPS = [
  'Detectando sua localização...',
  'Calculando distância até o destino...',
  'Consultando preços em tempo real...',
  'Verificando disponibilidade...',
  'Calculando impacto ambiental...',
  'Aplicando IA para melhor recomendação...',
]

export default function Loading() {
  const navigate  = useNavigate()
  const { state } = useLocation()
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => {
        if (s < STEPS.length - 1) return s + 1
        return s
      })
      setProgress(p => Math.min(p + 100 / STEPS.length, 100))
    }, 500)

    const done = setTimeout(() => {
      clearInterval(interval)
      navigate('/results', {
        state: {
          ...state,
          distanceKm: +(Math.random() * 4 + 1).toFixed(1),
        },
      })
    }, STEPS.length * 500 + 300)

    return () => { clearInterval(interval); clearTimeout(done) }
  }, [navigate, state])

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh bg-surface px-8 gap-8">
      {/* Spinner */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="#1a2535" strokeWidth="8"/>
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke="#22c55e"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${progress * 2.76} 276`}
            strokeDashoffset="69"
            style={{ transition: 'stroke-dasharray 0.4s ease' }}
          />
        </svg>
        <span className="text-4xl relative z-10">🤖</span>
      </div>

      {/* Title */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">Analisando opções</h2>
        <p className="text-sm text-slate-400 min-h-5 transition-all">
          {STEPS[step]}
        </p>
      </div>

      {/* Steps */}
      <div className="w-full max-w-xs flex flex-col gap-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
              i < step   ? 'bg-primary-500' :
              i === step ? 'bg-primary-500 animate-pulse' :
                           'bg-muted'
            }`}>
              {i < step && (
                <svg viewBox="0 0 10 10" className="w-2.5 h-2.5">
                  <polyline points="2,5 4,7.5 8,2.5" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )}
            </div>
            <span className={`text-xs transition-all ${i <= step ? 'text-slate-300' : 'text-slate-600'}`}>
              {s}
            </span>
          </div>
        ))}
      </div>

      {/* Destination badge */}
      {state?.destination && (
        <div className="flex items-center gap-2 bg-card border border-muted rounded-2xl px-4 py-2.5">
          <span className="text-base">📍</span>
          <p className="text-sm text-slate-300 max-w-xs truncate">{state.destination}</p>
        </div>
      )}
    </div>
  )
}
