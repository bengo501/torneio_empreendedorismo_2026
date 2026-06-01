import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Bell, Moon, Sun, ChevronRight,
  LogOut, HelpCircle, Info, Edit3, Shield, User, Sparkles, Camera,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'
import { useUser } from '../context/UserContext.jsx'
import {
  BEHAVIOR_TAGS,
  TRANSPORT_APP_OPTIONS,
  allSelectedInterestChips,
} from '../data/userInterests.js'
import ExpandableInterestPicker from '../components/ExpandableInterestPicker.jsx'
import { SimpleChipPicker, TransportAppPicker } from '../components/InterestTagPicker.jsx'

function formatPhoneInput(raw) {
  const d = raw.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export default function Profile() {
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()
  const user = useUser()
  const fileRef = useRef(null)

  const [notif, setNotif] = useState(true)
  const [editingAccount, setEditingAccount] = useState(false)
  const [editingInterests, setEditingInterests] = useState(false)
  const [draftName, setDraftName] = useState(user.fullName)
  const [draftPhone, setDraftPhone] = useState(user.phone.replace(/^\+55\s*/, ''))
  const [draftInterests, setDraftInterests] = useState(user.interests || {})
  const [draftBehavior, setDraftBehavior] = useState(user.behaviorTags || [])
  const [draftTransport, setDraftTransport] = useState(user.transportApps || [])

  const bg    = dark ? 'bg-dark-950'     : 'bg-gray-50'
  const bg2   = dark ? 'bg-dark-900'     : 'bg-white'
  const bg3   = dark ? 'bg-dark-800'     : 'bg-gray-100'
  const bdr   = dark ? 'border-dark-800' : 'border-gray-200'
  const bdr2  = dark ? 'border-dark-700' : 'border-gray-300'
  const text  = dark ? 'text-white'      : 'text-gray-900'
  const muted = dark ? 'text-dark-400'   : 'text-gray-500'
  const dim   = dark ? 'text-dark-600'   : 'text-gray-400'
  const sub   = dark ? 'text-dark-300'   : 'text-gray-600'

  const interestChips = allSelectedInterestChips(user.interests)

  function startEditAccount() {
    setDraftName(user.fullName)
    setDraftPhone(user.phone.replace(/^\+55\s*/, ''))
    setEditingAccount(true)
    setEditingInterests(false)
  }

  function saveAccount() {
    const phone = draftPhone.replace(/\D/g, '').length >= 10
      ? `+55 ${formatPhoneInput(draftPhone)}`
      : user.phone
    user.patchUser({ fullName: draftName.trim(), phone })
    setEditingAccount(false)
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => user.patchUser({ avatarUrl: reader.result })
    reader.readAsDataURL(file)
  }

  function startEditInterests() {
    setDraftInterests(user.interests || {})
    setDraftBehavior(user.behaviorTags || [])
    setDraftTransport(user.transportApps || [])
    setEditingInterests(true)
    setEditingAccount(false)
  }

  function saveInterests() {
    user.setInterests(draftInterests)
    user.setBehaviorTags(draftBehavior)
    user.setTransportApps(draftTransport)
    setEditingInterests(false)
  }

  return (
    <div className={`flex flex-col min-h-dvh ${bg}`}>
      <div className={`px-5 pt-14 pb-5 ${bg}`}>
        <div className="flex items-center gap-3 mb-8">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className={`w-9 h-9 rounded-xl ${bg3} border ${bdr2} flex items-center justify-center`}
          >
            <ArrowLeft size={16} className={sub} />
          </button>
          <h1 className={`text-xl font-black ${text}`}>meu perfil</h1>
        </div>

        <div className="flex items-center gap-4 mb-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative flex-shrink-0 group"
            title="alterar foto"
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="w-20 h-20 rounded-3xl object-cover shadow-xl border-2 border-zippi-400/40"
              />
            ) : (
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-zippi-400 to-emerald-600 flex items-center justify-center shadow-xl">
                <span className="text-2xl font-black text-dark-950">{user.initials}</span>
              </div>
            )}
            <div className="absolute inset-0 rounded-3xl bg-black/40 opacity-0 group-active:opacity-100 flex items-center justify-center">
              <Camera size={20} className="text-white" />
            </div>
          </button>

          <div className="flex-1 min-w-0">
            {editingAccount ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={draftName}
                  onChange={e => setDraftName(e.target.value)}
                  className={`w-full text-sm font-bold rounded-xl px-3 py-2 border ${bdr2} ${bg3} ${text} outline-none focus:border-zippi-400/60`}
                  placeholder="nome completo"
                />
                <div className="flex items-center gap-1">
                  <span className={`text-xs ${muted}`}>+55</span>
                  <input
                    type="tel"
                    value={draftPhone}
                    onChange={e => setDraftPhone(formatPhoneInput(e.target.value))}
                    className={`flex-1 text-sm rounded-xl px-3 py-2 border ${bdr2} ${bg3} ${text} outline-none focus:border-zippi-400/60`}
                  />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={saveAccount} className="text-xs font-bold text-zippi-400">salvar</button>
                  <button type="button" onClick={() => setEditingAccount(false)} className={`text-xs font-bold ${muted}`}>cancelar</button>
                </div>
              </div>
            ) : (
              <>
                <h2 className={`text-xl font-black ${text} leading-tight`}>{user.fullName}</h2>
                <p className={`text-sm ${muted} mt-0.5`}>{user.phone}</p>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-zippi-400 bg-zippi-900/30 px-2 py-0.5 rounded-full">
                    {user.city}
                  </span>
                  <span className={`text-[10px] ${dim}`}>· desde {user.since}</span>
                </div>
              </>
            )}
          </div>

          {!editingAccount && (
            <button
              type="button"
              onClick={startEditAccount}
              className={`w-9 h-9 rounded-xl ${bg3} border ${bdr2} flex items-center justify-center flex-shrink-0`}
              title="editar perfil"
            >
              <Edit3 size={14} className={muted} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-10">
        <SectionLabel label="meus interesses" dim={dim} />
        <div className={`${bg2} border ${bdr} rounded-2xl p-4 mb-5`}>
          {editingInterests ? (
            <div className="space-y-5 max-h-[60vh] overflow-y-auto">
              <ExpandableInterestPicker
                selected={draftInterests}
                onChange={setDraftInterests}
                dark={dark}
                minTags={0}
              />
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${dim} mb-2`}>estilo de rolê</p>
                <SimpleChipPicker tags={BEHAVIOR_TAGS} selected={draftBehavior} onChange={setDraftBehavior} dark={dark} accent="emerald" />
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${dim} mb-2`}>transporte</p>
                <TransportAppPicker options={TRANSPORT_APP_OPTIONS} selected={draftTransport} onChange={setDraftTransport} dark={dark} />
              </div>
              <div className="flex gap-2 pt-2 sticky bottom-0 bg-inherit pb-1">
                <button type="button" onClick={saveInterests} className="flex-1 py-2.5 rounded-xl bg-zippi-400 text-dark-950 text-sm font-bold">salvar</button>
                <button type="button" onClick={() => setEditingInterests(false)} className={`flex-1 py-2.5 rounded-xl border ${bdr2} text-sm font-bold ${text}`}>cancelar</button>
              </div>
            </div>
          ) : interestChips.length ? (
            <>
              <div className="flex flex-wrap gap-1.5 mb-3 max-h-32 overflow-y-auto">
                {interestChips.slice(0, 24).map(tag => (
                  <span key={tag} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-zippi-400/15 text-zippi-400 border border-zippi-400/30">{tag}</span>
                ))}
                {interestChips.length > 24 && (
                  <span className={`text-[10px] ${muted}`}>+{interestChips.length - 24} mais</span>
                )}
              </div>
              <button type="button" onClick={startEditInterests} className="text-[11px] font-bold text-zippi-400">editar interesses →</button>
            </>
          ) : (
            <div className="text-center py-4">
              <Sparkles size={20} className="text-zippi-400 mx-auto mb-2" />
              <p className={`text-sm ${muted} mb-3`}>adicione interesses para recomendações personalizadas</p>
              <button type="button" onClick={startEditInterests} className="text-sm font-bold text-zippi-400">escolher interesses</button>
            </div>
          )}
        </div>

        <SectionLabel label="preferências" dim={dim} />
        <div className={`${bg2} border ${bdr} rounded-2xl overflow-hidden mb-5`}>
          <ToggleRow icon={dark ? <Moon size={16} className="text-blue-400" /> : <Sun size={16} className="text-yellow-500" />} label="modo escuro" value={dark} onToggle={toggle} dark={dark} bg3={bg3} bdr={bdr} text={text} />
          <ToggleRow icon={<Bell size={16} className="text-zippi-400" />} label="notificações de rota" value={notif} onToggle={() => setNotif(n => !n)} dark={dark} bg3={bg3} bdr={bdr} text={text} last />
        </div>

        <SectionLabel label="conta" dim={dim} />
        <div className={`${bg2} border ${bdr} rounded-2xl overflow-hidden mb-5`}>
          <MenuRow icon={<User size={16} className="text-zippi-400" />} label="editar informações" onClick={startEditAccount} dark={dark} bg3={bg3} bdr={bdr} text={text} muted={muted} />
          <MenuRow icon={<Shield size={16} className="text-purple-400" />} label="privacidade e segurança" onClick={() => navigate('/profile/info/privacy')} dark={dark} bg3={bg3} bdr={bdr} text={text} muted={muted} />
          <MenuRow icon={<HelpCircle size={16} className="text-blue-400" />} label="central de ajuda" onClick={() => navigate('/profile/info/help')} dark={dark} bg3={bg3} bdr={bdr} text={text} muted={muted} />
          <MenuRow icon={<Info size={16} className={dim} />} label="sobre o turio" badge="v1.0 mvp" onClick={() => navigate('/profile/info/about')} dark={dark} bg3={bg3} bdr={bdr} text={text} muted={muted} last />
        </div>

        <button
          type="button"
          onClick={() => { user.logout(); navigate('/login') }}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border ${
            dark ? 'border-red-900/40 bg-red-950/20' : 'border-red-200 bg-red-50'
          } active:scale-95 transition-transform`}
        >
          <LogOut size={15} className="text-red-400" />
          <span className="text-sm font-bold text-red-400">sair da conta</span>
        </button>
      </div>
    </div>
  )
}

function SectionLabel({ label, dim }) {
  return <p className={`text-[10px] font-bold uppercase tracking-widest ${dim} mb-2`}>{label}</p>
}

function ToggleRow({ icon, label, value, onToggle, dark, bg3, bdr, text, last }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 ${!last ? `border-b ${bdr}` : ''}`}>
      <div className={`w-8 h-8 rounded-xl ${bg3} flex items-center justify-center flex-shrink-0`}>{icon}</div>
      <span className={`flex-1 text-sm font-medium ${text}`}>{label}</span>
      <button type="button" onClick={onToggle} className={`relative w-11 h-6 rounded-full flex-shrink-0 ${value ? 'bg-zippi-400' : dark ? 'bg-dark-700' : 'bg-gray-300'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${value ? 'left-[calc(100%-22px)]' : 'left-0.5'}`} />
      </button>
    </div>
  )
}

function MenuRow({ icon, label, badge, onClick, dark, bg3, bdr, text, muted, last }) {
  return (
    <button type="button" onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 text-left ${!last ? `border-b ${bdr}` : ''} ${dark ? 'active:bg-dark-800' : 'active:bg-gray-50'}`}>
      <div className={`w-8 h-8 rounded-xl ${bg3} flex items-center justify-center flex-shrink-0`}>{icon}</div>
      <span className={`flex-1 text-sm font-medium ${text}`}>{label}</span>
      {badge && <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md mr-1 ${dark ? 'bg-dark-700 text-dark-400' : 'bg-gray-100 text-gray-400'}`}>{badge}</span>}
      <ChevronRight size={14} className={dark ? 'text-dark-600' : 'text-gray-300'} />
    </button>
  )
}
