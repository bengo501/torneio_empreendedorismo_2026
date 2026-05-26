import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { upvoteReport } from '../services/community.js'

// Fix Leaflet default icons in Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const GREEN = '#3DED7A'
const RED   = '#FF4444'

function getTileUrl(dark) {
  return dark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
}

function makeIcon(emoji, color = '#3DED7A', size = 34) {
  return L.divIcon({
    html: `
      <div style="
        width:${size}px;height:${size}px;border-radius:50%;
        background:${color};border:2.5px solid white;
        display:flex;align-items:center;justify-content:center;
        font-size:${size * 0.48}px;box-shadow:0 2px 10px rgba(0,0,0,0.35);
        cursor:pointer;
      ">${emoji}</div>`,
    className: '',
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor:[0, -size / 2],
  })
}

function makePulseIcon() {
  return L.divIcon({
    html: `
      <div style="position:relative;width:28px;height:28px">
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:${GREEN};opacity:0.25;
          animation:zippiPulse 1.8s ease-out infinite;
        "></div>
        <div style="
          position:absolute;top:4px;left:4px;
          width:20px;height:20px;border-radius:50%;
          background:${GREEN};border:3px solid white;
          box-shadow:0 0 14px ${GREEN}99;
        "></div>
        <div style="
          position:absolute;top:9px;left:9px;
          width:10px;height:10px;border-radius:50%;
          background:white;
        "></div>
      </div>`,
    className: '',
    iconSize:   [28, 28],
    iconAnchor: [14, 14],
  })
}

