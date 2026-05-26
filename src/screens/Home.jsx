import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Crosshair, Plus, X, TriangleAlert,
  Sun, Moon, Mic, ArrowLeft, Leaf, Clock, ChevronRight,
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
import { EXPLORE_CATEGORIES, EXPLORE_PLACES } from '../data/explore.js'

const POA_DEFAULT = { lat: -30.0346, lon: -51.2177, label: 'Porto Alegre, RS' }

const SAVED = [
  { label:'Casa',     emoji:'🏠', address:'Bairro Moinhos de Vento', lat:-30.0230, lon:-51.1988 },
  { label:'Trabalho', emoji:'💼', address:'Centro Histórico — POA',  lat:-30.0310, lon:-51.2300 },
]
const RECENT = [
  { label:'Parque da Redenção',     address:'Av. José Bonifácio',        lat:-30.0355, lon:-51.2071 },
  { label:'UFRGS Campus Centro',    address:'Av. Paulo Gama, 110',       lat:-30.0320, lon:-51.2230 },
  { label:'Aeroporto Salgado Filho',address:'Av. Severo Dullius, 90000', lat:-29.9937, lon:-51.1714 },
]
const LOADING_STEPS = [
  { label:'Identificando sua posição urbana',    icon:'📍' },
  { label:'Calculando rotas multimodais',         icon:'🗺️' },
  { label:'Comparando custos de acesso',          icon:'💰' },
  { label:'Verificando disponibilidade',          icon:'📶' },
  { label:'Medindo impacto ambiental (ODS 13)',   icon:'🌿' },
  { label:'IA recomendando melhor acesso',        icon:'🤖' },
]
const FILTERS = [
  { id:'balanced', label:'⚡ Equilibrado', prefs:{ price:.35, time:.25, eco:.2, comfort:.1, avail:.1 } },
  { id:'cheapest', label:'💸 Menor preço', prefs:{ price:.6,  time:.15, eco:.1, comfort:.1, avail:.05 } },
  { id:'fastest',  label:'🏎 Mais rápido', prefs:{ price:.15, time:.6,  eco:.1, comfort:.1, avail:.05 } },
  { id:'eco',      label:'🌿 Eco',         prefs:{ price:.2,  time:.1,  eco:.5, comfort:.1, avail:.1  } },
  { id:'combined', label:'🔀 Combinado',   prefs: null },
]

// ── helpers ──────────────────────────────────────────────────────
function snap(val, points) {
  return points.reduce((a, b) => Math.abs(b - val) < Math.abs(a - val) ? b : a)
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }

