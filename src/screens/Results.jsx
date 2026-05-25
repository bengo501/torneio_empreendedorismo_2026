import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Navigation, Sliders, Leaf, Zap, Clock } from 'lucide-react'
import { getRankedServices } from '../data/services.js'
import ServiceCard from '../components/ServiceCard.jsx'
import ServiceDetail from '../components/ServiceDetail.jsx'

const FILTER_OPTIONS = [
  { id: 'balanced', label: 'Equilibrado', icon: <Zap  size={13}/>, prefs: { price:0.35, time:0.25, eco:0.2, comfort:0.1, avail:0.1 } },
  { id: 'cheapest', label: 'Menor preço', icon: <span className="text-xs font-bold">R$</span>, prefs: { price:0.6, time:0.15, eco:0.1, comfort:0.1, avail:0.05 } },
  { id: 'fastest',  label: 'Mais rápido', icon: <Clock size={13}/>, prefs: { price:0.15, time:0.6, eco:0.1, comfort:0.1, avail:0.05 } },
  { id: 'eco',      label: 'Eco-friendly',icon: <Leaf  size={13}/>, prefs: { price:0.2, time:0.1, eco:0.5, comfort:0.1, avail:0.1 } },
]

export default function Results() {
  const { state }    = useLocation()
  const navigate     = useNavigate()
  const [filter, setFilter] = useState('balanced')
  const [selected, setSelected] = useState(null)

  const distanceKm = state?.distanceKm ?? 2.4
  const currentFilter = FILTER_OPTIONS.find(f => f.id === filter)
  const ranked = getRankedServices(distanceKm, currentFilter.prefs)

  const best = ranked[0]
  const ecoBenefit = ranked.some(r => r.co2Saved > 0)

  return (
    <div className="flex flex-col min-h-dvh bg-surface">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 bg-surface sticky top-0 z-10 border-b border-muted/50">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/home')}
            className="w-9 h-9 rounded-xl bg-card border border-muted flex items-center justify-center"
          >
            <ArrowLeft size={16} className="text-slate-400" />
          </button>
          <h1 className="font-bold text-white text-lg flex-1">Melhores opções</h1>
          <div className="flex items-center gap-1.5 bg-card border border-muted rounded-xl px-3 py-1.5">
            <Sliders size={12} className="text-slate-400" />
            <span className="text-xs text-slate-400">{distanceKm} km</span>
          </div>
        </div>

        {/* Route summary */}
        <div className="bg-card rounded-2xl border border-muted px-4 py-3 mb-4">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-1 pt-0.5">
              <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
              <div className="w-0.5 h-5 bg-muted rounded" />
              <MapPin size={10} className="text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 truncate">
                {state?.origin ?? 'Localização atual'}
              </p>
              <div className="my-1.5" />
              <p className="text-xs text-slate-300 font-medium truncate">
                {state?.destination ?? 'Destino'}
              </p>
            </div>
            <Navigation size={14} className="text-primary-400 flex-shrink-0 mt-0.5" />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {FILTER_OPTIONS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all ${
                filter === f.id
                  ? 'bg-primary-500 text-white shadow-sm shadow-primary-900/40'
                  : 'bg-card border border-muted text-slate-400'
              }`}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pt-4 pb-8 overflow-y-auto">
        {/* AI insight banner */}
        {ecoBenefit && filter !== 'cheapest' && (
          <div className="flex items-start gap-3 bg-green-900/20 border border-green-700/30 rounded-2xl px-4 py-3 mb-4 animate-fade-in">
            <span className="text-xl">🌍</span>
            <div>
              <p className="text-xs font-bold text-green-400">Dica RotAI</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Para essa distância, patinete ou bike economizam até{' '}
                <span className="text-green-400 font-semibold">
                  {(distanceKm * 0.12).toFixed(2)} kg de CO₂
                </span>{' '}
                e custam menos!
              </p>
            </div>
          </div>
        )}

        {/* Best summary */}
        {best && (
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-500">
              <span className="text-primary-400 font-semibold">{ranked.length}</span> opções encontradas
            </p>
            <p className="text-xs text-slate-500">
              Melhor: <span className="text-white font-semibold">R${best.price.toFixed(2).replace('.', ',')}</span>
            </p>
          </div>
        )}

        {/* Cards */}
        <div className="flex flex-col gap-3">
          {ranked.map((service, i) => (
            <div
              key={service.id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
            >
              <ServiceCard
                service={service}
                rank={i}
                onSelect={setSelected}
              />
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-600">
            Preços estimados com base em dados em tempo real.
          </p>
          <p className="text-xs text-slate-700 mt-0.5">
            RotAI não é afiliada a nenhum aplicativo listado.
          </p>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <ServiceDetail service={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
