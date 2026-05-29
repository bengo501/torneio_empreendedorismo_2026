import { glassSurface } from '../styles/glass.js'

/** dock flutuante: perto de você + eventos */
export default function NotificationsDock({ items, dark, onItemClick }) {
  if (!items?.length) return null

  const style = glassSurface(dark, 'dock')

  return (
    <div
      className="w-full max-w-sm mx-auto pointer-events-auto"
      style={{
        ...style,
        borderRadius: 20,
        padding: '6px 8px',
      }}
    >
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-2" style={{ width: 'max-content', minWidth: '100%' }}>
          {items.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => onItemClick?.(item)}
              className="flex items-center gap-2 pl-2.5 pr-3 py-2 rounded-xl flex-shrink-0 active:scale-[0.97] transition-transform"
              style={{
                background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              }}
            >
              {item.live && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
              )}
              <span className="text-sm leading-none">{item.emoji}</span>
              <span className={`text-[11px] font-semibold whitespace-nowrap max-w-[220px] truncate ${dark ? 'text-white/90' : 'text-gray-800'}`}>
                {item.text}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
