/**
 * parques (verde) e água (azul) — formas distintas, menos sobreposição
 */
import { PORTO_ALEGRE_NATURE_RAW } from './portoAlegreNatureData.js'

function ring(points) {
  return [...points, points[0]]
}

function slugId(name) {
  return name.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-').slice(0, 48)
}

function hashSeed(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function isWaterItem(item) {
  const s = `${item.type} ${item.category} ${item.name}`.toLowerCase()
  return /água|agua|orla|praia|reserva|ilha|banho|guaíba|guaiba|vista|calçadão|calçadao/.test(s)
}

/** faixa fina ao longo do guaíba (orla) */
function orlaWaterStrip(lat, lng, length = 0.012) {
  const north = lat + 0.0012
  const south = lat - 0.0012
  return ring([
    [north, lng - length],
    [north, lng + 0.0015],
    [south, lng + 0.0015],
    [south, lng - length],
  ])
}

/** corpo d'água maior — polígono irregular alongado */
function lakeBodyPolygon() {
  return ring([
    [-30.028, -51.252], [-30.032, -51.258], [-30.038, -51.264],
    [-30.048, -51.268], [-30.058, -51.270], [-30.068, -51.268],
    [-30.075, -51.262], [-30.078, -51.254], [-30.072, -51.248],
    [-30.058, -51.244], [-30.042, -51.242], [-30.030, -51.244],
  ])
}

/** parque grande — formato orgânico elíptico */
function largeParkPolygon(lat, lng, rx, ry, rotation = 0) {
  const n = 10
  const points = []
  for (let k = 0; k < n; k++) {
    const a = (2 * Math.PI * k) / n + rotation
    const wobble = 1 + 0.12 * Math.sin(k * 2.3 + rotation)
    points.push([
      lat + Math.sin(a) * rx * wobble,
      lng + Math.cos(a) * ry * wobble * 1.15,
    ])
  }
  return ring(points)
}

/** praça — quadrado pequeno rotacionado */
function plazaPolygon(lat, lng, size = 0.0012) {
  return ring([
    [lat + size, lng - size * 0.8],
    [lat + size * 0.6, lng + size],
    [lat - size, lng + size * 0.7],
    [lat - size * 0.8, lng - size],
  ])
}

/** parque médio — formato em L */
function lShapedPark(lat, lng, s = 0.0025) {
  return ring([
    [lat, lng], [lat + s, lng], [lat + s, lng + s * 0.6],
    [lat + s * 0.45, lng + s * 0.6], [lat + s * 0.45, lng + s * 1.1],
    [lat, lng + s * 1.1],
  ])
}

function buildPath(item, index) {
  const name = item.name.toLowerCase()
  const lat = item.lat
  const lng = item.lng
  const h = hashSeed(item.name + index)

  if (name.includes('redenção') || name.includes('redencao')) {
    return largeParkPolygon(-30.0369, -51.2177, 0.0045, 0.0038, 0.4)
  }
  if (name.includes('parcão') || name.includes('parco')) {
    return largeParkPolygon(-30.0247, -51.2002, 0.0032, 0.0028, 0.2)
  }
  if (name.includes('marinha')) {
    return largeParkPolygon(-30.0557, -51.2297, 0.004, 0.0035, 0.5)
  }
  if (name.includes('botânico') || name.includes('botanico')) {
    return largeParkPolygon(-30.0547, -51.1755, 0.0045, 0.005, 0.1)
  }
  if (name.includes('morro do osso')) {
    return largeParkPolygon(-30.1181, -51.2447, 0.005, 0.004, 0.3)
  }
  if (item.type === 'praça') {
    return plazaPolygon(lat, lng, 0.0009 + (h % 3) * 0.0002)
  }
  if (isWaterItem(item)) {
    if (/orla|guaíba|guaiba|usina|cais|calçad|anfiteatro|rótula|rotula|edvaldo/i.test(name)) {
      return orlaWaterStrip(lat, lng, 0.008 + (h % 4) * 0.002)
    }
    if (/praia|lami|belém|belem|ipanema|banho|posto/i.test(name)) {
      return orlaWaterStrip(lat, lng, 0.006)
    }
    if (/reserva|ilha/i.test(name)) {
      return largeParkPolygon(lat, lng, 0.0035, 0.0045, h * 0.01)
    }
    return orlaWaterStrip(lat, lng, 0.005)
  }

  if (item.type.includes('parque natural')) {
    return largeParkPolygon(lat, lng, 0.0055, 0.0048, h * 0.008)
  }

  const shapes = [lShapedPark, largeParkPolygon, plazaPolygon]
  const fn = shapes[h % shapes.length]
  if (fn === largeParkPolygon) {
    const scale = 0.002 + (h % 4) * 0.0008
    return fn(lat, lng, scale, scale * 0.85, h * 0.007)
  }
  if (fn === lShapedPark) {
    return fn(lat, lng, 0.002 + (h % 3) * 0.0005)
  }
  return plazaPolygon(lat, lng, 0.001 + (h % 2) * 0.0003)
}

const GUABA_LAKE = {
  id: 'nature-guaiba-lake',
  kind: 'water',
  name: 'Guaíba',
  path: lakeBodyPolygon(),
}

function skipDuplicateOrlaWater(item) {
  if (!isWaterItem(item)) return false
  return /orla|guaíba|guaiba|usina|cais|calçad|anfiteatro|rótula|rotula|edvaldo|praia de belas/i.test(item.name)
}

export const MOCK_NATURE_POA = [
  GUABA_LAKE,
  ...PORTO_ALEGRE_NATURE_RAW
    .filter(item => !skipDuplicateOrlaWater(item))
    .map((item, i) => ({
      id: `nature-poa-${slugId(item.name)}-${i}`,
      kind: isWaterItem(item) ? 'water' : 'park',
      name: item.name,
      path: buildPath(item, i),
    })),
]

export function mergeNatureWithMock() {
  return MOCK_NATURE_POA
}
