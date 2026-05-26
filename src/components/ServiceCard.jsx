import { Clock, Leaf, ChevronRight } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'

const CAT = {
  carro:     { label: 'Carro',    dot: 'bg-blue-400'   },
  patinete:  { label: 'Patinete', dot: 'bg-orange-400' },
  bicicleta: { label: 'Bike',     dot: 'bg-yellow-400' },
}

export default function ServiceCard({ service, rank, onSelect }) {
  const { dark } = useTheme()
  const isBest   = rank === 0
  const cat      = CAT[service.category]

  const bg    = dark ? 'bg-dark-900'    : 'bg-white'
  const bdr   = dark ? 'border-dark-800': 'border-gray-200'
  const bdrT  = dark ? 'border-dark-800': 'border-gray-100'
  const text  = dark ? 'text-white'     : 'text-gray-900'
  const muted = dark ? 'text-dark-500'  : 'text-gray-400'
  const dim   = dark ? 'text-dark-600'  : 'text-gray-300'
  const score = dark ? 'text-dark-400'  : 'text-gray-500'
  const scdim = dark ? 'text-dark-700'  : 'text-gray-300'

  return (
    <button
      onClick={() => onSelect(service)}
      className={`w-full text-left rounded-3xl overflow-hidden border transition-all active:scale-[0.98] ${bg} ${
        isBest ? 'border-zippi-400/40' : bdr
      }`}
    >
      {isBest && (
        <div className="bg-zippi-400 px-4 py-1.5 flex items-center gap-2">
          <span className="text-xs font-bold text-dark-950 uppercase tracking-widest">⚡ Melhor escolha Zippi</span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 border border-dark-700"
            style={{ backgroundColor: service.bgColor }}
          >
            {service.emoji}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`font-bold ${text} text-base`}>{service.name}</span>
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
                <span className={`text-xs ${muted}`}>{cat.label}</span>
              </span>
            </div>
            <p className={`text-xs ${muted} truncate`}>{service.description}</p>
          </div>

          {/* Price + time */}
          <div className="text-right flex-shrink-0">
            <p className={`text-lg font-black ${text} leading-tight`}>
              R${service.price.toFixed(2).replace('.', ',')}
            </p>
            <p className={`text-xs ${muted}`}>{service.totalMin} min</p>
          </div>
        </div>

        {/* Metrics */}
        <div className={`flex items-center gap-4 mt-3 pt-3 border-t ${bdrT}`}>
          <div className={`flex items-center gap-1.5 text-xs ${muted}`}>
            <Clock size={11} />
            <span>{service.avgWaitMin} min espera</span>
          </div>

          {service.co2Saved > 0 ? (
            <div className="flex items-center gap-1.5 text-xs text-zippi-400 font-medium">
              <Leaf size={11} />
              <span>-{service.co2Saved} kg CO₂</span>
            </div>
          ) : (
            <div className={`flex items-center gap-1.5 text-xs ${dim}`}>
              <Leaf size={11} />
              <span>{service.co2PerKm}g/km</span>
            </div>
          )}

          <div className="ml-auto flex items-center gap-1">
            <span className={`text-xs font-black ${score}`}>
              {(service.score * 10).toFixed(0)}
              <span className={`${scdim} font-medium`}>/100</span>
            </span>
            <ChevronRight size={14} className={dim} />
          </div>
        </div>
      </div>
    </button>
  )
}