export default function Home() {
  const navigate         = useNavigate()
  const { dark, toggle } = useTheme()

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

  /* ── Explore ───────────────────────────────────────────────── */
  const [exploreCategory, setExploreCategory] = useState('todos')

  /* ── Single-screen state machine ───────────────────────────── */
  // 'search' | 'loading' | 'results'
  const [sheetState,  setSheetState]  = useState('search')
  const [loadingStep, setLoadingStep] = useState(0)
  const [loadingPct,  setLoadingPct]  = useState(0)
  const [activeFilter, setActiveFilter] = useState('balanced')
  const [ranked,    setRanked]    = useState([])
  const [combos,    setCombos]    = useState([])
  const [resultKm,  setResultKm]  = useState(2.4)
  const [selected,  setSelected]  = useState(null)   // ServiceDetail

  /* ── Draggable bottom sheet ────────────────────────────────── */
  const sheetRef  = useRef(null)
  const dragState = useRef({ active:false, startY:0, startH:0 })

  const SNAP = useMemo(() => {
    const h = window.innerHeight
    return { peek: 110, mid: Math.round(h * 0.48), full: Math.round(h * 0.86) }
  }, [])

  const [sheetH, setSheetH] = useState(() => {
    const h = window.innerHeight
    return Math.round(h * 0.48)
  })

  // Keep a CSS var in sync so the voice FAB can use it without React state reads
  useEffect(() => {
    document.documentElement.style.setProperty('--sheet-h', `${sheetH}px`)
  }, [sheetH])

  /* ── Init ──────────────────────────────────────────────────── */
  useEffect(() => {
    detectGPS()
    setReports(getReports())
  }, [])

  /* ── GPS (Firefox-safe two-pass) ───────────────────────────── */
  async function detectGPS() {
    setGpsLoading(true)
    setGpsError(false)
    try {
      // Firefox sometimes rejects enableHighAccuracy — try both
      let pos
      try {
        pos = await getCurrentPosition(true)
      } catch {
        pos = await getCurrentPosition(false)
      }
      const label = await reverseGeocode(pos.lat, pos.lon)
      setOrigin({ ...pos, label })
      setOriginLabel(label)
      try {
        const w = await getWeather(pos.lat, pos.lon)
        setWeather(w)
      } catch { /* weather is optional */ }
    } catch {
      setGpsError(true)
      setOriginLabel(POA_DEFAULT.label)
      setOrigin(POA_DEFAULT)
    } finally {
      setGpsLoading(false)
    }
  }

  /* ── Route calculation ─────────────────────────────────────── */
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
  }, [destinations, activeDestIdx])

  /* ── Start inline navigation (no route to /loading) ───────── */
  function startNavigation() {
    const dest = destinations[0]
    if (!dest?.lat) return

    const km = routeData?.distanceKm ?? +(Math.random() * 4 + 1.2).toFixed(1)
    setResultKm(km)
    setSheetState('loading')
    setLoadingStep(0)
    setLoadingPct(0)
    // snap to mid for compact loading view
    animateSheet(SNAP.mid)

    let step = 0
    const iv = setInterval(() => {
      step = Math.min(step + 1, LOADING_STEPS.length - 1)
      setLoadingStep(step)
      setLoadingPct(((step + 1) / LOADING_STEPS.length) * 100)
    }, 480)

    setTimeout(() => {
      clearInterval(iv)
      setLoadingPct(100)

      const prefs = FILTERS.find(f => f.id === activeFilter)?.prefs
      setRanked(getRankedServices(km, prefs))
      setCombos(getMultiVehicleCombos(km, weather?.warn ?? false))

      setTimeout(() => {
        setSheetState('results')
        animateSheet(SNAP.mid)
      }, 400)
    }, LOADING_STEPS.length * 480 + 300)
  }

  /* ── Filter change in results ──────────────────────────────── */
  function changeFilter(fId) {
    setActiveFilter(fId)
    const prefs = FILTERS.find(f => f.id === fId)?.prefs
    setRanked(getRankedServices(resultKm, prefs))
  }

  /* ── Back to search ────────────────────────────────────────── */
  function backToSearch() {
    setSheetState('search')
    setSelected(null)
    animateSheet(SNAP.mid)
  }

  /* ── Sheet animation helper ─────────────────────────────────── */
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
    document.documentElement.style.setProperty('--sheet-h', `${newH}px`)
  }

  function onDragEnd() {
    if (!dragState.current.active) return
    dragState.current.active = false
    const currentH = parseInt(sheetRef.current?.style.height || sheetH)
    const snapPoints = sheetState === 'results'
      ? [SNAP.peek, SNAP.mid, SNAP.full]
      : [SNAP.peek, SNAP.mid, SNAP.full]
    const target = snap(currentH, snapPoints)
    animateSheet(target)
  }

  /* ── Misc helpers ──────────────────────────────────────────── */
  function addDestination() {
    setDestinations(d => [...d, { label:'', lat:null, lon:null }])
    setActiveDestIdx(destinations.length)
  }
  function removeDestination(idx) {
    if (destinations.length === 1) {
      setDestinations([{ label:'', lat:null, lon:null }])
    } else {
      setDestinations(d => d.filter((_,i) => i !== idx))
      setActiveDestIdx(0)
    }
  }
  function handleMapClick(lat, lon) {
    if (mapClickMode) {
      reverseGeocode(lat, lon).then(label => {
        const next = [...destinations]
        next[activeDestIdx] = { label, lat, lon }
        setDestinations(next)
      })
      setMapClickMode(false)
    } else {
      setReportCoords({ lat, lon }); setShowReportModal(true)
    }
  }
  async function handleVoiceResult({ destination, preference }) {
    setVoicePref(preference); setActiveFilter(preference)
    setActiveDestIdx(0); setFocus(true)
    const places = await searchPlaces(destination, origin?.lat, origin?.lon)
    if (places.length > 0) selectPlace(places[0])
    else { setQuery(destination); setResults([]) }
  }

  const hasValidDest = destinations.some(d => d.lat)
  const isCombined   = activeFilter === 'combined'

  /* ── Theme helpers ─────────────────────────────────────────── */
  const bg    = dark ? '#0A0A0A'    : '#ffffff'
  const card  = dark ? 'bg-dark-900 border-dark-800' : 'bg-gray-50 border-gray-200'
  const inpBg = dark ? 'bg-dark-900 border-dark-800' : 'bg-white border-gray-100'
  const text  = dark ? 'text-white'     : 'text-gray-900'
  const muted = dark ? 'text-dark-400'  : 'text-gray-500'
  const divC  = dark ? 'border-dark-800': 'border-gray-100'
  const dim   = dark ? 'text-dark-600'  : 'text-gray-400'
  const pill  = 'w-10 h-10 rounded-2xl bg-black/45 backdrop-blur-md border border-white/15 flex items-center justify-center active:scale-90 transition-transform shadow-md'

  /* ═══════════════════════════════════════════════════════════ */
  return (
    <div
      className="relative w-full overflow-hidden bg-dark-950"
      style={{ height:'100dvh', minHeight:'-webkit-fill-available' }}
    >
      {/* ── MAP — full screen background ──────────────────────── */}
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

      {/* ── TOP GRADIENT ──────────────────────────────────────── */}
      <div
        className="absolute top-0 inset-x-0 pointer-events-none z-10"
        style={{ height:150, background:'linear-gradient(to bottom,rgba(0,0,0,0.55) 0%,transparent 100%)' }}
      />

      {/* ── TOP BAR ───────────────────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 z-20 px-4 pt-12 pb-2 pointer-events-auto">
        <div className="flex items-start justify-between gap-3">

          {/* Location pill */}
          <button
            onClick={detectGPS}
            className="flex items-center gap-2.5 bg-black/50 backdrop-blur-md rounded-2xl px-3 py-2.5 min-w-0 flex-1 border border-white/10 shadow-md active:scale-95 transition-transform"
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

          {/* 4 action buttons */}
          <div className="flex gap-1.5 flex-shrink-0">
            <button onClick={toggle} className={pill} title="Alternar tema">
              {dark ? <Sun size={16} className="text-yellow-300" /> : <Moon size={16} className="text-slate-200" />}
            </button>
            <button
              onClick={() => { setReportCoords(origin); setShowReportModal(true) }}
              className={pill} title="Reportar"
            >
              <TriangleAlert size={16} className="text-orange-400" />
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-2xl bg-zippi-400 flex items-center justify-center active:scale-90 transition-transform shadow-md shadow-zippi-900/40"
              title="Meu perfil"
            >
              <span className="text-[11px] font-black text-dark-950 select-none">JS</span>
            </button>
          </div>
        </div>

        {/* Weather strip */}
        {weather && (
          <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-md border shadow-sm ${
            weather.warn ? 'bg-yellow-900/70 border-yellow-600/40' : 'bg-black/35 border-white/10'
          }`}>
            <span className="text-sm leading-none">{weather.emoji}</span>
            <span className="text-xs font-semibold text-white">{weather.label}</span>
            <span className="text-xs text-white/55">{weather.temp}°C</span>
            {weather.warn && <span className="text-xs text-yellow-300 font-semibold">· Evite veículos abertos</span>}
          </div>
        )}

        {/* Map-click mode banner */}
        {mapClickMode && (
          <div className="mt-2 flex justify-center">
            <div className="bg-zippi-400 text-dark-950 px-5 py-2.5 rounded-2xl text-sm font-black shadow-xl">
              📍 Toque no mapa para definir o destino
            </div>
          </div>
        )}
      </div>

      {/* ── VOICE FAB — floats above sheet using CSS var ───────── */}
      <div
        className="absolute right-4 z-20 flex flex-col items-center gap-1 pointer-events-auto"
        style={{ bottom:'calc(var(--sheet-h, 340px) + 16px)', transition:'bottom 0.35s cubic-bezier(0.32,0.72,0,1)' }}
      >
        <button
          onClick={() => setShowVoice(true)}
          className="w-14 h-14 rounded-full bg-zippi-400 shadow-2xl shadow-zippi-900/50 flex items-center justify-center active:scale-90 transition-transform border-2 border-white/20"
        >
          <Mic size={26} className="text-dark-950" />
        </button>
        <span className="text-[9px] font-bold text-white" style={{ textShadow:'0 1px 4px rgba(0,0,0,0.8)' }}>
          Falar
        </span>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* DRAGGABLE BOTTOM SHEET                                  */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div
        ref={sheetRef}
        className="absolute bottom-0 inset-x-0 z-20 flex flex-col"
        style={{
          height: sheetH,
          backgroundColor: bg,
          borderRadius: '28px 28px 0 0',
          boxShadow: '0 -4px 32px rgba(0,0,0,0.28)',
          transition: 'height 0.35s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {/* ── Drag handle ─────────────────────────────────────── */}
        <div
          className="flex-shrink-0 h-8 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
          onTouchStart={onDragStart}
          onTouchMove={onDragMove}
          onTouchEnd={onDragEnd}
          onMouseDown={onDragStart}
          onMouseMove={onDragMove}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
        >
          <div className={`w-10 h-1 rounded-full ${dark ? 'bg-dark-700' : 'bg-gray-300'}`} />
        </div>

        {/* ── Scrollable content (flex-1, clips at sheet edge) ── */}
        <div className="flex-1 overflow-y-auto min-h-0">

          {/* ════════ STATE: search ════════ */}
          {sheetState === 'search' && (
            <div className="px-5 pt-1 pb-2">

              {/* Route card */}
              <div className={`${inpBg} border rounded-2xl overflow-hidden mb-3`}>
                {/* Origin row */}
                <div className={`flex items-center gap-3 px-4 py-3 border-b ${divC}`}>
                  <div className="relative flex-shrink-0 w-3 h-3">
                    <div className="absolute inset-0 rounded-full bg-zippi-400" />
                    <div className="absolute inset-0 rounded-full bg-zippi-400 animate-ping opacity-40" />
                  </div>
                  <p className={`text-sm ${muted} truncate flex-1`}>{originLabel}</p>
                  <Crosshair size={12} className="text-zippi-400 flex-shrink-0 opacity-50" />
                </div>

                {/* Destination rows */}
                {destinations.map((dest, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 px-4 py-3 ${i < destinations.length - 1 ? `border-b ${divC}` : ''}`}
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
                  <button
                    onClick={addDestination}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 border-t ${divC}`}
                  >
                    <Plus size={13} className="text-zippi-400" />
                    <span className="text-xs text-zippi-400 font-semibold">Adicionar parada</span>
                  </button>
                )}
              </div>

              {/* Search dropdown */}
              {focus && results.length > 0 && (
                <div className={`${dark ? 'bg-dark-900 border-dark-800' : 'bg-white border-gray-200'} border rounded-2xl mb-3 overflow-hidden shadow-xl`}>
                  {results.map((r, i) => (
                    <button
                      key={i}
                      onMouseDown={() => selectPlace(r)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left ${i > 0 ? `border-t ${divC}` : ''} ${dark ? 'active:bg-dark-800' : 'active:bg-gray-50'}`}
                    >
                      <span className="text-base flex-shrink-0 mt-0.5">📍</span>
                      <p className={`text-sm ${text} leading-tight`}>{r.label}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* Saved + Recent + Explore */}
              {!focus && (
                <>
                  {/* Saved shortcuts */}
                  <div className="flex gap-2 mb-4">
                    {SAVED.map(s => (
                      <button
                        key={s.label}
                        onClick={() => selectPlace({ label:s.address, lat:s.lat, lon:s.lon })}
                        className={`flex-1 flex items-center gap-2.5 ${card} border rounded-2xl px-3 py-3 active:scale-95 transition-transform`}
                      >
                        <div className={`w-8 h-8 rounded-xl ${dark ? 'bg-dark-700':'bg-gray-200'} flex items-center justify-center text-base flex-shrink-0`}>
                          {s.emoji}
                        </div>
                        <span className={`text-sm font-semibold ${text}`}>{s.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Recentes */}
                  <p className={`text-[10px] ${muted} font-bold uppercase tracking-widest mb-2`}>Recentes</p>
                  <div className="flex flex-col mb-1">
                    {RECENT.map(r => (
                      <button
                        key={r.label}
                        onClick={() => selectPlace({ label:r.address, lat:r.lat, lon:r.lon })}
                        className={`flex items-center gap-3 px-2 py-2.5 rounded-xl ${dark ? 'active:bg-dark-800':'active:bg-gray-50'} transition-colors text-left`}
                      >
                        <div className={`w-9 h-9 rounded-xl ${dark ? 'bg-dark-800':'bg-gray-100'} flex items-center justify-center text-lg flex-shrink-0`}>🕐</div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${text}`}>{r.label}</p>
                          <p className={`text-xs ${muted} truncate`}>{r.address}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Explorar Porto Alegre */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2.5">
                      <p className={`text-[10px] ${muted} font-bold uppercase tracking-widest`}>Explorar Porto Alegre</p>
                      <span className="text-[9px] font-black text-zippi-400">ODS 10 · 11</span>
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-3">
                      {EXPLORE_CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setExploreCategory(cat.id)}
                          className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                            exploreCategory === cat.id
                              ? 'bg-zippi-400 text-dark-950'
                              : dark ? 'bg-dark-800 text-dark-400 border border-dark-700' : 'bg-gray-100 text-gray-500 border border-gray-200'
                          }`}
                        >
                          <span className="text-[13px]">{cat.emoji}</span>
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-col pb-2">
                      {EXPLORE_PLACES
                        .filter(p => exploreCategory === 'todos' || p.category === exploreCategory)
                        .slice(0, 5)
                        .map(place => {
                          const catInfo = EXPLORE_CATEGORIES.find(c => c.id === place.category)
                          return (
                            <button
                              key={place.id}
                              onClick={() => selectPlace({ label:place.name, lat:place.lat, lon:place.lon })}
                              className={`flex items-center gap-3 px-2 py-2.5 rounded-xl ${dark ? 'active:bg-dark-800':'active:bg-gray-50'} transition-colors text-left`}
                            >
                              <div className={`w-9 h-9 rounded-xl ${dark ? 'bg-dark-800':'bg-gray-100'} flex items-center justify-center text-lg flex-shrink-0`}>
                                {catInfo?.emoji ?? '📍'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold ${text}`}>{place.name}</p>
                                <p className={`text-xs ${muted} truncate`}>{place.desc}</p>
                              </div>
                              {place.freeAccess && (
                                <span className="text-[9px] font-black text-zippi-400 bg-zippi-900/30 px-1.5 py-0.5 rounded-lg flex-shrink-0">
                                  GRÁTIS
                                </span>
                              )}
                            </button>
                          )
                        })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ════════ STATE: loading (Uber-style inline) ════════ */}
          {sheetState === 'loading' && (
            <div className="px-5 pt-3 pb-6">
              {/* Destination chip */}
              <div className={`flex items-center gap-3 ${dark ? 'bg-dark-800':'bg-gray-100'} rounded-2xl px-4 py-3 mb-5`}>
                <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                <p className={`text-sm font-semibold ${text} flex-1 truncate`}>{destinations[0]?.label}</p>
                <button onClick={backToSearch} className={`text-xs ${muted}`}>✕ Cancelar</button>
              </div>

              {/* Progress bar */}
              <div className={`w-full h-1.5 ${dark ? 'bg-dark-800':'bg-gray-200'} rounded-full mb-3 overflow-hidden`}>
                <div
                  className="h-full bg-zippi-400 rounded-full"
                  style={{ width:`${loadingPct}%`, transition:'width 0.45s ease' }}
                />
              </div>

              {/* Current step label */}
              <p className={`text-sm ${muted} mb-5`}>
                {loadingPct < 100
                  ? `${LOADING_STEPS[loadingStep]?.icon} ${LOADING_STEPS[loadingStep]?.label}…`
                  : '✅ Melhores opções encontradas!'
                }
              </p>

              {/* Steps checklist */}
              <div className="flex flex-col gap-2.5">
                {LOADING_STEPS.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      i < loadingStep   ? 'bg-zippi-400' :
                      i === loadingStep ? `${dark ? 'bg-dark-700':'bg-gray-200'} border-2 border-zippi-400 animate-pulse` :
                                         `${dark ? 'bg-dark-800 border-dark-700':'bg-gray-100 border-gray-300'} border`
                    }`}>
                      {i < loadingStep && (
                        <svg viewBox="0 0 10 8" className="w-3 h-3">
                          <polyline points="1,4 3.5,6.5 9,1" fill="none" stroke="#0A0A0A" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                      )}
                    </div>
                    <span className={`text-xs font-medium ${i <= loadingStep ? (dark?'text-dark-200':'text-gray-700') : (dark?'text-dark-700':'text-gray-300')}`}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════ STATE: results ════════ */}
          {sheetState === 'results' && (
            <div className="pb-4">
              {/* Results header */}
              <div className="flex items-center gap-3 px-5 pt-1 pb-3">
                <button
                  onClick={backToSearch}
                  className={`w-8 h-8 rounded-xl ${dark ? 'bg-dark-800':'bg-gray-100'} flex items-center justify-center flex-shrink-0`}
                >
                  <ArrowLeft size={15} className={muted} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs ${muted} truncate`}>{originLabel}</p>
                  <p className={`text-sm font-bold ${text} truncate`}>{destinations[0]?.label}</p>
                </div>
                <div className={`flex-shrink-0 px-2.5 py-1 rounded-xl ${dark ? 'bg-dark-800':'bg-gray-100'}`}>
                  <p className={`text-xs font-bold ${text}`}>{resultKm} km</p>
                </div>
              </div>

              {/* Weather warning */}
              {weather?.warn && (
                <div className="mx-5 mb-3 flex items-center gap-3 bg-yellow-900/30 border border-yellow-500/30 rounded-2xl px-4 py-3">
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
                    <button
                      key={f.id}
                      onClick={() => changeFilter(f.id)}
                      className={`flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                        activeFilter === f.id
                          ? 'bg-zippi-400 text-dark-950 shadow shadow-zippi-900/30'
                          : dark ? 'bg-dark-800 text-dark-400 border border-dark-700' : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Eco tip */}
              {!isCombined && ranked.some(r => r.co2Saved > 0) && activeFilter !== 'cheapest' && (
                <div className="mx-5 mb-4 flex items-start gap-3 bg-zippi-900/20 border border-zippi-400/20 rounded-2xl px-4 py-3">
                  <span className="text-xl flex-shrink-0">🌍</span>
                  <div>
                    <p className="text-xs font-bold text-zippi-400 mb-0.5">Dica Zippi</p>
                    <p className={`text-xs ${muted}`}>
                      Para {resultKm} km, patinete ou bike economiza até{' '}
                      <span className="text-zippi-400 font-semibold">{(resultKm * 0.12).toFixed(2)} kg de CO₂</span>!
                    </p>
                  </div>
                </div>
              )}

              {/* Combinado view */}
              {isCombined && (
                <div className="px-5 flex flex-col gap-4">
                  {combos.length === 0 ? (
                    <div className={`rounded-3xl border p-8 text-center ${dark ? 'bg-dark-900 border-dark-800':'bg-white border-gray-200'}`}>
                      <p className="text-3xl mb-3">🔀</p>
                      <p className={`font-bold ${text} mb-1`}>Nenhuma combinação</p>
                      <p className={`text-xs ${muted}`}>Para esta distância, um único serviço já é ideal.</p>
                    </div>
                  ) : combos.map((combo, i) => (
                    <MultiVehicleCard key={combo.id} combo={combo} rank={i}
                      origin={origin} dest={destinations[0] ? { ...destinations[0], label: destinations[0].label } : null}
                    />
                  ))}
                </div>
              )}

              {/* Single service list */}
              {!isCombined && (
                <div className="px-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-xs ${dim}`}>
                      <span className={`font-bold ${text}`}>{ranked.length}</span> opções
                    </p>
                    {ranked[0] && (
                      <p className={`text-xs ${dim}`}>
                        A partir de <span className={`font-bold ${text}`}>R${ranked[0].price.toFixed(2).replace('.',',')}</span>
                      </p>
                    )}
                  </div>
                  {ranked.map((s, i) => (
                    <ServiceCard key={s.id} service={s} rank={i} onSelect={setSelected} />
                  ))}
                </div>
              )}

              <p className={`text-center text-xs mt-4 mb-2 px-5 ${dim}`}>
                Preços estimados. Zippi não possui vínculo com os serviços.
              </p>
            </div>
          )}
        </div>

        {/* ── Sticky footer CTA — never scrolled away ─────────── */}
        {sheetState === 'search' && hasValidDest && (
          <div
            className="flex-shrink-0 px-5 pb-6 pt-2"
            style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
          >
            <button
              onClick={startNavigation}
              className="w-full py-4 rounded-2xl bg-zippi-400 text-dark-950 font-black text-base flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-zippi-900/30"
            >
              <Search size={18} />
              {routeData ? `Ver opções — ${routeData.distanceKm} km` : 'Ver melhores opções'}
            </button>
          </div>
        )}
      </div>

      {/* ── MODALS ─────────────────────────────────────────────── */}
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
