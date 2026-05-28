import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Crosshair, Plus, X, TriangleAlert,
  Sun, Moon, Mic, ArrowLeft, ChevronRight,
  Compass, CalendarDays, User2, Zap,
} from 'lucide-react'
import ZippiMap        from '../components/ZippiMap.jsx'
import CommunityModal  from '../components/CommunityModal.jsx'
import VoiceAssistant  from '../components/VoiceAssistant.jsx'
import ServiceCard     from '../components/ServiceCard.jsx'
import MultiVehicleCard from '../components/MultiVehicleCard.jsx'
import ServiceDetail   from '../components/ServiceDetail.jsx'
import { getCurrentPosition, reverseGeocode, searchPlaces, fetchRoute } from '../services/geo.js'
import { getWeather }  from '../services/weather.js'
import { getReports }  from '../services/community.js'
import { getRankedServices, getMultiVehicleCombos } from '../data/services.js'
import { useTheme }    from '../context/ThemeContext.jsx'
import { EXPLORE_CATEGORIES, EXPLORE_PLACES, EXPLORE_GRAMADO } from '../data/explore.js'
import { EVENTS_TODAY, EVENTS_GRAMADO, EVENT_CATS } from '../data/events.js'

// ── Constants ────────────────────────────────────────────────────
const NAV_H = 60 // bottom nav bar height in px

const POA_DEFAULT = { lat: -30.0346, lon: -51.2177, label: 'Porto Alegre, RS' }

const SAVED = [
  { label:'Casa',     emoji:'🏠', address:'Moinhos de Vento',     lat:-30.0230, lon:-51.1988 },
  { label:'Trabalho', emoji:'💼', address:'Centro Histórico — POA', lat:-30.0310, lon:-51.2300 },
]
const RECENT = [
  { label:'Parque da Redenção',      address:'Av. José Bonifácio',        lat:-30.0355, lon:-51.2071 },
  { label:'UFRGS Campus Centro',     address:'Av. Paulo Gama, 110',        lat:-30.0320, lon:-51.2230 },
  { label:'Aeroporto Salgado Filho', address:'Av. Severo Dullius, 90000', lat:-29.9937, lon:-51.1714 },
]
const LOADING_STEPS = [
  { label:'Identificando posição urbana',    icon:'📍' },
  { label:'Calculando rotas multimodais',    icon:'🗺️' },
  { label:'Comparando custos de acesso',     icon:'💰' },
  { label:'Verificando disponibilidade',     icon:'📶' },
  { label:'Medindo impacto ambiental',       icon:'🌿' },
  { label:'IA recomendando melhor acesso',   icon:'🤖' },
]
const FILTERS = [
  { id:'balanced', label:'⚡ Equilibrado', prefs:{ price:.35, time:.25, eco:.2, comfort:.1, avail:.1 } },
  { id:'cheapest', label:'💸 Menor preço', prefs:{ price:.6,  time:.15, eco:.1, comfort:.1, avail:.05 } },
  { id:'fastest',  label:'🏎 Mais rápido', prefs:{ price:.15, time:.6,  eco:.1, comfort:.1, avail:.05 } },
  { id:'eco',      label:'🌿 Eco',         prefs:{ price:.2,  time:.1,  eco:.5, comfort:.1, avail:.1  } },
  { id:'combined', label:'🔀 Combinado',   prefs: null },
]

// ── Contextual AI engine (client-side simulation) ────────────────
function getContextualInsight(hour, weather, dayOfWeek, origin) {
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  if (weather?.warn)       return { emoji:'⛈️', msg:'Chuva chegando — prefira opções cobertas', cta:'Ver rotas cobertas' }
  if (hour >= 6 && hour <= 9)  return { emoji:'☕', msg:'Bom café antes do trabalho?', cta:'Cafés próximos' }
  if (hour >= 11 && hour <= 13) return { emoji:'🍽️', msg:'Hora do almoço — restaurantes abertos', cta:'Ver opções' }
  if (hour >= 17 && hour <= 19) return { emoji:'🌆', msg:'Fim do expediente — que tal explorar?', cta:'Explorar bairro' }
  if (hour >= 19)          return { emoji:'🎵', msg:'Show gratuito hoje à noite em POA', cta:'Ver eventos' }
  if (isWeekend && hour < 14) return { emoji:'🌿', msg:'Final de semana perfeito para a Redenção', cta:'Como chegar' }
  return { emoji:'🌐', msg:'Sua cidade inteligente te espera', cta:'Explorar POA' }
}

function getGreeting(hour) {
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

// ── Helpers ──────────────────────────────────────────────────────
function snap(val, points) {
  return points.reduce((a, b) => Math.abs(b - val) < Math.abs(a - val) ? b : a)
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }

// ── Explore Card component ────────────────────────────────────────
function ExploreCard({ place, catInfo, dark, text, muted, onSelect }) {
  return (
    <button
      onClick={() => onSelect(place)}
      className={`flex-shrink-0 w-40 rounded-2xl overflow-hidden border text-left active:scale-95 transition-all`}
      style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}
    >
      <div className={`h-20 flex items-center justify-center text-4xl ${dark ? 'bg-white/5' : 'bg-black/4'}`}>
        {catInfo?.emoji ?? '📍'}
      </div>
      <div className="p-3">
        <p className={`text-xs font-bold ${text} leading-tight mb-0.5`}>{place.name}</p>
        <p className={`text-[10px] ${muted} leading-tight`}>{place.desc}</p>
        {place.freeAccess && (
          <span className="inline-block mt-1.5 text-[9px] font-black text-zippi-400 bg-zippi-400/10 px-1.5 py-0.5 rounded-md">GRÁTIS</span>
        )}
      </div>
    </button>
  )
}

