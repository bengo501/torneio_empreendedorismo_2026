import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Bell, Moon, Sun, ChevronRight,
  LogOut, HelpCircle, Info, Edit3, Shield, User,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'
import { computeSocialImpact } from '../data/explore.js'
import { RIDE_HISTORY, STATS } from '../data/history.js'

const USER = {
  name: 'João Silva',
  phone: '+55 (51) 9 9999-1234',
  since: 'Maio de 2026',
  initials: 'JS',
  city: 'Porto Alegre, RS',
}

const ODS_LIST = [
  { code: 10, color: '#DD1367' },
  { code: 11, color: '#FF6700' },
  { code: 13, color: '#3F7E44' },
]

export default function Profile() {
  const navigate             = useNavigate()
  const { dark, toggle }     = useTheme()
  const [notif, setNotif]    = useState(true)
  const impact               = computeSocialImpact(RIDE_HISTORY)

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
                {USER.initials}
              </span>
            </div>
            {/* Verified badge */}
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-zippi-400 flex items-center justify-center shadow-md border-2 border-dark-950">
              <span className="text-[9px] font-black text-dark-950">✓</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className={`text-xl font-black ${text} leading-tight`}>{USER.name}</h2>
            <p className={`text-sm ${muted} mt-0.5`}>{USER.phone}</p>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-zippi-400 bg-zippi-900/30 px-2 py-0.5 rounded-full">
                📍 {USER.city}
              </span>
              <span className={`text-[10px] ${dim}`}>· Desde {USER.since}</span>
            </div>
          </div>

          <button
            className={`w-9 h-9 rounded-xl ${bg3} border ${bdr2} flex items-center justify-center flex-shrink-0`}
            title="Editar perfil"
          >
            <Edit3 size={14} className={muted} />
          </button>
        </div>

        {/* ── IMPACTO CARD ──────────────────────────────────────── */}
        <div className={`${bg2} border ${bdr} rounded-3xl p-4`}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-[10px] font-bold uppercase tracking-widest ${dim}`}>Seu Impacto</p>
            <span className="text-[9px] font-black text-zippi-400 tracking-wider">ODS 10 · 11 · 13</span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <ImpactStat icon="🚗" value={String(STATS.totalRides)} label="Corridas" text={text} dim={dim} />
            <ImpactStat icon="🌿" value={`${impact.totalCo2Saved.toFixed(1)}kg`} label="CO₂ salvo" text={text} dim={dim} green />
            <ImpactStat icon="💸" value={`R$${STATS.totalSaved.toFixed(0)}`} label="Economizado" text={text} dim={dim} green />
          </div>

          {/* Green ride progress */}
          <div className={`pt-3 border-t ${dark ? 'border-dark-700' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between mb-1.5">
              <p className={`text-xs ${muted}`}>
                <span className="font-bold text-zippi-400">{impact.greenPct}%</span>{' '}
                das viagens foram ecológicas
              </p>
              <button
                onClick={() => navigate('/history')}
                className="text-[10px] font-bold text-zippi-400"
              >
                Histórico →
              </button>
            </div>
            <div className={`w-full h-1.5 rounded-full ${bg3} overflow-hidden`}>
              <div
                className="h-full rounded-full bg-zippi-400 transition-all duration-700"
                style={{ width: `${impact.greenPct}%` }}
              />
            </div>
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

        {/* MISSÃO */}
        <div
          className="rounded-2xl p-4 mb-5"
          style={{
            background: 'linear-gradient(135deg,#071a0b 0%,#0d1f15 100%)',
            border: '1px solid #3DED7A22',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">🌍</span>
            <p className="text-xs font-black text-zippi-400 uppercase tracking-widest">Missão Zippi</p>
          </div>
          <p className="text-xs text-dark-300 leading-relaxed mb-3">
            Cada corrida sua contribui para uma Porto Alegre mais justa,
            verde e acessível — reduzindo desigualdades, emissões de CO₂
            e o custo de vida de todos.
          </p>
          <div className="flex gap-2 flex-wrap">
            {ODS_LIST.map(o => (
              <span
                key={o.code}
                className="text-[9px] font-black px-2 py-0.5 rounded-full"
                style={{
                  color: o.color,
                  backgroundColor: o.color + '22',
                  border: `1px solid ${o.color}44`,
                }}
              >
                ODS {o.code}
              </span>
            ))}
          </div>
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

function ImpactStat({ icon, value, label, green, text, dim }) {
  return (
    <div className="text-center">
      <p className="text-xl mb-0.5">{icon}</p>
      <p className={`text-sm font-black leading-tight ${green ? 'text-zippi-400' : text}`}>{value}</p>
      <p className={`text-[10px] ${dim} mt-0.5`}>{label}</p>
    </div>
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
