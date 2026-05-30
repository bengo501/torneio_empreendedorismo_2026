/**
 * estilos de superfície glass inspirados no ios
 * iOS glass: baixa opacidade de fundo (35–55%) + blur forte (24–40px) + borda com realce sutil
 */
export function glassSurface(dark, variant = 'primary') {
  const bases = {
    // superfície principal: sheet, modal, card
    primary: dark
      ? { bg: 'rgba(20, 21, 38, 0.52)', border: 'rgba(255,255,255,0.14)' }
      : { bg: 'rgba(255, 255, 255, 0.45)', border: 'rgba(255,255,255,0.75)' },
    // superfície secundária: inputs, itens de lista
    secondary: dark
      ? { bg: 'rgba(255,255,255,0.07)', border: 'rgba(255,255,255,0.10)' }
      : { bg: 'rgba(255,255,255,0.38)', border: 'rgba(0,0,0,0.05)' },
    // pills/botões de ação flutuantes
    pill: dark
      ? { bg: 'rgba(14, 14, 26, 0.42)', border: 'rgba(255,255,255,0.16)' }
      : { bg: 'rgba(255,255,255,0.46)', border: 'rgba(255,255,255,0.70)' },
    // docks de notificação e alertas
    dock: dark
      ? { bg: 'rgba(18, 19, 36, 0.60)', border: 'rgba(255,255,255,0.13)' }
      : { bg: 'rgba(250, 250, 255, 0.58)', border: 'rgba(0,0,0,0.06)' },
  }
  const v = bases[variant] ?? bases.primary

  return {
    background: v.bg,
    backdropFilter: 'blur(36px) saturate(200%)',
    WebkitBackdropFilter: 'blur(36px) saturate(200%)',
    border: `1px solid ${v.border}`,
    boxShadow: dark
      ? '0 8px 32px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.07)'
      : '0 8px 32px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.95)',
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
