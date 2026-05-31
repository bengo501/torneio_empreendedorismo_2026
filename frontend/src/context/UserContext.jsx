import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const STORAGE_KEY = 'turio-user-profile'

const DEFAULT_USER = {
  name: 'João',
  fullName: 'João Silva',
  userName: 'João',
  phone: '+55 (51) 9 9999-1234',
  initials: 'JS',
  city: 'Porto Alegre, RS',
  since: 'Maio de 2026',
  onboardingCompleted: false,
  interests: {},
  behaviorTags: [],
  transportApps: [],
}

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_USER }
    return { ...DEFAULT_USER, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_USER }
  }
}

function saveUser(user) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } catch { /* quota */ }
}

function initialsFromName(name) {
  return (name || '')
    .trim()
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'
}

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser)

  const patchUser = useCallback((patch) => {
    setUser(prev => {
      const next = { ...prev, ...patch }
      if (patch.name || patch.fullName) {
        const full = patch.fullName || patch.name || prev.fullName
        next.fullName = full
        next.name = full.split(' ')[0]
        next.userName = next.name
        next.initials = initialsFromName(full)
      }
      if (patch.phone) next.phone = patch.phone
      saveUser(next)
      return next
    })
  }, [])

  const setInterests = useCallback((interests) => {
    patchUser({ interests })
  }, [patchUser])

  const setBehaviorTags = useCallback((behaviorTags) => {
    patchUser({ behaviorTags })
  }, [patchUser])

  const setTransportApps = useCallback((transportApps) => {
    patchUser({ transportApps })
  }, [patchUser])

  const completeOnboarding = useCallback((data) => {
    const fullName = data.fullName?.trim() || user.fullName
    patchUser({
      fullName,
      name: fullName.split(' ')[0],
      userName: fullName.split(' ')[0],
      initials: initialsFromName(fullName),
      phone: data.phone || user.phone,
      interests: data.interests || {},
      behaviorTags: data.behaviorTags || [],
      transportApps: data.transportApps || [],
      onboardingCompleted: true,
      since: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    })
  }, [patchUser, user.fullName, user.phone])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUser({ ...DEFAULT_USER, onboardingCompleted: false, interests: {}, behaviorTags: [], transportApps: [] })
  }, [])

  const value = useMemo(() => ({
    ...user,
    patchUser,
    setInterests,
    setBehaviorTags,
    setTransportApps,
    completeOnboarding,
    logout,
  }), [user, patchUser, setInterests, setBehaviorTags, setTransportApps, completeOnboarding, logout])

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) return DEFAULT_USER
  return ctx
}
