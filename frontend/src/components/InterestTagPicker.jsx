import { useMemo } from 'react'

export default function InterestTagPicker({
  categories,
  selected = {},
  onChange,
  dark = true,
  compact = false,
}) {
  const text = dark ? 'text-white' : 'text-gray-900'
  const muted = dark ? 'text-white/50' : 'text-gray-500'
  const chipOff = dark
    ? 'bg-dark-800 border-dark-700 text-dark-300'
    : 'bg-gray-100 border-gray-200 text-gray-600'
  const chipOn = 'bg-zippi-400/20 border-zippi-400 text-zippi-400'

  const total = useMemo(
    () => Object.values(selected).reduce((n, arr) => n + (arr?.length || 0), 0),
    [selected],
  )

  function toggle(catId, tag) {
    const current = selected[catId] || []
    const next = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag]
    onChange({ ...selected, [catId]: next })
  }

  return (
    <div className="space-y-4">
      {!compact && (
        <p className={`text-xs ${muted}`}>
          {total} {total === 1 ? 'interesse selecionado' : 'interesses selecionados'}
        </p>
      )}
      {categories.map(cat => (
        <div key={cat.id}>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${muted} mb-2`}>
            {cat.category}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {cat.tags.map(tag => {
              const active = (selected[cat.id] || []).includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggle(cat.id, tag)}
                  className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-xl border transition-colors active:scale-95 ${
                    active ? chipOn : chipOff
                  }`}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export function SimpleChipPicker({ tags, selected = [], onChange, dark = true, accent = 'zippi' }) {
  const chipOff = dark
    ? 'bg-dark-800 border-dark-700 text-dark-300'
    : 'bg-gray-100 border-gray-200 text-gray-600'
  const chipOn = accent === 'emerald'
    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
    : 'bg-zippi-400/20 border-zippi-400 text-zippi-400'

  function toggle(tag) {
    onChange(
      selected.includes(tag)
        ? selected.filter(t => t !== tag)
        : [...selected, tag],
    )
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map(tag => {
        const active = selected.includes(tag)
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-xl border transition-colors active:scale-95 ${
              active ? chipOn : chipOff
            }`}
          >
            {tag}
          </button>
        )
      })}
    </div>
  )
}

export function TransportAppPicker({ options, selected = [], onChange, dark = true }) {
  const chipOff = dark
    ? 'bg-dark-800 border-dark-700 text-dark-300'
    : 'bg-gray-100 border-gray-200 text-gray-600'
  const chipOn = 'bg-zippi-400/20 border-zippi-400 text-zippi-400'

  function toggle(id) {
    onChange(
      selected.includes(id)
        ? selected.filter(t => t !== id)
        : [...selected, id],
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map(opt => {
        const active = selected.includes(opt.id)
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => toggle(opt.id)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-colors active:scale-95 ${
              active ? chipOn : chipOff
            }`}
          >
            <span className="text-lg">{opt.emoji}</span>
            <span className="text-[11px] font-semibold leading-tight">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
