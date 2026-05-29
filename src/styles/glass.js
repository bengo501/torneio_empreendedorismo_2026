/** estilos de superfície "glass" inspirados no ios */

export function glassSurface(dark, variant = 'primary') {
  const bases = {
    primary: dark
      ? { bg: 'rgba(32, 33, 52, 0.78)', border: 'rgba(255,255,255,0.16)' }
      : { bg: 'rgba(255, 255, 255, 0.78)', border: 'rgba(255,255,255,0.85)' },
    secondary: dark
      ? { bg: 'rgba(255,255,255,0.09)', border: 'rgba(255,255,255,0.12)' }
      : { bg: 'rgba(255,255,255,0.52)', border: 'rgba(0,0,0,0.06)' },
    pill: dark
      ? { bg: 'rgba(18, 18, 28, 0.55)', border: 'rgba(255,255,255,0.14)' }
      : { bg: 'rgba(255,255,255,0.62)', border: 'rgba(255,255,255,0.75)' },
    dock: dark
      ? { bg: 'rgba(28, 29, 46, 0.88)', border: 'rgba(255,255,255,0.14)' }
      : { bg: 'rgba(248, 248, 252, 0.88)', border: 'rgba(0,0,0,0.07)' },
  }
  const v = bases[variant] ?? bases.primary

  return {
    background: v.bg,
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    border: `1px solid ${v.border}`,
    boxShadow: dark
      ? '0 8px 32px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.06)'
      : '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
  }
}

export const PIN_COLORS = {
  explore: {
    cultura: '#A855F7',
    parques: '#34C759',
    educacao: '#3B82F6',
    gastronomia: '#F97316',
    compras: '#EC4899',
    saude: '#14B8A6',
    default: '#6366F1',
  },
  event: {
    musica: '#A855F7',
    cultura: '#8B5CF6',
    feira: '#F97316',
    gastronomia: '#EF4444',
    esporte: '#3B82F6',
    gratuito: '#34C759',
    default: '#F59E0B',
  },
}

export function explorePinColor(category) {
  return PIN_COLORS.explore[category] ?? PIN_COLORS.explore.default
}

export function eventPinColor(cat) {
  return PIN_COLORS.event[cat] ?? PIN_COLORS.event.default
}
