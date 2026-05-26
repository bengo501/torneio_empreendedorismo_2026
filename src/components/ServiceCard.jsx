import { Clock, Leaf, ChevronRight } from 'lucide-react'

const CAT = {
  carro:     { label: 'Carro',    dot: 'bg-blue-400'   },
  patinete:  { label: 'Patinete', dot: 'bg-orange-400' },
  bicicleta: { label: 'Bike',     dot: 'bg-yellow-400' },
}

export default function ServiceCard({ service, rank, onSelect }) {
  const isBest = rank === 0
  const cat    = CAT[service.category]

  return (
    <button
      onClick={() => onSelect(service)}
      className={`w-full text-left rounded-3xl overflow-hidden border transition-all active:scale-[0.98] ${
        isBest
          ? 'border-zippi-400/40 bg-dark-900'
          : 'border-dark-800 bg-dark-900'
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
              <span className="font-bold text-white text-base">{service.name}</span>
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
                <span className="text-xs text-dark-500">{cat.label}</span>
              </span>
            </div>
            <p className="text-xs text-dark-500 truncate">{service.description}</p>
          </div>

          {/* Price + time */}
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-black text-white leading-tight">
              R${service.price.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-xs text-dark-500">{service.totalMin} min</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-dark-800">
          <div className="flex items-center gap-1.5 text-xs text-dark-500">
            <Clock size={11} />
            <span>{service.avgWaitMin} min espera</span>
          </div>

          {service.co2Saved > 0 ? (
            <div className="flex items-center gap-1.5 text-xs text-zippi-400 font-medium">
              <Leaf size={11} />
              <span>-{service.co2Saved} kg CO₂</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-dark-600">
              <Leaf size={11} />
              <span>{service.co2PerKm}g/km</span>
            </div>
          )}

          <div className="ml-auto flex items-center gap-1">
            <span className="text-xs font-black text-dark-400">
              {(service.score * 10).toFixed(0)}
              <span className="text-dark-700 font-medium">/100</span>
            </span>
            <ChevronRight size={14} className="text-dark-700" />
          </div>
        </div>
      </div>
    </button>
  )
}
