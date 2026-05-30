/** serviços básicos próximos */
export const ESSENTIAL_SERVICES = [
  {
    id: 'farmacia',
    label: 'Farmácias',
    query: 'farmácia',
    // tags OSM usados na busca por Overpass (amenity=pharmacy)
    osmTags: [{ key: 'amenity', value: 'pharmacy' }],
    nearby: 4,
    distanceKm: 0.3,
    color: '#3B82F6',
  },
  {
    id: 'mercado',
    label: 'Mercados',
    query: 'supermercado',
    osmTags: [
      { key: 'shop', value: 'supermarket' },
      { key: 'shop', value: 'convenience' },
    ],
    nearby: 7,
    distanceKm: 0.5,
    color: '#3B82F6',
  },
  {
    id: 'restaurante',
    label: 'Restaurantes',
    query: 'restaurante',
    osmTags: [
      { key: 'amenity', value: 'restaurant' },
      { key: 'amenity', value: 'fast_food' },
      { key: 'amenity', value: 'cafe' },
    ],
    nearby: 12,
    distanceKm: 0.4,
    color: '#3B82F6',
  },
  {
    id: 'saude',
    label: 'Saúde',
    query: 'hospital clínica',
    osmTags: [
      { key: 'amenity', value: 'hospital' },
      { key: 'amenity', value: 'clinic' },
      { key: 'amenity', value: 'doctors' },
      { key: 'healthcare', value: 'centre' },
    ],
    nearby: 2,
    distanceKm: 1.1,
    color: '#3B82F6',
  },
]
