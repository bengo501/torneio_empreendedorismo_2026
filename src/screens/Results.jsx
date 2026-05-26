import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Navigation } from 'lucide-react'
import { getRankedServices, getMultiVehicleCombos } from '../data/services.js'
import { useTheme } from '../context/ThemeContext.jsx'
import ServiceCard from '../components/ServiceCard.jsx'
import ServiceDetail from '../components/ServiceDetail.jsx'
import MultiVehicleCard from '../components/MultiVehicleCard.jsx'

const FILTERS = [
  { id: 'balanced',  label: '⚡ Equilibrado', prefs: { price:.35, time:.25, eco:.2, comfort:.1, avail:.1 } },
  { id: 'cheapest',  label: '💸 Menor preço', prefs: { price:.6, time:.15, eco:.1, comfort:.1, avail:.05 } },
  { id: 'fastest',   label: '🏎 Mais rápido', prefs: { price:.15, time:.6, eco:.1, comfort:.1, avail:.05 } },
  { id: 'eco',       label: '🌿 Eco',          prefs: { price:.2, time:.1, eco:.5, comfort:.1, avail:.1 } },
  { id: 'combined',  label: '🔀 Combinado',    prefs: null },
]

export default function Results() {
  const { state }  = useLocation()
  const navigate   = useNavigate()
  const { dark }   = useTheme()
  const [filter, setFilter]     = useState('balanced')
  const [selected, setSelected] = useState(null)

  const km      = state?.distanceKm ?? 2.4
  const weather = state?.weather
  const origin  = state?.originCoords
  const dest    = state?.destCoords
    ? { ...state.destCoords, label: state?.destination }
    : null

  const isCombined = filter === 'combined'
  const prefs      = FILTERS.find(f => f.id === filter)?.prefs
  const ranked     = isCombined ? [] : getRankedServices(km, prefs)
  const combos     = isCombined ? getMultiVehicleCombos(km, weather?.warn ?? false) : []
  const best       = ranked[0]
  const hasEco     = ranked.some(r => r.co2Saved > 0)

  // Theme helpers
  const bg    = dark ? 'bg-dark-950' : 'bg-gray-50'
  const bg2   = dark ? 'bg-dark-900' : 'bg-white'
  const text  = dark ? 'text-white'  : 'text-gray-900'
  const muted = dark ? 'text-dark-400' : 'text-gray-500'
  const dim   = dark ? 'text-dark-600' : 'text-gray-400'
  const card  = dark ? 'bg-dark-900/80 border-dark-800' : 'bg-white/80 border-gray-200'

  return (
    <div className={`flex flex-col min-h-dvh ${bg}`}>

      {/* ── MINI MAP HEADER ── */}
      <div className="relative h-44 overflow-hidden bg-dark-900">
        <MiniMap />
        <div className={`absolute inset-0 bg-gradient-to-b ${dark ? 'from-dark-950/60 via-transparent to-dark-950' : 'from-gray-900/60 via-transparent to-gray-50'}`} />

        {/* Back + route info overlay */}
        <div className="absolute top-12 left-0 right-0 flex items-center px-5 gap-3">
          <button
            onClick={() => navigate('/home')}
            className="w-9 h-9 rounded-xl bg-dark-900/80 backdrop-blur-sm border border-dark-800 flex items-center justify-center flex-shrink-0"
          >
            <ArrowLeft size={16} className="text-white" />
          </button>
          <div className={`flex-1 backdrop-blur-sm border rounded-2xl px-3 py-2 min-w-0 ${card}`}>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full bg-zippi-400 flex-shrink-0" />
                <p className={`text-xs truncate ${muted}`}>{state?.origin ?? 'Origem'}</p>
              </div>
              <Navigation size={10} className={`${dim} flex-shrink-0`} />
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin size={10} className="text-red-400 flex-shrink-0" />
              <p className={`text-xs font-semibold truncate ${text}`}>{state?.destination ?? 'Destino'}</p>
            </div>
          </div>
          <div className={`backdrop-blur-sm border rounded-xl px-2.5 py-1.5 flex-shrink-0 ${card}`}>
            <p className={`text-xs font-bold ${text}`}>{km} km</p>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className={`flex-1 flex flex-col -mt-2 ${bg} rounded-t-4xl`}>

        {/* Weather warning banner */}
        {weather?.warn && (
          <div className="mx-5 mt-4 flex items-center gap-3 bg-yellow-900/30 border border-yellow-500/30 rounded-2xl px-4 py-3 animate-fade-in">
            <span className="text-xl flex-shrink-0">{weather.emoji ?? '⛈️'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-yellow-400">Previsão de chuva</p>
              <p className="text-xs text-yellow-200/70">
                {weather.rainProb}% de chance · Prefira opções cobertas ou Combinado
              </p>
            </div>
          </div>
        )}

        {/* Filter strip */}
        <div className="px-5 pt-4 pb-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                  filter === f.id
                    ? 'bg-zippi-400 text-dark-950 shadow shadow-zippi-900/30'
                    : dark
                      ? 'bg-dark-800 text-dark-400 border border-dark-700'
                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* === COMBINED VIEW === */}
        {isCombined && (
          <div className="px-5 flex flex-col gap-4 pb-10">
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${dim}`}>Rotas multimodais</p>
              <p className={`text-xs ${muted}`}>
                Combine dois serviços e economize na rota de {km} km
              </p>
            </div>

            {combos.length === 0 ? (
              <div className={`rounded-3xl border p-8 text-center ${dark ? 'bg-dark-900 border-dark-800' : 'bg-white border-gray-200'}`}>
                <p className="text-3xl mb-3">🔀</p>
                <p className={`font-bold ${text} mb-1`}>Nenhuma combinação encontrada</p>
                <p className={`text-xs ${muted}`}>
                  Para distâncias curtas, um único serviço já é ideal.
                </p>
              </div>
            ) : (
              combos.map((combo, i) => (
                <div key={combo.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.07}s`, opacity: 0 }}>
                  <MultiVehicleCard combo={combo} rank={i} origin={origin} dest={dest} />
                </div>
              ))
            )}

            <p className={`text-center text-xs mt-2 ${dim}`}>
              Zippi não possui vínculo com nenhum dos serviços listados.<br />
              Preços estimados com base em dados públicos.
            </p>
          </div>
        )}

        {/* === SINGLE SERVICE VIEW === */}
        {!isCombined && (
          <>
            {/* Eco tip */}
            {hasEco && filter !== 'cheapest' && (
              <div className="mx-5 mb-4 flex items-start gap-3 bg-zippi-900/20 border border-zippi-400/20 rounded-2xl px-4 py-3 animate-fade-in">
                <span className="text-xl flex-shrink-0">🌍</span>
                <div>
                  <p className="text-xs font-bold text-zippi-400 mb-0.5">Dica Zippi</p>
                  <p className={`text-xs ${muted}`}>
                    Para {km} km, patinete ou bike economiza até{' '}
                    <span className="text-zippi-400 font-semibold">{(km * 0.12).toFixed(2)} kg de CO₂</span>{' '}
                    e custa menos!
                  </p>
                </div>
              </div>
            )}

            {/* Count line */}
            <div className="flex items-center justify-between px-5 mb-3">
              <p className={`text-xs ${dim}`}>
                <span className={`font-bold ${text}`}>{ranked.length}</span> opções encontradas
              </p>
              {best && (
                <p className={`text-xs ${dim}`}>
                  A partir de <span className={`font-bold ${text}`}>R${best.price.toFixed(2).replace('.', ',')}</span>
                </p>
              )}
            </div>

            {/* Cards */}
            <div className="px-5 flex flex-col gap-3 pb-10">
              {ranked.map((s, i) => (
                <div
                  key={s.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${i * 0.07}s`, opacity: 0 }}
                >
                  <ServiceCard service={s} rank={i} onSelect={setSelected} />
                </div>
              ))}

              <p className={`text-center text-xs mt-2 ${dim}`}>
                Zippi não possui vínculo com nenhum dos serviços listados.<br />
                Preços estimados com base em dados públicos.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Detail sheet */}
      {selected && (
        <ServiceDetail
          service={selected}
          origin={origin}
          dest={dest}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

function MiniMap() {
  return (
    <svg className="w-full h-full" viewBox="0 0 390 176" preserveAspectRatio="xMidYMid slice">
      <rect width="390" height="176" fill="#111111"/>
      {[30,70,110,150,190,230,270,310,350].map(x=>(
        <line key={x} x1={x} y1="0" x2={x} y2="176" stroke="#171717" strokeWidth="1"/>
      ))}
      {[30,70,110,150].map(y=>(
        <line key={y} x1="0" y1={y} x2="390" y2={y} stroke="#171717" strokeWidth="1"/>
      ))}
      <line x1="0" y1="88" x2="390" y2="70" stroke="#1E1E1E" strokeWidth="14"/>
      <line x1="180" y1="0" x2="200" y2="176" stroke="#1E1E1E" strokeWidth="10"/>
      <circle cx="100" cy="88" r="7" fill="#3DED7A"/>
      <circle cx="100" cy="88" r="3" fill="white"/>
      <path d="M100,88 Q190,60 280,100" stroke="#3DED7A" strokeWidth="3" fill="none" strokeDasharray="8,4"/>
      <circle cx="280" cy="100" r="9" fill="#FF4444"/>
      <circle cx="280" cy="100" r="4" fill="white"/>
    </svg>
  )
}
