import { useState } from 'react'
import { X, MapPin } from 'lucide-react'
import { PLACE_CATEGORIES, addPlaceContribution } from '../services/placeContributions.js'
import { useTheme } from '../context/ThemeContext.jsx'

export default function SuggestPlaceModal({ lat, lon, onClose, onAdded }) {
  const { dark } = useTheme()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('gastronomia')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  function submit() {
    if (!name.trim()) {
      setError('informe o nome do lugar')
      return
    }
    addPlaceContribution({
      name: name.trim(),
      category,
      address: address.trim() || null,
      lat: lat ?? null,
      lon: lon ?? null,
      note: note.trim() || null,
    })
    setDone(true)
    setError('')
    setTimeout(() => {
      onAdded?.()
      onClose()
    }, 1400)
  }

  const bg = dark ? 'bg-dark-900' : 'bg-white'
  const text = dark ? 'text-white' : 'text-gray-900'
  const muted = dark ? 'text-dark-400' : 'text-gray-500'
  const input = dark
    ? 'bg-dark-800 border-dark-700 text-white placeholder-dark-500'
    : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400'

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 ${bg} rounded-t-4xl border border-dark-800 animate-sheet-up max-h-[85vh] overflow-y-auto`}>
        <div className="w-10 h-1 bg-dark-700 rounded-full mx-auto mt-3" />

        <div className={`flex items-center justify-between px-5 pt-5 pb-3 ${text}`}>
          <h3 className="text-lg font-black">sugerir lugar</h3>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-xl bg-dark-800 flex items-center justify-center">
            <X size={15} className={muted} />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-10 px-5">
            <MapPin size={40} className="text-zippi-400" />
            <p className={`font-bold ${text}`}>sugestão enviada</p>
            <p className={`text-sm ${muted} text-center`}>
              em breve a equipe ou a comunidade pode validar e o lugar aparecer no mapa
            </p>
          </div>
        ) : (
          <div className="px-5 pb-8 flex flex-col gap-3">
            <p className={`text-xs ${muted}`}>
              ajude a manter o turio atualizado. sua sugestão fica na fila até validação (ver docs/contribuicao).
            </p>
            {lat != null && (
              <p className={`text-xs ${muted} flex items-center gap-1`}>
                <MapPin size={12} />
                posição: {lat.toFixed(5)}, {lon.toFixed(5)}
              </p>
            )}
            <input
              className={`w-full rounded-xl border px-3 py-2.5 text-sm ${input}`}
              placeholder="nome do lugar"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <select
              className={`w-full rounded-xl border px-3 py-2.5 text-sm ${input}`}
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {PLACE_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <input
              className={`w-full rounded-xl border px-3 py-2.5 text-sm ${input}`}
              placeholder="endereço (opcional)"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
            <textarea
              className={`w-full rounded-xl border px-3 py-2.5 text-sm resize-none ${input}`}
              placeholder="horário, site, por que vale a pena… (opcional)"
              rows={3}
              value={note}
              onChange={e => setNote(e.target.value)}
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="button"
              onClick={submit}
              className="w-full py-3 rounded-2xl bg-zippi-400 text-dark-950 font-bold text-sm active:scale-[0.98]"
            >
              enviar sugestão
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
