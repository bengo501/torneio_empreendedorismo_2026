/** âncoras geográficas para seed poa (bairro + endereços conhecidos) */

const NEIGHBORHOODS = {
  'centro historico': [-30.0280, -51.2270],
  'centro': [-30.0300, -51.2270],
  'bom fim': [-30.0345, -51.2105],
  'cidade baixa': [-30.0410, -51.2200],
  'moinhos de vento': [-30.0250, -51.1985],
  'moinhos': [-30.0250, -51.1985],
  'partenon': [-30.0580, -51.1780],
  'agronomia': [-30.0700, -51.1450],
  'cristo redentor': [-30.0450, -51.1580],
  'sao geraldo': [-30.0300, -51.1650],
  'vila ipiranga': [-30.0250, -51.1450],
  'rio branco': [-30.0360, -51.2050],
  'independencia': [-30.0380, -51.2080],
  'menino deus': [-30.0480, -51.2280],
  'higienopolis': [-30.0400, -51.1680],
  'passo d areia': [-30.0350, -51.1520],
  'santana': [-30.0380, -51.1950],
  'auxiliadora': [-30.0280, -51.1920],
  'bela vista': [-30.0443, -51.1839],
  'farroupilha': [-30.0355, -51.2070],
  'redencao': [-30.0355, -51.2070],
  'redenção': [-30.0355, -51.2070],
  'praia de belas': [-30.0520, -51.2320],
  'azenha': [-30.0520, -51.2180],
  'mont serrat': [-30.0320, -51.2180],
  'montserrat': [-30.0320, -51.2180],
  'tres figueiras': [-30.0180, -51.1780],
  'jardim botanico': [-30.0613, -51.1724],
  'belem velho': [-30.0800, -51.2100],
  'belém velho': [-30.0800, -51.2100],
  'restinga': [-30.1250, -51.1450],
  'obirici': [-30.0120, -51.1550],
  'floresta': [-30.0280, -51.2150],
  'santa cecilia': [-30.0550, -51.2050],
  'sao sebastiao': [-30.0080, -51.1380],
  'sétimo céu': [-30.0880, -51.1950],
  'setimo ceu': [-30.0880, -51.1950],
  'zona leste': [-30.0750, -51.1700],
  'porto alegre': [-30.0346, -51.2177],
}

/** endereços com coordenadas validadas manualmente */
const ADDRESS_COORDS = {
  'av. cristovao colombo, 976': [-30.0252, -51.2018],
  'rua dos andradas, 736': [-30.0298, -51.2245],
  'rua dos andradas, 1665': [-30.0285, -51.2268],
  'av. osvaldo aranha, 1300': [-30.0348, -51.2112],
  'av. bento goncalves, 2893': [-30.0575, -51.1795],
  'av. bento goncalves, 5117': [-30.0695, -51.1460],
  'av. assis brasil, 3277': [-30.0448, -51.1582],
  'av. ipiranga, 7861': [-30.0582, -51.1778],
  'av. ipiranga, 6681': [-30.0595, -51.1765],
  'av. ipiranga, 2000': [-30.0525, -51.2105],
  'rua ramiro barcelos, 2350': [-30.0545, -51.2045],
  'rua prof. annes dias, 295': [-30.0295, -51.2288],
  'rua ramiro barcelos, 910': [-30.0312, -51.2055],
  'rua jose de alencar, 286': [-30.0475, -51.2265],
  'av. ipiranga, 1801': [-30.0518, -51.2188],
  'av. francisco trein, 596': [-30.0442, -51.1595],
  'rua fernandes vieira, 401': [-30.0355, -51.2118],
  'rua múcio teixeira, 680': [-30.0465, -51.2245],
  'rua fernando machado, 860': [-30.0288, -51.2262],
  'av. plínio brasil milano, 1000': [-30.0395, -51.1695],
  'av. plínio brasil milano, 2333': [-30.0348, -51.1525],
  'av. sertório, 6600': [-30.0185, -51.1420],
  'av. joão wallig, 1800': [-30.0225, -51.1685],
  'rua duque de caxias, 1282': [-30.0305, -51.2255],
  'rua sarmento leite, 1030': [-30.0405, -51.2195],
  'rua vasco da gama, 514': [-30.0375, -51.2065],
  'rua ramiro barcelos, 1981': [-30.0338, -51.2095],
  'rua ramiro barcelos, 2215': [-30.0325, -51.2088],
  'av. joão pessoa': [-30.0355, -51.2071],
  'av. borges de medeiros, 2035': [-30.0515, -51.2315],
  'rua dr. salvador frança, 1427': [-30.0613, -51.1724],
  'av. presidente joão goulart, 551': [-30.0335, -51.2385],
  'rua demétrio ribeiro, 1085': [-30.0308, -51.2234],
  'rua sete de setembro, 1098': [-30.0315, -51.2258],
  'rua joão alfredo, 582': [-30.0425, -51.2185],
  'rua joão caetano, 440': [-30.0182, -51.1785],
  'rua riachuelo, 1190': [-30.0318, -51.2242],
  'rua 24 de outubro, 1681': [-30.0275, -51.1915],
  'largo glênio peres': [-30.0278, -51.2258],
  'av. edvaldo pereira paiva': [-30.0380, -51.2350],
}

function norm(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[''`]/g, '')
}

function hashOffset(name, lat, lon) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0
  return [
    lat + ((h % 80) - 40) * 0.00006,
    lon + (((h >> 7) % 80) - 40) * 0.00006,
  ]
}

function matchAddress(address) {
  const a = norm(address)
  for (const [key, coords] of Object.entries(ADDRESS_COORDS)) {
    if (a.includes(key)) return coords
  }
  return null
}

function matchNeighborhood(address) {
  const a = norm(address)
  let best = null
  let bestLen = 0
  for (const [name, coords] of Object.entries(NEIGHBORHOODS)) {
    if (a.includes(name) && name.length > bestLen) {
      best = coords
      bestLen = name.length
    }
  }
  return best
}

/** resolve lat/lng a partir do endereço; retorna null se não houver base */
export function resolveCoordsFromAddress(address, name = '') {
  if (!address) return null
  const exact = matchAddress(address)
  if (exact) return { lat: exact[0], lon: exact[1], precision: 'address' }
  const hood = matchNeighborhood(address)
  if (hood) {
    const [lat, lon] = hashOffset(name || address, hood[0], hood[1])
    return { lat, lon, precision: 'neighborhood' }
  }
  if (norm(address).includes('porto alegre')) {
    const [lat, lon] = hashOffset(name, -30.0346, -51.2177)
    return { lat, lon, precision: 'city' }
  }
  return null
}
