import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingDown, Leaf, RotateCcw } from 'lucide-react'
import { RIDE_HISTORY, STATS } from '../data/history.js'

export default function History() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-dvh bg-dark-950">
      {/* Header */}
      <div className="px-5 pt-14 pb-5 bg-dark-950">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/home')}
            className="w-9 h-9 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center"
          >
            <ArrowLeft size={16} className="text-dark-300" />
          </button>
          <h1 className="text-xl font-black text-white">Histórico</h1>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard
            icon="🚗"
            label="Corridas"
            value={STATS.totalRides}
          />
          <StatCard
            icon="💸"
            label="Economizado"
            value={`R$${STATS.totalSaved.toFixed(0)}`}
            green
          />
          <StatCard
            icon="🌿"
            label="CO₂ salvo"
            value={`${STATS.totalCo2Kg}kg`}
            green
          />
        </div>
      </div>

      {/* Rides list */}
      <div className="flex-1 px-5 overflow-y-auto pb-10">
        <p className="text-xs text-dark-600 font-bold uppercase tracking-widest mb-3">
          Últimas viagens
        </p>

        <div className="flex flex-col gap-3">
          {RIDE_HISTORY.map((ride, i) => (
            <div
              key={ride.id}
              className="bg-dark-900 border border-dark-800 rounded-3xl p-4 animate-slide-up"
              style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}
            >
              {/* Top row */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-dark-800 flex items-center justify-center text-xl flex-shrink-0">
                  {ride.serviceEmoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{ride.service}</span>
                    <span className="text-base font-black text-white">
                      R${ride.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <p className="text-xs text-dark-500 mt-0.5">{ride.timeLabel}</p>
                </div>
              </div>

              {/* Route */}
              <div className="bg-dark-950 rounded-2xl px-3 py-2.5 mb-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2 h-2 rounded-full bg-zippi-400 flex-shrink-0" />
                  <p className="text-xs text-dark-400 truncate">{ride.from}</p>
                </div>
                <div className="w-0.5 h-3 bg-dark-700 ml-[3px] mb-1.5" />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                  <p className="text-xs text-white font-medium truncate">{ride.to}</p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 text-xs bg-dark-800 text-dark-400 px-2.5 py-1 rounded-full">
                  📍 {ride.km} km
                </span>
                <span className="flex items-center gap-1 text-xs bg-dark-800 text-dark-400 px-2.5 py-1 rounded-full">
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
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-dark-800 border border-dark-700 text-sm font-semibold text-dark-300 active:scale-95 transition-transform"
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

function StatCard({ icon, label, value, green }) {
  return (
    <div className={`rounded-2xl p-3 text-center border ${
      green ? 'bg-zippi-900/20 border-zippi-400/20' : 'bg-dark-900 border-dark-800'
    }`}>
      <p className="text-2xl mb-1">{icon}</p>
      <p className={`text-base font-black ${green ? 'text-zippi-400' : 'text-white'}`}>{value}</p>
      <p className="text-xs text-dark-600 mt-0.5">{label}</p>
    </div>
  )
}
