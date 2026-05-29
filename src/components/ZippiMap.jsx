import { useEffect, useRef, memo, forwardRef, useImperativeHandle } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { upvoteReport } from '../services/community.js'
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
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
}

function makeIcon(emoji, color = GREEN, size = 34) {
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2.5px solid white;display:flex;align-items:center;justify-content:center;font-size:${size*0.48}px;box-shadow:0 2px 10px rgba(0,0,0,0.35);cursor:pointer">${emoji}</div>`,
    className:'', iconSize:[size,size], iconAnchor:[size/2,size/2], popupAnchor:[0,-size/2],
  })
}

/** pin 3d verde: esfera + cone, pulsante */
function makeUserPinIcon() {
  return L.divIcon({
    html: `<div class="zippi-user-pin" style="position:relative;width:36px;height:48px">
      <div class="zippi-user-pulse" style="position:absolute;left:50%;bottom:2px;width:28px;height:28px;margin-left:-14px;border-radius:50%;background:${GREEN};opacity:0.35"></div>
      <div style="position:absolute;left:50%;bottom:0;transform:translateX(-50%);width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;border-top:16px solid ${GREEN_DARK};filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35))"></div>
      <div style="position:absolute;left:50%;top:2px;transform:translateX(-50%);width:20px;height:20px;border-radius:50%;background:linear-gradient(145deg,#5AE88A 0%,${GREEN} 45%,${GREEN_DARK} 100%);border:2.5px solid rgba(255,255,255,0.95);box-shadow:0 2px 10px rgba(52,199,89,0.55),inset 0 -2px 4px rgba(0,0,0,0.15)"></div>
      <div style="position:absolute;left:50%;top:5px;transform:translateX(-50%);width:8px;height:5px;border-radius:50%;background:rgba(255,255,255,0.55)"></div>
    </div>`,
    className: '',
    iconSize: [36, 48],
    iconAnchor: [18, 48],
    popupAnchor: [0, -48],
  })
}

function makeDestIcon(label='') {
  const short = label.split(',')[0].slice(0,18)
  return L.divIcon({
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px"><div style="background:${RED};color:white;font-size:11px;font-weight:800;padding:3px 10px;border-radius:20px;white-space:nowrap;box-shadow:0 3px 10px rgba(255,68,68,0.4)">${short}</div><div style="width:2px;height:8px;background:${RED};opacity:0.7"></div><div style="width:14px;height:14px;border-radius:50%;background:${RED};border:2.5px solid white;box-shadow:0 0 8px rgba(255,68,68,0.5)"></div></div>`,
    className:'', iconSize:[90,46], iconAnchor:[45,46], popupAnchor:[0,-46],
  })
}

