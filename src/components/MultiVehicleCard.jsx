import { ChevronRight } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'
import { openService } from '../services/deeplinks.js'

export default function MultiVehicleCard({ combo, rank, origin, dest }) {
  const { dark } = useTheme()
  const isBest = rank === 0

  const bg     = dark ? 'bg-dark-900 border-dark-800' : 'bg-white border-gray-200'
  const text   = dark ? 'text-white'                  : 'text-gray-900'
  const muted  = dark ? 'text-dark-400'               : 'text-gray-500'
  const divClr = dark ? 'border-dark-800'             : 'border-gray-100'

  return (
    <div className={`rounded-3xl border overflow-hidden ${bg} ${isBest ? '!border-zippi-400/50' : ''}`}>
      {isBest && (
        <div className="bg-zippi-400 px-4 py-1.5">
          <p className="text-xs font-bold text-dark-950 uppercase tracking-widest">⚡ Melhor combinação</p>
        </div>
      )}

      <div className="p-4">
        {/* Vehicles row */}
        <div className="flex items-center gap-2 mb-3">
          {/* Vehicle 1 */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border border-dark-700"
              style={{ backgroundColor: combo.vehicle1.bgColor }}
            >
              {combo.vehicle1.emoji}
            </div>
            <div className="min-w-0">
              <p className={`text-sm font-bold ${text} leading-tight`}>{combo.vehicle1.name}</p>
              <p className={`text-xs ${muted}`}>{combo.distance1.toFixed(1)} km</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-6 h-6 rounded-full bg-dark-800 flex items-center justify-center">
              <ChevronRight size={12} className="text-zippi-400" />
            </div>
            <p className="text-xs text-dark-600 mt-0.5">troca</p>
          </div>

          {/* Vehicle 2 */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border border-dark-700"
              style={{ backgroundColor: combo.vehicle2.bgColor }}
            >
              {combo.vehicle2.emoji}
            </div>
            <div className="min-w-0">
              <p className={`text-sm font-bold ${text} leading-tight`}>{combo.vehicle2.name}</p>
              <p className={`text-xs ${muted}`}>{combo.distance2.toFixed(1)} km</p>
            </div>
          </div>

          {/* Total price */}
          <div className="text-right flex-shrink-0">
            <p className={`text-lg font-black ${text}`}>
              R${combo.totalPrice.toFixed(2).replace('.', ',')}
            </p>
            <p className={`text-xs ${muted}`}>{combo.totalMin} min</p>
          </div>
        </div>

        {/* Metrics */}
        <div className={`flex items-center gap-3 pt-3 border-t ${divClr}`}>
          {combo.co2Saved > 0 && (
            <span className="text-xs text-zippi-400 font-medium">
              🌿 -{combo.co2Saved.toFixed(2)} kg CO₂
            </span>
          )}
          {combo.weatherWarn && (
            <span className="text-xs text-yellow-400">⚠️ Possível chuva</span>
          )}
          <span className={`text-xs ${muted} ml-auto`}>
            +5 min troca de veículo
          </span>
        </div>

        {/* CTA buttons */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => openService(combo.vehicle1.id, origin, { ...dest, label: dest?.label })}
            className="flex-1 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-xs font-bold text-white active:scale-95 transition-transform"
          >
            Abrir {combo.vehicle1.name} →
          </button>
          <button
            onClick={() => openService(combo.vehicle2.id, origin, { ...dest, label: dest?.label })}
            className="flex-1 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-xs font-bold text-white active:scale-95 transition-transform"
          >
            Abrir {combo.vehicle2.name} →
          </button>
        </div>
      </div>
    </div>
  )
}
