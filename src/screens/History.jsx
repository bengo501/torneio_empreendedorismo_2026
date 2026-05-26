import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingDown, Leaf, RotateCcw } from 'lucide-react'
import { RIDE_HISTORY, STATS } from '../data/history.js'
import { useTheme } from '../context/ThemeContext.jsx'

export default function History() {
  const navigate = useNavigate()
  const { dark } = useTheme()

  const bg    = dark ? 'bg-dark-950'    : 'bg-gray-50'
  const bg2   = dark ? 'bg-dark-900'    : 'bg-white'
  const bg3   = dark ? 'bg-dark-800'    : 'bg-gray-100'
  const bg4   = dark ? 'bg-dark-950'    : 'bg-gray-50'
  const bdr   = dark ? 'border-dark-800': 'border-gray-200'
  const bdr2  = dark ? 'border-dark-700': 'border-gray-300'
  const text  = dark ? 'text-white'     : 'text-gray-900'
  const muted = dark ? 'text-dark-500'  : 'text-gray-500'
  const dim   = dark ? 'text-dark-600'  : 'text-gray-400'
  const sub   = dark ? 'text-dark-300'  : 'text-gray-600'

  return (
    <div className={`flex flex-col min-h-dvh ${bg}`}>
      {/* Header */}
      <div className={`px-5 pt-14 pb-5 ${bg}`}>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/home')}
            className={`w-9 h-9 rounded-xl ${bg3} border ${bdr2} flex items-center justify-center`}
          >
            <ArrowLeft size={16} className={sub} />
          </button>
          <h1 className={`text-xl font-black ${text}`}>Histórico</h1>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard dark={dark} bg2={bg2} bdr={bdr} text={text} dim={dim}
            icon="🚗" label="Corridas" value={STATS.totalRides} />
          <StatCard dark={dark} bg2={bg2} bdr={bdr} text={text} dim={dim}
            icon="💸" label="Economizado" value={`R$${STATS.totalSaved.toFixed(0)}`} green />
          <StatCard dark={dark} bg2={bg2} bdr={bdr} text={text} dim={dim}
            icon="🌿" label="CO₂ salvo" value={`${STATS.totalCo2Kg}kg`} green />
        </div>
      </div>

      {/* Rides list */}
      <div className={`flex-1 px-5 overflow-y-auto pb-10`}>
        <p className={`text-xs ${dim} font-bold uppercase tracking-widest mb-3`}>
          Últimas viagens
        </p>

        <div className="flex flex-col gap-3">
          {RIDE_HISTORY.map((ride, i) => (
            <div
              key={ride.id}
              className={`${bg2} border ${bdr} rounded-3xl p-4 animate-slide-up`}
              style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}
            >
              {/* Top row */}
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-11 h-11 rounded-xl ${bg3} flex items-center justify-center text-xl flex-shrink-0`}>
                  {ride.serviceEmoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${text} text-sm`}>{ride.service}</span>
                    <span className={`text-base font-black ${text}`}>
                      R${ride.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <p className={`text-xs ${muted} mt-0.5`}>{ride.timeLabel}</p>
                </div>
              </div>

              {/* Route */}
              <div className={`${bg4} rounded-2xl px-3 py-2.5 mb-3`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2 h-2 rounded-full bg-zippi-400 flex-shrink-0" />
                  <p className={`text-xs ${muted} truncate`}>{ride.from}</p>
                </div>
                <div className={`w-0.5 h-3 ${dark ? 'bg-dark-700' : 'bg-gray-300'} ml-[3px] mb-1.5`} />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                  <p className={`text-xs ${text} font-medium truncate`}>{ride.to}</p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`flex items-center gap-1 text-xs ${bg3} ${muted} px-2.5 py-1 rounded-full`}>
                  📍 {ride.km} km
                </span>
                <span className={`flex items-center gap-1 text-xs ${bg3} ${muted} px-2.5 py-1 rounded-full`}>
                  ⏱ {ride.durationMin} min
                </span>
                {ride.saved > 0 && (
                  <span className="flex items-center gap-1 text-xs bg-zippi-900/40 text-zippi-400 border border-zippi-400/20 px-2.5 py-1 rounded-full font-semibold">
                    <TrendingDown size={10} />
                    -R${ride.saved.toFixed(2).replace('.', ',')}
                  </span>
                )}
                {ride.ecoKg > 0 && (
                  <span className="flex items-center gap-1 text-xs bg-green-900/30 text-green-400 border border-green-800/30 px-2.5 py-1 rounded-full font-semibold">
                    <Leaf size={10} />
                    -{ride.ecoKg}kg CO₂
                  </span>
                )}
              </div>

              {/* Re-use button */}
              <button
                onClick={() => navigate('/loading', {
                  state: { origin: ride.from, destination: ride.to }
                })}
                className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl ${bg3} border ${bdr2} text-sm font-semibold ${sub} active:scale-95 transition-transform`}
              >
                <RotateCcw size={14} />
                Repetir viagem
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, green, dark, bg2, bdr, text, dim }) {
  return (
    <div className={`rounded-2xl p-3 text-center border ${
      green ? 'bg-zippi-900/20 border-zippi-400/20' : `${bg2} ${bdr}`
    }`}>
      <p className="text-2xl mb-1">{icon}</p>
      <p className={`text-base font-black ${green ? 'text-zippi-400' : text}`}>{value}</p>
      <p className={`text-xs ${dim} mt-0.5`}>{label}</p>
    </div>
  )
}
