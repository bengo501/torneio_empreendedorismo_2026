import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Crosshair, Plus, X, TriangleAlert, Sun, Moon, Mic } from 'lucide-react'
import ZippiMap        from '../components/ZippiMap.jsx'
import CommunityModal  from '../components/CommunityModal.jsx'
import VoiceAssistant  from '../components/VoiceAssistant.jsx'
import { getCurrentPosition, reverseGeocode, searchPlaces, fetchRoute } from '../services/geo.js'
import { getWeather }  from '../services/weather.js'
import { getReports }  from '../services/community.js'
import { useTheme }    from '../context/ThemeContext.jsx'
import { EXPLORE_CATEGORIES, EXPLORE_PLACES } from '../data/explore.js'

// Porto Alegre — foco do MVP
const POA_DEFAULT = { lat: -30.0346, lon: -51.2177, label: 'Porto Alegre, RS' }

const SAVED = [
  { label: 'Casa',     emoji: '🏠', address: 'Bairro Moinhos de Vento',  lat: -30.0230, lon: -51.1988 },
  { label: 'Trabalho', emoji: '💼', address: 'Centro Histórico — POA',   lat: -30.0310, lon: -51.2300 },
]
const RECENT = [
  { label: 'Parque da Redenção',    address: 'Av. José Bonifácio',       lat: -30.0355, lon: -51.2071 },
  { label: 'UFRGS Campus Centro',   address: 'Av. Paulo Gama, 110',      lat: -30.0320, lon: -51.2230 },
  { label: 'Aeroporto Salgado Filho', address: 'Av. Severo Dullius, 90000', lat: -29.9937, lon: -51.1714 },
]

