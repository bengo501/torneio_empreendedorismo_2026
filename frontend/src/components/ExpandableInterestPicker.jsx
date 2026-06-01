import { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import {
  INTEREST_CATEGORIES,
  countAllSelected,
  toggleInterestTag,
} from '../data/interestTree.js'

const BLUE = '#2B7FE6'
const BLUE_LIGHT = '#5B9FEF'

function titleCase(s) {
  return s.replace(/\b\w/g, c => c.toUpperCase())
}

function TagChip({ label, selected, expandable, expanded, onClick, dark }) {
  const offBg = dark ? 'bg-dark-800' : 'bg-white'
  const offBorder = dark ? 'border-blue-400/50' : 'border-blue-300'
  const offText = dark ? 'text-blue-300' : 'text-blue-500'

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-[0.97] shadow-sm"
      style={
        selected
          ? { background: BLUE, color: '#fff', border: `2px solid ${BLUE}` }
          : { background: offBg, color: offText, border: `2px solid ${offBorder}` }
      }
    >
      <span className="whitespace-nowrap">{label}</span>
      {selected ? (
        <Check size={16} strokeWidth={2.5} className="flex-shrink-0" />
      ) : expandable && !expanded ? (
        <Plus size={16} strokeWidth={2.5} className="flex-shrink-0" style={{ color: BLUE_LIGHT }} />
      ) : null}
    </button>
  )
}

export default function ExpandableInterestPicker({
  selected = {},
  onChange,
  dark = true,
  minTags = 3,
}) {
  const [expandedCats, setExpandedCats] = useState({})
  const [expandedGroups, setExpandedGroups] = useState({})

  const muted = dark ? 'text-white/55' : 'text-gray-500'
  const total = countAllSelected(selected)

  function isCatActive(catId) {
    return (selected[catId] || []).length > 0
  }

  function isGroupActive(catId, group) {
    const sel = selected[catId] || []
    return group.tags.some(t => sel.includes(t))
  }

  function isTagActive(catId, tag) {
    return (selected[catId] || []).includes(tag)
  }

  function handleCategoryClick(cat) {
    const willExpand = !expandedCats[cat.id]
    setExpandedCats(prev => ({ ...prev, [cat.id]: willExpand }))
  }

  function handleGroupClick(cat, group) {
    const key = `${cat.id}:${group.id}`
    const willExpand = !expandedGroups[key]
    setExpandedGroups(prev => ({ ...prev, [key]: willExpand }))
  }

  function handleGroupSelect(cat, group) {
    const sel = selected[cat.id] || []
    const allOn = group.tags.every(t => sel.includes(t))
    let next = [...sel]
    if (allOn) {
      next = next.filter(t => !group.tags.includes(t))
    } else {
      group.tags.forEach(t => { if (!next.includes(t)) next.push(t) })
    }
    onChange({ ...selected, [cat.id]: next })
    const key = `${cat.id}:${group.id}`
    if (!expandedGroups[key]) {
      setExpandedGroups(prev => ({ ...prev, [key]: true }))
    }
  }

  return (
    <div className="space-y-3">
      <p className={`text-xs ${muted}`}>
        toque na tag para expandir e escolher ramificações · {total} selecionadas
        {minTags > 0 && total < minTags && ` (mín. ${minTags})`}
      </p>

      <div className="flex flex-wrap gap-2.5 content-start">
        {INTEREST_CATEGORIES.map(cat => {
          const catExpanded = expandedCats[cat.id]
          const catActive = isCatActive(cat.id)

          return (
            <span key={cat.id} className="contents">
              <TagChip
                label={titleCase(cat.label)}
                selected={catActive}
                expandable={cat.groups.length > 0}
                expanded={catExpanded}
                dark={dark}
                onClick={() => handleCategoryClick(cat)}
              />

              {catExpanded && cat.groups.map(group => {
                const gKey = `${cat.id}:${group.id}`
                const gExpanded = expandedGroups[gKey]
                const gActive = isGroupActive(cat.id, group)
                const groupLabel = titleCase(group.shortLabel || group.label)
                const hasBranches = group.tags.length > 1

                return (
                  <span key={gKey} className="contents">
                    <TagChip
                      label={groupLabel}
                      selected={gActive}
                      expandable={hasBranches}
                      expanded={gExpanded}
                      dark={dark}
                      onClick={() => {
                        if (!hasBranches) {
                          onChange(toggleInterestTag(selected, cat.id, group.tags[0]))
                          return
                        }
                        if (!gExpanded) {
                          handleGroupClick(cat, group)
                        } else {
                          handleGroupSelect(cat, group)
                        }
                      }}
                    />

                    {gExpanded && hasBranches && (
                      <div className="w-full flex flex-wrap gap-2 pt-0.5 pb-1">
                        {group.tags.map(tag => (
                          <TagChip
                            key={tag}
                            label={titleCase(tag)}
                            selected={isTagActive(cat.id, tag)}
                            expandable={false}
                            dark={dark}
                            onClick={() => onChange(toggleInterestTag(selected, cat.id, tag))}
                          />
                        ))}
                      </div>
                    )}
                  </span>
                )
              })}
            </span>
          )
        })}
      </div>

      <p className={`text-[10px] ${muted} leading-relaxed`}>
        tag geral com + expande ramificações · tag azul com ✓ está selecionada
      </p>
    </div>
  )
}
