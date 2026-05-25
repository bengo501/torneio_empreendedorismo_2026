import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Navigation, Search, ChevronRight, Zap, Leaf, Clock } from 'lucide-react'

const QUICK_DESTINATIONS = [
  { label: 'Shopping', emoji: '🛍️', address: 'Shopping Iguatemi, Av. Brig. Faria Lima' },
  { label: 'Aeroporto', emoji: '✈️', address: 'Aeroporto Internacional de Congonhas' },
  { label: 'Paulista', emoji: '🏙️', address: 'Av. Paulista, São Paulo' },
  { label: 'Parque',   emoji: '🌳', address: 'Parque Ibirapuera, São Paulo' },
]

const RECENT = [
  { label: 'Faculdade USP', address: 'Rua do Matão, 1010 - Butantã', emoji: '🎓' },
  { label: 'Trabalho', address: 'Av. Eng. Luís Carlos Berrini, 105', emoji: '💼' },
]

export default function Home() {
  const navigate = useNavigate()
  const [origin,  setOrigin]  = useState('Detectando sua localização...')
  const [dest,    setDest]    = useState('')
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setOrigin('Localização atual — São Paulo, SP'), 1200)
    return () => clearTimeout(t)
  }, [])

  function handleSearch(destination = dest) {
    if (!destination.trim()) return
    navigate('/loading', { state: { origin, destination } })
  }

  return (
    <div className="flex flex-col min-h-dvh bg-surface">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Bem-vindo de volta</p>
            <h1 className="text-2xl font-extrabold text-white mt-0.5">
              Rot<span className="text-primary-400">AI</span>
            </h1>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-card flex items-center justify-center border border-muted">
            <span className="text-lg">👤</span>
          </div>
        </div>

        {/* Origin pill */}
        <div className="flex items-center gap-3 bg-card rounded-2xl px-4 py-3 border border-muted mb-3">
          <div className="relative flex-shrink-0">
            <div className="w-3 h-3 rounded-full bg-primary-500" />
            <span className="animate-pulse-ring absolute inset-0 w-3 h-3 rounded-full bg-primary-500 opacity-40" />
          </div>
          <span className="text-sm text-slate-300 truncate">{origin}</span>
          <Navigation size={14} className="text-primary-400 flex-shrink-0 ml-auto" />
        </div>

        {/* Destination input */}
        <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 border transition-all ${
          focused ? 'bg-card border-primary-500 shadow-lg shadow-primary-900/30' : 'bg-card border-muted'
        }`}>
          <MapPin size={16} className="text-slate-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Para onde você vai?"
            value={dest}
            onChange={e => setDest(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
          />
          {dest && (
            <button
              onClick={() => handleSearch()}
              className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center flex-shrink-0"
            >
              <Search size={14} className="text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Map placeholder */}
      <div className="mx-5 mb-5 rounded-3xl overflow-hidden relative h-44 bg-card border border-muted">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-xs text-slate-500">Mapa interativo</p>
          </div>
        </div>
        {/* Fake map grid */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 300 176">
          {Array.from({length: 10}).map((_,i) => (
            <line key={`v${i}`} x1={i*30} y1={0} x2={i*30} y2={176} stroke="#4ade80" strokeWidth="0.5"/>
          ))}
          {Array.from({length: 7}).map((_,i) => (
            <line key={`h${i}`} x1={0} y1={i*25} x2={300} y2={i*25} stroke="#4ade80" strokeWidth="0.5"/>
          ))}
        </svg>
        {/* Location dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-4 h-4 rounded-full bg-primary-500 border-2 border-white shadow-lg" />
            <div className="absolute inset-0 w-4 h-4 rounded-full bg-primary-500 animate-ping opacity-40" />
          </div>
        </div>
      </div>

      {/* Quick destinations */}
      <div className="px-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Destinos rápidos</p>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {QUICK_DESTINATIONS.map(d => (
            <button
              key={d.label}
              onClick={() => { setDest(d.address); handleSearch(d.address) }}
              className="flex items-center gap-2 bg-card border border-muted rounded-2xl px-3 py-3 text-left active:scale-95 transition-transform"
            >
              <span className="text-xl">{d.emoji}</span>
              <span className="text-sm font-medium text-white truncate">{d.label}</span>
              <ChevronRight size={14} className="text-slate-600 ml-auto flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* Recent */}
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Recentes</p>
        <div className="flex flex-col gap-2 mb-8">
          {RECENT.map(r => (
            <button
              key={r.label}
              onClick={() => { setDest(r.address); handleSearch(r.address) }}
              className="flex items-center gap-3 bg-card border border-muted rounded-2xl px-4 py-3 text-left active:scale-95 transition-transform"
            >
              <span className="text-xl">{r.emoji}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{r.label}</p>
                <p className="text-xs text-slate-500 truncate">{r.address}</p>
              </div>
              <ChevronRight size={14} className="text-slate-600 ml-auto flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Bottom feature pills */}
      <div className="mt-auto px-5 pb-8 flex gap-2 overflow-x-auto no-scrollbar">
        {[
          { icon: <Zap size={12}/>,  label: 'Menor preço', color: 'text-yellow-400 bg-yellow-900/30' },
          { icon: <Leaf size={12}/>, label: 'Eco-friendly', color: 'text-green-400 bg-green-900/30'  },
          { icon: <Clock size={12}/>,label: 'Mais rápido',  color: 'text-blue-400 bg-blue-900/30'   },
        ].map(f => (
          <div key={f.label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${f.color}`}>
            {f.icon}
            {f.label}
          </div>
        ))}
      </div>
    </div>
  )
}
