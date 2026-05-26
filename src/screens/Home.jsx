import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Crosshair, History, Plus, X, TriangleAlert, Sun, Moon, Mic } from 'lucide-react'
import ZippiMap        from '../components/ZippiMap.jsx'
import CommunityModal  from '../components/CommunityModal.jsx'
import VoiceAssistant  from '../components/VoiceAssistant.jsx'
import { getCurrentPosition, reverseGeocode, searchPlaces, fetchRoute } from '../services/geo.js'
import { getWeather }  from '../services/weather.js'
import { getReports }  from '../services/community.js'
import { useTheme }    from '../context/ThemeContext.jsx'

const SAVED = [
  { label: 'Casa',     emoji: '🏠', address: 'R. dos Pinheiros, 870', lat: -23.566, lon: -46.683 },
  { label: 'Trabalho', emoji: '💼', address: 'Av. Berrini, 105',     lat: -23.598, lon: -46.688 },
]
const RECENT = [
  { label: 'Faculdade USP',       address: 'R. do Matão, 1010',          lat: -23.559, lon: -46.731 },
  { label: 'Shopping Iguatemi',   address: 'Av. Faria Lima, 2232',        lat: -23.576, lon: -46.679 },
  { label: 'Aeroporto Congonhas', address: 'Aeroporto Int. Congonhas',    lat: -23.626, lon: -46.655 },
]

