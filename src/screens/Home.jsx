import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Crosshair, Bell, History, Plus, X, TriangleAlert, Sun, Moon } from 'lucide-react'
import ZippiMap from '../components/ZippiMap.jsx'
import CommunityModal from '../components/CommunityModal.jsx'
import { getCurrentPosition, reverseGeocode, searchPlaces, fetchRoute } from '../services/geo.js'
import { getWeather } from '../services/weather.js'
import { getReports } from '../services/community.js'
import { useTheme } from '../context/ThemeContext.jsx'

const SAVED = [
  { label: 'Casa',     emoji: '🏠', address: 'R. dos Pinheiros, 870 — Pinheiros', lat: -23.566, lon: -46.683 },
  { label: 'Trabalho', emoji: '💼', address: 'Av. L. C. Berrini, 105', lat: -23.598, lon: -46.688 },
]
const RECENT = [
  { label: 'Faculdade USP',     address: 'R. do Matão, 1010', lat: -23.559, lon: -46.731 },
  { label: 'Shopping Iguatemi', address: 'Av. Faria Lima, 2232', lat: -23.576, lon: -46.679 },
  { label: 'Aeroporto Congonhas', address: 'Aeroporto Int. Congonhas', lat: -23.626, lon: -46.655 },
]

export default function Home() {
  const navigate   = useNavigate()
  const { dark, toggle } = useTheme()

  // Location state
  const [origin,   setOrigin]   = useState(null)   // { lat, lon, label }
  const [originLabel, setOriginLabel] = useState('Detectando localização...')
  const [gpsLoading, setGpsLoading]   = useState(false)

  // Destinations (supports multiple stops)
  const [destinations, setDestinations] = useState([{ label: '', lat: null, lon: null }])
  const [activeDestIdx, setActiveDestIdx] = useState(0)

  // Search
  const [query,    setQuery]    = useState('')
  const [results,  setResults]  = useState([])
  const [focus,    setFocus]    = useState(false)
  const searchTimer = useRef(null)

  // Map
  const [routeData,   setRouteData]   = useState(null)
  const [mapClickMode, setMapClickMode] = useState(false)

  // Community
  const [reports,       setReports]       = useState([])
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportCoords,    setReportCoords]    = useState(null)

  // Weather
  const [weather, setWeather] = useState(null)

  // ── Auto-detect GPS on mount ──
  useEffect(() => {
    detectGPS()
    setReports(getReports())
  }, [])

  async function detectGPS() {
    setGpsLoading(true)
    try {
      const pos = await getCurrentPosition()
      const label = await reverseGeocode(pos.lat, pos.lon)
      setOrigin({ ...pos, label })
      setOriginLabel(label)
      // Fetch weather for current location
      const w = await getWeather(pos.lat, pos.lon)
      setWeather(w)
    } catch {
      setOriginLabel('São Paulo, SP (localização manual)')
      setOrigin({ lat: -23.5505, lon: -46.6333, label: 'São Paulo, SP' })
    } finally {
      setGpsLoading(false)
    }
  }

  // ── Fetch route when origin + destination change ──
  useEffect(() => {
    const dest = destinations[0]
    if (!origin || !dest?.lat) { setRouteData(null); return }
    fetchRoute(origin, dest).then(setRouteData)
  }, [origin, destinations])

  // ── Search places with debounce ──
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
      // Set as destination
      reverseGeocode(lat, lon).then(label => {
        const next = [...destinations]
        next[activeDestIdx] = { label, lat, lon }
        setDestinations(next)
      })
      setMapClickMode(false)
    } else {
      // Show report modal at clicked position
      setReportCoords({ lat, lon })
      setShowReportModal(true)
    }
  }

  function startNavigation() {
    const dest = destinations[0]
    if (!dest?.lat) return
    navigate('/loading', {
      state: {
        origin: originLabel,
        originCoords: origin,
        destination: dest.label,
        destCoords: { lat: dest.lat, lon: dest.lon },
        distanceKm: routeData?.distanceKm,
        weather,
        allDestinations: destinations.filter(d => d.lat),
      }
    })
  }

  const hasValidDest = destinations.some(d => d.lat)
  const bg     = dark ? 'bg-dark-950'  : 'bg-gray-50'
  const sheet  = dark ? 'bg-dark-950'  : 'bg-white'
  const card   = dark ? 'bg-dark-800 border-dark-700' : 'bg-gray-100 border-gray-200'
  const text   = dark ? 'text-white'   : 'text-gray-900'
  const muted  = dark ? 'text-dark-400': 'text-gray-500'
  const inputBg= dark ? 'bg-dark-800 border-dark-700' : 'bg-gray-100 border-gray-200'

  return (
    <div className={`flex flex-col min-h-dvh ${bg} overflow-hidden`}>

      {/* ── REAL INTERACTIVE MAP ── */}
      <div className="absolute inset-0 bottom-[50%]">
        <ZippiMap
          origin={origin}
          destinations={destinations.filter(d => d.lat)}
          routePolyline={routeData?.polyline}
          communityReports={reports}
          onMapClick={handleMapClick}
          dark={dark}
          className="w-full h-full"
        />
        {/* Bottom fade */}
        <div className={`absolute bottom-0 left-0 right-0 h-20 pointer-events-none ${
          dark
            ? 'bg-gradient-to-t from-dark-950 to-transparent'
            : 'bg-gradient-to-t from-gray-50 to-transparent'
        }`} />

        {/* Map click mode hint */}
        {mapClickMode && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zippi-400 text-dark-950 px-4 py-2 rounded-2xl text-sm font-bold shadow-lg pointer-events-none z-20">
            Toque no mapa para definir destino
          </div>
        )}
      </div>

      {/* ── TOP BAR ── */}
      <div className="relative z-20 flex items-start justify-between px-5 pt-14 pb-2">
        {/* Location */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl px-3 py-2 max-w-[200px]">
          <p className="text-xs text-white/60 font-medium">Sua localização</p>
          <p className="text-sm font-semibold text-white truncate leading-tight">{originLabel}</p>
        </div>

        {/* Right icons */}
        <div className="flex gap-2">
          {/* GPS button */}
          <button
            onClick={detectGPS}
            className={`w-9 h-9 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center ${gpsLoading ? 'opacity-60' : ''}`}
          >
            <Crosshair size={16} className={gpsLoading ? 'text-zippi-400 animate-spin' : 'text-white'} />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center"
          >
            {dark ? <Sun size={16} className="text-yellow-300" /> : <Moon size={16} className="text-white" />}
          </button>

          {/* Report button */}
          <button
            onClick={() => { setReportCoords(origin); setShowReportModal(true) }}
            className="w-9 h-9 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center"
          >
            <TriangleAlert size={16} className="text-orange-400" />
          </button>

          {/* History */}
          <button
            onClick={() => navigate('/history')}
            className="w-9 h-9 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center"
          >
            <History size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* Weather strip */}
      {weather && (
        <div className={`relative z-20 mx-5 mt-1 flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-md ${
          weather.warn ? 'bg-yellow-900/60 border border-yellow-600/40' : 'bg-black/30'
        }`}>
          <span className="text-base">{weather.emoji}</span>
          <span className="text-xs text-white font-medium">{weather.label}</span>
          <span className="text-xs text-white/60">{weather.temp}°C</span>
          {weather.warn && <span className="text-xs text-yellow-300 ml-1 font-semibold">Evite veículos abertos</span>}
        </div>
      )}

      {/* ── BOTTOM SHEET ── */}
      <div className={`relative z-10 mt-auto ${sheet} rounded-t-4xl pt-2 pb-6`}
        style={{ boxShadow: '0 -8px 32px rgba(0,0,0,0.3)' }}>
        <div className={`w-10 h-1 ${dark ? 'bg-dark-700' : 'bg-gray-200'} rounded-full mx-auto mb-4`} />

        <div className="px-5">
          {/* Destination inputs */}
          <div className={`${dark ? 'bg-dark-900' : 'bg-gray-50'} rounded-2xl border ${dark ? 'border-dark-800' : 'border-gray-200'} overflow-hidden mb-3`}>
            {/* Origin row */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-dashed border-dark-800/50">
              <div className="relative flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-zippi-400" />
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-zippi-400 animate-ping opacity-40" />
              </div>
              <p className={`text-sm ${muted} truncate flex-1`}>{originLabel}</p>
              <Crosshair size={13} className="text-zippi-400 flex-shrink-0" />
            </div>

            {/* Destination rows */}
            {destinations.map((dest, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i < destinations.length - 1 ? 'border-b border-dark-800/40' : ''}`}>
                <div className={`w-3 h-3 rounded-sm ${i === destinations.length - 1 ? 'bg-red-400' : 'bg-orange-400'} flex-shrink-0`} />
                <input
                  type="text"
                  placeholder={i === 0 ? 'Para onde?' : `Parada ${i + 1}`}
                  value={activeDestIdx === i ? query : dest.label}
                  onChange={e => { setActiveDestIdx(i); setQuery(e.target.value) }}
                  onFocus={() => { setActiveDestIdx(i); setFocus(true) }}
                  onBlur={() => setTimeout(() => setFocus(false), 150)}
                  className={`flex-1 bg-transparent text-sm font-medium outline-none ${dest.lat ? (dark ? 'text-white' : 'text-gray-900') : (dark ? 'text-dark-500' : 'text-gray-400')}`}
                />
                {dest.lat && (
                  <button onClick={() => removeDestination(i)}>
                    <X size={14} className={muted} />
                  </button>
                )}
                {!dest.lat && (
                  <button onClick={() => setMapClickMode(true)}>
                    <span className="text-xs text-zippi-400 font-semibold">📍 Mapa</span>
                  </button>
                )}
              </div>
            ))}

            {/* Add destination button */}
            {destinations.length < 3 && (
              <button
                onClick={addDestination}
                className={`w-full flex items-center gap-2 px-4 py-2.5 border-t ${dark ? 'border-dark-800' : 'border-gray-100'}`}
              >
                <Plus size={14} className="text-zippi-400" />
                <span className="text-xs text-zippi-400 font-semibold">Adicionar parada</span>
              </button>
            )}
          </div>

          {/* Search results dropdown */}
          {focus && results.length > 0 && (
            <div className={`${dark ? 'bg-dark-900 border-dark-800' : 'bg-white border-gray-200'} border rounded-2xl mb-3 overflow-hidden shadow-xl`}>
              {results.map((r, i) => (
                <button
                  key={i}
                  onMouseDown={() => selectPlace(r)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left ${
                    i > 0 ? (dark ? 'border-t border-dark-800' : 'border-t border-gray-100') : ''
                  } ${dark ? 'active:bg-dark-800' : 'active:bg-gray-50'}`}
                >
                  <span className="text-base flex-shrink-0 mt-0.5">📍</span>
                  <p className={`text-sm ${text} leading-tight`}>{r.label}</p>
                </button>
              ))}
            </div>
          )}

          {/* Saved places */}
          {!focus && (
            <>
              <div className="flex gap-2 mb-4">
                {SAVED.map(s => (
                  <button
                    key={s.label}
                    onClick={() => selectPlace({ label: s.address, lat: s.lat, lon: s.lon })}
                    className={`flex-1 flex items-center gap-2 ${card} border rounded-2xl px-3 py-3 active:scale-95 transition-transform`}
                  >
                    <div className={`w-8 h-8 rounded-xl ${dark ? 'bg-dark-700' : 'bg-gray-200'} flex items-center justify-center text-base flex-shrink-0`}>
                      {s.emoji}
                    </div>
                    <span className={`text-sm font-semibold ${text}`}>{s.label}</span>
                  </button>
                ))}
              </div>

              {/* Recents */}
              <p className={`text-xs ${muted} font-semibold uppercase tracking-widest mb-2`}>Recentes</p>
              <div className="flex flex-col gap-0.5">
                {RECENT.map(r => (
                  <button
                    key={r.label}
                    onClick={() => selectPlace({ label: r.address, lat: r.lat, lon: r.lon })}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${dark ? 'active:bg-dark-800' : 'active:bg-gray-100'} transition-colors text-left`}
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

      {/* Community report modal */}
      {showReportModal && (
        <CommunityModal
          lat={reportCoords?.lat}
          lon={reportCoords?.lon}
          onClose={() => setShowReportModal(false)}
          onAdded={() => setReports(getReports())}
        />
      )}
    </div>
  )
}
