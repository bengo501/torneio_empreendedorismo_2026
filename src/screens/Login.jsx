import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, ChevronRight, ArrowLeft } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [step, setStep]   = useState('phone') // 'phone' | 'otp'
  const [phone, setPhone] = useState('')
  const [otp,   setOtp]   = useState(['','','',''])

  function handlePhone() {
    if (phone.replace(/\D/g,'').length >= 10) setStep('otp')
  }

  function handleOtp(val, idx) {
    const next = [...otp]
    next[idx] = val.slice(-1)
    setOtp(next)
    if (val && idx < 3) {
      document.getElementById(`otp-${idx+1}`)?.focus()
    }
    if (next.every(d => d !== '')) {
      setTimeout(() => navigate('/home'), 300)
    }
  }

  return (
    <div className="flex flex-col min-h-dvh bg-dark-950">
      {/* Map-like top bg */}
      <div className="relative flex-1 max-h-[45vh] overflow-hidden bg-dark-900">
        <MapIllustration />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-950/20 to-dark-950" />
        {/* Logo over map */}
        <div className="absolute top-14 left-0 right-0 flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-zippi-400 flex items-center justify-center shadow-xl shadow-zippi-900/50">
            <span className="text-3xl">⚡</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Zippi</h1>
        </div>
      </div>

      {/* Bottom sheet */}
      <div className="flex flex-col flex-1 bg-dark-950 rounded-t-4xl -mt-6 px-6 pt-8 pb-10">
        {step === 'phone' ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-1">Bem-vindo!</h2>
            <p className="text-dark-400 text-sm mb-8">Entre com seu número para continuar</p>

            {/* Phone input */}
            <div className="flex items-center gap-3 bg-dark-800 border border-dark-700 rounded-2xl px-4 py-4 mb-4">
              <span className="text-xl">🇧🇷</span>
              <span className="text-dark-400 text-sm font-medium">+55</span>
              <div className="w-px h-5 bg-dark-700" />
              <input
                type="tel"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePhone()}
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder-dark-600"
                autoFocus
              />
            </div>

            <button
              onClick={handlePhone}
              className="w-full py-4 rounded-2xl bg-zippi-400 text-dark-950 font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-zippi-900/30"
            >
              Continuar
              <ChevronRight size={18} />
            </button>

            <p className="text-center text-xs text-dark-600 mt-5">
              Ao continuar, você aceita os{' '}
              <span className="text-zippi-400">Termos de Uso</span> e{' '}
              <span className="text-zippi-400">Privacidade</span> do Zippi.
            </p>

            {/* Skip for prototype */}
            <button
              onClick={() => navigate('/home')}
              className="mt-4 w-full py-3 text-sm text-dark-500 underline"
            >
              Pular (modo protótipo)
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setStep('phone')} className="flex items-center gap-2 text-dark-400 mb-6">
              <ArrowLeft size={16} /> Voltar
            </button>
            <h2 className="text-2xl font-bold text-white mb-1">Código SMS</h2>
            <p className="text-dark-400 text-sm mb-8">
              Enviamos um código para <span className="text-white font-semibold">{phone}</span>
            </p>

            <div className="flex gap-3 justify-center mb-8">
              {otp.map((d, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="number"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleOtp(e.target.value, i)}
                  className="w-14 h-14 rounded-2xl bg-dark-800 border border-dark-700 text-center text-xl font-bold text-white outline-none focus:border-zippi-400 transition-colors"
                />
              ))}
            </div>

            <button
              onClick={() => navigate('/home')}
              className="w-full py-4 rounded-2xl bg-zippi-400 text-dark-950 font-bold text-base active:scale-95 transition-transform"
            >
              Verificar código
            </button>

            <p className="text-center text-sm text-dark-500 mt-5">
              Não recebeu? <span className="text-zippi-400 font-medium">Reenviar</span>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function MapIllustration() {
  return (
    <svg className="w-full h-full" viewBox="0 0 390 320" preserveAspectRatio="xMidYMid slice">
      <rect width="390" height="320" fill="#111111"/>
      {/* Grid lines (street feel) */}
      {[0,40,80,120,160,200,240,280,320,360,390].map(x => (
        <line key={`v${x}`} x1={x} y1={0} x2={x} y2={320} stroke="#1D1D1D" strokeWidth="1"/>
      ))}
      {[0,40,80,120,160,200,240,280,320].map(y => (
        <line key={`h${y}`} x1={0} y1={y} x2={390} y2={y} stroke="#1D1D1D" strokeWidth="1"/>
      ))}
      {/* Main avenues */}
      <line x1="0" y1="140" x2="390" y2="100" stroke="#222222" strokeWidth="8"/>
      <line x1="0" y1="200" x2="390" y2="240" stroke="#222222" strokeWidth="12"/>
      <line x1="160" y1="0" x2="200" y2="320" stroke="#222222" strokeWidth="10"/>
      <line x1="280" y1="0" x2="260" y2="320" stroke="#222222" strokeWidth="6"/>
      {/* Blocks */}
      <rect x="20" y="150" width="70" height="40" rx="4" fill="#1A1A1A"/>
      <rect x="210" y="110" width="50" height="30" rx="4" fill="#1A1A1A"/>
      <rect x="210" y="250" width="60" height="35" rx="4" fill="#1A1A1A"/>
      <rect x="40" y="220" width="80" height="25" rx="4" fill="#1A1A1A"/>
      <rect x="310" y="60" width="60" height="45" rx="4" fill="#1A1A1A"/>
      {/* Location pin */}
      <circle cx="195" cy="170" r="16" fill="#3DED7A" opacity="0.2"/>
      <circle cx="195" cy="170" r="8"  fill="#3DED7A"/>
      <circle cx="195" cy="170" r="3"  fill="#0A0A0A"/>
      {/* Nearby cars */}
      <circle cx="140" cy="130" r="5" fill="#3DED7A" opacity="0.6"/>
      <circle cx="250" cy="200" r="5" fill="#3DED7A" opacity="0.4"/>
      <circle cx="100" cy="210" r="4" fill="#3DED7A" opacity="0.35"/>
    </svg>
  )
}
