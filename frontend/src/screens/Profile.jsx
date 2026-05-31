import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Bell, Moon, Sun, ChevronRight,
  LogOut, HelpCircle, Info, Edit3, Shield, User,
  Sparkles, ChevronDown, ChevronUp,
  Wallet, Zap, Compass, Navigation, Clock, Heart, Users, Accessibility,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'
import { useUser } from '../context/UserContext.jsx'
import {
  BEHAVIOR_CATEGORIES,
  loadSelectedTags,
  saveSelectedTags,
} from '../data/behaviorTags.js'

const CAT_ICONS = {
  budget: Wallet,
  vibe: Zap,
  space: Compass,
  mobility: Navigation,
  time: Clock,
  interests: Heart,
  company: Users,
  needs: Accessibility,
}

export default function Profile() {
  const navigate             = useNavigate()
  const { dark, toggle }     = useTheme()
  const user                 = useUser()
  const [notif, setNotif]               = useState(true)
  const [selectedTags, setSelectedTags] = useState(() => loadSelectedTags())
  const [expandedCat, setExpandedCat]   = useState(null)

  const toggleTag = useCallback((tag) => {
    setSelectedTags(prev => {
      const next = prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
      saveSelectedTags(next)
      return next
    })
  }, [])

  const bg    = dark ? 'bg-dark-950'     : 'bg-gray-50'
  const bg2   = dark ? 'bg-dark-900'     : 'bg-white'
  const bg3   = dark ? 'bg-dark-800'     : 'bg-gray-100'
  const bdr   = dark ? 'border-dark-800' : 'border-gray-200'
  const bdr2  = dark ? 'border-dark-700' : 'border-gray-300'
  const text  = dark ? 'text-white'      : 'text-gray-900'
  const muted = dark ? 'text-dark-400'   : 'text-gray-500'
  const dim   = dark ? 'text-dark-600'   : 'text-gray-400'
  const sub   = dark ? 'text-dark-300'   : 'text-gray-600'

  return (
    <div className={`flex flex-col min-h-dvh ${bg}`}>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className={`px-5 pt-14 pb-5 ${bg}`}>
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/home')}
            className={`w-9 h-9 rounded-xl ${bg3} border ${bdr2} flex items-center justify-center`}
          >
            <ArrowLeft size={16} className={sub} />
          </button>
          <h1 className={`text-xl font-black ${text}`}>Meu Perfil</h1>
        </div>

        {/* ── AVATAR + NOME ─────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-shrink-0">
            {/* Avatar gradient */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-zippi-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-zippi-900/40">
              <span className="text-2xl font-black text-dark-950 select-none">
                {user.initials}
              </span>
            </div>
            {/* Verified badge */}
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-zippi-400 flex items-center justify-center shadow-md border-2 border-dark-950">
              <span className="text-[9px] font-black text-dark-950">✓</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className={`text-xl font-black ${text} leading-tight`}>{user.fullName}</h2>
            <p className={`text-sm ${muted} mt-0.5`}>{user.phone}</p>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-zippi-400 bg-zippi-900/30 px-2 py-0.5 rounded-full">
                📍 {user.city}
              </span>
              <span className={`text-[10px] ${dim}`}>· Desde {user.since}</span>
            </div>
          </div>

          <button
            className={`w-9 h-9 rounded-xl ${bg3} border ${bdr2} flex items-center justify-center flex-shrink-0`}
            title="Editar perfil"
          >
            <Edit3 size={14} className={muted} />
          </button>
        </div>

        {/* ── BEHAVIOR TAGS CARD ────────────────────────────────── */}
        <div className={`${bg2} border ${bdr} rounded-3xl p-4`}>

          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-zippi-400" />
              <p className={`text-[10px] font-bold uppercase tracking-widest ${dim}`}>
                Seu Perfil de Gostos
              </p>
            </div>
            {selectedTags.length > 0 && (
              <span className="text-[10px] font-bold text-zippi-400 bg-zippi-900/30 px-2 py-0.5 rounded-full">
                {selectedTags.length} selecionadas
              </span>
            )}
          </div>

          {/* Intro text */}
          <p className={`text-xs ${muted} mb-4 leading-relaxed`}>
            Selecione o que combina com você — a IA vai usar isso para recomendar lugares e eventos.
          </p>

          {/* Selected tags preview */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {selectedTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-zippi-400/15 text-zippi-400 border border-zippi-400/30 active:scale-95 transition-all duration-150"
                >
                  {tag} ✕
                </button>
              ))}
            </div>
          )}

          {/* Category accordion */}
          <div className="space-y-1.5">
            {BEHAVIOR_CATEGORIES.map(cat => {
              const isOpen = expandedCat === cat.id
              const catSelectedCount = cat.tags.filter(t => selectedTags.includes(t)).length
              const Icon = CAT_ICONS[cat.id] || Sparkles

              return (
                <div key={cat.id}>
                  {/* Category header */}
                  <button
                    onClick={() => setExpandedCat(isOpen ? null : cat.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors duration-150 ${
                      isOpen
                        ? dark ? 'bg-dark-700/60' : 'bg-gray-100'
                        : dark ? 'active:bg-dark-800' : 'active:bg-gray-50'
                    }`}
                  >
                    <Icon size={16} className={dark ? 'text-zippi-400' : 'text-zippi-500'} />
                    <span className={`flex-1 text-left text-xs font-semibold ${text}`}>
                      {cat.label}
                    </span>
                    {catSelectedCount > 0 && (
                      <span className="text-[9px] font-bold text-zippi-400 bg-zippi-400/15 w-5 h-5 rounded-full flex items-center justify-center">
                        {catSelectedCount}
                      </span>
                    )}
                    {isOpen
                      ? <ChevronUp size={14} className={dim} />
                      : <ChevronDown size={14} className={dim} />
                    }
                  </button>

                  {/* Tags (expanded) */}
                  {isOpen && (
                    <div className="flex flex-wrap gap-1.5 px-3 pt-2 pb-3">
                      {cat.tags.map(tag => {
                        const active = selectedTags.includes(tag)
                        return (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`text-[11px] font-medium px-2.5 py-1.5 rounded-full border transition-all duration-150 active:scale-95 ${
                              active
                                ? 'bg-zippi-400/20 text-zippi-400 border-zippi-400/40 font-semibold'
                                : dark
                                  ? 'bg-dark-800/60 text-dark-300 border-dark-700 active:bg-dark-700'
                                  : 'bg-gray-50 text-gray-600 border-gray-200 active:bg-gray-100'
                            }`}
                          >
                            {active ? '✓ ' : ''}{tag}
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
      </div>

      {/* ── SCROLLABLE BODY ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 pb-10">

        {/* PREFERÊNCIAS */}
        <SectionLabel label="Preferências" dim={dim} />
        <div className={`${bg2} border ${bdr} rounded-2xl overflow-hidden mb-5`}>
          <ToggleRow
            icon={dark
              ? <Moon size={16} className="text-blue-400" />
              : <Sun size={16} className="text-yellow-500" />
            }
            label="Modo escuro"
            value={dark}
            onToggle={toggle}
            dark={dark} bg3={bg3} bdr={bdr} text={text}
          />
          <ToggleRow
            icon={<Bell size={16} className="text-zippi-400" />}
            label="Notificações de rota"
            value={notif}
            onToggle={() => setNotif(n => !n)}
            dark={dark} bg3={bg3} bdr={bdr} text={text}
            last
          />
        </div>

        {/* CONTA */}
        <SectionLabel label="Conta" dim={dim} />
        <div className={`${bg2} border ${bdr} rounded-2xl overflow-hidden mb-5`}>
          <MenuRow
            icon={<User size={16} className="text-zippi-400" />}
            label="Editar informações"
            dark={dark} bg3={bg3} bdr={bdr} text={text} muted={muted}
          />
          <MenuRow
            icon={<Shield size={16} className="text-purple-400" />}
            label="Privacidade e segurança"
            dark={dark} bg3={bg3} bdr={bdr} text={text} muted={muted}
          />
          <MenuRow
            icon={<HelpCircle size={16} className="text-blue-400" />}
            label="Central de ajuda"
            dark={dark} bg3={bg3} bdr={bdr} text={text} muted={muted}
          />
          <MenuRow
            icon={<Info size={16} className={dim} />}
            label="Sobre o Zippi"
            badge="v1.0 MVP"
            dark={dark} bg3={bg3} bdr={bdr} text={text} muted={muted}
            last
          />
        </div>

        {/* SIGN OUT */}
        <button
          onClick={() => navigate('/login')}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border ${
            dark
              ? 'border-red-900/40 bg-red-950/20 active:bg-red-900/30'
              : 'border-red-200 bg-red-50 active:bg-red-100'
          } transition-colors active:scale-95 transition-transform`}
        >
          <LogOut size={15} className="text-red-400" />
          <span className="text-sm font-bold text-red-400">Sair da conta</span>
        </button>
      </div>
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────────────── */

function SectionLabel({ label, dim }) {
  return (
    <p className={`text-[10px] font-bold uppercase tracking-widest ${dim} mb-2`}>{label}</p>
  )
}



function ToggleRow({ icon, label, value, onToggle, dark, bg3, bdr, text, last }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 ${!last ? `border-b ${bdr}` : ''}`}>
      <div className={`w-8 h-8 rounded-xl ${bg3} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <span className={`flex-1 text-sm font-medium ${text}`}>{label}</span>
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
          value ? 'bg-zippi-400' : dark ? 'bg-dark-700' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${
            value ? 'left-[calc(100%-22px)]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  )
}

function MenuRow({ icon, label, badge, dark, bg3, bdr, text, muted, last }) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left ${
        !last ? `border-b ${bdr}` : ''
      } ${dark ? 'active:bg-dark-800' : 'active:bg-gray-50'} transition-colors`}
    >
      <div className={`w-8 h-8 rounded-xl ${bg3} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <span className={`flex-1 text-sm font-medium ${text}`}>{label}</span>
      {badge && (
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md mr-1 ${
          dark ? 'bg-dark-700 text-dark-400' : 'bg-gray-100 text-gray-400'
        }`}>
          {badge}
        </span>
      )}
      <ChevronRight size={14} className={dark ? 'text-dark-600' : 'text-gray-300'} />
    </button>
  )
}
