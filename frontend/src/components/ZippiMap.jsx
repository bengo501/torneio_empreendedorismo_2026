import { useEffect, useRef, memo, forwardRef, useImperativeHandle } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { upvoteReport } from '../services/community.js'
import { kmBetween } from '../services/nearbyPlaces.js'
import { explorePinColor, eventPinColor } from '../styles/glass.js'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const GREEN = '#34C759'
const GREEN_DARK = '#2DB84A'
const RED   = '#FF4444'

function getTileUrl(dark) {
  return dark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
}

/** menos requisições e recargas ao pan/zoom */
const TILE_LAYER_OPTS = {
  maxZoom: 19,
  minZoom: 11,
  keepBuffer: 5,
  updateWhenZooming: false,
  updateWhenIdle: true,
  updateInterval: 250,
  detectRetina: false,
  crossOrigin: 'anonymous',
}

const MAP_INIT_OPTS = {
  zoomControl: false,
  attributionControl: false,
  fadeAnimation: false,
  zoomAnimation: true,
  markerZoomAnimation: false,
}

function makeIcon(emoji, color = GREEN, size = 34) {
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2.5px solid white;display:flex;align-items:center;justify-content:center;font-size:${size*0.48}px;box-shadow:0 2px 10px rgba(0,0,0,0.35);cursor:pointer">${emoji}</div>`,
    className:'', iconSize:[size,size], iconAnchor:[size/2,size/2], popupAnchor:[0,-size/2],
  })
}

/** pin do usuário: círculo + triângulo abaixo + pulso na ponta */
function makeUserPinIcon() {
  const outline = '2.5px'
  return L.divIcon({
    html: `<div class="tourio-user-pin" style="position:relative;width:34px;height:54px">
      <div class="tourio-user-pulse" style="position:absolute;left:50%;bottom:1px;width:26px;height:26px;border-radius:50%;background:${GREEN};opacity:0.52"></div>
      <div style="position:absolute;left:50%;top:27px;transform:translateX(-50%);width:0;height:0;border-left:12px solid transparent;border-right:12px solid transparent;border-top:17px solid #fff"></div>
      <div style="position:absolute;left:50%;top:29px;transform:translateX(-50%);width:0;height:0;border-left:9.5px solid transparent;border-right:9.5px solid transparent;border-top:13px solid ${GREEN_DARK}"></div>
      <div style="position:absolute;left:50%;top:0;transform:translateX(-50%);width:26px;height:26px;border-radius:50%;background:linear-gradient(145deg,#5AE88A 0%,${GREEN} 45%,${GREEN_DARK} 100%);border:${outline} solid #fff;box-shadow:0 2px 12px rgba(52,199,89,0.5)"></div>
      <div style="position:absolute;left:50%;top:5px;transform:translateX(-50%);width:8px;height:5px;border-radius:50%;background:rgba(255,255,255,0.55)"></div>
    </div>`,
    className: '',
    iconSize: [34, 54],
    iconAnchor: [17, 54],
    popupAnchor: [0, -54],
  })
}

/** 1 = longe · >1 = mais perto do usuário */
function proximityScaleKm(km) {
  if (km == null || !Number.isFinite(km)) return 1
  if (km <= 0.25) return 1.45
  if (km <= 0.5) return 1.32
  if (km <= 1) return 1.2
  if (km <= 2) return 1.08
  if (km <= 3) return 1
  return 0.92
}

function makeDestIcon(label='') {
  const short = label.split(',')[0].slice(0,18)
  return L.divIcon({
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px"><div style="background:${RED};color:white;font-size:11px;font-weight:800;padding:3px 10px;border-radius:20px;white-space:nowrap;box-shadow:0 3px 10px rgba(255,68,68,0.4)">${short}</div><div style="width:2px;height:8px;background:${RED};opacity:0.7"></div><div style="width:14px;height:14px;border-radius:50%;background:${RED};border:2.5px solid white;box-shadow:0 0 8px rgba(255,68,68,0.5)"></div></div>`,
    className:'', iconSize:[90,46], iconAnchor:[45,46], popupAnchor:[0,-46],
  })
}