function makeDestIcon(label = '') {
  const short = label.split(',')[0].slice(0, 18)
  return L.divIcon({
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
        <div style="
          background:${RED};color:white;font-size:11px;font-weight:800;
          padding:3px 10px;border-radius:20px;white-space:nowrap;
          box-shadow:0 3px 10px rgba(255,68,68,0.4);letter-spacing:0.01em;
        ">${short}</div>
        <div style="width:2px;height:8px;background:${RED};opacity:0.7;"></div>
        <div style="
          width:14px;height:14px;border-radius:50%;
          background:${RED};border:2.5px solid white;
          box-shadow:0 0 8px rgba(255,68,68,0.5);
        "></div>
      </div>`,
    className: '',
    iconSize:   [90, 46],
    iconAnchor: [45, 46],
    popupAnchor:[0, -46],
  })
}

export default function ZippiMap({
  origin,           // { lat, lon, label }
  destinations,     // [{ lat, lon, label }]
  routePolyline,    // [[lat,lon], ...]
  communityReports, // []
  onMapClick,       // (lat, lon) => void
  dark,
  className = '',
}) {
  const containerRef  = useRef(null)
  const mapRef        = useRef(null)
  const tileLayerRef  = useRef(null)
  const layersRef     = useRef({ markers: [], polylines: [], reports: [] })

  // ── Init map once ──
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    if (!document.getElementById('zippi-map-css')) {
      const style = document.createElement('style')
      style.id = 'zippi-map-css'
      style.textContent = `
        @keyframes zippiPulse {
          0%   { transform: scale(1);   opacity: 0.35; }
          70%  { transform: scale(2.8); opacity: 0; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        .leaflet-container { font-family: Inter, system-ui, sans-serif; }
        .leaflet-control-zoom { border: none !important; box-shadow: 0 2px 12px rgba(0,0,0,0.2) !important; border-radius: 12px !important; overflow: hidden; }
        .leaflet-control-zoom a { background: rgba(255,255,255,0.92) !important; backdrop-filter: blur(8px); color: #111 !important; border: none !important; font-size: 18px !important; line-height: 30px !important; width: 32px !important; height: 32px !important; }
        .leaflet-control-zoom a:hover { background: #fff !important; }
        .leaflet-control-attribution { background: rgba(0,0,0,0.35) !important; backdrop-filter: blur(4px); border-radius: 8px 0 0 0 !important; color: rgba(255,255,255,0.7) !important; font-size: 9px !important; }
        .leaflet-control-attribution a { color: rgba(255,255,255,0.9) !important; }
        .zippi-popup .leaflet-popup-content-wrapper {
          background: #1A1A1A; color: white; border-radius: 14px;
          border: 1px solid #333; box-shadow: 0 4px 24px rgba(0,0,0,0.5);
        }
        .zippi-popup .leaflet-popup-tip { background: #1A1A1A; }
        .zippi-popup-light .leaflet-popup-content-wrapper {
          background: white; color: #111; border-radius: 14px;
          border: 1px solid #ddd; box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .zippi-popup-light .leaflet-popup-tip { background: white; }
      `
      document.head.appendChild(style)
    }

    const center = origin
      ? [origin.lat, origin.lon]
      : [-23.5505, -46.6333]

    const map = L.map(containerRef.current, {
      center,
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    })

    // CartoDB tiles — clean, Uber-like style with full OSM detail
    const tileLayer = L.tileLayer(getTileUrl(dark), {
      maxZoom: 19,
      attribution: '© <a href="https://carto.com">CARTO</a> © <a href="https://osm.org">OpenStreetMap</a>',
    }).addTo(map)

    tileLayerRef.current = tileLayer

    // Zoom control — positioned to not overlap bottom sheet
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // Minimal attribution
    L.control.attribution({ position: 'bottomleft', prefix: false })
      .addAttribution('© <a href="https://carto.com">CARTO</a> © <a href="https://osm.org">OSM</a>')
      .addTo(map)

    map.on('click', e => onMapClick?.(e.latlng.lat, e.latlng.lng))

    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, []) // eslint-disable-line

  // ── Switch tile style when dark mode changes ──
  useEffect(() => {
    tileLayerRef.current?.setUrl(getTileUrl(dark))
  }, [dark])

  // ── Update markers + route ──
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const L_ = layersRef.current

    L_.markers.forEach(m => map.removeLayer(m))
    L_.polylines.forEach(p => map.removeLayer(p))
    L_.markers  = []
    L_.polylines = []

    const popupClass = dark ? 'zippi-popup' : 'zippi-popup-light'

    if (origin) {
      const m = L.marker([origin.lat, origin.lon], {
        icon: makePulseIcon(),
        zIndexOffset: 100,
      })
        .bindPopup(`<b>📍 Você está aqui</b><br><small>${origin.label ?? ''}</small>`, { className: popupClass })
        .addTo(map)
      L_.markers.push(m)
    }

    destinations?.forEach((d, i) => {
      if (!d?.lat) return
      const m = L.marker([d.lat, d.lon], { icon: makeDestIcon(d.label ?? `Destino ${i + 1}`) })
        .bindPopup(`<b>🎯 ${d.label ?? `Destino ${i + 1}`}</b>`, { className: popupClass })
        .addTo(map)
      L_.markers.push(m)
    })

    if (routePolyline?.length > 1) {
      // Subtle white glow outline
      const outline = L.polyline(routePolyline, {
        color: '#ffffff', weight: 9, opacity: 0.3,
        lineCap: 'round', lineJoin: 'round',
      }).addTo(map)
      const line = L.polyline(routePolyline, {
        color: GREEN, weight: 5, opacity: 0.9,
        lineCap: 'round', lineJoin: 'round',
      }).addTo(map)
      L_.polylines.push(outline, line)
      map.fitBounds(line.getBounds(), { padding: [80, 60] })
    } else if (origin) {
      map.setView([origin.lat, origin.lon], 15)
    }
  }, [origin, destinations, routePolyline, dark])

  // ── Community reports ──
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const L_ = layersRef.current

    L_.reports.forEach(m => map.removeLayer(m))
    L_.reports = []

    const popupClass = dark ? 'zippi-popup' : 'zippi-popup-light'

    communityReports?.forEach(r => {
      const m = L.marker([r.lat, r.lon], { icon: makeIcon(r.emoji, r.color, 30) })
        .bindPopup(`
          <div style="min-width:160px">
            <b style="font-size:13px">${r.emoji} ${r.label}</b>
            ${r.description ? `<p style="margin:4px 0;font-size:11px;opacity:0.7">${r.description}</p>` : ''}
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px">
              <small style="opacity:0.5">${r.upvotes} confirmações</small>
              <button onclick="window.__zippiUpvote?.('${r.id}')"
                style="background:#3DED7A;color:#0a0a0a;border:none;padding:3px 10px;border-radius:6px;cursor:pointer;font-weight:700;font-size:11px">
                👍 Confirmar
              </button>
            </div>
          </div>`, { className: popupClass })
        .addTo(map)
      L_.reports.push(m)
    })

    window.__zippiUpvote = id => { upvoteReport(id) }
  }, [communityReports, dark])

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
      // isolation:isolate creates a new stacking context so Leaflet's
      // internal z-indexes (200–700) are scoped inside this div and
      // cannot bleed over app UI elements that live outside.
      style={{ isolation: 'isolate', minHeight: 200 }}
    />
  )
}
