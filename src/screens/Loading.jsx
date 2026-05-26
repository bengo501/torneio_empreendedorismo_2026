import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MapPin } from 'lucide-react'

const STEPS = [
  { label: 'Detectando localização',       icon: '📍' },
  { label: 'Calculando distância',          icon: '📐' },
  { label: 'Consultando preços ao vivo',    icon: '💰' },
  { label: 'Verificando disponibilidade',   icon: '📶' },
  { label: 'Analisando impacto ambiental',  icon: '🌿' },
  { label: 'IA gerando recomendação',       icon: '🤖' },
]

export default function Loading() {
  const navigate  = useNavigate()
  const { state } = useLocation()
  const [step, setStep]         = useState(0)
  const [pct,  setPct]          = useState(0)
  const [done, setDone]         = useState(false)

  useEffect(() => {
    const iv = setInterval(() => {
      setStep(s  => Math.min(s + 1, STEPS.length - 1))
      setPct(p   => Math.min(p + 100 / STEPS.length, 100))
    }, 480)

    const t = setTimeout(() => {
      clearInterval(iv)
      setDone(true)
      setPct(100)
      setTimeout(() => navigate('/results', {
        state: { ...state, distanceKm: +(Math.random() * 4 + 1.2).toFixed(1) }
      }), 600)
    }, STEPS.length * 480 + 200)

    return () => { clearInterval(iv); clearTimeout(t) }
  }, [navigate, state])

  return (
    <div className="flex flex-col items-center justify-between min-h-dvh bg-dark-950 px-6 py-16">

      {/* Top: destination */}
      <div className="w-full">
        <div className="flex items-center gap-3 bg-dark-800 border border-dark-700 rounded-2xl px-4 py-3">
          <MapPin size={16} className="text-zippi-400 flex-shrink-0" />
          <p className="text-sm text-white font-medium truncate">
            {state?.destination ?? 'Seu destino'}
          </p>
        </div>
      </div>

      {/* Center: circular progress */}
      <div className="flex flex-col items-center gap-8">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 144 144">
            <circle cx="72" cy="72" r="60" fill="none" stroke="#1A1A1A" strokeWidth="8"/>
            <circle
              cx="72" cy="72" r="60"
              fill="none"
              stroke="#3DED7A"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${pct * 3.77} 377`}
              style={{ transition: 'stroke-dasharray 0.45s ease' }}
            />
          </svg>
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-4xl">{done ? '✅' : STEPS[step]?.icon}</span>
            <span className="text-lg font-black text-zippi-400 mt-1">{Math.round(pct)}%</span>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-1">
            {done ? 'Pronto!' : 'Analisando opções'}
          </h2>
          <p className="text-sm text-dark-400 min-h-[20px] transition-all">
            {done ? 'Melhores opções encontradas 🎉' : STEPS[step]?.label + '...'}
          </p>
        </div>
      </div>

      {/* Bottom: step checklist */}
      <div className="w-full flex flex-col gap-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
              i < step   ? 'bg-zippi-400' :
              i === step ? 'bg-dark-700 animate-blink border-2 border-zippi-400' :
                           'bg-dark-800 border border-dark-700'
            }`}>
              {i < step && (
                <svg viewBox="0 0 10 8" className="w-3 h-3">
                  <polyline points="1,4 3.5,6.5 9,1" fill="none" stroke="#0A0A0A" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              )}
            </div>
            <span className={`text-xs font-medium transition-colors ${
              i <= step ? 'text-dark-200' : 'text-dark-700'
            }`}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