export default function Home() {
  const navigate         = useNavigate()
  const { dark, toggle } = useTheme()

  const [origin,       setOrigin]       = useState(null)
  const [originLabel,  setOriginLabel]  = useState('Detectando localização…')
  const [gpsLoading,   setGpsLoading]   = useState(false)

  const [destinations,  setDestinations]  = useState([{ label: '', lat: null, lon: null }])
  const [activeDestIdx, setActiveDestIdx] = useState(0)

  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [focus,   setFocus]   = useState(false)
  const searchTimer = useRef(null)

  const [routeData,    setRouteData]    = useState(null)
  const [mapClickMode, setMapClickMode] = useState(false)

  const [reports,          setReports]          = useState([])
  const [showReportModal,  setShowReportModal]  = useState(false)
  const [reportCoords,     setReportCoords]     = useState(null)

  const [showVoice,       setShowVoice]       = useState(false)
  const [voicePref,       setVoicePref]       = useState('balanced')
  const [exploreCategory, setExploreCategory] = useState('todos')

  const [weather, setWeather] = useState(null)

  // ── Init ──────────────────────────────────────────────────────
  useEffect(() => {
    detectGPS()
    setReports(getReports())
  }, [])

  async function detectGPS() {
    setGpsLoading(true)
    try {
      const pos   = await getCurrentPosition()
      const label = await reverseGeocode(pos.lat, pos.lon)
      setOrigin({ ...pos, label })
      setOriginLabel(label)
      const w = await getWeather(pos.lat, pos.lon)
      setWeather(w)
    } catch {
      setOriginLabel(POA_DEFAULT.label)
      setOrigin(POA_DEFAULT)
    } finally {
      setGpsLoading(false)
    }
  }

  useEffect(() => {
    const dest = destinations[0]
    if (!origin || !dest?.lat) { setRouteData(null); return }
    fetchRoute(origin, dest).then(setRouteData)
  }, [origin, destinations])

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
    setQuery('')
    setResults([])
    setFocus(false)
  }, [destinations, activeDestIdx])

  function addDestination() {
    setDestinations(d => [...d, { label: '', lat: null, lon: null }])
    setActiveDestIdx(destinations.length)
  }

  function removeDestination(idx) {
    if (destinations.length === 1) {
      setDestinations([{ label: '', lat: null, lon: null }])
    } else {
      setDestinations(d => d.filter((_, i) => i !== idx))
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
      setReportCoords({ lat, lon })
      setShowReportModal(true)
    }
  }

  function startNavigation() {
    const dest = destinations[0]
    if (!dest?.lat) return
    navigate('/loading', {
      state: {
        origin:          originLabel,
        originCoords:    origin,
        destination:     dest.label,
        destCoords:      { lat: dest.lat, lon: dest.lon },
        distanceKm:      routeData?.distanceKm,
        weather,
        preferredFilter: voicePref,
        allDestinations: destinations.filter(d => d.lat),
      }
    })
  }

  async function handleVoiceResult({ destination, preference }) {
    setVoicePref(preference)
    setActiveDestIdx(0)
    setFocus(true)
    const places = await searchPlaces(destination, origin?.lat, origin?.lon)
    if (places.length > 0) {
      selectPlace(places[0])
    } else {
      setQuery(destination)
      setResults([])
    }
  }

  const hasValidDest = destinations.some(d => d.lat)

  // ── Theme ──────────────────────────────────────────────────────
  const sheet   = dark ? 'bg-dark-950'    : 'bg-white'
  const card    = dark ? 'bg-dark-900 border-dark-800' : 'bg-gray-50 border-gray-200'
  const inpRow  = dark ? 'bg-dark-900 border-dark-800' : 'bg-white border-gray-100'
  const text    = dark ? 'text-white'     : 'text-gray-900'
  const muted   = dark ? 'text-dark-400'  : 'text-gray-500'
  const divClr  = dark ? 'border-dark-800': 'border-gray-100'

  // Floating pill button style
  const pill = 'w-10 h-10 rounded-2xl bg-black/45 backdrop-blur-md border border-white/15 flex items-center justify-center active:scale-90 transition-transform shadow-md'

  return (
    /*
     * Layout strategy — flex column filling the viewport:
     *   • The map is absolute inset-0 (behind everything, full-screen)
     *   • Top section and bottom sheet are real flex items (reliable height)
     *   • Middle spacer (flex-1, pointer-events-none) exposes the map
     * This avoids the "height:100dvh collapsing to 0" bug that broke the
     * previous all-absolute layout.
     */
    <div className="relative flex flex-col min-h-dvh overflow-x-hidden">

      {/* ── FULL-SCREEN MAP (background, isolated stacking context) ── */}
      <div className="absolute inset-0 z-0" style={{ isolation: 'isolate' }}>
        <ZippiMap
          origin={origin}
          destinations={destinations.filter(d => d.lat)}
          routePolyline={routeData?.polyline}
          communityReports={reports}
          onMapClick={handleMapClick}
          dark={dark}
        />
      </div>

      {/* ── TOP GRADIENT (visual softening, no interaction) ── */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none z-10"
        style={{ height: 140, background: 'linear-gradient(to bottom,rgba(0,0,0,0.52) 0%,transparent 100%)' }}
      />

      {/* ══ TOP SECTION — in flex flow, z-20 beats map ══════════════ */}
      <div className="relative z-20 flex-shrink-0 px-4 pt-12 pb-2 pointer-events-auto">
        <div className="flex items-start justify-between gap-3">

          {/* Location pill */}
          <div className="flex items-center gap-2.5 bg-black/50 backdrop-blur-md rounded-2xl px-3 py-2.5 min-w-0 flex-1 max-w-[192px] border border-white/10 shadow-md">
            <div className="relative flex-shrink-0 w-3 h-3">
              <div className="absolute inset-0 rounded-full bg-zippi-400" />
              <div className="absolute inset-0 rounded-full bg-zippi-400 animate-ping opacity-50" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] text-white/50 font-bold uppercase tracking-wider leading-none mb-0.5">Você está em</p>
              <p className="text-xs font-semibold text-white truncate leading-tight">{originLabel}</p>
            </div>
          </div>

          {/* Action buttons — máx 4 para caber em qualquer tela */}
          <div className="flex gap-1.5 flex-shrink-0">
            <button onClick={detectGPS} className={pill} title="Atualizar localização">
              <Crosshair size={16} className={gpsLoading ? 'text-zippi-400 animate-spin' : 'text-white'} />
            </button>
            <button onClick={toggle} className={pill} title="Alternar tema">
              {dark ? <Sun size={16} className="text-yellow-300" /> : <Moon size={16} className="text-slate-200" />}
            </button>
            <button
              onClick={() => { setReportCoords(origin); setShowReportModal(true) }}
              className={pill}
              title="Reportar ocorrência"
            >
              <TriangleAlert size={16} className="text-orange-400" />
            </button>
            {/* Avatar de perfil — substituiu History no top bar */}
            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-2xl bg-zippi-400 flex items-center justify-center active:scale-90 transition-transform shadow-md shadow-zippi-900/40"
              title="Meu perfil"
            >
              <span className="text-[11px] font-black text-dark-950 leading-none select-none">JS</span>
            </button>
          </div>
        </div>

        {/* Weather strip */}
        {weather && (
          <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-md border shadow-sm ${
            weather.warn
              ? 'bg-yellow-900/70 border-yellow-600/40'
              : 'bg-black/35 border-white/10'
          }`}>
            <span className="text-sm leading-none">{weather.emoji}</span>
            <span className="text-xs font-semibold text-white">{weather.label}</span>
            <span className="text-xs text-white/55">{weather.temp}°C</span>
            {weather.warn && (
              <span className="text-xs text-yellow-300 font-semibold">· Evite veículos abertos</span>
            )}
          </div>
        )}
      </div>

      {/* ══ MIDDLE SPACER — exposes the map, voice FAB ══════════════ */}
      <div className="flex-1 relative z-10 min-h-[80px]" style={{ pointerEvents: 'none' }}>

        {/* Map-click mode banner */}
        {mapClickMode && (
          <div className="absolute inset-x-0 top-6 flex justify-center z-20" style={{ pointerEvents: 'none' }}>
            <div className="bg-zippi-400 text-dark-950 px-5 py-3 rounded-2xl text-sm font-black shadow-xl">
              📍 Toque no mapa para definir o destino
            </div>
          </div>
        )}

        {/* Voice assistant FAB */}
        <div className="absolute bottom-4 right-4 flex flex-col items-center gap-1" style={{ pointerEvents: 'auto' }}>
          <button
            onClick={() => setShowVoice(true)}
            className="w-14 h-14 rounded-full bg-zippi-400 shadow-2xl shadow-zippi-900/50 flex items-center justify-center active:scale-90 transition-transform border-2 border-white/20"
            title="Assistente de voz"
          >
            <Mic size={26} className="text-dark-950" />
          </button>
          <span className="text-[9px] font-bold text-white" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
            Falar
          </span>
        </div>
      </div>

      {/* ══ BOTTOM SHEET — in flex flow, z-20, scrollable ═══════════ */}
      <div
        className={`relative z-20 flex-shrink-0 ${sheet} rounded-t-4xl overflow-hidden`}
        style={{ maxHeight: '60vh', boxShadow: '0 -4px 32px rgba(0,0,0,0.22)' }}
      >
        {/* Drag handle */}
        <div className={`w-10 h-1 ${dark ? 'bg-dark-700' : 'bg-gray-300'} rounded-full mx-auto mt-3`} />

        {/* Scrollable inner content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(60vh - 20px)' }}>
          <div className="px-5 pt-3 pb-8">

            {/* Route inputs card */}
            <div className={`${inpRow} border rounded-2xl overflow-hidden mb-3`}>

              {/* Origin */}
              <div className={`flex items-center gap-3 px-4 py-3 border-b ${divClr}`}>
                <div className="relative flex-shrink-0 w-3 h-3">
                  <div className="absolute inset-0 rounded-full bg-zippi-400" />
                  <div className="absolute inset-0 rounded-full bg-zippi-400 animate-ping opacity-40" />
                </div>
                <p className={`text-sm ${muted} truncate flex-1`}>{originLabel}</p>
                <Crosshair size={12} className="text-zippi-400 flex-shrink-0 opacity-50" />
              </div>

              {/* Destinations */}
              {destinations.map((dest, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    i < destinations.length - 1 ? `border-b ${divClr}` : ''
                  }`}
                >
                  <div className={`w-3 h-3 rounded-sm flex-shrink-0 ${
                    i === destinations.length - 1 ? 'bg-red-400' : 'bg-orange-400'
                  }`} />
                  <input
                    type="text"
                    placeholder={i === 0 ? 'Para onde?' : `Parada ${i + 1}`}
                    value={activeDestIdx === i ? query : dest.label}
                    onChange={e => { setActiveDestIdx(i); setQuery(e.target.value) }}
                    onFocus={() => { setActiveDestIdx(i); setFocus(true) }}
                    onBlur={() => setTimeout(() => setFocus(false), 150)}
                    className={`flex-1 bg-transparent text-sm font-medium outline-none ${
                      dest.lat ? text : muted
                    }`}
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

              {/* Add stop */}
              {destinations.length < 3 && (
                <button
                  onClick={addDestination}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 border-t ${divClr}`}
                >
                  <Plus size={13} className="text-zippi-400" />
                  <span className="text-xs text-zippi-400 font-semibold">Adicionar parada</span>
                </button>
              )}
            </div>

            {/* Search results */}
            {focus && results.length > 0 && (
              <div className={`${dark ? 'bg-dark-900 border-dark-800' : 'bg-white border-gray-200'} border rounded-2xl mb-3 overflow-hidden shadow-xl`}>
                {results.map((r, i) => (
                  <button
                    key={i}
                    onMouseDown={() => selectPlace(r)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left ${
                      i > 0 ? `border-t ${divClr}` : ''
                    } ${dark ? 'active:bg-dark-800' : 'active:bg-gray-50'}`}
                  >
                    <span className="text-base flex-shrink-0 mt-0.5">📍</span>
                    <p className={`text-sm ${text} leading-tight`}>{r.label}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Saved + recent */}
            {!focus && (
              <>
                <div className="flex gap-2 mb-4">
                  {SAVED.map(s => (
                    <button
                      key={s.label}
                      onClick={() => selectPlace({ label: s.address, lat: s.lat, lon: s.lon })}
                      className={`flex-1 flex items-center gap-2.5 ${card} border rounded-2xl px-3 py-3 active:scale-95 transition-transform`}
                    >
                      <div className={`w-8 h-8 rounded-xl ${dark ? 'bg-dark-700' : 'bg-gray-200'} flex items-center justify-center text-base flex-shrink-0`}>
                        {s.emoji}
                      </div>
                      <span className={`text-sm font-semibold ${text}`}>{s.label}</span>
                    </button>
                  ))}
                </div>

                <p className={`text-[10px] ${muted} font-bold uppercase tracking-widest mb-2`}>Recentes</p>
                <div className="flex flex-col">
                  {RECENT.map(r => (
                    <button
                      key={r.label}
                      onClick={() => selectPlace({ label: r.address, lat: r.lat, lon: r.lon })}
                      className={`flex items-center gap-3 px-2 py-2.5 rounded-xl ${dark ? 'active:bg-dark-800' : 'active:bg-gray-50'} transition-colors text-left`}
                    >
                      <div className={`w-9 h-9 rounded-xl ${dark ? 'bg-dark-800' : 'bg-gray-100'} flex items-center justify-center text-lg flex-shrink-0`}>
                        🕐
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${text}`}>{r.label}</p>
                        <p className={`text-xs ${muted} truncate`}>{r.address}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* ── Explorar Porto Alegre ─────────────────────────── */}
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-2.5">
                    <p className={`text-[10px] ${muted} font-bold uppercase tracking-widest`}>
                      Explorar Porto Alegre
                    </p>
                    <span className="text-[9px] font-black text-zippi-400">ODS 10 · 11</span>
                  </div>

                  {/* Category chips */}
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-3">
                    {EXPLORE_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setExploreCategory(cat.id)}
                        className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                          exploreCategory === cat.id
                            ? 'bg-zippi-400 text-dark-950'
                            : dark
                              ? 'bg-dark-800 text-dark-400 border border-dark-700'
                              : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}
                      >
                        <span className="text-[13px]">{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Place rows */}
                  <div className="flex flex-col">
                    {EXPLORE_PLACES
                      .filter(p => exploreCategory === 'todos' || p.category === exploreCategory)
                      .slice(0, 5)
                      .map(place => {
                        const catInfo = EXPLORE_CATEGORIES.find(c => c.id === place.category)
                        return (
                          <button
                            key={place.id}
                            onClick={() => selectPlace({ label: place.name, lat: place.lat, lon: place.lon })}
                            className={`flex items-center gap-3 px-2 py-2.5 rounded-xl ${dark ? 'active:bg-dark-800' : 'active:bg-gray-50'} transition-colors text-left`}
                          >
                            <div className={`w-9 h-9 rounded-xl ${dark ? 'bg-dark-800' : 'bg-gray-100'} flex items-center justify-center text-lg flex-shrink-0`}>
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
                      })
                    }
                  </div>
                </div>
              </>
            )}

            {/* Go button */}
            {hasValidDest && (
              <button
                onClick={startNavigation}
                className="w-full mt-4 py-4 rounded-2xl bg-zippi-400 text-dark-950 font-black text-base flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-zippi-900/30"
              >
                <Search size={18} />
                {routeData ? `Ver opções — ${routeData.distanceKm} km` : 'Ver melhores opções'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── MODALS ──────────────────────────────────────────────── */}
      {showReportModal && (
        <CommunityModal
          lat={reportCoords?.lat}
          lon={reportCoords?.lon}
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
    </div>
  )
}
