import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'

const STEPS = [
  { label: 'Identificando sua posição urbana',     icon: '📍' },
  { label: 'Calculando rotas multimodais',          icon: '🗺️' },
  { label: 'Comparando custos de acesso',           icon: '💰' },
  { label: 'Verificando disponibilidade em tempo real', icon: '📶' },
  { label: 'Medindo impacto ambiental',    icon: '🌿' },
  { label: 'IA recomendando melhor acesso urbano',  icon: '🤖' },
]

export default function Loading() {
  const navigate  = useNavigate()
  const { state } = useLocation()
  const { dark }  = useTheme()
  const [step, setStep] = useState(0)
  const [pct,  setPct]  = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const iv = setInterval(() => {
      setStep(s => Math.min(s + 1, STEPS.length - 1))
      setPct(p  => Math.min(p + 100 / STEPS.length, 100))
    }, 480)

    const t = setTimeout(() => {
      clearInterval(iv)
      setDone(true)
      setPct(100)
      // Preserve real distanceKm from GPS routing if available; else mock
      const distanceKm = state?.distanceKm ?? +(Math.random() * 4 + 1.2).toFixed(1)
      setTimeout(() => navigate('/results', { state: { ...state, distanceKm } }), 600)
    }, STEPS.length * 480 + 200)

    return () => { clearInterval(iv); clearTimeout(t) }
  }, [navigate, state])

  const bg    = dark ? 'bg-dark-950'   : 'bg-gray-50'
  const bg2   = dark ? 'bg-dark-800'   : 'bg-white'
  const bdr   = dark ? 'border-dark-700' : 'border-gray-200'
  const text  = dark ? 'text-white'    : 'text-gray-900'
  const muted = dark ? 'text-dark-400' : 'text-gray-500'
  const dim   = dark ? 'text-dark-700' : 'text-gray-300'

  return (
    <div className={`flex flex-col items-center justify-between min-h-dvh ${bg} px-6 py-16`}>

      {/* Top: destination */}
      <div className="w-full">
        <div className={`flex items-center gap-3 ${bg2} border ${bdr} rounded-2xl px-4 py-3`}>
          <MapPin size={16} className="text-zippi-400 flex-shrink-0" />
          <p className={`text-sm ${text} font-medium truncate`}>
            {state?.destination ?? 'Seu destino'}
          </p>
        </div>
      </div>

      {/* Center: circular progress */}
      <div className="flex flex-col items-center gap-8">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 144 144">
            <circle cx="72" cy="72" r="60" fill="none" stroke={dark ? '#1A1A1A' : '#E5E7EB'} strokeWidth="8"/>
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
          <h2 className={`text-xl font-bold ${text} mb-1`}>
            {done ? 'Pronto!' : 'Analisando opções'}
          </h2>
          <p className={`text-sm ${muted} min-h-[20px] transition-all`}>
            {done ? 'Melhores opções encontradas 🎉' : (STEPS[step]?.label ?? '') + '...'}
          </p>
        </div>
      </div>

      {/* Bottom: step checklist */}
      <div className="w-full flex flex-col gap-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
              i < step   ? 'bg-zippi-400' :
              i === step ? `${dark ? 'bg-dark-700' : 'bg-gray-200'} animate-blink border-2 border-zippi-400` :
                           `${dark ? 'bg-dark-800 border-dark-700' : 'bg-gray-100 border-gray-300'} border`
            }`}>
              {i < step && (
                <svg viewBox="0 0 10 8" className="w-3 h-3">
                  <polyline points="1,4 3.5,6.5 9,1" fill="none" stroke="#0A0A0A" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              )}
            </div>
            <span className={`text-xs font-medium transition-colors ${
              i <= step ? (dark ? 'text-dark-200' : 'text-gray-700') : dim
            }`}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
