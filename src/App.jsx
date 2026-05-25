import { Routes, Route, Navigate } from 'react-router-dom'
import Splash   from './screens/Splash.jsx'
import Home     from './screens/Home.jsx'
import Loading  from './screens/Loading.jsx'
import Results  from './screens/Results.jsx'

export default function App() {
  return (
    <div className="max-w-sm mx-auto min-h-dvh relative overflow-x-hidden">
      <Routes>
        <Route path="/"        element={<Splash  />} />
        <Route path="/home"    element={<Home    />} />
        <Route path="/loading" element={<Loading />} />
        <Route path="/results" element={<Results />} />
        <Route path="*"        element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
