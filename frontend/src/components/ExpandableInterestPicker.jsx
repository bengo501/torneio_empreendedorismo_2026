import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import {
  INTEREST_CATEGORIES,
  countAllSelected,
  toggleInterestTag,
  toggleGroupTags,
} from '../data/interestTree.js'

export default function ExpandableInterestPicker({
  selected = {},
  onChange,
  dark = true,
  minTags = 3,
}) {
  const [openCats, setOpenCats] = useState({})
  const [openGroups, setOpenGroups] = useState({})

  const muted = dark ? 'text-white/50' : 'text-gray-500'
  const text = dark ? 'text-white' : 'text-gray-900'
  const chipOff = dark
    ? 'bg-dark-800 border-dark-700 text-dark-300'
    : 'bg-gray-100 border-gray-200 text-gray-600'
  const chipOn = 'bg-zippi-400/20 border-zippi-400 text-zippi-400'

  const total = countAllSelected(selected)

  function toggleCat(catId) {
    setOpenCats(prev => ({ ...prev, [catId]: !prev[catId] }))
  }

  function toggleGroup(catId, groupId) {
    const key = `${catId}:${groupId}`
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-2">
      <p className={`text-xs ${muted}`}>
        {total} {total === 1 ? 'tag selecionada' : 'tags selecionadas'}
        {minTags > 0 && total < minTags && ` · mínimo ${minTags}`}
      </p>

      {INTEREST_CATEGORIES.map(cat => {
        const catOpen = openCats[cat.id]
        const catCount = (selected[cat.id] || []).length

        return (
          <div
            key={cat.id}
            className={`rounded-2xl border overflow-hidden ${
              dark ? 'border-dark-700 bg-dark-900/50' : 'border-gray-200 bg-white'
            }`}
          >
            <button
              type="button"
              onClick={() => toggleCat(cat.id)}
              className={`w-full flex items-center gap-2 px-3 py-3 text-left ${dark ? 'active:bg-dark-800' : 'active:bg-gray-50'}`}
            >
              {catOpen
                ? <ChevronDown size={16} className="text-zippi-400 flex-shrink-0" />
                : <ChevronRight size={16} className={muted + ' flex-shrink-0'} />}
              <span className={`flex-1 text-sm font-bold ${text}`}>{cat.label}</span>
              {catCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zippi-400/20 text-zippi-400">
                  {catCount}
                </span>
              )}
            </button>

            {catOpen && (
              <div className={`px-3 pb-3 space-y-2 border-t ${dark ? 'border-dark-700' : 'border-gray-100'}`}>
                {cat.groups.map(group => {
                  const gKey = `${cat.id}:${group.id}`
                  const gOpen = openGroups[gKey]
                  const groupSelected = group.tags.filter(t => (selected[cat.id] || []).includes(t)).length
                  const allInGroup = groupSelected === group.tags.length

                  return (
                    <div key={group.id} className={`rounded-xl ${dark ? 'bg-dark-800/60' : 'bg-gray-50'}`}>
                      <button
                        type="button"
                        onClick={() => toggleGroup(cat.id, group.id)}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-left"
                      >
                        {gOpen
                          ? <ChevronDown size={14} className="text-zippi-400/80" />
                          : <ChevronRight size={14} className={muted} />}
                        <span className={`flex-1 text-xs font-semibold ${text}`}>{group.label}</span>
                        {groupSelected > 0 && (
                          <span className={`text-[9px] font-bold ${muted}`}>{groupSelected}/{group.tags.length}</span>
                        )}
                      </button>

                      {gOpen && (
                        <div className="px-2.5 pb-2.5 space-y-2">
                          <button
                            type="button"
                            onClick={() => onChange(toggleGroupTags(selected, cat.id, group.tags, !allInGroup))}
                            className={`text-[10px] font-bold ${allInGroup ? 'text-zippi-400' : muted}`}
                          >
                            {allInGroup ? 'desmarcar grupo' : 'selecionar grupo'}
                          </button>
                          <div className="flex flex-wrap gap-1.5">
                            {group.tags.map(tag => {
                              const active = (selected[cat.id] || []).includes(tag)
                              return (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => onChange(toggleInterestTag(selected, cat.id, tag))}
                                  className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-colors active:scale-95 ${
                                    active ? chipOn : chipOff
                                  }`}
                                >
                                  {tag}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
