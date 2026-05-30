import { useState, useEffect } from 'react'
import { glassSurface } from '../styles/glass.js'

const ROTATE_MS = 6000
const FADE_MS = 320

/** dock de alertas — um aviso por vez; compacto para canto superior direito */
export default function AlertsDock({ alerts, dark, onAlertClick, compact = false }) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setIndex(0)
    setVisible(true)
  }, [alerts])

  useEffect(() => {
    if (!alerts?.length || alerts.length <= 1) return undefined
    const iv = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % alerts.length)
        setVisible(true)
      }, FADE_MS)
    }, ROTATE_MS)
    return () => clearInterval(iv)
  }, [alerts])

  if (!alerts?.length) return null

  const alert = alerts[index] ?? alerts[0]
  const style = glassSurface(dark, 'dock')

  if (compact) {
    return (
      <div
        className="pointer-events-auto max-w-[168px]"
        style={{
          ...style,
          borderRadius: 12,
          padding: '3px 6px',
          borderColor: dark ? 'rgba(255, 149, 0, 0.35)' : 'rgba(255, 149, 0, 0.25)',
        }}
      >
        <button
          type="button"
          onClick={() => onAlertClick?.(alert)}
          className="flex items-center gap-1.5 w-full py-0.5 rounded-lg text-left active:scale-[0.98] transition-transform"
          style={{
            opacity: visible ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease`,
          }}
        >
          <span className="text-[11px] leading-none flex-shrink-0">{alert.emoji}</span>
          <span className={`text-[9px] font-semibold flex-1 truncate leading-tight ${dark ? 'text-white/85' : 'text-gray-900'}`}>
            {alert.text}
          </span>
        </button>
      </div>
    )
  }

  return (
    <div
      className="w-full pointer-events-auto"
      style={{
        ...style,
        borderRadius: 18,
        padding: '5px 10px',
        borderColor: dark ? 'rgba(255, 149, 0, 0.35)' : 'rgba(255, 149, 0, 0.25)',
      }}
    >
      <button
        type="button"
        onClick={() => onAlertClick?.(alert)}
        className="flex items-center gap-2.5 w-full py-1.5 rounded-xl text-left active:scale-[0.98] transition-transform"
        style={{
          background: dark ? 'rgba(255, 149, 0, 0.08)' : 'rgba(255, 149, 0, 0.06)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(4px)',
          transition: `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`,
        }}
      >
        <span className="text-base leading-none flex-shrink-0">{alert.emoji}</span>
        <span className={`text-[11px] font-semibold flex-1 truncate ${dark ? 'text-white/90' : 'text-gray-900'}`}>
          {alert.text}
        </span>
      </button>
    </div>
  )
}
