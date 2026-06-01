import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Crosshair, Plus, X, MapPin,
  Sun, Moon, Mic, ArrowLeft, ChevronRight,
  Compass, CalendarDays, User2, Zap, Sparkles,
  ShoppingBag, Cross, UtensilsCrossed, Heart,
} from 'lucide-react'
import ZippiMap           from '../components/ZippiMap.jsx'
import NotificationsDock  from '../components/NotificationsDock.jsx'
import AlertsDock         from '../components/AlertsDock.jsx'
import CommunityModal     from '../components/CommunityModal.jsx'
import SuggestPlaceModal  from '../components/SuggestPlaceModal.jsx'
import VoiceAssistant  from '../components/VoiceAssistant.jsx'
import ServiceCard     from '../components/ServiceCard.jsx'
import MultiVehicleCard from '../components/MultiVehicleCard.jsx'
import { getCurrentPosition, watchPosition, reverseGeocodeDetailed, searchPlaces, fetchRoute } from '../services/geo.js'
import {
  filterNearbyExplorePlaces,
  countNearbyExplorePlaces,
  formatDistanceKm,
  EXPLORE_RADIUS_KM,
  kmBetween as kmBetweenPlaces,
} from '../services/nearbyPlaces.js'
import { POA_NEIGHBORHOODS, filterPlacesByNeighborhood } from '../data/poa/neighborhoods.js'
import { getWeather, isSevereWeather } from '../services/weather.js'
import { getReports }  from '../services/community.js'
import { getRankedServices, getMultiVehicleCombos } from '../data/services.js'
import { useTheme }    from '../context/ThemeContext.jsx'
import { useUser }     from '../context/UserContext.jsx'
import { EXPLORE_CATEGORIES, EXPLORE_PLACES, EXPLORE_BENTO } from '../data/explore.js'
import { EVENTS_TODAY, EVENTS_BENTO } from '../data/events.js'
import {
  POA_PLACES,
  POA_EVENT_MOCKS,
  poaMockToEventRow,
  filterPoaLugares,
  filterPoaEssentials,
  placeToMapPin,
  sortByLocalFirst,
} from '../data/poa/index.js'
import { mergeNatureWithMock } from '../data/poa/mockNature.js'
import { loadPoaNatureFeatures } from '../services/poaMapLayers.js'
import { pinMeta } from '../data/poa/mapCategories.js'
import {
  LUGARES_FILTERS,
  EVENTOS_FILTERS,
  ESSENCIAIS_FILTERS,
} from '../data/poa/mapCategories.js'
import { geocodePendingPlaces, applyGeocodeCache } from '../services/poaGeocode.js'
import PlacePreviewSheet from '../components/PlacePreviewSheet.jsx'
import TrafficPreviewSheet from '../components/TrafficPreviewSheet.jsx'
import { getTrafficSegments, getTrafficSummary, loadTrafficGeometry, isAlertTraffic } from '../data/traffic.js'
import { ESSENTIAL_SERVICES } from '../data/essentials.js'
import { fetchNatureFeatures, fetchBusStops } from '../services/overpass.js'
import { searchEssentials } from '../services/essentialsSearch.js'
import { fetchEventsToday, fetchEventsUpcoming, hasSymplaToken } from '../services/sympla.js'
import { fetchNearbyScooters } from '../services/scooters.js'
import { glassSurface, explorePinColor, eventPinColor } from '../styles/glass.js'

// ── Constants ────────────────────────────────────────────────────
const NAV_H      = 60
const HANDLE_H   = 22
const DOCK_BAR_H = 48

function computeSnap() {
  const avail = window.innerHeight - NAV_H
  const peek  = HANDLE_H + DOCK_BAR_H + 6
  const full  = Math.min(Math.round(avail * 0.88), avail - 160)
  return { peek, mid: Math.round(avail * 0.48), full }
}

const POA_DEFAULT = { lat: -30.0346, lon: -51.2177, label: 'Porto Alegre, RS' }

const EXPLORE_CITIES = [
  { id: 'poa', label: 'Porto Alegre', emoji: '🌆', lat: -30.0346, lon: -51.2177, displayName: 'Porto Alegre' },
  { id: 'bentogoncalves', label: 'Bento Gonçalves', emoji: '🍷', lat: -29.1696, lon: -51.5193, displayName: 'Bento Gonçalves' },
]

function isBentoCity(cityId) {
  return cityId === 'bentogoncalves'
}

function placesForCity(cityId) {
  return isBentoCity(cityId) ? EXPLORE_BENTO : EXPLORE_PLACES
}

function eventsForCity(cityId) {
  return isBentoCity(cityId) ? EVENTS_BENTO : EVENTS_TODAY
}

function eventCityForExplore(cityId) {
  return isBentoCity(cityId) ? 'Bento Gonçalves' : 'Porto Alegre'
}

function inferExploreCityFromCoords(lat, lon) {
  if (kmBetween({ lat, lon }, { lat: -29.1696, lon: -51.5193 }) < 35) return 'bentogoncalves'
  return 'poa'
}

function filterEventsByCat(events, cat) {
  return events.filter(e => {
    if (cat === 'todos') return true
    if (e.cat === cat) return true
    if (cat === 'gratuito' && (/gr[aá]tis/i.test(e.price || '') || e.price === 'Entrada livre')) return true
    if (cat === 'hoje' && (/hoje/i.test(e.time || '') || e.highlight)) return true
    if (cat === 'aovivo' && /ao vivo|show/i.test(`${e.title} ${e.desc || ''}`)) return true
    if (cat === 'noturno' && /noite|noturno|bar/i.test(`${e.title} ${e.desc || ''} ${e.time || ''}`)) return true
    if (cat === 'infantil' && /infantil|criança|família/i.test(`${e.title} ${e.desc || ''}`)) return true
    return false
  })
}

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

