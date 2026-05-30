import { createContext, useContext } from 'react'

const UserContext = createContext(null)

const DEFAULT_USER = {
  name: 'João',
  fullName: 'João Silva',
  phone: '+55 (51) 9 9999-1234',
  initials: 'JS',
  city: 'Porto Alegre, RS',
  since: 'Maio de 2026',
}

export function UserProvider({ children }) {
  return (
    <UserContext.Provider value={DEFAULT_USER}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) return DEFAULT_USER
  return ctx
}
