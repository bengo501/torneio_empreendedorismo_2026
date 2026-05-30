/**
 * Smart deep linking: tries to open the native app with pre-filled route.
 * Falls back to the web version after 1.8s if app isn't installed.
 */
export const APP_LINKS = {
  uber: {
    appScheme: 'uber://',
    deepLink: (olat, olon, dlat, dlon, dname) =>
      `uber://?action=setPickup&pickup=my_location` +
      `&dropoff[latitude]=${dlat}&dropoff[longitude]=${dlon}` +
      `&dropoff[nickname]=${encodeURIComponent(dname)}`,
    webLink: (olat, olon, dlat, dlon, dname) =>
      `https://m.uber.com/ul/?action=setPickup&pickup=my_location` +
      `&dropoff[latitude]=${dlat}&dropoff[longitude]=${dlon}` +
      `&dropoff[nickname]=${encodeURIComponent(dname)}`,
    storeAndroid: 'https://play.google.com/store/apps/details?id=com.ubercab',
    storeIOS: 'https://apps.apple.com/br/app/uber/id368677368',
  },
  '99': {
    appScheme: '99app://',
    deepLink: (_ol, _oo, dlat, dlon, dname) =>
      `99app://place?lat=${dlat}&lon=${dlon}&name=${encodeURIComponent(dname)}`,
    webLink: () => 'https://99app.com',
    storeAndroid: 'https://play.google.com/store/apps/details?id=com.taxis99',
    storeIOS: 'https://apps.apple.com/br/app/99/id553663268',
  },
  inDriver: {
    appScheme: 'indriver://',
    deepLink: (_ol, _oo, dlat, dlon) =>
      `indriver://destination?lat=${dlat}&lon=${dlon}`,
    webLink: () => 'https://indriver.com',
    storeAndroid: 'https://play.google.com/store/apps/details?id=sinet.startup.inDriver',
    storeIOS: 'https://apps.apple.com/br/app/indriver/id1156878862',
  },
  whoosh: {
    appScheme: 'whoosh://',
    deepLink: () => 'whoosh://open',
    webLink: () => 'https://whoosh.bike',
    storeAndroid: 'https://play.google.com/store/apps/details?id=io.whoosh.android',
    storeIOS: 'https://apps.apple.com/br/app/whoosh-bike/id1459892985',
  },
  lime: {
    appScheme: 'lime://',
    deepLink: () => 'lime://open',
    webLink: () => 'https://li.me',
    storeAndroid: 'https://play.google.com/store/apps/details?id=com.limebike',
    storeIOS: 'https://apps.apple.com/br/app/lime/id1199780189',
  },
  yellow: {
    appScheme: 'tembici://',
    deepLink: () => 'tembici://open',
    webLink: () => 'https://tembici.com.br',
    storeAndroid: 'https://play.google.com/store/apps/details?id=br.com.tembici',
    storeIOS: 'https://apps.apple.com/br/app/tembici/id1086931954',
  },
}

/**
 * Open a service app — tries deep link, falls back to web URL.
 * @param {string} serviceId  - service id (e.g. 'uber')
 * @param {object} origin     - { lat, lon }
 * @param {object} dest       - { lat, lon, label }
 */
export function openService(serviceId, origin, dest) {
  const links = APP_LINKS[serviceId]
  if (!links) return

  const { lat: olat, lon: olon } = origin || {}
  const { lat: dlat, lon: dlon, label: dname = 'Destino' } = dest || {}

  const deepLink = links.deepLink(olat, olon, dlat, dlon, dname)
  const webLink  = links.webLink(olat, olon, dlat, dlon, dname)

  // Try to open native app; fall back to web after 1.8s
  const fallbackTimer = setTimeout(() => {
    window.open(webLink, '_blank')
  }, 1800)

  // If we can detect visibility change (user switched to app), cancel fallback
  const handleVisibility = () => {
    if (document.hidden) clearTimeout(fallbackTimer)
    document.removeEventListener('visibilitychange', handleVisibility)
  }
  document.addEventListener('visibilitychange', handleVisibility)

  try {
    window.location.href = deepLink
  } catch {
    clearTimeout(fallbackTimer)
    window.open(webLink, '_blank')
  }
}
