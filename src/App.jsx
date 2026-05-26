import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'
import Splash   from './screens/Splash.jsx'
import Login    from './screens/Login.jsx'
import Home     from './screens/Home.jsx'
import Loading  from './screens/Loading.jsx'
import Results  from './screens/Results.jsx'
import History  from './screens/History.jsx'
import Profile  from './screens/Profile.jsx'

export default function App() {
  return (
    <ThemeProvider>
    <div className="max-w-sm mx-auto min-h-dvh relative overflow-x-hidden bg-white dark:bg-dark-950">
      <Routes>
        <Route path="/"        element={<Splash   />} />
        <Route path="/login"   element={<Login    />} />
        <Route path="/home"    element={<Home     />} />
        <Route path="/loading" element={<Loading  />} />
        <Route path="/results" element={<Results  />} />
        <Route path="/history" element={<History  />} />
        <Route path="/profile" element={<Profile  />} />
        <Route path="*"        element={<Navigate to="/" replace />} />
      </Routes>
    </div>
    </ThemeProvider>
  )
}