// ── Event Card component ─────────────────────────────────────────
function EventCard({ event, dark, text, muted, onNavigate }) {
  return (
    <button
      onClick={() => onNavigate(event)}
      className="w-full flex items-start gap-3 p-3 rounded-2xl text-left active:scale-[0.98] transition-all"
      style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', border: `1px solid ${dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)'}` }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}>
        {event.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-bold ${text} leading-tight`}>{event.title}</p>
          <span className={`text-[10px] font-bold flex-shrink-0 px-2 py-0.5 rounded-lg ${event.price === 'Grátis' || event.price === 'Grátis (shows especiais pagos)' ? 'text-zippi-400 bg-zippi-400/10' : 'text-orange-400 bg-orange-400/10'}`}>
            {event.price === 'Grátis' ? 'GRÁTIS' : event.price}
          </span>
        </div>
        <p className={`text-xs ${muted} mt-0.5`}>{event.local} · {event.time}</p>
        {event.bairro && <p className={`text-[10px] ${muted} opacity-60`}>{event.bairro}</p>}
      </div>
    </button>
  )
}

// ════════════════════════════════════════════════════════════════
export default function Home() {
  const navigate         = useNavigate()
  const { dark, toggle } = useTheme()

  const hour      = new Date().getHours()
  const dayOfWeek = new Date().getDay()

  /* ── GPS / origin ──────────────────────────────────────────── */
  const [origin,      setOrigin]      = useState(null)
  const [originLabel, setOriginLabel] = useState('Detectando localização…')
  const [gpsLoading,  setGpsLoading]  = useState(false)
  const [gpsError,    setGpsError]    = useState(false)

  /* ── Destination inputs ────────────────────────────────────── */
  const [destinations,  setDestinations]  = useState([{ label:'', lat:null, lon:null }])
  const [activeDestIdx, setActiveDestIdx] = useState(0)

  /* ── Search ────────────────────────────────────────────────── */
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [focus,   setFocus]   = useState(false)
  const searchTimer = useRef(null)

  /* ── Route ─────────────────────────────────────────────────── */
  const [routeData,    setRouteData]    = useState(null)
  const [mapClickMode, setMapClickMode] = useState(false)

  /* ── Community ─────────────────────────────────────────────── */
  const [reports,         setReports]         = useState([])
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportCoords,    setReportCoords]    = useState(null)

  /* ── Voice ─────────────────────────────────────────────────── */
  const [showVoice, setShowVoice] = useState(false)
  const [voicePref, setVoicePref] = useState('balanced')

  /* ── Weather ───────────────────────────────────────────────── */
  const [weather, setWeather] = useState(null)

  /* ── Navigation tabs ───────────────────────────────────────── */
  // 'ir' | 'explorar' | 'hoje'
  const [activeTab, setActiveTab] = useState('ir')

  /* ── Explore ───────────────────────────────────────────────── */
  const [exploreCategory, setExploreCategory] = useState('todos')
  const [exploreCity,     setExploreCity]     = useState('poa') // 'poa' | 'gramado'

  /* ── Events (Hoje tab) ─────────────────────────────────────── */
  const [eventCat, setEventCat] = useState('todos')

  /* ── Single-screen Ir state machine ───────────────────────── */
  const [sheetState,  setSheetState]  = useState('search')
  const [loadingStep, setLoadingStep] = useState(0)
  const [loadingPct,  setLoadingPct]  = useState(0)
  const [activeFilter, setActiveFilter] = useState('balanced')
  const [ranked,    setRanked]    = useState([])
  const [combos,    setCombos]    = useState([])
  const [resultKm,  setResultKm]  = useState(2.4)
  const [selected,  setSelected]  = useState(null)

  /* ── Draggable bottom sheet ────────────────────────────────── */
  const sheetRef  = useRef(null)
  const dragState = useRef({ active:false, startY:0, startH:0 })

  const SNAP = useMemo(() => {
    const avail = window.innerHeight - NAV_H
    return { peek: 90, mid: Math.round(avail * 0.48), full: Math.round(avail * 0.88) }
  }, [])

  const [sheetH, setSheetH] = useState(() => {
    const avail = window.innerHeight - NAV_H
    return Math.round(avail * 0.48)
  })

  // CSS var = total height from screen bottom to sheet top (for FAB)
  useEffect(() => {
    document.documentElement.style.setProperty('--sheet-h', `${sheetH + NAV_H}px`)
  }, [sheetH])

  /* ── Init ──────────────────────────────────────────────────── */
  useEffect(() => {
    detectGPS()
    setReports(getReports())
  }, [])

  /* ── GPS (Firefox-safe two-pass) ───────────────────────────── */
  async function detectGPS() {
    setGpsLoading(true); setGpsError(false)
    try {
      let pos
      try { pos = await getCurrentPosition(true)
      } catch { pos = await getCurrentPosition(false) }
      const label = await reverseGeocode(pos.lat, pos.lon)
      setOrigin({ ...pos, label }); setOriginLabel(label)
      try { const w = await getWeather(pos.lat, pos.lon); setWeather(w) }
      catch { /* weather optional */ }
    } catch {
      setGpsError(true); setOriginLabel(POA_DEFAULT.label); setOrigin(POA_DEFAULT)
    } finally { setGpsLoading(false) }
  }

  /* ── Route ─────────────────────────────────────────────────── */
  useEffect(() => {
    const dest = destinations[0]
    if (!origin || !dest?.lat) { setRouteData(null); return }
    fetchRoute(origin, dest).then(setRouteData)
  }, [origin, destinations])

  /* ── Search autocomplete ───────────────────────────────────── */
  useEffect(() => {
    clearTimeout(searchTimer.current)
    if (query.length < 2) { setResults([]); return }
    searchTimer.current = setTimeout(async () => {
      const places = await searchPlaces(query, origin?.lat, origin?.lon)
      setResults(places)
    }, 400)
    return () => clearTimeout(searchTimer.current)
  }, [query, origin])

  const selectPlace = useCallback((place) => {
    const next = [...destinations]
    next[activeDestIdx] = { label: place.label, lat: place.lat, lon: place.lon }
    setDestinations(next)
    setQuery(''); setResults([]); setFocus(false)
    setActiveTab('ir')
  }, [destinations, activeDestIdx])

  /* ── Navigation (Ir tab) ───────────────────────────────────── */
  function startNavigation() {
    const dest = destinations[0]
    if (!dest?.lat) return
    const km = routeData?.distanceKm ?? +(Math.random() * 4 + 1.2).toFixed(1)
    setResultKm(km); setSheetState('loading'); setLoadingStep(0); setLoadingPct(0)
    animateSheet(SNAP.mid)
    let step = 0
    const iv = setInterval(() => {
      step = Math.min(step + 1, LOADING_STEPS.length - 1)
      setLoadingStep(step)
      setLoadingPct(((step + 1) / LOADING_STEPS.length) * 100)
    }, 480)
    setTimeout(() => {
      clearInterval(iv); setLoadingPct(100)
      const prefs = FILTERS.find(f => f.id === activeFilter)?.prefs
      setRanked(getRankedServices(km, prefs))
      setCombos(getMultiVehicleCombos(km, weather?.warn ?? false))
      setTimeout(() => { setSheetState('results'); animateSheet(SNAP.mid) }, 400)
    }, LOADING_STEPS.length * 480 + 300)
  }

  function changeFilter(fId) {
    setActiveFilter(fId)
    const prefs = FILTERS.find(f => f.id === fId)?.prefs
    setRanked(getRankedServices(resultKm, prefs))
  }
  function backToSearch() { setSheetState('search'); setSelected(null); animateSheet(SNAP.mid) }

  /* ── Tab navigation ────────────────────────────────────────── */
  function switchTab(tab) {
    if (tab === 'perfil') { navigate('/profile'); return }
    setActiveTab(tab)
    if (tab !== 'ir' || sheetState !== 'search') animateSheet(SNAP.mid)
  }

  /* ── Event navigate to Ir tab ──────────────────────────────── */
  function navigateToEvent(event) {
    if (!event.lat) return
    selectPlace({ label: event.local, lat: event.lat, lon: event.lon })
    setActiveTab('ir')
    animateSheet(SNAP.mid)
  }

  /* ── Sheet animation ───────────────────────────────────────── */
  function animateSheet(targetH) {
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'height 0.35s cubic-bezier(0.32,0.72,0,1)'
      sheetRef.current.style.height = targetH + 'px'
    }
    setSheetH(targetH)
  }

  /* ── Drag handlers ─────────────────────────────────────────── */
  function onDragStart(e) {
    if (sheetRef.current) sheetRef.current.style.transition = 'none'
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const currentH = parseInt(sheetRef.current?.style.height || sheetH)
    dragState.current = { active: true, startY: clientY, startH: currentH }
  }
  function onDragMove(e) {
    if (!dragState.current.active) return
    e.preventDefault()
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const delta   = dragState.current.startY - clientY
    const newH    = clamp(dragState.current.startH + delta, SNAP.peek, SNAP.full)
    if (sheetRef.current) sheetRef.current.style.height = newH + 'px'
    document.documentElement.style.setProperty('--sheet-h', `${newH + NAV_H}px`)
  }
  function onDragEnd() {
    if (!dragState.current.active) return
    dragState.current.active = false
    const currentH = parseInt(sheetRef.current?.style.height || sheetH)
    animateSheet(snap(currentH, [SNAP.peek, SNAP.mid, SNAP.full]))
  }

  /* ── Misc helpers ──────────────────────────────────────────── */
  function addDestination() {
    setDestinations(d => [...d, { label:'', lat:null, lon:null }])
    setActiveDestIdx(destinations.length)
  }
  function removeDestination(idx) {
    if (destinations.length === 1) setDestinations([{ label:'', lat:null, lon:null }])
    else { setDestinations(d => d.filter((_,i) => i !== idx)); setActiveDestIdx(0) }
  }
  function handleMapClick(lat, lon) {
    if (mapClickMode) {
      reverseGeocode(lat, lon).then(label => {
        const next = [...destinations]; next[activeDestIdx] = { label, lat, lon }
        setDestinations(next)
      })
      setMapClickMode(false)
    } else { setReportCoords({ lat, lon }); setShowReportModal(true) }
  }
  async function handleVoiceResult({ destination, preference }) {
    setVoicePref(preference); setActiveFilter(preference)
    setActiveDestIdx(0); setFocus(true); setActiveTab('ir')
    const places = await searchPlaces(destination, origin?.lat, origin?.lon)
    if (places.length > 0) selectPlace(places[0])
    else { setQuery(destination); setResults([]) }
  }

  const hasValidDest = destinations.some(d => d.lat)
  const isCombined   = activeFilter === 'combined'

  // Contextual AI insight
  const insight = useMemo(() => getContextualInsight(hour, weather, dayOfWeek, origin), [hour, weather, dayOfWeek])

  // Surface system:
  // Dark  → solid surfaces (no transparency) so dark map + dark glass ≠ black void
  // Light → glass (backdrop-blur) for iOS aesthetic
  const GLASS_BG     = dark ? '#1C1C28'              : 'rgba(248,248,252,0.93)'
  const GLASS_BLUR   = dark ? 'none'                 : 'blur(24px) saturate(160%)'
  const GLASS_BORDER = dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'
  const CARD_BG      = dark ? '#252535'              : 'rgba(0,0,0,0.04)'
  const CARD_BORDER  = dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)'

  // Text class helpers
  const text  = dark ? 'text-white'    : 'text-gray-900'
  const muted = dark ? 'text-white/50' : 'text-gray-500'
  const dim   = dark ? 'text-white/30' : 'text-gray-400'
  const pill  = 'w-10 h-10 rounded-2xl flex items-center justify-center active:scale-90 transition-transform shadow-md'

  // Filtered events
  const eventsFiltered = (exploreCity === 'gramado' ? EVENTS_GRAMADO : EVENTS_TODAY)
    .filter(e => eventCat === 'todos' || e.cat === eventCat || (eventCat === 'gratuito' && (e.price === 'Grátis' || e.price === 'Entrada livre' || e.price === 'Grátis (shows especiais pagos)')))

  /* ═══════════════════════════════════════════════════════════ */
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height:'100dvh', minHeight:'-webkit-fill-available', background: dark ? '#12121E' : '#e8eaf0' }}
    >
      {/* ── MAP ─────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0" style={{ isolation:'isolate' }}>
        <ZippiMap
          origin={origin}
          destinations={destinations.filter(d => d.lat)}
          routePolyline={routeData?.polyline}
          communityReports={reports}
          onMapClick={handleMapClick}
          dark={dark}
        />
      </div>

      {/* ── TOP GRADIENT ─────────────────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 pointer-events-none z-10"
        style={{ height:180, background:'linear-gradient(to bottom,rgba(0,0,0,0.65) 0%,transparent 100%)' }}
      />

      {/* ── TOP BAR ──────────────────────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 z-20 px-4 pt-12 pb-2 pointer-events-auto">
        <div className="flex items-start justify-between gap-3">

          {/* Location pill */}
          <button onClick={detectGPS}
            className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 min-w-0 flex-1 active:scale-95 transition-transform"
            style={{ background:'rgba(0,0,0,0.52)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.12)' }}
          >
            <div className="relative flex-shrink-0 w-3 h-3">
              <div className={`absolute inset-0 rounded-full ${gpsError ? 'bg-orange-400' : 'bg-zippi-400'}`} />
              {!gpsError && <div className="absolute inset-0 rounded-full bg-zippi-400 animate-ping opacity-50" />}
            </div>
            <div className="min-w-0 text-left">
              <p className="text-[9px] text-white/50 font-bold uppercase tracking-wider leading-none mb-0.5">
                {gpsError ? 'GPS negado · toque para tentar' : 'Você está em'}
              </p>
              <p className="text-xs font-semibold text-white truncate leading-tight">
                {gpsLoading ? 'Detectando…' : originLabel}
              </p>
            </div>
            {gpsLoading && <div className="flex-shrink-0 w-3 h-3 border-2 border-zippi-400 border-t-transparent rounded-full animate-spin" />}
          </button>

          {/* Action buttons */}
          <div className="flex gap-1.5 flex-shrink-0">
            <button onClick={toggle}
              className={pill}
              style={{ background:'rgba(0,0,0,0.48)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.12)' }}
            >
              {dark ? <Sun size={16} className="text-yellow-300" /> : <Moon size={16} className="text-slate-200" />}
            </button>
            <button onClick={() => { setReportCoords(origin); setShowReportModal(true) }}
              className={pill}
              style={{ background:'rgba(0,0,0,0.48)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.12)' }}
            >
              <TriangleAlert size={16} className="text-orange-400" />
            </button>
            <button onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-2xl bg-zippi-400 flex items-center justify-center active:scale-90 transition-transform shadow-md shadow-zippi-900/40"
            >
              <span className="text-[11px] font-black text-dark-950 select-none">JS</span>
            </button>
          </div>
        </div>

        {/* Weather strip */}
        {weather && (
          <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-sm`}
            style={{ background: weather.warn ? 'rgba(113,63,18,0.7)' : 'rgba(0,0,0,0.38)', backdropFilter:'blur(12px)', borderColor: weather.warn ? 'rgba(234,179,8,0.4)' : 'rgba(255,255,255,0.1)' }}
          >
            <span className="text-sm leading-none">{weather.emoji}</span>
            <span className="text-xs font-semibold text-white">{weather.label}</span>
            <span className="text-xs text-white/55">{weather.temp}°C</span>
            {weather.warn && <span className="text-xs text-yellow-300 font-semibold">· Evite veículos abertos</span>}
          </div>
        )}

        {/* Map click banner */}
        {mapClickMode && (
          <div className="mt-2 flex justify-center">
            <div className="bg-zippi-400 text-dark-950 px-5 py-2.5 rounded-2xl text-sm font-black shadow-xl">
              📍 Toque no mapa para definir o destino
            </div>
          </div>
        )}
      </div>

      {/* ── CONTEXTUAL AI FLOAT CARD ──────────────────────────────── */}
      {activeTab === 'ir' && sheetState === 'search' && !focus && insight && (
        <div className="absolute left-4 right-4 z-10 pointer-events-auto"
          style={{ bottom: `calc(var(--sheet-h, 340px) + 12px)` }}
        >
          <button
            onClick={() => { if (insight.cta === 'Ver eventos') switchTab('hoje'); else if (insight.cta.includes('Explorar')) switchTab('explorar') }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-left active:scale-95 transition-all"
            style={{ background:'rgba(0,0,0,0.55)', backdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.12)', boxShadow:'0 4px 24px rgba(0,0,0,0.3)' }}
          >
            <span className="text-2xl flex-shrink-0">{insight.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white leading-tight">{insight.msg}</p>
              <p className="text-[10px] text-zippi-400 font-semibold mt-0.5">{insight.cta} →</p>
            </div>
            <Zap size={14} className="text-zippi-400 flex-shrink-0" />
          </button>
        </div>
      )}

      {/* ── VOICE FAB ─────────────────────────────────────────────── */}
      <div className="absolute right-4 z-20 flex flex-col items-center gap-1 pointer-events-auto"
        style={{ bottom:'calc(var(--sheet-h, 340px) + 16px)', transition:'bottom 0.35s cubic-bezier(0.32,0.72,0,1)' }}
      >
        <button onClick={() => setShowVoice(true)}
          className="w-14 h-14 rounded-full bg-zippi-400 shadow-2xl shadow-zippi-900/50 flex items-center justify-center active:scale-90 transition-transform border-2 border-white/20"
        >
          <Mic size={26} className="text-dark-950" />
        </button>
        <span className="text-[9px] font-bold text-white" style={{ textShadow:'0 1px 4px rgba(0,0,0,0.8)' }}>Falar</span>
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* GLASS BOTTOM SHEET                                          */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div
        ref={sheetRef}
        className="absolute inset-x-0 z-20 flex flex-col"
        style={{
          bottom: NAV_H,
          height: sheetH,
          background: GLASS_BG,
          backdropFilter: GLASS_BLUR,
          WebkitBackdropFilter: GLASS_BLUR,
          borderRadius: '28px 28px 0 0',
          borderTop: `1px solid ${GLASS_BORDER}`,
          borderLeft: `1px solid ${GLASS_BORDER}`,
          borderRight: `1px solid ${GLASS_BORDER}`,
          boxShadow: '0 -8px 48px rgba(0,0,0,0.3)',
          transition: 'height 0.35s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {/* Drag handle */}
        <div
          className="flex-shrink-0 h-8 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
          onTouchStart={onDragStart} onTouchMove={onDragMove} onTouchEnd={onDragEnd}
          onMouseDown={onDragStart}  onMouseMove={onDragMove}  onMouseUp={onDragEnd} onMouseLeave={onDragEnd}
        >
          <div className="w-10 h-1 rounded-full" style={{ background: dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.18)' }} />
        </div>

        {/* ── Contextual greeting (shown in Ir/search mode) ─────── */}
        {activeTab === 'ir' && sheetState === 'search' && !focus && (
          <div className="flex-shrink-0 px-5 pb-3 flex items-center justify-between">
            <div>
              <p className={`text-lg font-black ${text}`}>
                {getGreeting(hour)} {weather?.emoji ?? '👋'}
              </p>
              <p className={`text-xs ${muted}`}>
                {weather ? `${weather.temp}°C · ${weather.label}` : 'Porto Alegre, RS'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-zippi-400 uppercase tracking-widest">IA Zippi</p>
              <p className={`text-[10px] ${muted}`}>Copiloto urbano ativo</p>
            </div>
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto min-h-0">

          {/* ══════════ TAB: IR ══════════ */}
          {activeTab === 'ir' && (
            <>
              {/* ── search state ── */}
              {sheetState === 'search' && (
                <div className="px-5 pt-1 pb-2">

                  {/* Route card */}
                  <div className="rounded-2xl overflow-hidden mb-3"
                    style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                    {/* Origin */}
                    <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
                      <div className="relative flex-shrink-0 w-3 h-3">
                        <div className="absolute inset-0 rounded-full bg-zippi-400" />
                        <div className="absolute inset-0 rounded-full bg-zippi-400 animate-ping opacity-40" />
                      </div>
                      <p className={`text-sm ${muted} truncate flex-1`}>{originLabel}</p>
                      <Crosshair size={12} className="text-zippi-400 flex-shrink-0 opacity-50" />
                    </div>

                    {/* Destination rows */}
                    {destinations.map((dest, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3"
                        style={{ borderBottom: i < destinations.length - 1 ? `1px solid ${CARD_BORDER}` : 'none' }}
                      >
                        <div className={`w-3 h-3 rounded-sm flex-shrink-0 ${i === destinations.length - 1 ? 'bg-red-400' : 'bg-orange-400'}`} />
                        <input
                          type="text"
                          placeholder={i === 0 ? 'Para onde?' : `Parada ${i+1}`}
                          value={activeDestIdx === i ? query : dest.label}
                          onChange={e => { setActiveDestIdx(i); setQuery(e.target.value) }}
                          onFocus={() => { setActiveDestIdx(i); setFocus(true); animateSheet(SNAP.full) }}
                          onBlur={() => setTimeout(() => { setFocus(false); animateSheet(SNAP.mid) }, 150)}
                          className={`flex-1 bg-transparent text-sm font-medium outline-none ${dest.lat ? text : muted}`}
                        />
                        {dest.lat ? (
                          <button onClick={() => removeDestination(i)}>
                            <X size={14} className={`${muted} opacity-60`} />
                          </button>
                        ) : (
                          <button onClick={() => setMapClickMode(true)} className="flex-shrink-0">
                            <span className="text-xs text-zippi-400 font-semibold">📍 Mapa</span>
                          </button>
                        )}
                      </div>
                    ))}

                    {destinations.length < 3 && (
                      <button onClick={addDestination}
                        className="w-full flex items-center gap-2 px-4 py-2.5"
                        style={{ borderTop: `1px solid ${CARD_BORDER}` }}
                      >
                        <Plus size={13} className="text-zippi-400" />
                        <span className="text-xs text-zippi-400 font-semibold">Adicionar parada</span>
                      </button>
                    )}
                  </div>

                  {/* Search dropdown */}
                  {focus && results.length > 0 && (
                    <div className="rounded-2xl mb-3 overflow-hidden shadow-2xl"
                      style={{ background: dark ? 'rgba(18,18,24,0.96)' : 'rgba(255,255,255,0.97)', backdropFilter:'blur(20px)', border: `1px solid ${CARD_BORDER}` }}
                    >
                      {results.map((r, i) => (
                        <button key={i} onMouseDown={() => selectPlace(r)}
                          className={`w-full flex items-start gap-3 px-4 py-3 text-left ${dark ? 'active:bg-white/5' : 'active:bg-black/5'}`}
                          style={{ borderTop: i > 0 ? `1px solid ${CARD_BORDER}` : 'none' }}
                        >
                          <span className="text-base flex-shrink-0 mt-0.5">📍</span>
                          <p className={`text-sm ${text} leading-tight`}>{r.label}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Saved + Recent + Explore section */}
                  {!focus && (
                    <>
                      {/* Saved shortcuts */}
                      <div className="flex gap-2 mb-4">
                        {SAVED.map(s => (
                          <button key={s.label}
                            onClick={() => selectPlace({ label:s.address, lat:s.lat, lon:s.lon })}
                            className="flex-1 flex items-center gap-2.5 rounded-2xl px-3 py-3 active:scale-95 transition-transform"
                            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
                          >
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                              style={{ background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
                              {s.emoji}
                            </div>
                            <span className={`text-sm font-semibold ${text}`}>{s.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Recentes */}
                      <p className={`text-[10px] ${muted} font-bold uppercase tracking-widest mb-2`}>Recentes</p>
                      <div className="flex flex-col mb-4">
                        {RECENT.map(r => (
                          <button key={r.label}
                            onClick={() => selectPlace({ label:r.address, lat:r.lat, lon:r.lon })}
                            className={`flex items-center gap-3 px-2 py-2.5 rounded-xl transition-colors text-left ${dark ? 'active:bg-white/5' : 'active:bg-black/5'}`}
                          >
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                              style={{ background: CARD_BG }}>🕐</div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold ${text}`}>{r.label}</p>
                              <p className={`text-xs ${muted} truncate`}>{r.address}</p>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Quick explore teaser */}
                      <div className="rounded-2xl p-4 mb-2"
                        style={{ background:'linear-gradient(135deg, rgba(61,237,122,0.12) 0%, rgba(61,237,122,0.04) 100%)', border:'1px solid rgba(61,237,122,0.2)' }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-xs font-black text-zippi-400">Explorar Porto Alegre</p>
                            <p className={`text-[10px] ${muted}`}>Descubra o que a cidade tem</p>
                          </div>
                          <button onClick={() => switchTab('explorar')}
                            className="text-[10px] font-black text-zippi-400 flex items-center gap-0.5"
                          >Ver tudo <ChevronRight size={10} /></button>
                        </div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                          {EXPLORE_PLACES.slice(0, 4).map(place => {
                            const cat = EXPLORE_CATEGORIES.find(c => c.id === place.category)
                            return (
                              <button key={place.id}
                                onClick={() => selectPlace({ label:place.name, lat:place.lat, lon:place.lon })}
                                className="flex-shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-all"
                              >
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                                  style={{ background: CARD_BG, border:`1px solid ${CARD_BORDER}` }}>
                                  {cat?.emoji ?? '📍'}
                                </div>
                                <span className={`text-[10px] font-semibold ${text} text-center max-w-[56px] leading-tight`}>
                                  {place.name.split(' ').slice(0,2).join(' ')}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── loading state ── */}
              {sheetState === 'loading' && (
                <div className="px-5 pt-3 pb-6">
                  <div className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-5"
                    style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                    <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                    <p className={`text-sm font-semibold ${text} flex-1 truncate`}>{destinations[0]?.label}</p>
                    <button onClick={backToSearch} className={`text-xs ${muted}`}>✕ Cancelar</button>
                  </div>
                  <div className="w-full h-1.5 rounded-full mb-3 overflow-hidden"
                    style={{ background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}>
                    <div className="h-full bg-zippi-400 rounded-full"
                      style={{ width:`${loadingPct}%`, transition:'width 0.45s ease' }} />
                  </div>
                  <p className={`text-sm ${muted} mb-5`}>
                    {loadingPct < 100
                      ? `${LOADING_STEPS[loadingStep]?.icon} ${LOADING_STEPS[loadingStep]?.label}…`
                      : '✅ Melhores opções encontradas!'}
                  </p>
                  <div className="flex flex-col gap-2.5">
                    {LOADING_STEPS.map((s, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          i < loadingStep   ? 'bg-zippi-400' :
                          i === loadingStep ? 'border-2 border-zippi-400 animate-pulse' : 'border'
                        }`}
                          style={{ background: i < loadingStep ? '' : i === loadingStep ? 'transparent' : dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', borderColor: i >= loadingStep && i !== loadingStep ? dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' : undefined }}
                        >
                          {i < loadingStep && (
                            <svg viewBox="0 0 10 8" className="w-3 h-3">
                              <polyline points="1,4 3.5,6.5 9,1" fill="none" stroke="#0A0A0A" strokeWidth="1.8" strokeLinecap="round"/>
                            </svg>
                          )}
                        </div>
                        <span className={`text-xs font-medium ${i <= loadingStep ? text : dim}`}>{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── results state ── */}
              {sheetState === 'results' && (
                <div className="pb-4">
                  <div className="flex items-center gap-3 px-5 pt-1 pb-3">
                    <button onClick={backToSearch}
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: CARD_BG }}>
                      <ArrowLeft size={15} className={muted} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs ${muted} truncate`}>{originLabel}</p>
                      <p className={`text-sm font-bold ${text} truncate`}>{destinations[0]?.label}</p>
                    </div>
                    <div className="flex-shrink-0 px-2.5 py-1 rounded-xl" style={{ background: CARD_BG }}>
                      <p className={`text-xs font-bold ${text}`}>{resultKm} km</p>
                    </div>
                  </div>

                  {weather?.warn && (
                    <div className="mx-5 mb-3 flex items-center gap-3 rounded-2xl px-4 py-3"
                      style={{ background:'rgba(113,63,18,0.3)', border:'1px solid rgba(234,179,8,0.3)' }}>
                      <span className="text-xl flex-shrink-0">{weather.emoji ?? '⛈️'}</span>
                      <div>
                        <p className="text-xs font-bold text-yellow-400">Previsão de chuva</p>
                        <p className="text-xs text-yellow-200/70">{weather.rainProb}% de chance · Prefira opções cobertas</p>
                      </div>
                    </div>
                  )}

                  {/* Filter pills */}
                  <div className="px-5 mb-4">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                      {FILTERS.map(f => (
                        <button key={f.id} onClick={() => changeFilter(f.id)}
                          className={`flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${activeFilter === f.id ? 'bg-zippi-400 text-dark-950 shadow shadow-zippi-900/30' : ''}`}
                          style={activeFilter !== f.id ? { background: CARD_BG, border: `1px solid ${CARD_BORDER}`, color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' } : {}}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {!isCombined && ranked.some(r => r.co2Saved > 0) && activeFilter !== 'cheapest' && (
                    <div className="mx-5 mb-4 flex items-start gap-3 rounded-2xl px-4 py-3"
                      style={{ background:'rgba(61,237,122,0.08)', border:'1px solid rgba(61,237,122,0.2)' }}>
                      <span className="text-xl flex-shrink-0">🌍</span>
                      <div>
                        <p className="text-xs font-bold text-zippi-400 mb-0.5">Dica Zippi</p>
                        <p className={`text-xs ${muted}`}>
                          Patinete ou bike economiza até{' '}
                          <span className="text-zippi-400 font-semibold">{(resultKm * 0.12).toFixed(2)} kg de CO₂</span>!
                        </p>
                      </div>
                    </div>
                  )}

                  {isCombined ? (
                    <div className="px-5 flex flex-col gap-4">
                      {combos.length === 0 ? (
                        <div className="rounded-3xl p-8 text-center" style={{ background: CARD_BG, border:`1px solid ${CARD_BORDER}` }}>
                          <p className="text-3xl mb-3">🔀</p>
                          <p className={`font-bold ${text} mb-1`}>Nenhuma combinação</p>
                          <p className={`text-xs ${muted}`}>Para esta distância, um único serviço já é ideal.</p>
                        </div>
                      ) : combos.map((combo, i) => (
                        <MultiVehicleCard key={combo.id} combo={combo} rank={i}
                          origin={origin} dest={destinations[0]?.lat ? destinations[0] : null} />
                      ))}
                    </div>
                  ) : (
                    <div className="px-5 flex flex-col gap-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-xs ${dim}`}>
                          <span className={`font-bold ${text}`}>{ranked.length}</span> opções
                        </p>
                        {ranked[0] && <p className={`text-xs ${dim}`}>
                          A partir de <span className={`font-bold ${text}`}>R${ranked[0].price.toFixed(2).replace('.',',')}</span>
                        </p>}
                      </div>
                      {ranked.map((s, i) => <ServiceCard key={s.id} service={s} rank={i} onSelect={setSelected} />)}
                    </div>
                  )}

                  <p className={`text-center text-xs mt-4 mb-2 px-5 ${dim}`}>
                    Preços estimados. Zippi não possui vínculo com os serviços.
                  </p>
                </div>
              )}
            </>
          )}

          {/* ══════════ TAB: EXPLORAR ══════════ */}
          {activeTab === 'explorar' && (
            <div className="pb-4">
              {/* City selector */}
              <div className="px-5 mb-4">
                <div className="flex gap-2 p-1 rounded-2xl" style={{ background: CARD_BG, border:`1px solid ${CARD_BORDER}` }}>
                  {[{ id:'poa', label:'🌆 Porto Alegre' }, { id:'gramado', label:'🏔 Gramado' }].map(c => (
                    <button key={c.id} onClick={() => setExploreCity(c.id)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${exploreCity === c.id ? 'bg-zippi-400 text-dark-950 shadow' : ''}`}
                      style={exploreCity !== c.id ? { color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' } : {}}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* IA suggestion banner */}
              <div className="mx-5 mb-4 flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{ background:'linear-gradient(135deg,rgba(61,237,122,0.1),rgba(61,237,122,0.04))', border:'1px solid rgba(61,237,122,0.2)' }}>
                <span className="text-xl">🤖</span>
                <div>
                  <p className="text-xs font-black text-zippi-400">Zippi IA recomenda</p>
                  <p className={`text-xs ${muted}`}>
                    {exploreCity === 'gramado'
                      ? 'Gramado é ideal para o inverno — chocolates, vinhos e paisagens!'
                      : `${getGreeting(hour)}! ${insight.msg}`
                    }
                  </p>
                </div>
              </div>

              {/* Category filter */}
              <div className="px-5 mb-3">
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {EXPLORE_CATEGORIES.filter(c => c.id !== 'compras' || exploreCity === 'poa').map(cat => (
                    <button key={cat.id} onClick={() => setExploreCategory(cat.id)}
                      className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                        exploreCategory === cat.id ? 'bg-zippi-400 text-dark-950' : ''
                      }`}
                      style={exploreCategory !== cat.id ? { background: CARD_BG, border:`1px solid ${CARD_BORDER}`, color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' } : {}}
                    >
                      <span className="text-[13px]">{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Collections header */}
              <div className="px-5 mb-2">
                <p className={`text-[10px] font-bold uppercase tracking-widest ${muted}`}>
                  {exploreCity === 'gramado' ? 'Gramado & Serra Gaúcha' : 'Porto Alegre'}
                </p>
              </div>

              {/* Horizontal scroll: featured cards */}
              <div className="px-5">
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-3">
                  {(exploreCity === 'gramado' ? EXPLORE_GRAMADO : EXPLORE_PLACES)
                    .filter(p => exploreCategory === 'todos' || p.category === exploreCategory)
                    .map(place => {
                      const cat = EXPLORE_CATEGORIES.find(c => c.id === place.category)
                      return (
                        <ExploreCard
                          key={place.id} place={place} catInfo={cat}
                          dark={dark} text={text} muted={muted}
                          onSelect={p => selectPlace({ label:p.name, lat:p.lat, lon:p.lon })}
                        />
                      )
                    })}
                </div>
              </div>

              {/* List view */}
              <div className="px-5 flex flex-col gap-2">
                {(exploreCity === 'gramado' ? EXPLORE_GRAMADO : EXPLORE_PLACES)
                  .filter(p => exploreCategory === 'todos' || p.category === exploreCategory)
                  .map(place => {
                    const cat = EXPLORE_CATEGORIES.find(c => c.id === place.category)
                    return (
                      <button key={place.id}
                        onClick={() => selectPlace({ label:place.name, lat:place.lat, lon:place.lon })}
                        className="flex items-center gap-3 p-3 rounded-2xl text-left active:scale-[0.98] transition-all"
                        style={{ background: CARD_BG, border:`1px solid ${CARD_BORDER}` }}
                      >
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                          style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
                          {cat?.emoji ?? '📍'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold ${text}`}>{place.name}</p>
                          <p className={`text-xs ${muted} truncate`}>{place.desc}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {place.freeAccess && <span className="text-[9px] font-black text-zippi-400">GRÁTIS</span>}
                          <ChevronRight size={14} className={dim} />
                        </div>
                      </button>
                    )
                  })}
              </div>
            </div>
          )}

          {/* ══════════ TAB: HOJE ══════════ */}
          {activeTab === 'hoje' && (
            <div className="pb-4">
              {/* Header */}
              <div className="px-5 mb-3 flex items-center justify-between">
                <div>
                  <p className={`text-sm font-black ${text}`}>
                    {new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long' })}
                  </p>
                  <p className={`text-xs ${muted}`}>
                    {exploreCity === 'gramado' ? 'Gramado & Serra Gaúcha' : 'Porto Alegre'}
                  </p>
                </div>
                {/* City toggle */}
                <div className="flex gap-1 p-0.5 rounded-xl" style={{ background: CARD_BG, border:`1px solid ${CARD_BORDER}` }}>
                  {[{ id:'poa', label:'POA' }, { id:'gramado', label:'GRM' }].map(c => (
                    <button key={c.id} onClick={() => setExploreCity(c.id)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${exploreCity === c.id ? 'bg-zippi-400 text-dark-950' : ''}`}
                      style={exploreCity !== c.id ? { color: dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' } : {}}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Highlight event */}
              {eventsFiltered.find(e => e.highlight) && (() => {
                const ev = eventsFiltered.find(e => e.highlight)
                return (
                  <button onClick={() => navigateToEvent(ev)}
                    className="mx-5 mb-3 w-[calc(100%-40px)] rounded-2xl overflow-hidden text-left active:scale-[0.98] transition-all"
                    style={{ background:'linear-gradient(135deg,rgba(61,237,122,0.15),rgba(61,237,122,0.06))', border:'1px solid rgba(61,237,122,0.25)' }}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-3xl">{ev.emoji}</span>
                        <span className="text-[10px] font-black text-zippi-400 bg-zippi-400/15 px-2 py-0.5 rounded-lg">DESTAQUE</span>
                      </div>
                      <p className={`text-sm font-black ${text} mb-1`}>{ev.title}</p>
                      <p className={`text-xs ${muted}`}>{ev.local} · {ev.time}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] font-bold text-zippi-400">{ev.price}</span>
                        <span className="text-[10px] text-zippi-400 font-semibold">Como chegar →</span>
                      </div>
                    </div>
                  </button>
                )
              })()}

              {/* Category filter */}
              <div className="px-5 mb-3">
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {EVENT_CATS.map(cat => (
                    <button key={cat.id} onClick={() => setEventCat(cat.id)}
                      className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all ${eventCat === cat.id ? 'bg-zippi-400 text-dark-950' : ''}`}
                      style={eventCat !== cat.id ? { background: CARD_BG, border:`1px solid ${CARD_BORDER}`, color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' } : {}}
                    >
                      <span className="text-[12px]">{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Events list */}
              <div className="px-5 flex flex-col gap-2">
                {eventsFiltered.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-4xl mb-3">📅</p>
                    <p className={`font-bold ${text} mb-1`}>Nenhum evento encontrado</p>
                    <p className={`text-xs ${muted}`}>Tente outra categoria ou cidade.</p>
                  </div>
                ) : eventsFiltered.map(ev => (
                  <EventCard
                    key={ev.id} event={ev}
                    dark={dark} text={text} muted={muted}
                    onNavigate={navigateToEvent}
                  />
                ))}
              </div>

              {/* ODS badge */}
              <div className="mx-5 mt-4 flex items-center gap-2 px-4 py-3 rounded-2xl"
                style={{ background: CARD_BG, border:`1px solid ${CARD_BORDER}` }}>
                <span className="text-lg">🌐</span>
                <p className={`text-xs ${muted}`}>
                  Eventos locais apoiam os <span className="text-zippi-400 font-bold">ODS 8, 10 e 11</span> — economia local, inclusão e cidades sustentáveis.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* ── Sticky CTA (Ir tab, search state) ─────────────────── */}
        {activeTab === 'ir' && sheetState === 'search' && hasValidDest && (
          <div className="flex-shrink-0 px-5 pb-4 pt-2"
            style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
            <button onClick={startNavigation}
              className="w-full py-4 rounded-2xl bg-zippi-400 text-dark-950 font-black text-base flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-zippi-900/30"
            >
              <Search size={18} />
              {routeData ? `Ver opções — ${routeData.distanceKm} km` : 'Ver melhores opções'}
            </button>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* GLASS BOTTOM NAV BAR                                        */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div
        className="absolute bottom-0 inset-x-0 z-30"
        style={{
          height: NAV_H,
          background: GLASS_BG,
          backdropFilter: GLASS_BLUR,
          WebkitBackdropFilter: GLASS_BLUR,
          borderTop: `1px solid ${GLASS_BORDER}`,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex items-center justify-around h-full px-2">
          {[
            { id:'ir',       icon: Zap,         label:'Ir'       },
            { id:'explorar', icon: Compass,      label:'Explorar' },
            { id:'hoje',     icon: CalendarDays, label:'Hoje'     },
            { id:'perfil',   icon: User2,        label:'Perfil'   },
          ].map(({ id, icon: Icon, label }) => {
            const isActive = activeTab === id && id !== 'perfil'
            return (
              <button key={id}
                onClick={() => switchTab(id)}
                className="flex flex-col items-center gap-1 py-1.5 px-4 rounded-2xl transition-all active:scale-90"
                style={{ background: isActive ? 'rgba(61,237,122,0.12)' : 'transparent' }}
              >
                <Icon size={20} className={isActive ? 'text-zippi-400' : dark ? 'text-white/40' : 'text-gray-400'} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`text-[10px] font-bold ${isActive ? 'text-zippi-400' : dark ? 'text-white/40' : 'text-gray-400'}`}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── MODALS ─────────────────────────────────────────────────── */}
      {showReportModal && (
        <CommunityModal
          lat={reportCoords?.lat} lon={reportCoords?.lon}
          onClose={() => setShowReportModal(false)}
          onAdded={() => setReports(getReports())}
        />
      )}
      {showVoice && (
        <VoiceAssistant
          onResult={handleVoiceResult}
          onClose={() => setShowVoice(false)}
        />
      )}
      {selected && (
        <ServiceDetail
          service={selected}
          origin={origin}
          dest={destinations[0]?.lat ? destinations[0] : null}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
