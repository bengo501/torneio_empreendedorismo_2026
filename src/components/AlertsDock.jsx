import { glassSurface } from '../styles/glass.js'

/** dock de alertas — só clima e trânsito crítico; oculta se vazia */
export default function AlertsDock({ alerts, dark, onAlertClick }) {
  if (!alerts?.length) return null

  const style = glassSurface(dark, 'dock')

  return (
    <div
      className="w-full max-w-sm mx-auto pointer-events-auto"
      style={{
        ...style,
        borderRadius: 18,
        padding: '5px 8px',
        borderColor: dark ? 'rgba(255, 149, 0, 0.35)' : 'rgba(255, 149, 0, 0.25)',
      }}
    >
      <div className="flex flex-col gap-1">
        {alerts.map(alert => (
          <button
            key={alert.id}
            type="button"
            onClick={() => onAlertClick?.(alert)}
            className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-xl text-left active:scale-[0.98] transition-transform"
            style={{
              background: dark ? 'rgba(255, 149, 0, 0.08)' : 'rgba(255, 149, 0, 0.06)',
            }}
          >
            <span className="text-base leading-none flex-shrink-0">{alert.emoji}</span>
            <span className={`text-[11px] font-semibold flex-1 truncate ${dark ? 'text-white/90' : 'text-gray-800'}`}>
              {alert.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