function kmBetween(a, b) {
  if (!a?.lat || !b?.lat) return Infinity
  const R = 6371
  const dLat = (b.lat - a.lat) * Math.PI / 180
  const dLon = (b.lon - a.lon) * Math.PI / 180
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

// ── Essential service icons ──────────────────────────────────────
// definido fora do componente para evitar recriação a cada render
const ESSENTIAL_ICONS_MAP = {
  farmacia:    Cross,
  mercado:     ShoppingBag,
  fastfood:    UtensilsCrossed,
  restaurante: UtensilsCrossed,
  saude:       Heart,
}

// ── Event Card component ─────────────────────────────────────────
function EventCard({ event, dark, text, muted, cardStyle, onNavigate }) {
  return (
    <div className="w-full flex items-start gap-2.5 p-2 rounded-2xl" style={cardStyle}>
      <button type="button" onClick={() => onNavigate(event)}
        className="flex items-start gap-2.5 flex-1 min-w-0 text-left active:scale-[0.98] transition-all">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}>
          {event.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-[13px] font-bold ${text} leading-tight`}>{event.title}</p>
            <span className={`text-[9px] font-bold flex-shrink-0 px-1.5 py-0.5 rounded-md ${event.price === 'Grátis' || event.price === 'Grátis (shows especiais pagos)' ? 'text-zippi-400 bg-zippi-400/10' : 'text-orange-400 bg-orange-400/10'}`}>
              {event.price === 'Grátis' ? 'GRÁTIS' : event.price}
            </span>
          </div>
          <p className={`text-[11px] ${muted} leading-snug`}>{event.local} · {event.time}</p>
          {event.bairro && <p className={`text-[9px] ${muted} opacity-60 leading-snug`}>{event.bairro}</p>}
        </div>
      </button>
      {event.url && (
        <a href={event.url} target="_blank" rel="noopener noreferrer"
          className="text-[10px] font-bold text-zippi-400 flex-shrink-0 self-center px-2 py-1 rounded-lg bg-zippi-400/10">
          ingressos
        </a>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
export default function Home() {
  const navigate         = useNavigate()
  const { dark, toggle } = useTheme()
  const user             = useUser()

  const hour      = new Date().getHours()
  const dayOfWeek = new Date().getDay()

  /* ── GPS / origin ──────────────────────────────────────────── */
  const [origin,      setOrigin]      = useState(null)
  const [originLabel, setOriginLabel] = useState('Detectando localização…')
  const [location,    setLocation]    = useState({ city:'Porto Alegre', neighborhood:null, street:null })
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
  const boundsTimer   = useRef(null)
  const [natureFeatures, setNatureFeatures] = useState(() => mergeNatureWithMock())

  /* ── Route ─────────────────────────────────────────────────── */
  const [routeData,    setRouteData]    = useState(null)
  const [mapClickMode, setMapClickMode] = useState(false)

  /* ── Micromobilidade contextual ──────────────────────────────── */
  const [busStops,    setBusStops]    = useState([])
  const [scooterPins, setScooterPins] = useState([])

  /* ── Community ─────────────────────────────────────────────── */
  const [reports,         setReports]         = useState([])
  const [showReportModal, setShowReportModal] = useState(false)
  const [showSuggestPlace, setShowSuggestPlace] = useState(false)
  const [reportCoords,    setReportCoords]    = useState(null)
  const [pinCreationMode, setPinCreationMode] = useState(false)

  /* ── Voice: chat (dock) | guide (botão ia) ─────────────────── */
  const [voiceMode, setVoiceMode] = useState(null) // null | 'chat' | 'guide'

  /* ── Weather ───────────────────────────────────────────────── */
  const [weather, setWeather] = useState(null)

  /* ── Navigation tabs ───────────────────────────────────────── */
  // 'ir' | 'explorar' | 'hoje' | 'essenciais'
  const [activeTab, setActiveTab] = useState('ir')

  /* ── Explore ───────────────────────────────────────────────── */
  const [exploreCategory, setExploreCategory] = useState('todos')
  const [exploreNeighborhood, setExploreNeighborhood] = useState(null)
  const [essentialFilter, setEssentialFilter] = useState('farmacias')
  const [exploreSection, setExploreSection] = useState('lugares') // 'lugares' | 'eventos'
  const [exploreCity,     setExploreCity]     = useState('poa')
  const [poaPlaces, setPoaPlaces] = useState([])
  const [previewPlace, setPreviewPlace] = useState(null)
  const [previewTraffic, setPreviewTraffic] = useState(null)
  const [savedPlaceIds, setSavedPlaceIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('turio-saved-places') || '[]'))
    } catch {
      return new Set()
    }
  })

  /* ── Events (Hoje tab) ─────────────────────────────────────── */
  const [eventCat, setEventCat] = useState('todos')
  const [cityEventsToday, setCityEventsToday] = useState(EVENTS_TODAY)
  const [cityEventsUpcoming, setCityEventsUpcoming] = useState([])
  const [eventsLoadingToday, setEventsLoadingToday] = useState(false)
  const [eventsLoadingUpcoming, setEventsLoadingUpcoming] = useState(false)
  const [eventsSourceToday, setEventsSourceToday] = useState('fallback')
  const [symplaConfigured, setSymplaConfigured] = useState(false)

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
  const sheetRef      = useRef(null)
  const mapRef        = useRef(null)
  const dockInputRef  = useRef(null)
  const dragState     = useRef({ active:false, startY:0, startH:0 })
  const pendingCenter    = useRef(false)
  const pendingCinematic = useRef(false)

  const SNAP = useMemo(() => computeSnap(), [])

  const [sheetH, setSheetH] = useState(() => computeSnap().peek)

  const isSheetExpanded = sheetH > SNAP.peek + 20

  // CSS var = total height from screen bottom to sheet top (for FAB)
  useEffect(() => {
    document.documentElement.style.setProperty('--sheet-h', `${sheetH + NAV_H}px`)
  }, [sheetH])

  /* ── Init ──────────────────────────────────────────────────── */
  useEffect(() => {
    detectGPS()
    setReports(getReports())
    setPoaPlaces(POA_PLACES)
    geocodePendingPlaces(POA_PLACES, { max: 8 }).then(cache => {
      setPoaPlaces(prev => applyGeocodeCache(prev.length ? prev : POA_PLACES, cache))
    })
  }, [])

  async function refreshWeather(lat, lon) {
    try {
      const w = await getWeather(lat, lon)
      setWeather(w)
    } catch { /* opcional */ }
  }

  useEffect(() => {
    if (!origin?.lat || !origin?.lon) return
    refreshWeather(origin.lat, origin.lon)
    const iv = setInterval(() => refreshWeather(origin.lat, origin.lon), 15 * 60 * 1000)
    return () => clearInterval(iv)
  }, [origin?.lat, origin?.lon])

  useEffect(() => {
    if (origin && pendingCenter.current) {
      mapRef.current?.focusPoint(origin.lat, origin.lon, 15, mapSheetPadding())
      pendingCenter.current = false
    }
  }, [origin])

  /* ── GPS contínuo (explorar · raio 3 km em poa) ─────────────── */
  useEffect(() => {
    if (isBentoCity(exploreCity)) return undefined
    const stop = watchPosition(pos => {
      setOrigin(prev => {
        if (!prev?.lat) return { lat: pos.lat, lon: pos.lon, label: prev?.label ?? originLabel }
        if (kmBetweenPlaces(prev, pos) < 0.03) return prev
        return { ...prev, lat: pos.lat, lon: pos.lon }
      })
    })
    return stop
  }, [exploreCity])

  /* ── GPS (Firefox-safe two-pass) ───────────────────────────── */
  async function detectGPS() {
    setGpsLoading(true); setGpsError(false)
    try {
      let pos
      try { pos = await getCurrentPosition(true)
      } catch { pos = await getCurrentPosition(false) }
      const loc = await reverseGeocodeDetailed(pos.lat, pos.lon)
      setOrigin({ ...pos, label: loc.label }); setOriginLabel(loc.label)
      setLocation({ city: loc.city, neighborhood: loc.neighborhood, street: loc.street })
      setExploreCity(inferExploreCityFromCoords(pos.lat, pos.lon))
      mapRef.current?.focusPoint(pos.lat, pos.lon, 15, mapSheetPadding())
    } catch {
      setGpsError(true)
      setOriginLabel(POA_DEFAULT.label)
      setOrigin(POA_DEFAULT)
      setLocation({ city: 'Porto Alegre', neighborhood: 'Centro', street: null })
    } finally { setGpsLoading(false) }
  }

  /* ── Route ─────────────────────────────────────────────────── */
  useEffect(() => {
    const dest = destinations[0]
    if (!origin || !dest?.lat) {
      setRouteData(null)
      setBusStops([])
      setScooterPins([])
      return
    }
    fetchRoute(origin, dest).then(route => {
      setRouteData(route)
      if (pendingCinematic.current && route?.polyline?.length > 1) {
        pendingCinematic.current = false
        mapRef.current?.cinematicRoute(origin, dest, route.polyline, mapSheetPadding(SNAP.peek))
      }
    })
    // carrega paradas de ônibus próximas à origem e ao destino
    Promise.all([
      fetchBusStops(origin.lat, origin.lon, 800),
      fetchBusStops(dest.lat, dest.lon, 800),
    ]).then(([near, far]) => {
      const seen = new Set()
      const merged = [...near, ...far].filter(s => {
        const k = `${s.lat.toFixed(4)}_${s.lon.toFixed(4)}`
        if (seen.has(k)) return false
        seen.add(k)
        return true
      })
      setBusStops(merged)
    }).catch(() => {})
    // carrega patinetes próximos à origem
    fetchNearbyScooters(origin.lat, origin.lon, 600)
      .then(setScooterPins)
      .catch(() => {})
  }, [origin, destinations])

  /* ── Search autocomplete ───────────────────────────────────── */
  useEffect(() => {
    clearTimeout(searchTimer.current)
    if (query.length < 2) { setResults([]); return }
    searchTimer.current = setTimeout(async () => {
      const searchLat = origin?.lat ?? POA_DEFAULT.lat
      const searchLon = origin?.lon ?? POA_DEFAULT.lon
      // radiusDeg=0.5 (~55km) com bounded=0: prioriza resultados próximos mas permite cidade inteira
      const places = await searchPlaces(query, searchLat, searchLon, { radiusDeg: 0.5 })
      setResults(places)
    }, 400)
    return () => clearTimeout(searchTimer.current)
  }, [query, origin])

  const selectPlace = useCallback((place) => {
    const next = [...destinations]
    next[activeDestIdx] = { label: place.label, lat: place.lat, lon: place.lon }
    pendingCinematic.current = true
    setDestinations(next)
    setQuery(''); setResults([]); setFocus(false)
    setActiveTab('ir')
    // fecha a sheet para o mapa ficar visível durante a animação
    animateSheet(SNAP.peek)
  }, [destinations, activeDestIdx, SNAP.peek])

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
  function mapSheetPadding(height = sheetH) {
    return { bottom: height + NAV_H + 24 }
  }

  function syncMapToSheet(height) {
    if (!origin?.lat || !mapRef.current) return
    const zoom = mapRef.current.getZoom?.() ?? 15
    mapRef.current.focusPoint(origin.lat, origin.lon, zoom, mapSheetPadding(height))
  }

  function backToSearch() {
    setSheetState('search')
    setSelected(null)
    setRouteData(null)
    setDestinations([{ label:'', lat:null, lon:null }])
    animateSheet(SNAP.peek)
    if (origin?.lat) {
      setTimeout(() => syncMapToSheet(SNAP.peek), 380)
    }
  }

  function centerOnUser() {
    if (!origin?.lat) { detectGPS(); return }
    mapRef.current?.focusPoint(origin.lat, origin.lon, 16, mapSheetPadding())
  }

  function expandSheet(target = SNAP.full) {
    animateSheet(target)
  }

  function exploreCityName() {
    return location.city || eventCityForExplore(exploreCity)
  }

  function exploreGreeting() {
    return `${getGreeting(hour)}, ${user.name}! ${exploreCityName()} te espera!`
  }

  function switchExploreCity(cityId) {
    setExploreCity(cityId)
    const city = EXPLORE_CITIES.find(c => c.id === cityId)
    if (!city) return
    mapRef.current?.flyTo(city.lat, city.lon, 14)
  }

  function dockPlaceholder() {
    if (activeTab === 'explorar') return exploreGreeting()
    if (activeTab === 'hoje')     return 'Buscar eventos de hoje…'
    if (activeTab === 'essenciais') return 'Buscar farmácias, mercados…'
    return 'Para onde você quer ir?'
  }

  /* ── Tab navigation ────────────────────────────────────────── */
  function switchTab(tab) {
    setActiveTab(tab)
    if (tab === 'essenciais' && !isBentoCity(exploreCity)) {
      setPreviewPlace(null)
    }
    if (tab === 'ir' && sheetState === 'search') animateSheet(SNAP.peek)
    else animateSheet(SNAP.mid)
  }

  async function openEssentialService(service) {
    const filterMap = {
      farmacia: 'farmacias',
      mercado: 'mercados',
      restaurante: 'restaurantes',
      saude: 'saude',
      fastfood: 'fastfood',
    }
    setEssentialFilter(filterMap[service.id] || 'farmacias')
    setActiveTab('essenciais')
    setPreviewPlace(null)
    expandSheet(SNAP.mid)

    if (isBentoCity(exploreCity)) {
      setActiveTab('ir')
      setSheetState('search')
      setFocus(true)
      setQuery(service.query)
      expandSheet(SNAP.full)
      const cityMeta = EXPLORE_CITIES.find(c => c.id === exploreCity) ?? EXPLORE_CITIES[0]
      const places = await searchEssentials(service, {
        lat: origin?.lat ?? cityMeta.lat,
        lon: origin?.lon ?? cityMeta.lon,
        city: location.city || cityMeta.displayName,
        state: location.state || 'RS',
      })
      setResults(places.length ? places : [])
      return
    }

    const data = poaPlaces.length ? poaPlaces : POA_PLACES
    const mockList = sortByLocalFirst(filterPoaEssentials(filterMap[service.id] || 'farmacias', data))
    const cityMeta = EXPLORE_CITIES[0]
    const searchLat = origin?.lat ?? cityMeta.lat
    const searchLon = origin?.lon ?? cityMeta.lon
    const cityName = location.city || 'Porto Alegre'

    const places = await searchEssentials(service, {
      lat: searchLat,
      lon: searchLon,
      city: cityName,
      state: location.state || 'RS',
    }).catch(() => [])

    if (places.length < 2 && mockList.length) {
      setResults(mockList.map(p => ({
        label: p.name,
        lat: p.lat,
        lon: p.lng,
        fullLabel: p.address,
        poaPlace: p,
      })))
    } else if (places.length) {
      setResults(places)
    } else {
      setResults(mockList.map(p => ({
        label: p.name,
        lat: p.lat,
        lon: p.lng,
        fullLabel: p.address,
        poaPlace: p,
      })))
    }
  }

  async function handleGuideVoiceResult({ destination }) {
    setActiveTab('explorar')
    expandSheet(SNAP.mid)
    const places = await searchPlaces(destination, origin?.lat, origin?.lon)
    if (places.length > 0) {
      mapRef.current?.flyTo(places[0].lat, places[0].lon, 15)
    } else {
      setQuery(destination)
      setFocus(true)
      expandSheet(SNAP.full)
    }
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
    document.documentElement.style.setProperty('--sheet-h', `${targetH + NAV_H}px`)
    setTimeout(() => syncMapToSheet(targetH), 360)
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
      reverseGeocodeDetailed(lat, lon).then(loc => {
        const next = [...destinations]; next[activeDestIdx] = { label: loc.label, lat, lon }
        setDestinations(next)
      })
      setMapClickMode(false)
      return
    }
    if (pinCreationMode) {
      setReportCoords({ lat, lon })
      setShowReportModal(true)
      setPinCreationMode(false)
    }
  }

  function togglePinCreationMode() {
    setPinCreationMode(v => {
      const next = !v
      if (next) {
        setMapClickMode(false)
        animateSheet(SNAP.peek)
      }
      return next
    })
  }
  async function handleVoiceResult({ destination, preference }) {
    setActiveFilter(preference)
    setActiveDestIdx(0); setFocus(true); setActiveTab('ir')
    const places = await searchPlaces(destination, origin?.lat, origin?.lon)
    if (places.length > 0) selectPlace(places[0])
    else { setQuery(destination); setResults([]) }
  }

  const hasValidDest = destinations.some(d => d.lat)
  const isCombined   = activeFilter === 'combined'

  const insight = useMemo(() => getContextualInsight(hour, weather, dayOfWeek, origin), [hour, weather, dayOfWeek])

  const glassPrimary   = useMemo(() => glassSurface(dark, 'primary'), [dark])
  const glassSecondary = useMemo(() => glassSurface(dark, 'secondary'), [dark])
  const glassPill      = useMemo(() => glassSurface(dark, 'pill'), [dark])
  const GLASS_BORDER = dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)'
  const cardStyle    = glassSecondary

  const [trafficSegments, setTrafficSegments] = useState(() => getTrafficSegments(hour, dayOfWeek))
  const trafficSummary  = useMemo(() => getTrafficSummary(trafficSegments), [trafficSegments])
  const showTraffic     = true

  useEffect(() => {
    if (isBentoCity(exploreCity)) return
    let cancelled = false
    loadTrafficGeometry().then(segments => {
      if (!cancelled && segments?.length) setTrafficSegments(segments)
    })
    loadPoaNatureFeatures().then(features => {
      if (!cancelled && features?.length) setNatureFeatures(features)
    })
    return () => { cancelled = true }
  }, [exploreCity])

  useEffect(() => {
    hasSymplaToken().then(setSymplaConfigured)
  }, [])

  useEffect(() => {
    let cancelled = false
    const cityName = eventCityForExplore(exploreCity)
    const staticToday = isBentoCity(exploreCity)
      ? eventsForCity(exploreCity)
      : [
          ...eventsForCity(exploreCity),
          ...POA_EVENT_MOCKS.map(poaMockToEventRow),
        ]
    setCityEventsToday(staticToday)
    setEventsLoadingToday(true)

    fetchEventsToday(cityName, 'RS')
      .then(({ events, source }) => {
        if (cancelled) return
        if (events.length) {
          const symplaTitles = new Set(events.map(e => e.title.toLowerCase()))
          const extra = staticToday.filter(e => !symplaTitles.has(e.title.toLowerCase()))
          setCityEventsToday([...events, ...extra].slice(0, 24))
          setEventsSourceToday(extra.length ? 'mixed' : source)
        } else {
          setCityEventsToday(staticToday)
          setEventsSourceToday('fallback')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCityEventsToday(staticToday)
          setEventsSourceToday('fallback')
        }
      })
      .finally(() => {
        if (!cancelled) setEventsLoadingToday(false)
      })

    return () => { cancelled = true }
  }, [exploreCity])

  useEffect(() => {
    let cancelled = false
    const cityName = eventCityForExplore(exploreCity)
    setEventsLoadingUpcoming(true)

    fetchEventsUpcoming(cityName, 'RS')
      .then(({ events }) => {
        if (cancelled) return
        const fallbackUpcoming = isBentoCity(exploreCity)
          ? eventsForCity(exploreCity)
          : POA_EVENT_MOCKS.map(poaMockToEventRow)
        setCityEventsUpcoming(events.length ? events : fallbackUpcoming)
      })
      .catch(() => {
        if (!cancelled) {
          setCityEventsUpcoming(isBentoCity(exploreCity)
            ? eventsForCity(exploreCity)
            : POA_EVENT_MOCKS.map(poaMockToEventRow))
        }
      })
      .finally(() => {
        if (!cancelled) setEventsLoadingUpcoming(false)
      })

    return () => { cancelled = true }
  }, [exploreCity])

  const handleMapBoundsChange = useCallback((bbox) => {
    if (!isBentoCity(exploreCity)) return
    clearTimeout(boundsTimer.current)
    boundsTimer.current = setTimeout(async () => {
      const spanLat = bbox.north - bbox.south
      const spanLon = bbox.east - bbox.west
      if (spanLat > 0.12 || spanLon > 0.12) return
      try {
        const nature = await fetchNatureFeatures(bbox).catch(() => [])
        setNatureFeatures(nature?.length ? nature : mergeNatureWithMock())
      } catch {
        setNatureFeatures(mergeNatureWithMock())
      }
    }, 500)
  }, [exploreCity])

  const eventsFiltered = useMemo(() => (
    filterEventsByCat(cityEventsToday, eventCat)
  ), [cityEventsToday, eventCat])

  const upcomingFiltered = useMemo(() => {
    let list = cityEventsUpcoming
    if (exploreSection === 'eventos') {
      list = filterEventsByCat(list, eventCat)
    }
    return list.slice(0, 24)
  }, [cityEventsUpcoming, eventCat, exploreSection])

  const poaData = poaPlaces.length ? poaPlaces : POA_PLACES

  const essentialCounts = useMemo(() => {
    if (isBentoCity(exploreCity)) return {}
    return Object.fromEntries(
      ESSENCIAIS_FILTERS.map(f => [f.id, filterPoaEssentials(f.id, poaData).length]),
    )
  }, [exploreCity, poaData])

  const nearbyExploreAll = useMemo(() => {
    if (isBentoCity(exploreCity) || !origin?.lat) return []
    return filterNearbyExplorePlaces(poaData, origin, EXPLORE_RADIUS_KM, 'todos')
  }, [exploreCity, origin, poaData])

  const nearbyExploreCount = useMemo(
    () => (origin?.lat ? countNearbyExplorePlaces(poaData, origin, EXPLORE_RADIUS_KM) : 0),
    [origin, poaData],
  )

  const poaListForTab = useMemo(() => {
    if (isBentoCity(exploreCity)) return []
    if (activeTab === 'essenciais') {
      return sortByLocalFirst(filterPoaEssentials(essentialFilter, poaData))
    }
    if (activeTab === 'explorar' && exploreSection === 'lugares') {
      const list = origin?.lat
        ? filterNearbyExplorePlaces(poaData, origin, EXPLORE_RADIUS_KM, exploreCategory)
        : sortByLocalFirst(filterPoaLugares(exploreCategory, poaData))
      return filterPlacesByNeighborhood(list, exploreNeighborhood)
    }
    return []
  }, [exploreCity, activeTab, essentialFilter, exploreCategory, exploreSection, exploreNeighborhood, poaData, origin])

  const poaExploreMapPins = useMemo(() => {
    if (isBentoCity(exploreCity)) return []
    if (origin?.lat && nearbyExploreAll.length) return nearbyExploreAll.map(placeToMapPin)
    if (activeTab === 'explorar' && exploreSection === 'lugares') {
      return sortByLocalFirst(filterPoaLugares(exploreCategory, poaData)).map(placeToMapPin)
    }
    return []
  }, [exploreCity, origin, nearbyExploreAll, activeTab, exploreSection, exploreCategory, poaData])

  const alwaysVisiblePins = useMemo(() => {
    const events = activeTab === 'hoje'
      ? eventsFiltered
      : activeTab === 'explorar' && exploreSection === 'eventos'
        ? upcomingFiltered
        : []

    const poaPins = poaExploreMapPins.length ? poaExploreMapPins : poaListForTab.map(placeToMapPin)

    if (!isBentoCity(exploreCity) && poaPins.length) {
      const eventPins = events
        .filter(e => e.lat)
        .map(e => ({
          id: `ev-${e.id}`,
          lat: e.lat,
          lon: e.lon,
          label: e.title,
          desc: `${e.local} · ${e.time}`,
          emoji: e.emoji,
          category: e.cat,
          color: eventPinColor(e.cat),
          type: 'event',
          event: e,
        }))
      return [...poaPins, ...eventPins]
    }

    const places = placesForCity(exploreCity)
    const explorePins = places.map(p => ({
      id: p.id,
      lat: p.lat,
      lon: p.lon,
      label: p.name,
      desc: p.desc,
      emoji: EXPLORE_CATEGORIES.find(c => c.id === p.category)?.emoji ?? '📍',
      category: p.category,
      color: explorePinColor(p.category),
      type: 'explore',
      place: p,
    }))
    const eventPins = events
      .filter(e => e.lat)
      .map(e => ({
        id: `ev-${e.id}`,
        lat: e.lat,
        lon: e.lon,
        label: e.title,
        desc: `${e.local} · ${e.time}`,
        emoji: e.emoji,
        category: e.cat,
        color: eventPinColor(e.cat),
        type: 'event',
        event: e,
      }))
    return [...explorePins, ...eventPins]
  }, [exploreCity, cityEventsToday, cityEventsUpcoming, activeTab, exploreSection, poaListForTab, poaExploreMapPins, eventsFiltered, upcomingFiltered])

  const notificationItems = useMemo(() => {
    const items = []
    const nearbyPlaces = placesForCity(exploreCity)
      .filter(p => origin && kmBetween(origin, p) < 2.5)
      .slice(0, 4)
    nearbyPlaces.forEach(p => {
      const cat = EXPLORE_CATEGORIES.find(c => c.id === p.category)
      items.push({
        id: `near-${p.id}`,
        emoji: cat?.emoji ?? '📍',
        text: `Perto de você · ${p.name}`,
        live: false,
        kind: 'nearby',
        place: p,
      })
    })
    const upcoming = [...cityEventsToday, ...cityEventsUpcoming]
      .filter(e => e.highlight || e.price === 'Grátis' || e.price === 'Entrada livre')
      .slice(0, 4)
    upcoming.forEach(ev => {
      items.push({
        id: `notif-ev-${ev.id}`,
        emoji: ev.emoji,
        text: `Evento · ${ev.title} · ${ev.time}`,
        live: !!ev.highlight,
        kind: 'event',
        event: ev,
      })
    })
    return items.slice(0, 8)
  }, [origin, exploreCity, cityEventsToday, cityEventsUpcoming])

  const alerts = useMemo(() => {
    const items = []
    if (isSevereWeather(weather)) {
      items.push({
        id: 'alert-weather',
        emoji: weather.emoji ?? '⛈️',
        text: `${weather.label} · ${weather.temp}°`,
        type: 'weather',
      })
    }
    trafficSegments
      .filter(s => isAlertTraffic(s.level, s))
      .slice(0, 4)
      .forEach(s => {
        items.push({
          id: `alert-traffic-${s.id}`,
          emoji: '🚗',
          text: `Congestionado · ${s.name}`,
          type: 'traffic',
          segment: s,
        })
      })
    return items
  }, [weather, trafficSegments])

  function handleNotificationClick(item) {
    if (item.kind === 'nearby' && item.place) {
      mapRef.current?.flyTo(item.place.lat, item.place.lon, 15)
      return
    }
    if (item.kind === 'event' && item.event) navigateToEvent(item.event)
  }

  function handleAlertClick(alert) {
    if (alert.type === 'traffic' && alert.segment?.path?.length) {
      const mid = alert.segment.path[Math.floor(alert.segment.path.length / 2)]
      mapRef.current?.focusPoint(mid[0], mid[1], 15, mapSheetPadding())
      setPreviewTraffic(alert.segment)
      setPreviewPlace(null)
      animateSheet(SNAP.peek)
    }
  }

  function handleTrafficClick(segment) {
    if (!segment?.path?.length) return
    const mid = segment.path[Math.floor(segment.path.length / 2)]
    mapRef.current?.focusPoint(mid[0], mid[1], 15, mapSheetPadding())
    setPreviewPlace(null)
    setPreviewTraffic(segment)
    animateSheet(SNAP.peek)
  }

  function handleTrafficAlternatives() {
    if (!previewTraffic) return
    setPreviewTraffic(null)
    setActiveTab('ir')
    expandSheet(SNAP.mid)
  }

  function handleTrafficAskAi() {
    if (!previewTraffic) return
    setVoiceMode('guide')
    setPreviewTraffic(null)
  }

  function handlePlacePinClick(pin) {
    if (pin.type === 'event' && pin.event) {
      setPreviewPlace(null)
      navigateToEvent(pin.event)
      return
    }
    const place = pin.place
    if (!place) return
    const lat = place.lat
    const lon = place.lng ?? place.lon
    if (lat != null) {
      mapRef.current?.focusPoint(lat, lon, 16, mapSheetPadding())
    }
    setPreviewPlace(place)
    animateSheet(SNAP.peek)
  }

  function handlePreviewRoute() {
    if (!previewPlace?.lat) return
    setPreviewPlace(null)
    selectPlace({
      label: previewPlace.name,
      lat: previewPlace.lat,
      lon: previewPlace.lng ?? previewPlace.lon,
    })
    setActiveTab('ir')
    expandSheet(SNAP.mid)
  }

  function handlePreviewAskAi() {
    if (!previewPlace) return
    setVoiceMode('guide')
    setPreviewPlace(null)
  }

  function toggleSavePlace(id) {
    setSavedPlaceIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem('turio-saved-places', JSON.stringify([...next]))
      return next
    })
  }

  // Text class helpers
  const text  = dark ? 'text-white'    : 'text-gray-900'
  const muted = dark ? 'text-white/50' : 'text-gray-500'
  const dim   = dark ? 'text-white/30' : 'text-gray-400'
  const pill  = 'w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform shadow-md'

  /* ═══════════════════════════════════════════════════════════ */
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height:'100dvh', minHeight:'-webkit-fill-available', background: dark ? '#14152B' : '#e8eaf0' }}
    >
      {/* ── MAP ─────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0" style={{ isolation:'isolate' }}>
        <ZippiMap
          ref={mapRef}
          origin={origin}
          destinations={destinations.filter(d => d.lat)}
          routePolyline={routeData?.polyline}
          communityReports={reports}
          placePins={alwaysVisiblePins}
          trafficSegments={trafficSegments}
          showTraffic={showTraffic}
          natureFeatures={natureFeatures}
          busStops={busStops}
          scooterPins={scooterPins}
          onMapClick={handleMapClick}
          onPlacePinClick={handlePlacePinClick}
          onTrafficClick={handleTrafficClick}
          onBoundsChange={handleMapBoundsChange}
          dark={dark}
        />
      </div>

      {/* ── TOP GRADIENT ─────────────────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 pointer-events-none z-10"
        style={{
          height: 220,
          background: dark
            ? 'linear-gradient(to bottom,rgba(0,0,0,0.65) 0%,transparent 100%)'
            : 'linear-gradient(to bottom,rgba(255,255,255,0.55) 0%,transparent 100%)',
        }}
      />

      {/* ── TOP BAR ──────────────────────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 z-[40] px-4 pt-[max(0.5rem,env(safe-area-inset-top))] pb-1 pointer-events-none flex flex-col gap-1">
        <div className="pointer-events-auto">
          <NotificationsDock
            items={notificationItems}
            dark={dark}
            onItemClick={handleNotificationClick}
          />
        </div>

        <div className="flex items-start justify-between gap-2 pointer-events-auto">
          <button onClick={detectGPS} className="min-w-0 flex-1 text-left active:opacity-80 transition-opacity pr-1">
            <p className={`text-lg font-semibold truncate leading-tight ${dark ? 'text-white' : 'text-black'}`}>
              {gpsLoading ? 'localizando…' : (location.city || 'porto alegre')}
            </p>
            <p className={`text-[11px] truncate leading-snug mt-0.5 ${dark ? 'text-white/60' : 'text-black'}`}>
              {gpsLoading
                ? 'detectando localização…'
                : [
                    location.neighborhood || 'bairro',
                    location.street || originLabel.split(',')[0] || 'rua',
                    weather?.temp != null ? `${weather.temp}°` : '—°',
                  ].join(' · ')}
            </p>
          </button>

          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={toggle} className={pill} style={glassPill} aria-label="alternar tema">
                {dark ? <Sun size={16} className="text-yellow-300" /> : <Moon size={16} className="text-gray-700" />}
              </button>
              <button
                onClick={togglePinCreationMode}
                className={pill}
                style={{
                  ...glassPill,
                  ...(pinCreationMode ? { boxShadow: '0 0 0 2px rgba(61,237,122,0.85)' } : {}),
                }}
                aria-label="criar pin ou aviso"
                title="criar pin/aviso"
              >
                <MapPin size={16} className={pinCreationMode ? 'text-zippi-400' : dark ? 'text-zippi-400' : 'text-gray-800'} />
              </button>
              <button
                onClick={centerOnUser}
                className={pill}
                style={glassPill}
                aria-label="focar no usuário"
                title="focar no usuário"
              >
                <Crosshair size={16} className={dark ? 'text-white' : 'text-gray-800'} />
              </button>
              <button onClick={() => navigate('/profile')} className={pill} style={glassPill} aria-label="perfil">
                <User2 size={16} className={dark ? 'text-white' : 'text-gray-800'} />
              </button>
            </div>
            {alerts.length > 0 && (
              <AlertsDock
                alerts={alerts}
                dark={dark}
                compact
                onAlertClick={handleAlertClick}
              />
            )}
          </div>
        </div>

        {mapClickMode && (
          <div className="flex justify-center pointer-events-auto">
            <div className="bg-zippi-400 text-dark-950 px-5 py-2.5 rounded-2xl text-sm font-black shadow-xl">
              toque no mapa para definir o destino
            </div>
          </div>
        )}

        {pinCreationMode && (
          <div className="flex justify-center pointer-events-auto">
            <div className="px-5 py-2.5 rounded-2xl text-sm font-semibold shadow-xl"
              style={{ ...glassPill, color: dark ? 'white' : '#111' }}>
              toque no mapa para posicionar o pin de aviso
            </div>
          </div>
        )}
      </div>

      <PlacePreviewSheet
        place={previewPlace}
        dark={dark}
        saved={previewPlace ? savedPlaceIds.has(previewPlace.id) : false}
        onClose={() => setPreviewPlace(null)}
        onRoute={handlePreviewRoute}
        onAskAi={handlePreviewAskAi}
        onSave={() => previewPlace && toggleSavePlace(previewPlace.id)}
      />

      <TrafficPreviewSheet
        segment={previewTraffic}
        dark={dark}
        onClose={() => setPreviewTraffic(null)}
        onAlternatives={handleTrafficAlternatives}
        onAskAi={handleTrafficAskAi}
      />

      {/* ── BOTÃO IA (acima da dock, direita) ── */}
      <div
        className="absolute right-4 z-[35] pointer-events-auto"
        style={{ bottom: `calc(var(--sheet-h, 76px) + 12px)`, transition: 'bottom 0.35s cubic-bezier(0.32,0.72,0,1)' }}
      >
        <button
          onClick={() => setVoiceMode('guide')}
          className="w-12 h-12 rounded-2xl flex items-center justify-center active:scale-90 transition-transform shadow-lg"
          style={{ background: '#E8B84B', border: '1px solid rgba(255,255,255,0.15)' }}
          aria-label="Guia inteligência artificial"
          title="Guia IA"
        >
          <Sparkles size={22} className="text-dark-950" strokeWidth={2.2} />
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* GLASS BOTTOM SHEET                                          */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div
        ref={sheetRef}
        className="absolute inset-x-0 z-[25] flex flex-col"
        style={{
          bottom: NAV_H,
          height: sheetH,
          pointerEvents: pinCreationMode ? 'none' : 'auto',
          ...glassPrimary,
          borderRadius: '28px 28px 0 0',
          borderBottom: 'none',
          transition: 'height 0.35s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {/* Drag handle */}
        <div
          className="flex-shrink-0 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
          style={{ height: HANDLE_H }}
          onTouchStart={onDragStart} onTouchMove={onDragMove} onTouchEnd={onDragEnd}
          onMouseDown={onDragStart}  onMouseMove={onDragMove}  onMouseUp={onDragEnd} onMouseLeave={onDragEnd}
        >
          <div className="w-10 h-1 rounded-full" style={{ background: dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.18)' }} />
        </div>

        {/* Conteúdo expansível (oculto no modo recuado) */}
        {isSheetExpanded && (
          <>
            {activeTab === 'ir' && sheetState === 'search' && !focus && (
              <div className="flex-shrink-0 px-5 pb-3">
                <p className={`text-lg font-black ${text}`}>{getGreeting(hour)} 👋</p>
                <button
                  onClick={() => { if (insight.cta === 'Ver eventos') switchTab('hoje'); else switchTab('explorar') }}
                  className="mt-2 w-full flex items-center gap-2 px-3 py-2.5 rounded-2xl text-left active:scale-[0.98] transition-all"
                  style={glassSecondary}
                >
                  <span className="text-lg">{insight.emoji}</span>
                  <p className={`text-xs font-medium ${text} flex-1`}>{insight.msg}</p>
                  <ChevronRight size={14} className="text-zippi-400" />
                </button>
              </div>
            )}
            {(activeTab === 'explorar' || activeTab === 'hoje' || activeTab === 'essenciais') && (
              <div className="flex-shrink-0 px-5 pb-2">
                <p className={`text-sm font-black ${text}`}>
                  {activeTab === 'explorar'
                    ? exploreGreeting()
                    : activeTab === 'hoje'
                      ? 'Hoje'
                      : 'Essenciais'}
                </p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto min-h-0">

          {/* ══════════ TAB: IR ══════════ */}
          {activeTab === 'ir' && (
            <>
              {/* ── search state ── */}
              {sheetState === 'search' && (
                <div className="px-5 pt-1 pb-2">

                  {/* Route card */}
                  <div className="rounded-2xl overflow-hidden mb-3"
                    style={cardStyle}>
                    {/* Origin */}
                    <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${GLASS_BORDER}` }}>
                      <div className="relative flex-shrink-0 w-3 h-3">
                        <div className="absolute inset-0 rounded-full bg-zippi-400" />
                        <div className="absolute inset-0 rounded-full bg-zippi-400 animate-ping opacity-40" />
                      </div>
                      <p className={`text-sm ${muted} truncate flex-1`}>{originLabel}</p>
                    </div>

                    {/* Destinos — edição pela dock */}
                    {destinations.map((dest, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setActiveDestIdx(i)
                          if (!dest.lat) { dockInputRef.current?.focus(); expandSheet(SNAP.full) }
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left active:opacity-80 ${dark ? 'active:bg-white/5' : 'active:bg-black/5'}`}
                        style={{ borderBottom: i < destinations.length - 1 ? `1px solid ${GLASS_BORDER}` : 'none' }}
                      >
                        <div className={`w-3 h-3 rounded-sm flex-shrink-0 ${i === destinations.length - 1 ? 'bg-red-400' : 'bg-orange-400'}`} />
                        <span className={`flex-1 text-sm font-medium truncate ${dest.label ? text : muted}`}>
                          {dest.label || (i === 0 ? 'Toque na barra abaixo para buscar destino' : `Parada ${i + 1}`)}
                        </span>
                        {dest.lat ? (
                          <span onClick={e => { e.stopPropagation(); removeDestination(i) }} className="p-1">
                            <X size={14} className={`${muted} opacity-60`} />
                          </span>
                        ) : (
                          <span className="text-xs text-zippi-400 font-semibold">Editar</span>
                        )}
                      </button>
                    ))}

                    <div className="flex border-t" style={{ borderColor: GLASS_BORDER }}>
                      {destinations.length < 3 && (
                        <button onClick={addDestination}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 active:opacity-70">
                          <Plus size={13} className="text-zippi-400" />
                          <span className="text-xs text-zippi-400 font-semibold">Parada</span>
                        </button>
                      )}
                      <button onClick={() => setMapClickMode(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 active:opacity-70"
                        style={destinations.length < 3 ? { borderLeft: `1px solid ${GLASS_BORDER}` } : {}}>
                        <span className="text-xs text-zippi-400 font-semibold">📍 No mapa</span>
                      </button>
                    </div>
                  </div>

                  {/* Search dropdown */}
                  {focus && results.length > 0 && (
                    <div className="rounded-2xl mb-3 overflow-hidden shadow-2xl"
                      style={{ background: dark ? 'rgba(18,18,24,0.96)' : 'rgba(255,255,255,0.97)', backdropFilter:'blur(20px)', border: `1px solid ${GLASS_BORDER}` }}
                    >
                      {results.map((r, i) => (
                        <button key={i} onMouseDown={() => selectPlace(r)}
                          className={`w-full flex items-start gap-3 px-4 py-3 text-left ${dark ? 'active:bg-white/5' : 'active:bg-black/5'}`}
                          style={{ borderTop: i > 0 ? `1px solid ${GLASS_BORDER}` : 'none' }}
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
                      <button
                        onClick={() => switchTab('explorar')}
                        className="w-full mt-2 flex items-center justify-between px-4 py-3 rounded-2xl active:scale-[0.98] transition-all"
                        style={{ ...glassSecondary, border: '1px solid rgba(61,237,122,0.25)' }}
                      >
                        <span className={`text-xs font-semibold ${text}`}>Explorar a cidade</span>
                        <ChevronRight size={14} className="text-zippi-400" />
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* ── loading state ── */}
              {sheetState === 'loading' && (
                <div className="px-5 pt-3 pb-6">
                  <div className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-5"
                    style={cardStyle}>
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
                      style={glassSecondary}>
                      <ArrowLeft size={15} className={muted} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs ${muted} truncate`}>{originLabel}</p>
                      <p className={`text-sm font-bold ${text} truncate`}>{destinations[0]?.label}</p>
                    </div>
                    <div className="flex-shrink-0 px-2.5 py-1 rounded-xl" style={glassSecondary}>
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
                          style={activeFilter !== f.id ? { ...cardStyle, color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' } : {}}
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
                        <p className="text-xs font-bold text-zippi-400 mb-0.5">Dica Turio</p>
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
                        <div className="rounded-3xl p-8 text-center" style={cardStyle}>
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
                      {ranked.map((s, i) => (
                        <ServiceCard
                          key={s.id}
                          service={s}
                          rank={i}
                          origin={origin}
                          dest={destinations[0]?.lat ? destinations[0] : null}
                        />
                      ))}
                    </div>
                  )}

                  <p className={`text-center text-xs mt-4 mb-2 px-5 ${dim}`}>
                    Preços estimados. Turio não possui vínculo com os serviços.
                  </p>
                </div>
              )}
            </>
          )}

          {/* ══════════ TAB: EXPLORAR ══════════ */}
          {activeTab === 'explorar' && (
            <div className="pb-4">
              {/* lugares | eventos */}
              <div className="px-5 mb-3">
                <div className="flex gap-1 p-0.5 rounded-xl" style={cardStyle}>
                  {[
                    { id: 'lugares', label: 'Lugares' },
                    { id: 'eventos', label: 'Eventos' },
                  ].map(tab => (
                    <button key={tab.id} type="button" onClick={() => setExploreSection(tab.id)}
                      className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all ${exploreSection === tab.id ? 'bg-zippi-400 text-dark-950' : ''}`}
                      style={exploreSection !== tab.id ? { color: dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' } : {}}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {exploreSection === 'lugares' && (
                <>
              <div className="px-5 mb-3">
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {(isBentoCity(exploreCity) ? EXPLORE_CATEGORIES : LUGARES_FILTERS).map(cat => (
                    <button key={cat.id} type="button" onClick={() => setExploreCategory(cat.id)}
                      className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-bold transition-all ${
                        exploreCategory === cat.id ? 'bg-zippi-400 text-dark-950' : ''
                      }`}
                      style={exploreCategory !== cat.id ? { ...cardStyle, color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' } : {}}
                    >
                      <span className="text-[13px]">{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-5 mb-2">
                <p className={`text-[10px] font-bold uppercase tracking-widest ${muted}`}>
                  {isBentoCity(exploreCity) ? 'bento gonçalves · vale dos vinhedos' : 'porto alegre · copiloto urbano'}
                </p>
                {!isBentoCity(exploreCity) && origin?.lat && (
                  <p className={`text-[11px] ${muted} mt-1`}>
                    {nearbyExploreCount} lugares em {EXPLORE_RADIUS_KM} km · atualiza ao se mover
                  </p>
                )}
                {!isBentoCity(exploreCity) && (
                  <button
                    type="button"
                    onClick={() => setShowSuggestPlace(true)}
                    className={`text-[11px] font-bold text-zippi-400 mt-1.5 active:opacity-70`}
                  >
                    sugerir lugar · ajudar a manter o mapa
                  </button>
                )}
              </div>

              {!isBentoCity(exploreCity) && (
                <div className="px-5 mb-2">
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    <button
                      type="button"
                      onClick={() => setExploreNeighborhood(null)}
                      className={`flex-shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                        !exploreNeighborhood ? 'bg-zippi-400 text-dark-950' : ''
                      }`}
                      style={exploreNeighborhood ? { ...cardStyle, color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' } : {}}
                    >
                      todos os bairros
                    </button>
                    {POA_NEIGHBORHOODS.map(nb => (
                      <button
                        key={nb.id}
                        type="button"
                        onClick={() => setExploreNeighborhood(exploreNeighborhood === nb.id ? null : nb.id)}
                        className={`flex-shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                          exploreNeighborhood === nb.id ? 'bg-zippi-400 text-dark-950' : ''
                        }`}
                        style={exploreNeighborhood !== nb.id ? { ...cardStyle, color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' } : {}}
                      >
                        {nb.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="px-5 flex flex-col gap-1.5">
                {(isBentoCity(exploreCity)
                  ? placesForCity(exploreCity).filter(p => exploreCategory === 'todos' || p.category === exploreCategory)
                  : poaListForTab
                ).map(place => {
                  const catId = place.mapFilter || place.category
                  const cat = (isBentoCity(exploreCity) ? EXPLORE_CATEGORIES : LUGARES_FILTERS).find(c => c.id === catId)
                    || LUGARES_FILTERS.find(c => c.id === 'todos')
                  const label = place.name
                  const desc = place.preview || place.desc
                  const lat = place.lat
                  const lon = place.lng ?? place.lon
                  return (
                    <button key={place.id} type="button"
                      onClick={() => {
                        if (isBentoCity(exploreCity)) {
                          selectPlace({ label, lat, lon })
                        } else {
                          setPreviewPlace(place)
                          if (lat != null) mapRef.current?.focusPoint(lat, lon, 16, mapSheetPadding())
                          animateSheet(SNAP.peek)
                        }
                      }}
                      className="flex items-center gap-2.5 p-2 rounded-2xl text-left active:scale-[0.98] transition-all"
                      style={cardStyle}
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
                        {cat?.emoji ?? '📍'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-bold leading-tight ${text}`}>{label}</p>
                        <p className={`text-[11px] ${muted} truncate leading-snug`}>{desc}</p>
                        {place.isLocalBusiness && (
                          <p className="text-[9px] font-bold text-emerald-400 leading-snug">economia local</p>
                        )}
                        {place.neighborhoodLabel && (
                          <p className={`text-[9px] ${muted} leading-snug`}>{place.neighborhoodLabel}</p>
                        )}
                      </div>
                      {place.distanceKm != null ? (
                        <span className="text-[10px] font-bold text-zippi-400 flex-shrink-0">
                          {formatDistanceKm(place.distanceKm)}
                        </span>
                      ) : (
                        <ChevronRight size={14} className={dim} />
                      )}
                    </button>
                  )
                })}
                {!isBentoCity(exploreCity) && origin?.lat && poaListForTab.length === 0 && (
                  <p className={`text-xs ${muted} py-4 text-center`}>
                    nenhum local nesta categoria em {EXPLORE_RADIUS_KM} km. amplie o filtro ou caminhe pela cidade.
                  </p>
                )}
              </div>
                </>
              )}

              {exploreSection === 'eventos' && (
                <>
              <div className="px-5 mb-2">
                <p className={`text-[10px] font-bold uppercase tracking-widest ${muted}`}>
                  próximas 2 semanas · {eventCityForExplore(exploreCity)}
                </p>
              </div>
              <div className="px-5 mb-3">
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {(isBentoCity(exploreCity) ? EVENTOS_FILTERS.filter(c => ['todos', 'musica', 'cultura', 'feira', 'gastronomia', 'esporte', 'gratuito'].includes(c.id)) : EVENTOS_FILTERS).map(cat => (
                    <button key={cat.id} type="button" onClick={() => setEventCat(cat.id)}
                      className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-bold transition-all ${eventCat === cat.id ? 'bg-zippi-400 text-dark-950' : ''}`}
                      style={eventCat !== cat.id ? { ...cardStyle, color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' } : {}}
                    >
                      <span className="text-[12px]">{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="px-5 flex flex-col gap-1.5">
                {eventsLoadingUpcoming && (
                  <p className={`text-xs ${muted} text-center py-2`}>carregando eventos…</p>
                )}
                {!eventsLoadingUpcoming && upcomingFiltered.length === 0 ? (
                  <p className={`text-xs ${muted} py-4 text-center`}>nenhum evento encontrado.</p>
                ) : upcomingFiltered.map(ev => (
                  <EventCard
                    key={ev.id} event={ev}
                    dark={dark} text={text} muted={muted} cardStyle={cardStyle}
                    onNavigate={navigateToEvent}
                  />
                ))}
              </div>
                </>
              )}
            </div>
          )}

          {/* ══════════ TAB: ESSENCIAIS ══════════ */}
          {activeTab === 'essenciais' && (
            <div className="pb-4">
              <div className="px-5 mb-3">
                <p className={`text-[10px] font-bold uppercase tracking-widest ${muted}`}>
                  essenciais · porto alegre
                </p>
                <p className={`text-xs ${muted} mt-1`}>
                  escolha a categoria — lista e pins no mapa mudam juntos
                </p>
              </div>
              <div className="px-5 mb-3">
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {ESSENCIAIS_FILTERS.map(cat => (
                    <button key={cat.id} type="button" onClick={() => {
                      setEssentialFilter(cat.id)
                      setPreviewPlace(null)
                    }}
                      className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-bold transition-all ${essentialFilter === cat.id ? 'bg-zippi-400 text-dark-950' : ''}`}
                      style={essentialFilter !== cat.id ? { ...cardStyle, color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' } : {}}
                    >
                      <span className="text-[13px]">{cat.emoji}</span>
                      <span>{cat.label}</span>
                      {!isBentoCity(exploreCity) && essentialCounts[cat.id] != null && (
                        <span className={`text-[9px] px-1 rounded-md ${essentialFilter === cat.id ? 'bg-dark-950/20' : 'opacity-60'}`}>
                          {essentialCounts[cat.id]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              {!isBentoCity(exploreCity) ? (
                <div className="px-5 flex flex-col gap-1.5">
                  {poaListForTab.length === 0 ? (
                    <p className={`text-xs ${muted} py-4 text-center`}>nenhum local nesta categoria.</p>
                  ) : poaListForTab.map(place => {
                    const meta = pinMeta(place.pinType)
                    return (
                      <button key={place.id} type="button"
                        onClick={() => {
                          setPreviewPlace(place)
                          if (place.lat != null) mapRef.current?.focusPoint(place.lat, place.lng, 16, mapSheetPadding())
                          animateSheet(SNAP.peek)
                        }}
                        className="flex items-center gap-2.5 p-2 rounded-2xl text-left active:scale-[0.98] transition-all"
                        style={cardStyle}
                      >
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                          style={{ background: `${meta.color}22` }}>
                          {meta.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[13px] font-bold leading-tight ${text}`}>{place.name}</p>
                          <p className={`text-[11px] ${muted} truncate leading-snug`}>{place.address || place.preview}</p>
                          {place.brand && (
                            <p className="text-[9px] font-semibold leading-snug" style={{ color: meta.color }}>{place.brand}</p>
                          )}
                        </div>
                        <span className="text-[9px] font-bold text-zippi-400 flex-shrink-0">{place.priceRange}</span>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="px-5 grid grid-cols-2 gap-2.5">
                  {ESSENTIAL_SERVICES.map(svc => {
                    const Icon = ESSENTIAL_ICONS_MAP[svc.id] ?? ShoppingBag
                    return (
                      <button key={svc.id} type="button" onClick={() => openEssentialService(svc)}
                        className="flex flex-col items-start gap-2 p-3.5 rounded-2xl text-left active:scale-[0.98] transition-all"
                        style={cardStyle}
                      >
                        <Icon size={18} className="text-blue-400" />
                        <p className={`text-sm font-bold ${text}`}>{svc.label}</p>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══════════ TAB: HOJE ══════════ */}
          {activeTab === 'hoje' && (
            <div className="pb-4">
              {/* Header */}
              <div className="px-5 mb-3">
                <p className={`text-sm font-black ${text}`}>
                  {new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long' })}
                </p>
                <p className={`text-xs ${muted}`}>
                  {location.city || eventCityForExplore(exploreCity)} · hoje
                  {eventsSourceToday === 'sympla' ? ' · sympla' : eventsSourceToday === 'mixed' ? ' · sympla + local' : ' · curadoria local'}
                </p>
              </div>

              {/* Highlight event */}
              {eventsFiltered.find(e => e.highlight) && (() => {
                const ev = eventsFiltered.find(e => e.highlight)
                return (
                  <button onClick={() => navigateToEvent(ev)}
                    className="mx-5 mb-2 w-[calc(100%-40px)] rounded-2xl overflow-hidden text-left active:scale-[0.98] transition-all"
                    style={{ background:'linear-gradient(135deg,rgba(61,237,122,0.15),rgba(61,237,122,0.06))', border:'1px solid rgba(61,237,122,0.25)' }}
                  >
                    <div className="px-3 py-2.5">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-xl leading-none">{ev.emoji}</span>
                        <span className="text-[9px] font-black text-zippi-400 bg-zippi-400/15 px-1.5 py-0.5 rounded-md">DESTAQUE</span>
                      </div>
                      <p className={`text-[13px] font-black leading-tight ${text}`}>{ev.title}</p>
                      <p className={`text-[11px] ${muted} leading-snug`}>{ev.local} · {ev.time}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[9px] font-bold text-zippi-400">{ev.price}</span>
                        <span className="text-[9px] text-zippi-400 font-semibold">como chegar →</span>
                      </div>
                    </div>
                  </button>
                )
              })()}

              {/* Category filter */}
              <div className="px-5 mb-3">
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {(isBentoCity(exploreCity) ? EVENTOS_FILTERS.filter(c => ['todos', 'musica', 'cultura', 'feira', 'gastronomia', 'esporte', 'gratuito'].includes(c.id)) : EVENTOS_FILTERS).map(cat => (
                    <button key={cat.id} type="button" onClick={() => setEventCat(cat.id)}
                      className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-bold transition-all ${eventCat === cat.id ? 'bg-zippi-400 text-dark-950' : ''}`}
                      style={eventCat !== cat.id ? { ...cardStyle, color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' } : {}}
                    >
                      <span className="text-[12px]">{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Events list */}
              <div className="px-5 flex flex-col gap-1.5">
                {eventsLoadingToday && (
                  <p className={`text-xs ${muted} text-center py-2`}>carregando eventos de hoje…</p>
                )}
                {eventsFiltered.length === 0 && !eventsLoadingToday ? (
                  <div className="py-12 text-center">
                    <p className="text-4xl mb-3">📅</p>
                    <p className={`font-bold ${text} mb-1`}>nenhum evento hoje</p>
                    <p className={`text-xs ${muted}`}>
                      {eventsSourceToday === 'fallback'
                        ? 'eventos de exemplo — sympla complementa quando disponível.'
                        : 'tente outra categoria ou cidade.'}
                    </p>
                  </div>
                ) : eventsFiltered.map(ev => (
                  <EventCard
                    key={ev.id} event={ev}
                    dark={dark} text={text} muted={muted} cardStyle={cardStyle}
                    onNavigate={navigateToEvent}
                  />
                ))}
              </div>
            </div>
          )}

            </div>

            {/* CTA rotas (Ir tab expandida) */}
            {activeTab === 'ir' && sheetState === 'search' && hasValidDest && (
              <div className="flex-shrink-0 px-5 pb-2 pt-2">
                <button onClick={startNavigation}
                  className="w-full py-4 rounded-2xl bg-zippi-400 text-dark-950 font-black text-base flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-zippi-900/30"
                >
                  <Search size={18} />
                  {routeData ? `Ver opções — ${routeData.distanceKm} km` : 'Ver melhores opções'}
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Dock recuada: busca + falar (sempre visível) ──────── */}
        <div
          className="flex-shrink-0 px-4 pt-0.5"
          style={{
            height: DOCK_BAR_H,
            borderTop: isSheetExpanded ? `1px solid ${GLASS_BORDER}` : 'none',
          }}
        >
          <div className="flex items-center gap-2 h-10">
            <input
              ref={dockInputRef}
              type="text"
              placeholder={dockPlaceholder()}
              value={activeTab === 'ir' && (focus || !destinations[0]?.label) ? query : (destinations[0]?.label || query)}
              onChange={e => {
                setActiveTab('ir')
                setActiveDestIdx(0)
                setQuery(e.target.value)
              }}
              onFocus={() => {
                setActiveTab('ir')
                setActiveDestIdx(0)
                setFocus(true)
                expandSheet(SNAP.full)
              }}
              onBlur={() => setTimeout(() => {
                setFocus(false)
                if (activeTab === 'ir' && sheetState === 'search') animateSheet(SNAP.peek)
              }, 150)}
              className={`flex-1 h-10 px-4 rounded-2xl text-sm font-medium outline-none ${text}`}
              style={glassSecondary}
            />
            <button
              onClick={() => setVoiceMode('chat')}
              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
              style={glassSecondary}
              aria-label="Chat por voz"
              title="Falar no chat"
            >
              <Mic size={20} className={dark ? 'text-white' : 'text-gray-700'} />
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* GLASS BOTTOM NAV BAR                                        */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div
        className="absolute bottom-0 inset-x-0 z-[30]"
        style={{
          height: NAV_H,
          ...glassPrimary,
          borderTop: `1px solid ${GLASS_BORDER}`,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex items-center justify-around h-full px-2">
          {[
            { id:'ir',          icon: Zap,          label:'Ir'          },
            { id:'explorar',    icon: Compass,     label:'Explorar'    },
            { id:'hoje',        icon: CalendarDays, label:'Hoje'        },
            { id:'essenciais',  icon: ShoppingBag, label:'Essenciais'  },
          ].map(({ id, icon: Icon, label }) => {
            const isActive = activeTab === id
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
          onClose={() => { setShowReportModal(false); setPinCreationMode(false) }}
          onAdded={() => setReports(getReports())}
        />
      )}
      {showSuggestPlace && (
        <SuggestPlaceModal
          lat={origin?.lat ?? reportCoords?.lat}
          lon={origin?.lon ?? reportCoords?.lon}
          onClose={() => setShowSuggestPlace(false)}
        />
      )}
      {voiceMode && (
        <VoiceAssistant
          mode={voiceMode}
          onResult={voiceMode === 'guide' ? handleGuideVoiceResult : handleVoiceResult}
          onClose={() => setVoiceMode(null)}
        />
      )}
      {/* ServiceDetail removido: cards agora abrem o app direto via deeplink */}
    </div>
  )
}
