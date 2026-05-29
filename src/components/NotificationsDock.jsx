import { useState, useEffect } from 'react'
import { glassSurface } from '../styles/glass.js'

const ROTATE_MS = 5500
const FADE_MS = 320

/** dock flutuante: uma notificação por vez, rotação automática */
export default function NotificationsDock({ items, dark, onItemClick }) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setIndex(0)
    setVisible(true)
  }, [items])

  useEffect(() => {
    if (!items?.length || items.length <= 1) return undefined
    const iv = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % items.length)
        setVisible(true)
      }, FADE_MS)
    }, ROTATE_MS)
    return () => clearInterval(iv)
  }, [items])

  if (!items?.length) return null

  const item = items[index] ?? items[0]
  const style = glassSurface(dark, 'dock')

  return (
    <div
      className="w-full pointer-events-auto"
      style={{
        ...style,
        borderRadius: 16,
        padding: '4px 8px',
      }}
    >
      <button
        type="button"
        onClick={() => onItemClick?.(item)}
        className="flex items-center gap-2 w-full py-1 rounded-xl active:scale-[0.98] transition-transform"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(4px)',
          transition: `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`,
        }}
      >
        {item.live && (
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
        )}
        <span className="text-sm leading-none flex-shrink-0">{item.emoji}</span>
        <span className={`text-[11px] font-semibold flex-1 truncate text-left ${dark ? 'text-white/90' : 'text-gray-900'}`}>
          {item.text}
        </span>
      </button>
    </div>
  )
}
