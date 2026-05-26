import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Clock, Bookmark, ChevronRight, MapPin, Bell, History } from 'lucide-react'

const SAVED = [
  { label: 'Casa',      emoji: '🏠', address: 'R. dos Pinheiros, 870 — Pinheiros' },
  { label: 'Trabalho',  emoji: '💼', address: 'Av. Eng. L. C. Berrini, 105'       },
]

const RECENT = [
  { label: 'Faculdade USP',    address: 'R. do Matão, 1010 — Butantã',     emoji: '🎓' },
  { label: 'Shopping Iguatemi',address: 'Av. Brig. Faria Lima, 2232',       emoji: '🛍️' },
  { label: 'Aeroporto Congonhas', address: 'Aeroporto Int. de Congonhas',   emoji: '✈️' },
]

export default function Home() {
  const navigate = useNavigate()
  const [dest,  setDest]  = useState('')
  const [focus, setFocus] = useState(false)
  const [origin, setOrigin] = useState('Detectando...')

  useEffect(() => {
    const t = setTimeout(() => setOrigin('R. dos Pinheiros, 870 — Pinheiros'), 800)
    return () => clearTimeout(t)
  }, [])

  function go(destination) {
    if (!destination.trim()) return
    navigate('/loading', { state: { origin, destination } })
  }

  return (
    <div className="relative flex flex-col min-h-dvh bg-dark-950 overflow-hidden">

      {/* ── MAP BACKGROUND ── */}
      <div className="absolute inset-0 top-0 bottom-[52%]">
        <MapBackground />
        {/* gradient to sheet */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-dark-950 to-transparent" />
      </div>

      {/* ── TOP BAR ── */}
      <div className="relative z-20 flex items-center justify-between px-5 pt-14 pb-2">
        <div>
          <p className="text-xs text-dark-400 font-medium">Sua localização</p>
          <p className="text-sm font-semibold text-white truncate max-w-[220px]">{origin}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/history')}
            className="w-9 h-9 rounded-xl bg-dark-900/80 backdrop-blur-sm border border-dark-800 flex items-center justify-center"
          >
            <History size={16} className="text-dark-300" />
          </button>
          <button className="w-9 h-9 rounded-xl bg-dark-900/80 backdrop-blur-sm border border-dark-800 flex items-center justify-center relative">
            <Bell size={16} className="text-dark-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-zippi-400" />
          </button>
        </div>
      </div>

      {/* ── BOTTOM SHEET ── */}
      <div className="relative z-10 mt-auto bg-dark-950 rounded-t-4xl pt-2 pb-8">
        {/* Handle */}
        <div className="w-10 h-1 bg-dark-700 rounded-full mx-auto mb-5" />

        {/* Search bar */}
        <div className="px-5 mb-5">
          <div
            className={`flex items-center gap-3 rounded-2xl px-4 py-4 border transition-all ${
              focus
                ? 'bg-dark-800 border-zippi-400/60 shadow-lg shadow-zippi-900/20'
                : 'bg-dark-800 border-dark-700'
            }`}
          >
            <Search size={18} className={focus ? 'text-zippi-400' : 'text-dark-500'} />
            <input
              type="text"
              placeholder="Para onde?"
              value={dest}
              onChange={e => setDest(e.target.value)}
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              onKeyDown={e => e.key === 'Enter' && go(dest)}
              className="flex-1 bg-transparent text-white text-base font-medium outline-none placeholder-dark-600"
            />
            {dest && (
              <button
                onClick={() => go(dest)}
                className="w-8 h-8 rounded-xl bg-zippi-400 flex items-center justify-center"
              >
                <ChevronRight size={16} className="text-dark-950" />
              </button>
            )}
          </div>
        </div>

        {/* Saved places */}
        <div className="px-5 mb-5">
          <div className="flex gap-2">
            {SAVED.map(s => (
              <button
                key={s.label}
                onClick={() => go(s.address)}
                className="flex-1 flex items-center gap-2 bg-dark-800 border border-dark-700 rounded-2xl px-3 py-3 active:scale-95 transition-transform"
              >
                <div className="w-8 h-8 rounded-xl bg-dark-700 flex items-center justify-center flex-shrink-0 text-base">
                  {s.emoji}
                </div>
                <span className="text-sm font-semibold text-white">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent */}
        <div className="px-5">
          <p className="text-xs text-dark-500 font-semibold uppercase tracking-widest mb-3">Recentes</p>
          <div className="flex flex-col gap-1">
            {RECENT.map(r => (
              <button
                key={r.label}
                onClick={() => go(r.address)}
                className="flex items-center gap-3 px-3 py-3 rounded-2xl active:bg-dark-800 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center flex-shrink-0 text-xl">
                  {r.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{r.label}</p>
                  <p className="text-xs text-dark-500 truncate">{r.address}</p>
                </div>
                <Clock size={14} className="text-dark-600 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MapBackground() {
  return (
    <svg className="w-full h-full" viewBox="0 0 390 420" preserveAspectRatio="xMidYMid slice">
      <rect width="390" height="420" fill="#111111"/>
      {/* Street grid */}
      {[30,70,110,150,190,230,270,310,350,390].map(x => (
        <line key={`v${x}`} x1={x} y1="0" x2={x} y2="420" stroke="#181818" strokeWidth="1"/>
      ))}
      {[30,70,110,150,190,230,270,310,350,390,420].map(y => (
        <line key={`h${y}`} x1="0" y1={y} x2="390" y2={y} stroke="#181818" strokeWidth="1"/>
      ))}
      {/* Main roads */}
      <line x1="0" y1="180" x2="390" y2="140" stroke="#1E1E1E" strokeWidth="14"/>
      <line x1="0" y1="260" x2="390" y2="300" stroke="#1E1E1E" strokeWidth="18"/>
      <line x1="170" y1="0" x2="200" y2="420" stroke="#1E1E1E" strokeWidth="12"/>
      <line x1="310" y1="0" x2="290" y2="420" stroke="#1E1E1E" strokeWidth="8"/>
      <line x1="60"  y1="0" x2="80"  y2="420" stroke="#1E1E1E" strokeWidth="6"/>
      {/* Blocks */}
      {[
        [20,100,60,50],[90,90,60,60],[230,100,60,50],[340,90,40,55],
        [20,200,60,45],[90,205,65,50],[230,195,55,55],[340,195,40,55],
        [20,310,70,60],[100,305,55,60],[230,305,55,55],[340,305,40,55],
      ].map(([x,y,w,h],i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="6" fill="#171717"/>
      ))}
      {/* Parks */}
      <rect x="90" y="330" width="110" height="80" rx="8" fill="#141F14" opacity="0.8"/>
      {/* User location */}
      <circle cx="195" cy="230" r="28" fill="#3DED7A" opacity="0.08"/>
      <circle cx="195" cy="230" r="16" fill="#3DED7A" opacity="0.15"/>
      <circle cx="195" cy="230" r="9"  fill="#3DED7A"/>
      <circle cx="195" cy="230" r="4"  fill="white"/>
      {/* Nearby vehicles */}
      <g transform="translate(130,170) rotate(45)">
        <rect x="-5" y="-3" width="10" height="6" rx="2" fill="#3DED7A" opacity="0.7"/>
      </g>
      <g transform="translate(260,200) rotate(-20)">
        <rect x="-5" y="-3" width="10" height="6" rx="2" fill="#3DED7A" opacity="0.5"/>
      </g>
      <g transform="translate(150,290) rotate(10)">
        <rect x="-5" y="-3" width="10" height="6" rx="2" fill="#3DED7A" opacity="0.55"/>
      </g>
      <g transform="translate(240,160) rotate(-30)">
        <rect x="-4" y="-2.5" width="8" height="5" rx="2" fill="#3DED7A" opacity="0.4"/>
      </g>
    </svg>
  )
}