export default function Home() {
  const navigate          = useNavigate()
  const { dark, toggle }  = useTheme()

  // ── Location ──────────────────────────────────────────────────
  const [origin,      setOrigin]      = useState(null)
  const [originLabel, setOriginLabel] = useState('Detectando localização…')
  const [gpsLoading,  setGpsLoading]  = useState(false)

  // ── Destinations ──────────────────────────────────────────────
  const [destinations,   setDestinations]   = useState([{ label: '', lat: null, lon: null }])
  const [activeDestIdx,  setActiveDestIdx]  = useState(0)

  // ── Search ────────────────────────────────────────────────────
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [focus,   setFocus]   = useState(false)
  const searchTimer = useRef(null)

  // ── Map ───────────────────────────────────────────────────────
  const [routeData,    setRouteData]    = useState(null)
  const [mapClickMode, setMapClickMode] = useState(false)

  // ── Community ─────────────────────────────────────────────────
  const [reports,         setReports]         = useState([])
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportCoords,    setReportCoords]    = useState(null)

  // ── Voice ─────────────────────────────────────────────────────
  const [showVoice,      setShowVoice]      = useState(false)
  const [voicePref,      setVoicePref]      = useState('balanced')

  // ── Weather ───────────────────────────────────────────────────
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
      setOriginLabel('São Paulo, SP')
      setOrigin({ lat: -23.5505, lon: -46.6333, label: 'São Paulo, SP' })
    } finally {
      setGpsLoading(false)
    }
  }

  // ── Route update ──────────────────────────────────────────────
  useEffect(() => {
    const dest = destinations[0]
    if (!origin || !dest?.lat) { setRouteData(null); return }
    fetchRoute(origin, dest).then(setRouteData)
  }, [origin, destinations])

  // ── Debounced search ──────────────────────────────────────────
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
        origin:         originLabel,
        originCoords:   origin,
        destination:    dest.label,
        destCoords:     { lat: dest.lat, lon: dest.lon },
        distanceKm:     routeData?.distanceKm,
        weather,
        preferredFilter: voicePref,
        allDestinations: destinations.filter(d => d.lat),
      }
    })
  }

  // ── Voice result handler ──────────────────────────────────────
  async function handleVoiceResult({ destination, preference }) {
    setVoicePref(preference)
    setQuery(destination)
    setActiveDestIdx(0)
    setFocus(true)
    // Auto-search and select first result
    const places = await searchPlaces(destination, origin?.lat, origin?.lon)
    if (places.length > 0) {
      selectPlace(places[0])
    } else {
      setResults(places)
    }
  }

  const hasValidDest = destinations.some(d => d.lat)

  // ── Theme tokens ──────────────────────────────────────────────
  const sheet = dark ? 'bg-dark-950' : 'bg-white'
  const card  = dark ? 'bg-dark-900 border-dark-800' : 'bg-gray-50 border-gray-200'
  const inputRow = dark ? 'bg-dark-900 border-dark-800' : 'bg-white border-gray-100'
  const text  = dark ? 'text-white'   : 'text-gray-900'
  const muted = dark ? 'text-dark-400': 'text-gray-500'
  const floatBtn = 'w-10 h-10 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center active:scale-90 transition-transform shadow-md'

  return (
    // Root: full-screen relative container.
    // The map sits as an absolutely-positioned background.
    // All other UI panels are absolutely-positioned above it.
    <div className="relative w-full overflow-hidden" style={{ height: '100dvh' }}>

      {/* ── FULL-SCREEN MAP ────────────────────────────────────
          isolation:isolate on ZippiMap itself contains Leaflet's
          internal z-indexes (200–700) so they don't escape the
          map div and overlap the app's own controls.              */}
      <div className="absolute inset-0">
        <ZippiMap
          origin={origin}
          destinations={destinations.filter(d => d.lat)}
          routePolyline={routeData?.polyline}
          communityReports={reports}
          onMapClick={handleMapClick}
          dark={dark}
        />
      </div>

      {/* ── TOP GRADIENT fade (pointer-events-none) ─────────── */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none z-10"
        style={{
          height: 140,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)'
        }}
      />

      {/* ── TOP BAR — floats over map ──────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-12">
        <div className="flex items-start justify-between gap-3">

          {/* Location pill */}
          <div className="flex items-center gap-2.5 bg-black/50 backdrop-blur-md rounded-2xl px-3 py-2.5 flex-1 max-w-[180px] shadow-md border border-white/10">
            <div className="relative flex-shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-zippi-400" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-zippi-400 animate-ping opacity-50" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] text-white/50 font-semibold uppercase tracking-wider leading-none mb-0.5">Sua posição</p>
              <p className="text-xs font-semibold text-white truncate leading-tight">{originLabel}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={detectGPS}
              className={floatBtn}
              title="Minha localização"
            >
              <Crosshair
                size={17}
                className={gpsLoading ? 'text-zippi-400 animate-spin' : 'text-white'}
              />
            </button>
            <button onClick={toggle} className={floatBtn} title="Alternar tema">
              {dark
                ? <Sun  size={17} className="text-yellow-300" />
                : <Moon size={17} className="text-slate-200" />
              }
            </button>
            <button
              onClick={() => { setReportCoords(origin); setShowReportModal(true) }}
              className={floatBtn}
              title="Reportar ocorrência"
            >
              <TriangleAlert size={17} className="text-orange-400" />
            </button>
            <button
              onClick={() => navigate('/history')}
              className={floatBtn}
              title="Histórico"
            >
              <History size={17} className="text-white" />
            </button>
          </div>
        </div>

        {/* Weather strip */}
        {weather && (
          <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-md text-white border shadow-sm ${
            weather.warn
              ? 'bg-yellow-900/70 border-yellow-600/40'
              : 'bg-black/35 border-white/10'
          }`}>
            <span className="text-sm leading-none">{weather.emoji}</span>
            <span className="text-xs font-semibold">{weather.label}</span>
            <span className="text-xs text-white/60">{weather.temp}°C</span>
            {weather.warn && (
              <span className="text-xs text-yellow-300 font-semibold">· Evite veículos abertos</span>
            )}
          </div>
        )}
      </div>

      {/* ── MAP-CLICK MODE BANNER ───────────────────────────── */}
      {mapClickMode && (
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-20 flex justify-center pointer-events-none">
          <div className="bg-zippi-400 text-dark-950 px-5 py-3 rounded-2xl text-sm font-black shadow-xl">
            📍 Toque no mapa para definir o destino
          </div>
        </div>
      )}

      {/* ── VOICE FAB — floats above bottom sheet ──────────── */}
      <div className="absolute right-4 z-20" style={{ bottom: 'calc(56vh + 16px)' }}>
        <button
          onClick={() => setShowVoice(true)}
          className="w-14 h-14 rounded-full bg-zippi-400 shadow-xl shadow-zippi-900/50 flex items-center justify-center active:scale-90 transition-transform border-2 border-white/20"
          title="Assistente de voz"
        >
          <Mic size={26} className="text-dark-950" />
        </button>
        <p className="text-center text-[9px] font-bold text-white mt-1 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
          Falar
        </p>
      </div>

      {/* ── BOTTOM SHEET ────────────────────────────────────── */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 ${sheet} rounded-t-4xl overflow-hidden`}
        style={{
          maxHeight: '60vh',
          boxShadow: '0 -4px 32px rgba(0,0,0,0.25)',
        }}
      >
        {/* Drag handle */}
        <div className={`w-10 h-1 ${dark ? 'bg-dark-700' : 'bg-gray-300'} rounded-full mx-auto mt-3 mb-0`} />

        {/* Scrollable content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(60vh - 16px)' }}>
          <div className="px-5 pt-4 pb-8">

            {/* ── Route inputs ── */}
            <div className={`${inputRow} border rounded-2xl overflow-hidden mb-3`}>
              {/* Origin row */}
              <div className={`flex items-center gap-3 px-4 py-3 border-b ${dark ? 'border-dark-800/50' : 'border-gray-100'}`}>
                <div className="relative flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-zippi-400" />
                  <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-zippi-400 animate-ping opacity-40" />
                </div>
                <p className={`text-sm ${muted} truncate flex-1`}>{originLabel}</p>
                <Crosshair size={13} className="text-zippi-400 flex-shrink-0 opacity-60" />
              </div>

              {/* Destination rows */}
              {destinations.map((dest, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    i < destinations.length - 1
                      ? `border-b ${dark ? 'border-dark-800/40' : 'border-gray-100'}`
                      : ''
                  }`}
                >
                  <div className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${
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
                      dest.lat
                        ? text
                        : muted
                    }`}
                  />
                  {dest.lat ? (
                    <button onClick={() => removeDestination(i)}>
                      <X size={14} className={`${muted} opacity-60`} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setMapClickMode(true)}
                      className="flex items-center gap-1"
                    >
                      <span className="text-xs text-zippi-400 font-semibold">📍 Mapa</span>
                    </button>
                  )}
                </div>
              ))}

              {/* Add destination */}
              {destinations.length < 3 && (
                <button
                  onClick={addDestination}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 border-t ${
                    dark ? 'border-dark-800' : 'border-gray-100'
                  }`}
                >
                  <Plus size={14} className="text-zippi-400" />
                  <span className="text-xs text-zippi-400 font-semibold">Adicionar parada</span>
                </button>
              )}
            </div>

            {/* ── Search results dropdown ── */}
            {focus && results.length > 0 && (
              <div className={`${dark ? 'bg-dark-900 border-dark-800' : 'bg-white border-gray-200'} border rounded-2xl mb-3 overflow-hidden shadow-xl`}>
                {results.map((r, i) => (
                  <button
                    key={i}
                    onMouseDown={() => selectPlace(r)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left ${
                      i > 0 ? `border-t ${dark ? 'border-dark-800' : 'border-gray-100'}` : ''
                    } ${dark ? 'active:bg-dark-800' : 'active:bg-gray-50'}`}
                  >
                    <span className="text-base flex-shrink-0 mt-0.5">📍</span>
                    <p className={`text-sm ${text} leading-tight`}>{r.label}</p>
                  </button>
                ))}
              </div>
            )}

            {/* ── Saved places + recent (when not searching) ── */}
            {!focus && (
              <>
                {/* Saved */}
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

                {/* Recent */}
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
              </>
            )}

            {/* ── Go button ── */}
            {hasValidDest && (
              <button
                onClick={startNavigation}
                className="w-full mt-4 py-4 rounded-2xl bg-zippi-400 text-dark-950 font-black text-base flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-zippi-900/30"
              >
                <Search size={18} />
                {routeData
                  ? `Ver opções — ${routeData.distanceKm} km`
                  : 'Ver melhores opções'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── MODALS ──────────────────────────────────────────── */}
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
