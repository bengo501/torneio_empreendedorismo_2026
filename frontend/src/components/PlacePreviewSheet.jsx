import { X, Navigation, Sparkles, Bookmark } from 'lucide-react'
import { glassSurface } from '../styles/glass.js'
import { pinMeta } from '../data/poa/mapCategories.js'

export default function PlacePreviewSheet({
  place,
  dark,
  onClose,
  onRoute,
  onAskAi,
  onSave,
  saved,
}) {
  if (!place) return null

  const glass = glassSurface(dark, 'primary')
  const text = dark ? 'text-white' : 'text-gray-900'
  const muted = dark ? 'text-white/55' : 'text-gray-500'
  const meta = pinMeta(place.pinType)

  return (
    <div className="absolute inset-x-0 z-[45] px-4 pointer-events-none" style={{ bottom: 'calc(var(--sheet-h, 76px) + 8px)' }}>
      <div
        className="pointer-events-auto rounded-3xl overflow-hidden shadow-2xl animate-fade-in"
        style={glass}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: `${meta.color}22`, border: `1px solid ${meta.color}44` }}
            >
              {meta.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={`text-base font-black leading-tight ${text}`}>{place.name}</p>
                  <p className="text-[10px] font-bold mt-0.5" style={{ color: meta.color }}>
                    {place.subcategory || place.category}
                  </p>
                </div>
                <button type="button" onClick={onClose} className={`p-1 rounded-lg ${muted}`} aria-label="fechar">
                  <X size={18} />
                </button>
              </div>
              {place.brand && (
                <p className={`text-[10px] mt-1 ${muted}`}>{place.brand}</p>
              )}
            </div>
          </div>

          {place.address && (
            <p className={`text-xs mt-3 leading-relaxed ${muted}`}>{place.address}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-3">
            {place.priceRange && (
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-zippi-400/15 text-zippi-400">
                {place.priceRange}
              </span>
            )}
            {place.isLocalBusiness && (
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-400">
                economia local
              </span>
            )}
          </div>

          {place.target && (
            <p className={`text-[11px] mt-2 ${muted}`}>
              <span className="font-semibold">público: </span>{place.target}
            </p>
          )}

          {place.preview && (
            <p className={`text-xs mt-2 leading-relaxed ${text} opacity-90`}>{place.preview}</p>
          )}

          <div className="grid grid-cols-3 gap-2 mt-4">
            <button
              type="button"
              onClick={onRoute}
              className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-zippi-400 text-dark-950 active:scale-95 transition-transform"
            >
              <Navigation size={16} strokeWidth={2.5} />
              <span className="text-[10px] font-black">ver rota</span>
            </button>
            <button
              type="button"
              onClick={onAskAi}
              className="flex flex-col items-center gap-1 py-2.5 rounded-xl active:scale-95 transition-transform"
              style={glassSurface(dark, 'secondary')}
            >
              <Sparkles size={16} className="text-yellow-500" />
              <span className={`text-[10px] font-bold ${text}`}>perguntar ia</span>
            </button>
            <button
              type="button"
              onClick={onSave}
              className="flex flex-col items-center gap-1 py-2.5 rounded-xl active:scale-95 transition-transform"
              style={glassSurface(dark, 'secondary')}
            >
              <Bookmark size={16} className={saved ? 'text-zippi-400 fill-zippi-400' : muted} />
              <span className={`text-[10px] font-bold ${saved ? 'text-zippi-400' : text}`}>salvar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
