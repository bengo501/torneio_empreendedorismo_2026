import { Clock, Leaf, Star, ChevronRight, Zap } from 'lucide-react'

const CATEGORY_LABELS = {
  carro:    { label: 'Carro',    color: 'text-blue-400  bg-blue-900/30'  },
  patinete: { label: 'Patinete', color: 'text-orange-400 bg-orange-900/30' },
  bicicleta:{ label: 'Bike',     color: 'text-yellow-400 bg-yellow-900/30' },
}

export default function ServiceCard({ service, rank, onSelect }) {
  const isBest = rank === 0
  const cat    = CATEGORY_LABELS[service.category]

  return (
    <button
      onClick={() => onSelect(service)}
      className={`w-full text-left rounded-3xl p-4 border transition-all active:scale-98 ${
        isBest
          ? 'bg-gradient-to-br from-primary-900/60 to-card border-primary-500/60 shadow-lg shadow-primary-900/30'
          : 'bg-card border-muted'
      }`}
    >
      {isBest && (
        <div className="flex items-center gap-1.5 mb-3">
          <Star size={12} className="text-primary-400 fill-primary-400" />
          <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">
            Melhor recomendação
          </span>
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ backgroundColor: service.bgColor }}
        >
          {service.emoji}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold text-white">{service.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.color}`}>
              {cat.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate">{service.description}</p>
        </div>

        {/* Price */}
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-extrabold text-white">
            R${service.price.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-xs text-slate-500">{service.totalMin} min</p>
        </div>
      </div>

      {/* Metrics row */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Clock size={11} />
          <span>{service.avgWaitMin} min espera</span>
        </div>

        {service.co2Saved > 0 ? (
          <div className="flex items-center gap-1 text-xs text-green-400">
            <Leaf size={11} />
            <span>-{service.co2Saved} kg CO₂</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Leaf size={11} />
            <span>{service.co2PerKm}g/km CO₂</span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-1 text-xs text-primary-400 font-semibold">
          <Zap size={11} />
          <span>{(service.score * 10).toFixed(0)}pts</span>
        </div>

        <ChevronRight size={14} className="text-slate-600" />
      </div>
    </button>
  )
}
