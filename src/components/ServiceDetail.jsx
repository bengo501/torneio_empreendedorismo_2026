import { X, ExternalLink, Bell, BellOff } from 'lucide-react'
import { useState } from 'react'

export default function ServiceDetail({ service, onClose }) {
  const [alert, setAlert] = useState(false)
  if (!service) return null

  const metrics = [
    { icon: '💰', label: 'Preço estimado',   value: `R$${service.price.toFixed(2).replace('.', ',')}`, green: true },
    { icon: '⏱️', label: 'Tempo total',       value: `${service.totalMin} min` },
    { icon: '🕐', label: 'Espera estimada',   value: `${service.avgWaitMin} min` },
    { icon: '⭐', label: 'Conforto',           value: `${service.comfortScore}/10` },
    { icon: '📶', label: 'Disponibilidade',   value: `${(service.availability*100).toFixed(0)}%` },
    { icon: '🌱', label: service.co2Saved > 0 ? 'CO₂ economizado' : 'Emissão CO₂',
                  value: service.co2Saved > 0 ? `-${service.co2Saved}kg` : `${service.co2PerKm}g/km`,
                  green: service.co2Saved > 0 },
  ]

  const reasons = [
    service.category !== 'carro'  && '🌍 Zero emissões de CO₂ — transporte sustentável',
    service.price < 10             && '💸 Melhor custo-benefício para esta distância',
    service.avgWaitMin <= 2        && '⚡ Disponível imediatamente, sem espera',
                                      `📍 ${(service.availability*100).toFixed(0)}% de disponibilidade na região`,
    `🕐 Chegada estimada em ${service.totalMin} minutos`,
  ].filter(Boolean)

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative z-10 bg-dark-900 rounded-t-4xl border border-dark-800 overflow-hidden animate-sheet-up max-h-[90dvh] overflow-y-auto">
        {/* Handle */}
        <div className="w-10 h-1 bg-dark-700 rounded-full mx-auto mt-3 mb-0" />

        {/* Header */}
        <div className="flex items-center gap-4 px-5 pt-5 pb-4 sticky top-0 bg-dark-900 z-10">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 border border-dark-700"
            style={{ backgroundColor: service.bgColor }}
          >
            {service.emoji}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-black text-white">{service.name}</h2>
            <p className="text-sm text-dark-500">{service.description}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-dark-800 flex items-center justify-center">
            <X size={16} className="text-dark-400" />
          </button>
        </div>

        <div className="px-5 pb-8">
          {/* Score bar */}
          <div className="bg-dark-950 rounded-2xl p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-dark-500 font-bold uppercase tracking-widest">Score Zippi</span>
              <span className="text-2xl font-black text-zippi-400">
                {(service.score * 10).toFixed(0)}
                <span className="text-sm text-dark-600 font-medium">/100</span>
              </span>
            </div>
            <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-zippi-400 rounded-full transition-all"
                style={{ width: `${service.score * 10}%` }}
              />
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {metrics.map(m => (
              <div key={m.label} className={`rounded-2xl p-3 text-center ${
                m.green ? 'bg-zippi-900/30 border border-zippi-400/20' : 'bg-dark-950'
              }`}>
                <p className="text-xl mb-1">{m.icon}</p>
                <p className={`text-sm font-black ${m.green ? 'text-zippi-400' : 'text-white'}`}>{m.value}</p>
                <p className="text-xs text-dark-600 leading-tight mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Why */}
          <div className="bg-dark-950 rounded-2xl p-4 mb-4">
            <p className="text-xs text-dark-500 font-bold uppercase tracking-widest mb-3">Por que recomendamos</p>
            <ul className="flex flex-col gap-2">
              {reasons.map((r, i) => (
                <li key={i} className="text-sm text-dark-300">{r}</li>
              ))}
            </ul>
          </div>

          {/* Price alert toggle */}
          <button
            onClick={() => setAlert(a => !a)}
            className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 mb-4 border transition-all ${
              alert
                ? 'bg-zippi-900/30 border-zippi-400/40'
                : 'bg-dark-950 border-dark-800'
            }`}
          >
            {alert
              ? <Bell size={18} className="text-zippi-400 flex-shrink-0" />
              : <BellOff size={18} className="text-dark-500 flex-shrink-0" />
            }
            <div className="flex-1 text-left">
              <p className={`text-sm font-semibold ${alert ? 'text-zippi-400' : 'text-dark-400'}`}>
                {alert ? 'Alerta de preço ativo' : 'Ativar alerta de preço'}
              </p>
              <p className="text-xs text-dark-600">
                {alert
                  ? `Aviso quando preço cair abaixo de R$${(service.price * 0.9).toFixed(2).replace('.', ',')}`
                  : 'Notificação quando o preço baixar'}
              </p>
            </div>
            <div className={`w-11 h-6 rounded-full transition-all ${alert ? 'bg-zippi-400' : 'bg-dark-700'}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow mt-0.5 transition-all ${alert ? 'ml-5.5' : 'ml-0.5'}`} style={{marginLeft: alert ? '22px' : '2px'}} />
            </div>
          </button>

          {/* CTA */}
          <button
            onClick={() => window.open(service.storeLink, '_blank')}
            className="w-full py-4 rounded-2xl bg-zippi-400 text-dark-950 font-black text-base flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-zippi-900/30"
          >
            <ExternalLink size={18} />
            Abrir {service.name}
          </button>
          <p className="text-center text-xs text-dark-700 mt-2">
            Redireciona para o app com seu destino preenchido
          </p>
        </div>
      </div>
    </div>
  )
}
