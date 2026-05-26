import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { upvoteReport } from '../services/community.js'

// Fix Leaflet default icons in Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const GREEN = '#3DED7A'
const RED   = '#FF4444'

function makeIcon(emoji, color = '#3DED7A', size = 36) {
  return L.divIcon({
    html: `
      <div style="
        width:${size}px;height:${size}px;border-radius:50%;
        background:${color};border:3px solid white;
        display:flex;align-items:center;justify-content:center;
        font-size:${size * 0.5}px;box-shadow:0 2px 8px rgba(0,0,0,0.4);
        cursor:pointer;
      ">${emoji}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

function makePulseIcon() {
  return L.divIcon({
    html: `
      <div style="position:relative;width:24px;height:24px">
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:${GREEN};opacity:0.25;
          animation:zippiPulse 1.8s ease-out infinite;
        "></div>
        <div style="
          position:absolute;top:4px;left:4px;
          width:16px;height:16px;border-radius:50%;
          background:${GREEN};border:2.5px solid white;
          box-shadow:0 0 12px ${GREEN}99;
        "></div>
        <div style="
          position:absolute;top:8px;left:8px;
          width:8px;height:8px;border-radius:50%;
          background:white;
        "></div>
      </div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

function makeDestIcon(label = '') {
  return L.divIcon({
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
        <div style="
          background:${RED};color:white;font-size:11px;font-weight:700;
          padding:2px 8px;border-radius:8px;white-space:nowrap;max-width:120px;overflow:hidden;text-overflow:ellipsis;
          box-shadow:0 2px 6px rgba(0,0,0,0.4);
        ">${label.split(',')[0]}</div>
        <div style="
          width:16px;height:16px;border-radius:50%;
          background:${RED};border:2.5px solid white;
          box-shadow:0 0 8px rgba(255,68,68,0.6);
        "></div>
        <div style="width:2px;height:10px;background:${RED};"></div>
      </div>`,
    className: '',
    iconSize: [80, 48],
    iconAnchor: [40, 48],
    popupAnchor: [0, -48],
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
  const containerRef = useRef(null)
  const mapRef       = useRef(null)
  const layersRef    = useRef({ markers: [], polylines: [], reports: [] })

  // ── Init map once ──────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Inject pulse animation CSS once
    if (!document.getElementById('zippi-map-css')) {
      const style = document.createElement('style')
      style.id = 'zippi-map-css'
      style.textContent = `
        @keyframes zippiPulse {
          0%   { transform: scale(1);   opacity: 0.35; }
          70%  { transform: scale(2.5); opacity: 0; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .leaflet-container { font-family: Inter, sans-serif; }
        .zippi-popup .leaflet-popup-content-wrapper {
          background: #1A1A1A; color: white; border-radius: 14px;
          border: 1px solid #333; box-shadow: 0 4px 20px rgba(0,0,0,0.5);
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
      : [-23.5505, -46.6333] // São Paulo default

    const map = L.map(containerRef.current, {
      center,
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
    })

    // OSM tiles — shows traffic lights at zoom 17+
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map)

    // Zoom control (bottom right)
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // Attribution (small, bottom left)
    L.control.attribution({ position: 'bottomleft', prefix: false })
      .addAttribution('© <a href="https://osm.org">OpenStreetMap</a>')
      .addTo(map)

    // Map click handler
    map.on('click', e => {
      onMapClick && onMapClick(e.latlng.lat, e.latlng.lng)
    })

    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, []) // eslint-disable-line

  // ── Update markers and route when props change ──────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const L_ = layersRef.current

    // Clear previous markers
    L_.markers.forEach(m => map.removeLayer(m))
    L_.polylines.forEach(p => map.removeLayer(p))
    L_.markers = []
    L_.polylines = []

    const popupClass = dark ? 'zippi-popup' : 'zippi-popup-light'

    // Origin marker
    if (origin) {
      const m = L.marker([origin.lat, origin.lon], { icon: makePulseIcon(), zIndexOffset: 100 })
        .bindPopup(`<b>📍 Você está aqui</b><br><small>${origin.label || ''}</small>`, { className: popupClass })
        .addTo(map)
      L_.markers.push(m)
    }

    // Destination markers
    if (destinations) {
      destinations.forEach((d, i) => {
        if (!d?.lat) return
        const m = L.marker([d.lat, d.lon], { icon: makeDestIcon(d.label || `Destino ${i + 1}`) })
          .bindPopup(`<b>🎯 ${d.label || `Destino ${i + 1}`}</b>`, { className: popupClass })
          .addTo(map)
        L_.markers.push(m)
      })
    }

    // Route polyline
    if (routePolyline && routePolyline.length > 1) {
      const poly = L.polyline(routePolyline, {
        color: GREEN, weight: 5, opacity: 0.85,
        dashArray: null, lineCap: 'round', lineJoin: 'round',
      }).addTo(map)
      L_.polylines.push(poly)

      // Fit map to route
      map.fitBounds(poly.getBounds(), { padding: [60, 60] })
    } else if (origin) {
      map.setView([origin.lat, origin.lon], 16)
    }
  }, [origin, destinations, routePolyline, dark])

  // ── Community reports ────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const L_ = layersRef.current

    L_.reports.forEach(m => map.removeLayer(m))
    L_.reports = []

    const popupClass = dark ? 'zippi-popup' : 'zippi-popup-light'

    communityReports?.forEach(r => {
      const m = L.marker([r.lat, r.lon], { icon: makeIcon(r.emoji, r.color, 32) })
        .bindPopup(`
          <div style="min-width:160px">
            <b style="font-size:14px">${r.emoji} ${r.label}</b>
            ${r.description ? `<p style="margin:4px 0;font-size:12px;color:#aaa">${r.description}</p>` : ''}
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px">
              <small style="color:#666">${r.upvotes} confirmações</small>
              <button onclick="window.__zippiUpvote?.('${r.id}')"
                style="background:#3DED7A;color:#0a0a0a;border:none;padding:3px 10px;border-radius:6px;cursor:pointer;font-weight:700;font-size:12px">
                👍 Confirmar
              </button>
            </div>
          </div>`, { className: popupClass })
        .addTo(map)
      L_.reports.push(m)
    })

    // Expose upvote fn to popup buttons
    window.__zippiUpvote = (id) => { upvoteReport(id) }
  }, [communityReports, dark])

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
      style={{ minHeight: 200 }}
    />
  )
}
