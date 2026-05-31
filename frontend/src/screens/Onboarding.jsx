import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { BEHAVIOR_CATEGORIES, loadSelectedTags, saveSelectedTags } from '../data/behaviorTags.js'

export default function Onboarding() {
  const navigate = useNavigate()
  
  // States
  const [selectedTags, setSelectedTags] = useState(() => loadSelectedTags())
  const [openCategory, setOpenCategory] = useState(BEHAVIOR_CATEGORIES[0]?.id)
  
  // Save when tags change
  useEffect(() => {
    saveSelectedTags(selectedTags)
  }, [selectedTags])

  function toggleTag(tag) {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  function handleFinish() {
    navigate('/home')
  }

  return (
    <div className="flex flex-col min-h-dvh bg-dark-950 text-white pb-6">
      
      {/* Header */}
      <div className="pt-14 px-6 pb-4">
        <button
          onClick={() => navigate('/login')}
          className="w-9 h-9 rounded-xl bg-dark-900 border border-dark-800 flex items-center justify-center text-dark-400 mb-6"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-3xl font-black mb-2 leading-tight">Como você gosta de explorar?</h1>
        <p className="text-sm text-dark-400">
          Selecione o que combina com você para que a nossa IA possa personalizar suas recomendações e trajetos.
        </p>
      </div>

      {/* Tags Section */}
      <div className="flex-1 px-6 overflow-y-auto">
        <div className="flex flex-col gap-3">
          {BEHAVIOR_CATEGORIES.map(cat => {
            const isOpen = openCategory === cat.id
            const selectedCount = cat.tags.filter(t => selectedTags.includes(t)).length

            return (
              <div
                key={cat.id}
                className="bg-dark-900 border border-dark-800 rounded-3xl overflow-hidden transition-all duration-300"
              >
                {/* Category Header */}
                <button
                  onClick={() => setOpenCategory(isOpen ? null : cat.id)}
                  className="w-full flex items-center justify-between p-4 bg-dark-900/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white">{cat.label}</span>
                    {selectedCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-zippi-400 text-dark-950 text-[10px] font-black flex items-center justify-center">
                        {selectedCount}
                      </span>
                    )}
                  </div>
                  <ChevronRight
                    size={16}
                    className={`text-dark-500 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
                  />
                </button>

                {/* Category Tags */}
                {isOpen && (
                  <div className="p-4 pt-0 border-t border-dark-800/50 flex flex-wrap gap-2 mt-2">
                    {cat.tags.map(tag => {
                      const active = selectedTags.includes(tag)
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all border ${
                            active
                              ? 'bg-zippi-400/20 text-zippi-400 border-zippi-400/30'
                              : 'bg-dark-800 text-dark-400 border-dark-700'
                          }`}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pt-6 flex-shrink-0">
        <button
          onClick={handleFinish}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg bg-zippi-400 text-dark-950 shadow-zippi-900/30"
        >
          {selectedTags.length === 0 ? 'Pular por enquanto' : 'Continuar e explorar'}
          <ChevronRight size={18} />
        </button>
      </div>
      
    </div>
  )
}