/** zoom <= DOT_ONLY: só bolinha colorida · nomes voltam ao aproximar · hero no zoom alto */
const ZOOM_DOT_ONLY = 12.2
const ZOOM_NAME_IN = 13.4
const ZOOM_ICON_IN = 15
const ZOOM_HERO = 17.8

function clamp01(v) {
  return Math.max(0, Math.min(1, v))
}

function makePlacePinIcon(label, color, emoji = '📍', zoom = 14, nearScale = 1) {
  const short = (label ?? '').slice(0, 20)
  const prox = Math.max(0.9, Math.min(1.55, nearScale))
  const nameT = clamp01((zoom - ZOOM_NAME_IN) / 1.4)
  const iconT = clamp01((zoom - ZOOM_ICON_IN) / (ZOOM_HERO - ZOOM_ICON_IN))
  const dotOnly = zoom < ZOOM_DOT_ONLY || nameT < 0.04

  const dotSize = Math.round((10 + clamp01((zoom - 10) / 4) * 4) * prox)

  if (dotOnly) {
    return L.divIcon({
      html: `<div style="width:${dotSize}px;height:${dotSize}px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);cursor:pointer"></div>`,
      className: '',
      iconSize: [dotSize, dotSize],
      iconAnchor: [dotSize / 2, dotSize / 2],
      popupAnchor: [0, -dotSize / 2],
    })
  }

  const zoomBoost = 0.85 + iconT * 0.15
  const circle = Math.round((16 + iconT * 26) * prox * zoomBoost)
  const fontEmoji = Math.round((11 + iconT * 9) * prox)
  const fontLabel = Math.round(8 + iconT * 6)
  const heroLabel = iconT > 0.55
  const labelOpacity = nameT
  const gap = heroLabel ? 4 : 2
  const labelHtml = heroLabel
    ? `<span style="display:block;max-width:${Math.round(120 * prox)}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#fff;font-size:${fontLabel}px;font-weight:800;text-shadow:0 1px 4px rgba(0,0,0,0.9),0 0 8px rgba(0,0,0,0.5);opacity:${labelOpacity};line-height:1.15">${short}</span>`
    : `<span style="display:block;max-width:${Math.round(76 * prox)}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;background:${color};color:#fff;font-size:${fontLabel}px;font-weight:700;padding:2px 7px;border-radius:8px;border:1.5px solid rgba(255,255,255,0.9);box-shadow:0 1px 5px rgba(0,0,0,0.35);opacity:${labelOpacity}">${short}</span>`

  const h = Math.round(circle + gap + (heroLabel ? fontLabel + 10 : fontLabel + 14) * labelOpacity)
  const w = Math.max(circle, Math.round(80 * prox * (0.6 + iconT * 0.4)))

  return L.divIcon({
    html: `<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:${gap}px;cursor:pointer;width:${w}px">
      <div style="width:${circle}px;height:${circle}px;border-radius:50%;background:${color};border:${heroLabel ? 2.5 : 1.5}px solid #fff;display:flex;align-items:center;justify-content:center;font-size:${fontEmoji}px;box-shadow:0 3px 12px rgba(0,0,0,0.38);flex-shrink:0">${emoji}</div>
      ${labelHtml}
    </div>`,
    className: '',
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    popupAnchor: [0, -h],
  })
}