function makePlacePinIcon(emoji, label, color) {
  const short = (label ?? '').slice(0, 16)
  return L.divIcon({
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer">
      <div style="width:38px;height:38px;border-radius:50%;background:${color};border:2.5px solid rgba(255,255,255,0.95);display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 14px rgba(0,0,0,0.35)">${emoji}</div>
      <div style="background:rgba(12,12,20,0.82);color:white;font-size:10px;font-weight:800;padding:2px 9px;border-radius:12px;white-space:nowrap;backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.12)">${short}</div>
    </div>`,
    className:'', iconSize:[88, 54], iconAnchor:[44, 54], popupAnchor:[0, -54],
  })
}

const ZippiMap = memo(forwardRef(function ZippiMap({
  origin, destinations, routePolyline, communityReports,
  placePins = [], trafficSegments = [], showTraffic = false,
  natureFeatures = [],
  onMapClick, onPlacePinClick, onBoundsChange, dark, className = '',
}, ref) {
  const containerRef = useRef(null)
  const mapRef       = useRef(null)
  const tileLayerRef = useRef(null)
  const layersRef    = useRef({ markers:[], routeLines:[], traffic:[], reports:[], placePins:[], nature:[] })
  const darkRef      = useRef(dark)
  const onPinRef     = useRef(onPlacePinClick)
  const onBoundsRef  = useRef(onBoundsChange)
  useEffect(() => { darkRef.current = dark }, [dark])
  useEffect(() => { onPinRef.current = onPlacePinClick }, [onPlacePinClick])
  useEffect(() => { onBoundsRef.current = onBoundsChange }, [onBoundsChange])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    if (!document.getElementById('zippi-map-css')) {
      const s = document.createElement('style')
      s.id = 'zippi-map-css'
      s.textContent = `
        @keyframes zippiUserPulse{0%{transform:scale(0.6);opacity:.45}70%{transform:scale(2.2);opacity:0}100%{transform:scale(2.2);opacity:0}}
        @keyframes zippiUserBob{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-2px)}}
        .zippi-user-pulse{animation:zippiUserPulse 1.8s ease-out infinite}
        .zippi-user-pin > div:nth-child(3){animation:zippiUserBob 2.4s ease-in-out infinite}
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
      `
      document.head.appendChild(s)
    }

    const center = origin ? [origin.lat, origin.lon] : [-30.0346, -51.2177]
    const map = L.map(containerRef.current, { center, zoom:15, zoomControl:false, attributionControl:false })
    const tileLayer = L.tileLayer(getTileUrl(dark), { maxZoom:19 }).addTo(map)
    tileLayerRef.current = tileLayer
    L.control.attribution({ position:'bottomleft', prefix:false })
      .addAttribution('© <a href="https://carto.com">CARTO</a> © <a href="https://osm.org">OSM</a>')
      .addTo(map)
    map.on('click', e => onMapClick?.(e.latlng.lat, e.latlng.lng))

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
      }).addTo(map)
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
      const layer = L.polygon(f.path, {
        color: isWater ? 'rgba(64, 156, 255, 0.55)' : 'rgba(52, 199, 89, 0.5)',
        fillColor: isWater ? 'rgba(64, 156, 255, 0.22)' : 'rgba(52, 199, 89, 0.18)',
        fillOpacity: 1,
        weight: 1.5,
        opacity: 0.7,
      })
      if (f.name) {
        layer.bindTooltip(f.name, { permanent: false, direction: 'top', className: 'zippi-nature-tip' })
      }
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
      map.fitBounds(line.getBounds(), { padding:[100, 60] })
    } else if (origin && !routePolyline?.length) {
      map.setView([origin.lat, origin.lon], map.getZoom() || 15)
    }
  }, [origin, destinations, routePolyline])

  /* pins explorar / hoje — sempre visíveis, sem auto-fit */
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const L_ = layersRef.current
    L_.placePins.forEach(m => map.removeLayer(m))
    L_.placePins = []

    if (!placePins?.length) return

    const pc = darkRef.current ? 'zippi-popup' : 'zippi-popup-light'

    placePins.forEach(pin => {
      if (!pin.lat || !pin.lon) return
      const color = pin.color
        ?? (pin.type === 'event' ? eventPinColor(pin.category) : explorePinColor(pin.category))
      const m = L.marker([pin.lat, pin.lon], {
        icon: makePlacePinIcon(pin.emoji ?? '📍', pin.label, color),
        zIndexOffset: 50,
      })
        .bindPopup(`<b>${pin.emoji ?? '📍'} ${pin.label}</b>${pin.desc ? `<br><small>${pin.desc}</small>` : ''}`, { className: pc })
        .on('click', () => onPinRef.current?.(pin))
        .addTo(map)
      L_.placePins.push(m)
    })
  }, [placePins])

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
      mapRef.current?.setView([lat, lon], zoom, { animate: true })
    },
    getBounds() {
      const b = mapRef.current?.getBounds()
      if (!b) return null
      return { south: b.getSouth(), west: b.getWest(), north: b.getNorth(), east: b.getEast() }
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
