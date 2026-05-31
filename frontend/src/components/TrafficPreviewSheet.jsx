import { X, GitBranch, Sparkles } from 'lucide-react'
import { glassSurface } from '../styles/glass.js'
import { TRAFFIC_MOCK_LEGEND } from '../data/poa/portoAlegreTrafficData.js'

export default function TrafficPreviewSheet({
  segment,
  dark,
  onClose,
  onAlternatives,
  onAskAi,
}) {
  if (!segment) return null

  const glass = glassSurface(dark, 'primary')
  const text = dark ? 'text-white' : 'text-gray-900'
  const muted = dark ? 'text-white/55' : 'text-gray-500'
  const legend = TRAFFIC_MOCK_LEGEND[segment.trafficLevel] ?? TRAFFIC_MOCK_LEGEND.medio
  const color = segment.color || legend.color

  return (
    <div
      className="absolute inset-x-0 z-[45] px-4 pointer-events-none"
      style={{ bottom: 'calc(var(--sheet-h, 76px) + 8px)' }}
    >
      <div
        className="pointer-events-auto rounded-3xl overflow-hidden shadow-2xl animate-fade-in"
        style={glass}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={`text-base font-black leading-tight ${text}`}>{segment.name}</p>
              <p className="text-[10px] font-bold mt-0.5" style={{ color }}>
                {legend.label} · {segment.speedLabel}
              </p>
            </div>
            <button type="button" onClick={onClose} className={`p-1 rounded-lg ${muted}`} aria-label="fechar">
              <X size={18} />
            </button>
          </div>

          <p className={`text-xs mt-2 ${muted}`}>
            velocidade estimada: <span className={text}>{segment.estimatedSpeed}</span>
          </p>
          <p className={`text-xs mt-1 ${muted}`}>
            região: <span className={text}>{segment.area}</span>
          </p>
          <p className={`text-xs mt-1 ${muted}`}>
            trecho: <span className={text}>{segment.from}</span>
            {' → '}
            <span className={text}>{segment.to}</span>
          </p>

          {segment.description && (
            <p className={`text-xs mt-3 leading-relaxed ${text} opacity-90`}>{segment.description}</p>
          )}

          {segment.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {segment.tags.map(tag => (
                <span
                  key={tag}
                  className="text-[9px] font-bold px-2 py-0.5 rounded-lg"
                  style={{ background: `${color}18`, color, border: `1px solid ${color}33` }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className={`text-[9px] mt-3 ${muted}`}>
            dados simulados para protótipo — não representa trânsito em tempo real
          </p>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              type="button"
              onClick={onAlternatives}
              className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-zippi-400 text-dark-950 active:scale-95 transition-transform"
            >
              <GitBranch size={16} strokeWidth={2.5} />
              <span className="text-[10px] font-black">ver alternativas</span>
            </button>
            <button
              type="button"
              onClick={onAskAi}
              className="flex flex-col items-center gap-1 py-2.5 rounded-xl active:scale-95 transition-transform"
              style={glassSurface(dark, 'secondary')}
            >
              <Sparkles size={16} className="text-yellow-500" />
              <span className={`text-[10px] font-bold ${text}`}>perguntar para ia</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
