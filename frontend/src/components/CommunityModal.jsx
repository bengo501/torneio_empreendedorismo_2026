import { useState } from 'react'
import { X } from 'lucide-react'
import { REPORT_TYPES, addReport } from '../services/community.js'
import { useTheme } from '../context/ThemeContext.jsx'

export default function CommunityModal({ lat, lon, onClose, onAdded }) {
  const { dark } = useTheme()
  const [type, setType]   = useState('danger')
  const [desc, setDesc]   = useState('')
  const [done, setDone]   = useState(false)

  function submit() {
    addReport({ type, lat, lon, description: desc })
    setDone(true)
    setTimeout(() => { onAdded?.(); onClose() }, 1200)
  }

  const bg    = dark ? 'bg-dark-900'  : 'bg-white'
  const text  = dark ? 'text-white'   : 'text-gray-900'
  const muted = dark ? 'text-dark-400': 'text-gray-500'
  const input = dark ? 'bg-dark-800 border-dark-700 text-white placeholder-dark-500' : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400'

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 ${bg} rounded-t-4xl border border-dark-800 animate-sheet-up`}>
        <div className="w-10 h-1 bg-dark-700 rounded-full mx-auto mt-3 mb-0" />

        <div className={`flex items-center justify-between px-5 pt-5 pb-3 ${text}`}>
          <h3 className="text-lg font-black">Reportar ocorrência</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-dark-800 flex items-center justify-center">
            <X size={15} className={muted} />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <span className="text-5xl">✅</span>
            <p className={`font-bold ${text}`}>Ocorrência reportada!</p>
            <p className={`text-sm ${muted}`}>Obrigado por ajudar a comunidade Turio</p>
          </div>
        ) : (
          <div className="px-5 pb-8">
            {lat && (
              <p className={`text-xs ${muted} mb-4`}>
                📍 Posição: {lat.toFixed(5)}, {lon.toFixed(5)}
              </p>
            )}

            {/* Type grid */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {REPORT_TYPES.map(rt => (
                <button
                  key={rt.id}
                  onClick={() => setType(rt.id)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl border transition-all ${
                    type === rt.id
                      ? 'border-zippi-400 bg-zippi-900/30'
                      : dark ? 'border-dark-700 bg-dark-800' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{rt.emoji}</span>
                  <span className={`text-xs text-center leading-tight font-medium ${type === rt.id ? 'text-zippi-400' : muted}`}>
                    {rt.label.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>

            {/* Description */}
            <input
              type="text"
              placeholder="Descrição (opcional)"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className={`w-full ${input} border rounded-xl px-4 py-3 text-sm outline-none mb-4`}
            />

            <button
              onClick={submit}
              className="w-full py-4 rounded-2xl bg-zippi-400 text-dark-950 font-black text-base active:scale-95 transition-transform"
            >
              Reportar agora
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
