import { X, ExternalLink, Clock, Leaf, Star, Shield, TrendingDown } from 'lucide-react'

export default function ServiceDetail({ service, onClose }) {
  if (!service) return null

  const metrics = [
    { label: 'Preço estimado',   value: `R$${service.price.toFixed(2).replace('.', ',')}`, icon: '💰', highlight: true },
    { label: 'Tempo total',      value: `${service.totalMin} min`,                         icon: '⏱️' },
    { label: 'Espera estimada',  value: `${service.avgWaitMin} min`,                       icon: '🕐' },
    { label: 'Conforto',         value: `${service.comfortScore}/10`,                      icon: '⭐' },
    { label: 'Disponibilidade',  value: `${(service.availability*100).toFixed(0)}%`,       icon: '📶' },
    {
      label: service.co2Saved > 0 ? 'CO₂ economizado' : 'Emissão CO₂',
      value: service.co2Saved > 0 ? `-${service.co2Saved}kg` : `${service.co2PerKm}g/km`,
      icon: '🌱',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card rounded-t-3xl border border-muted border-b-0 overflow-hidden animate-slide-up">
        {/* Handle */}
        <div className="w-10 h-1 bg-muted rounded-full mx-auto mt-3" />

        {/* Header */}
        <div className="flex items-center gap-4 px-5 pt-4 pb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ backgroundColor: service.bgColor }}
          >
            {service.emoji}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-white">{service.name}</h2>
            <p className="text-sm text-slate-400">{service.description}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center"
          >
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        {/* Score bar */}
        <div className="mx-5 mb-4 bg-surface rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-widest">Score RotAI</span>
            <span className="text-lg font-extrabold text-primary-400">{(service.score * 10).toFixed(0)}<span className="text-xs text-slate-500">/100</span></span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all"
              style={{ width: `${service.score * 10}%` }}
            />
          </div>
        </div>

        {/* Metrics grid */}
        <div className="mx-5 mb-4 grid grid-cols-3 gap-2">
          {metrics.map(m => (
            <div key={m.label} className={`rounded-2xl p-3 text-center ${m.highlight ? 'bg-primary-900/40 border border-primary-500/30' : 'bg-surface'}`}>
              <p className="text-xl mb-1">{m.icon}</p>
              <p className={`text-sm font-bold ${m.highlight ? 'text-primary-400' : 'text-white'}`}>{m.value}</p>
              <p className="text-xs text-slate-500 leading-tight mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Why recommended */}
        <div className="mx-5 mb-5 bg-surface rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star size={13} className="text-primary-400 fill-primary-400" />
            <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">Por que recomendamos</span>
          </div>
          <ul className="flex flex-col gap-1.5">
            {service.category !== 'carro' && (
              <li className="flex items-center gap-2 text-xs text-slate-300">
                <Leaf size={12} className="text-green-400 flex-shrink-0" />
                Transporte sustentável — zero emissões de CO₂
              </li>
            )}
            {service.price < 10 && (
              <li className="flex items-center gap-2 text-xs text-slate-300">
                <TrendingDown size={12} className="text-yellow-400 flex-shrink-0" />
                Melhor custo-benefício para essa distância
              </li>
            )}
            <li className="flex items-center gap-2 text-xs text-slate-300">
              <Clock size={12} className="text-blue-400 flex-shrink-0" />
              Tempo estimado de chegada: {service.totalMin} minutos
            </li>
            <li className="flex items-center gap-2 text-xs text-slate-300">
              <Shield size={12} className="text-purple-400 flex-shrink-0" />
              {(service.availability * 100).toFixed(0)}% de disponibilidade na sua região
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="px-5 pb-8">
          <button
            onClick={() => window.open(service.storeLink, '_blank')}
            className="w-full py-4 rounded-2xl bg-primary-500 hover:bg-primary-600 active:scale-95 transition-all font-bold text-white flex items-center justify-center gap-2 text-base shadow-lg shadow-primary-900/40"
          >
            <ExternalLink size={16} />
            Abrir {service.name}
          </button>
          <p className="text-center text-xs text-slate-600 mt-3">
            Abre o app diretamente com seu destino
          </p>
        </div>
      </div>
    </div>
  )
}
