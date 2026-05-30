import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { UserProvider } from './context/UserContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import Splash   from './screens/Splash.jsx'
import Login    from './screens/Login.jsx'
import Home     from './screens/Home.jsx'
import History  from './screens/History.jsx'
import Profile  from './screens/Profile.jsx'

export default function App() {
  return (
    <ThemeProvider>
    <UserProvider>
    <ErrorBoundary>
    <div className="w-full max-w-sm mx-auto min-h-dvh relative overflow-x-hidden bg-white dark:bg-dark-950">
      <Routes>
        <Route path="/"        element={<Splash   />} />
        <Route path="/login"   element={<Login    />} />
        <Route path="/home"    element={<Home     />} />
        <Route path="/history" element={<History  />} />
        <Route path="/profile" element={<Profile  />} />
        {/* /loading e /results foram integrados ao Home — redireciona quem ainda tiver a URL antiga */}
        <Route path="/loading" element={<Navigate to="/home" replace />} />
        <Route path="/results" element={<Navigate to="/home" replace />} />
        <Route path="*"        element={<Navigate to="/"    replace />} />
      </Routes>
    </div>
    </ErrorBoundary>
    </UserProvider>
    </ThemeProvider>
  )
}
