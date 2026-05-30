import { useTheme } from '../context/ThemeContext.jsx'
import { openService } from '../services/deeplinks.js'

const CAT_COLOR = {
  carro:     '#60A5FA',
  patinete:  '#FB923C',
  bicicleta: '#FACC15',
  onibus:    '#34D399',
}

/**
 * Card simplificado de transporte:
 * emoji + nome | categoria | preço | tempo | botão "Abrir"
 * Clicar abre o app diretamente (deeplink) ou leva à loja.
 */
export default function ServiceCard({ service, rank, origin, dest }) {
  const { dark } = useTheme()

  const bg    = dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)'
  const bdr   = dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)'
  const text  = dark ? 'text-white'              : 'text-gray-900'
  const muted = dark ? 'text-white/45'           : 'text-gray-500'

  const isBest  = rank === 0
  const catColor = CAT_COLOR[service.category] ?? '#9CA3AF'

  function handleOpen(e) {
    e.stopPropagation()
    openService(service.id, origin, dest)
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all active:scale-[0.98]"
      style={{
        background: bg,
        border: `1px solid ${isBest ? 'rgba(61,237,122,0.35)' : bdr}`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: service.bgColor ?? (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)') }}
      >
        {service.emoji}
      </div>

      {/* name + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`text-sm font-bold ${text} truncate`}>{service.name}</span>
          {isBest && (
            <span className="text-[9px] font-black text-zippi-400 bg-zippi-400/10 px-1.5 py-0.5 rounded-md leading-none flex-shrink-0">
              MELHOR
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md leading-none"
            style={{ color: catColor, background: catColor + '20' }}>
            {service.category}
          </span>
          <span className={`text-xs ${muted}`}>{service.avgWaitMin} min espera</span>
        </div>
      </div>

      {/* price + time */}
      <div className="text-right flex-shrink-0 mr-1">
        <p className={`text-sm font-black ${text} leading-tight`}>
          R${service.price.toFixed(2).replace('.', ',')}
        </p>
        <p className={`text-[11px] ${muted}`}>{service.totalMin} min</p>
      </div>

      {/* open app button */}
      <button
        onClick={handleOpen}
        className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold bg-zippi-400 text-dark-950 active:scale-90 transition-transform leading-none"
      >
        Abrir
      </button>
    </div>
  )
}