const ZippiMap = memo(forwardRef(function ZippiMap({
  origin, destinations, routePolyline, communityReports,
  placePins = [], trafficSegments = [], showTraffic = false,
  natureFeatures = [], busStops = [], scooterPins = [],
  onMapClick, onPlacePinClick, onTrafficClick, onBoundsChange, dark, className = '',
}, ref) {
  const containerRef      = useRef(null)
  const mapRef            = useRef(null)
  const tileLayerRef      = useRef(null)
  const layersRef         = useRef({ markers:[], routeLines:[], traffic:[], reports:[], placePins:[], nature:[], busStops:[], scooters:[] })
  const placePinsRef      = useRef(placePins)
  const placePinsSigRef   = useRef('')
  const mapZoomRef        = useRef(15)
  const darkRef           = useRef(dark)
  // quando true, suprime o fitBounds automático para não interromper a animação cinemática
  const cinematicActiveRef = useRef(false)
  const onPinRef      = useRef(onPlacePinClick)
  const onTrafficRef  = useRef(onTrafficClick)
  const onBoundsRef   = useRef(onBoundsChange)
  const onMapClickRef = useRef(onMapClick)
  useEffect(() => { darkRef.current = dark }, [dark])
  useEffect(() => { onPinRef.current = onPlacePinClick }, [onPlacePinClick])
  useEffect(() => { onTrafficRef.current = onTrafficClick }, [onTrafficClick])
  useEffect(() => { onBoundsRef.current = onBoundsChange }, [onBoundsChange])
  useEffect(() => { onMapClickRef.current = onMapClick }, [onMapClick])
  useEffect(() => { placePinsRef.current = placePins }, [placePins])

  function renderPlacePins() {
    const map = mapRef.current
    if (!map) return
    const L_ = layersRef.current
    L_.placePins.forEach(m => map.removeLayer(m))
    L_.placePins = []
    const pins = placePinsRef.current
    if (!pins?.length) return
    const zoom = mapZoomRef.current
    const pc = darkRef.current ? 'zippi-popup' : 'zippi-popup-light'
    const user = origin?.lat != null
      ? { lat: origin.lat, lon: origin.lon ?? origin.lng }
      : null

    pins.forEach(pin => {
      if (!pin.lat || !pin.lon) return
      const color = pin.color
        ?? (pin.type === 'event' ? eventPinColor(pin.category) : explorePinColor(pin.category))
      const distKm = user
        ? kmBetween(user, { lat: pin.lat, lon: pin.lon })
        : null
      const nearScale = proximityScaleKm(distKm)
      const m = L.marker([pin.lat, pin.lon], {
        icon: makePlacePinIcon(pin.label, color, pin.emoji ?? '📍', zoom, nearScale),
        zIndexOffset: 50 + Math.round((nearScale - 1) * 120),
      })
        .bindPopup(`<b>${pin.emoji ?? '📍'} ${pin.label}</b>${pin.desc ? `<br><small>${pin.desc}</small>` : ''}`, { className: pc })
        .on('click', () => onPinRef.current?.(pin))
        .addTo(map)
      L_.placePins.push(m)
    })
  }

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    if (!document.getElementById('zippi-map-css')) {
      const s = document.createElement('style')
      s.id = 'zippi-map-css'
      s.textContent = `
        @keyframes tourioUserPulse{0%{transform:translateX(-50%) scale(0.5);opacity:.58}70%{transform:translateX(-50%) scale(2.15);opacity:0}100%{transform:translateX(-50%) scale(2.15);opacity:0}}
        @keyframes tourioUserBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        .tourio-user-pulse{left:50%!important;transform:translateX(-50%);animation:tourioUserPulse 1.7s ease-out infinite}
        .tourio-user-pin{animation:tourioUserBob 2s ease-in-out infinite;filter:drop-shadow(0 2px 6px rgba(52,199,89,0.35))}
        .leaflet-container{font-family:Inter,system-ui,sans-serif;z-index:0!important}
        .leaflet-pane{z-index:1!important}
        .leaflet-tile-pane{z-index:1!important}
        .leaflet-overlay-pane{z-index:2!important}
        .leaflet-marker-pane{z-index:3!important}
        .leaflet-popup-pane{z-index:4!important}
        .leaflet-control-attribution{background:rgba(0,0,0,.35)!important;backdrop-filter:blur(8px);border-radius:8px 0 0 0!important;color:rgba(255,255,255,.7)!important;font-size:9px!important}
        .leaflet-control-attribution a{color:rgba(255,255,255,.9)!important}
        .zippi-popup .leaflet-popup-content-wrapper{background:rgba(28,28,40,0.92);color:white;border-radius:14px;border:1px solid rgba(255,255,255,0.12);box-shadow:0 4px 24px rgba(0,0,0,.5);backdrop-filter:blur(20px)}
        .zippi-popup .leaflet-popup-tip{background:rgba(28,28,40,0.92)}
        .zippi-popup-light .leaflet-popup-content-wrapper{background:rgba(255,255,255,0.95);color:#111;border-radius:14px;border:1px solid rgba(0,0,0,0.08);box-shadow:0 4px 20px rgba(0,0,0,.12);backdrop-filter:blur(20px)}
        .zippi-popup-light .leaflet-popup-tip{background:rgba(255,255,255,0.95)}
        .leaflet-tile-container{pointer-events:none}
        .leaflet-zoom-anim .leaflet-zoom-animated{will-change:auto}
      `
      document.head.appendChild(s)
    }

    const center = origin ? [origin.lat, origin.lon] : [-30.0346, -51.2177]
    const map = L.map(containerRef.current, { center, zoom: 15, ...MAP_INIT_OPTS })
    const tileLayer = L.tileLayer(getTileUrl(dark), TILE_LAYER_OPTS).addTo(map)
    tileLayerRef.current = tileLayer
    L.control.attribution({ position:'bottomleft', prefix:false })
      .addAttribution('© <a href="https://carto.com">CARTO</a> © <a href="https://osm.org">OSM</a>')
      .addTo(map)
    map.on('click', e => onMapClickRef.current?.(e.latlng.lat, e.latlng.lng))

    const emitBounds = () => {
      const b = map.getBounds()
      onBoundsRef.current?.({
        south: b.getSouth(),
        west: b.getWest(),
        north: b.getNorth(),
        east: b.getEast(),
      })
    }
    map.on('moveend', emitBounds)
    const onZoomChange = () => {
      const z = map.getZoom()
      const prev = mapZoomRef.current
      mapZoomRef.current = z
      if (Math.abs(z - prev) > 0.08) renderPlacePins()
    }
    map.on('zoomend', onZoomChange)
    map.on('zoom', onZoomChange)
    map.whenReady(emitBounds)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
        delete containerRef.current._leaflet_id
      }
    }
  }, []) // eslint-disable-line

  useEffect(() => {
    tileLayerRef.current?.setUrl(getTileUrl(dark))
  }, [dark])

  /* trânsito */
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const L_ = layersRef.current
    L_.traffic.forEach(p => map.removeLayer(p))
    L_.traffic = []

    if (!showTraffic || !trafficSegments?.length) return

    trafficSegments.forEach(seg => {
      if (!seg.path?.length) return
      const line = L.polyline(seg.path, {
        color: seg.color,
        weight: seg.weight ?? 3,
        opacity: seg.opacity ?? 0.3,
        lineCap: 'round',
        lineJoin: 'round',
        smoothFactor: 1.5,
        interactive: true,
      })
        .on('click', (e) => {
          L.DomEvent.stopPropagation(e)
          onTrafficRef.current?.(seg)
        })
        .addTo(map)
      L_.traffic.push(line)
    })
  }, [showTraffic, trafficSegments])

  /* parques e água (osm) */
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const L_ = layersRef.current
    L_.nature.forEach(p => map.removeLayer(p))
    L_.nature = []

    natureFeatures?.forEach(f => {
      if (!f.path?.length) return
      const isWater = f.kind === 'water'
      const isLake = f.id === 'nature-guaiba-lake'
      const layer = L.polygon(f.path, {
        color: isWater ? 'rgba(56, 140, 255, 0.55)' : 'rgba(46, 185, 95, 0.55)',
        fillColor: isWater ? 'rgba(56, 140, 255, 0.22)' : 'rgba(52, 199, 89, 0.22)',
        fillOpacity: isLake ? 0.85 : 1,
        weight: isWater ? (isLake ? 1.2 : 1.6) : 1.4,
        opacity: isLake ? 0.65 : 0.75,
        interactive: false,
      })
      layer.addTo(map)
      L_.nature.push(layer)
    })
  }, [natureFeatures])

  /* origem, destino, rota */
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const L_ = layersRef.current
    L_.markers.forEach(m => map.removeLayer(m))
    L_.routeLines.forEach(p => map.removeLayer(p))
    L_.routeLines = []
    L_.markers = []

    const pc = darkRef.current ? 'zippi-popup' : 'zippi-popup-light'

    if (origin) {
      const m = L.marker([origin.lat, origin.lon], { icon: makeUserPinIcon(), zIndexOffset: 100 })
        .bindPopup(`<b>você está aqui</b><br><small>${origin.label ?? ''}</small>`, { className: pc })
        .addTo(map)
      L_.markers.push(m)
    }

    destinations?.forEach((d, i) => {
      if (!d?.lat) return
      const m = L.marker([d.lat, d.lon], { icon: makeDestIcon(d.label ?? `Destino ${i+1}`) })
        .bindPopup(`<b>🎯 ${d.label ?? `Destino ${i+1}`}</b>`, { className: pc })
        .addTo(map)
      L_.markers.push(m)
    })

    if (routePolyline?.length > 1) {
      const outline = L.polyline(routePolyline, { color:'#ffffff', weight:9, opacity:0.3, lineCap:'round', lineJoin:'round', smoothFactor: 1.5 }).addTo(map)
      const line    = L.polyline(routePolyline, { color:GREEN, weight:5, opacity:0.9, lineCap:'round', lineJoin:'round', smoothFactor: 1.5 }).addTo(map)
      L_.routeLines.push(outline, line)
      // não faz fitBounds automático quando a animação cinemática está ativa
      if (!cinematicActiveRef.current) {
        map.fitBounds(line.getBounds(), { padding:[100, 60] })
      }
    }
  }, [origin, destinations, routePolyline])

  function placePinsSignature(pins, user, zoom) {
    if (!pins?.length) return ''
    const ids = pins.map(p => p.id).join('|')
    const zKey = Math.round(zoom * 10)
    if (!user?.lat) return `${ids}@z${zKey}`
    const bucket = pins.map(p => {
      const d = kmBetween(user, { lat: p.lat, lon: p.lon })
      return `${p.id}:${Math.floor((d ?? 99) * 4)}`
    }).join('|')
    return `${ids}@${bucket}@z${zKey}`
  }

  /* pins explorar — escala ao aproximar do usuário */
  useEffect(() => {
    const z = mapRef.current?.getZoom() ?? mapZoomRef.current
    const sig = placePinsSignature(placePins, origin, z)
    if (sig === placePinsSigRef.current) return
    placePinsSigRef.current = sig
    placePinsRef.current = placePins
    renderPlacePins()
  }, [placePins, origin?.lat, origin?.lon])

  /* paradas de ônibus */
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const L_ = layersRef.current
    L_.busStops.forEach(m => map.removeLayer(m))
    L_.busStops = []

    busStops?.forEach(stop => {
      if (!stop.lat || !stop.lon) return
      const pc = darkRef.current ? 'zippi-popup' : 'zippi-popup-light'
      const icon = L.divIcon({
        html: `<div style="width:24px;height:24px;border-radius:50%;background:#34D399;border:2.5px solid white;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🚌</div>`,
        className:'', iconSize:[24,24], iconAnchor:[12,12],
      })
      const m = L.marker([stop.lat, stop.lon], { icon, zIndexOffset: 20 })
        .bindPopup(`<b>🚌 ${stop.label}</b><br><small>${stop.distanceKm?.toFixed ? stop.distanceKm.toFixed(2) + ' km' : ''}</small>`, { className: pc })
        .addTo(map)
      L_.busStops.push(m)
    })
  }, [busStops])

  /* patinetes */
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const L_ = layersRef.current
    L_.scooters.forEach(m => map.removeLayer(m))
    L_.scooters = []

    scooterPins?.forEach(s => {
      if (!s.lat || !s.lon) return
      const pc = darkRef.current ? 'zippi-popup' : 'zippi-popup-light'
      const icon = L.divIcon({
        html: `<div style="width:28px;height:28px;border-radius:50%;background:${s.color};border:2.5px solid white;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${s.emoji}</div>`,
        className:'', iconSize:[28,28], iconAnchor:[14,14],
      })
      const m = L.marker([s.lat, s.lon], { icon, zIndexOffset: 25 })
        .bindPopup(`<b>${s.emoji} ${s.name}</b>${s.batteryPct != null ? `<br><small>🔋 ${s.batteryPct}%</small>` : ''}`, { className: pc })
        .addTo(map)
      L_.scooters.push(m)
    })
  }, [scooterPins])

  /* relatórios comunidade */
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const L_ = layersRef.current
    L_.reports.forEach(m => map.removeLayer(m))
    L_.reports = []
    const pc = darkRef.current ? 'zippi-popup' : 'zippi-popup-light'
    communityReports?.forEach(r => {
      const m = L.marker([r.lat, r.lon], { icon:makeIcon(r.emoji, r.color, 30) })
        .bindPopup(`<div style="min-width:160px"><b>${r.emoji} ${r.label}</b>${r.description ? `<p style="margin:4px 0;font-size:11px;opacity:.7">${r.description}</p>` : ''}<div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px"><small style="opacity:.5">${r.upvotes} confirmações</small><button onclick="window.__zippiUpvote?.('${r.id}')" style="background:#3DED7A;color:#0a0a0a;border:none;padding:3px 10px;border-radius:6px;cursor:pointer;font-weight:700;font-size:11px">👍</button></div></div>`, { className:pc })
        .addTo(map)
      L_.reports.push(m)
    })
    window.__zippiUpvote = id => upvoteReport(id)
  }, [communityReports])

  useImperativeHandle(ref, () => ({
    flyTo(lat, lon, zoom = 15) {
      mapRef.current?.flyTo([lat, lon], zoom, { duration: 0.7, easeLinearity: 0.5 })
    },
    fitUserAndDest(userCoords, destCoords) {
      const map = mapRef.current
      if (!map) return
      const bounds = L.latLngBounds(
        [userCoords.lat, userCoords.lon],
        [destCoords.lat, destCoords.lon],
      )
      map.flyToBounds(bounds, { padding: [90, 70], duration: 0.9, easeLinearity: 0.25 })
    },
    getZoom() {
      return mapRef.current?.getZoom() ?? 15
    },
    getBounds() {
      const b = mapRef.current?.getBounds()
      if (!b) return null
      return { south: b.getSouth(), west: b.getWest(), north: b.getNorth(), east: b.getEast() }
    },
    /** zoom out suave mostrando usuário e destino */
    cinematicRoute(originCoords, destCoords, routeCoords, padding = {}) {
      const map = mapRef.current
      if (!map) return Promise.resolve(false)
      cinematicActiveRef.current = true
      const padTop = padding.top ?? 80
      const padBottom = padding.bottom ?? 120
      const padSide = padding.side ?? 48
      return new Promise(resolve => {
        const bounds = routeCoords?.length > 1
          ? L.polyline(routeCoords).getBounds()
          : L.latLngBounds([originCoords.lat, originCoords.lon], [destCoords.lat, destCoords.lon])
        map.flyToBounds(bounds, {
          paddingTopLeft: [padSide, padTop],
          paddingBottomRight: [padSide, padBottom],
          duration: 1.1,
          easeLinearity: 0.25,
        })
        setTimeout(() => {
          cinematicActiveRef.current = false
          resolve(true)
        }, 1150)
      })
    },
    /** centraliza no ponto compensando a dock (pin fica acima da sheet) */
    focusPoint(lat, lon, zoom = 15, padding = {}) {
      const map = mapRef.current
      if (!map) return
      const z = zoom ?? map.getZoom()
      const target = map.project([lat, lon], z)
      const padBottom = padding.bottom ?? 0
      const padTop = padding.top ?? 0
      const center = map.unproject(
        [target.x, target.y + (padBottom - padTop) * 0.45],
        z,
      )
      map.flyTo(center, z, { duration: 0.4, easeLinearity: 0.35 })
    },
  }))

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
      style={{ isolation:'isolate', minHeight:200 }}
    />
  )
}))

export default ZippiMap
