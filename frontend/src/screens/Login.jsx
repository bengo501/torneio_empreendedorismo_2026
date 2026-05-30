import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ArrowLeft } from 'lucide-react'

export default function Login() {
  const navigate         = useNavigate()
  const [step, setStep]  = useState('phone')   // 'phone' | 'otp'
  const [phone, setPhone] = useState('')
  const [otp, setOtp]    = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const otpRefs          = useRef([])

  /* ── Helpers ─────────────────────────────────────────────── */
  function formatPhone(raw) {
    const d = raw.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 2)  return d
    if (d.length <= 7)  return `(${d.slice(0,2)}) ${d.slice(2)}`
    if (d.length <= 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
    return raw
  }

  function handlePhoneChange(e) {
    setPhone(formatPhone(e.target.value))
  }

  function handlePhoneSubmit() {
    if (phone.replace(/\D/g, '').length < 10) return
    setLoading(true)
    setTimeout(() => { setLoading(false); setStep('otp') }, 800)
  }

  function handleOtpChange(val, idx) {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next  = [...otp]
    next[idx]   = digit
    setOtp(next)
    if (digit && idx < 5) {
      otpRefs.current[idx + 1]?.focus()
    }
    if (next.every(d => d !== '')) {
      setLoading(true)
      setTimeout(() => navigate('/home'), 700)
    }
  }

  function handleOtpKeyDown(e, idx) {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus()
    }
  }

  function handleOtpPaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = [...otp]
    for (let i = 0; i < 6; i++) next[i] = pasted[i] ?? ''
    setOtp(next)
    otpRefs.current[Math.min(pasted.length, 5)]?.focus()
    if (next.every(d => d !== '')) {
      setLoading(true)
      setTimeout(() => navigate('/home'), 700)
    }
  }

  const phoneValid = phone.replace(/\D/g, '').length >= 10

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className="flex flex-col min-h-dvh bg-dark-950 overflow-hidden">

      {/* ── MAP TOP SECTION ──────────────────────────────────── */}
      <div className="relative flex-shrink-0 h-[44vh] overflow-hidden bg-dark-900">
        <MapIllustration />
        {/* Gradient fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-950/10 to-dark-950" />

        {/* Logo centred over map */}
        <div className="absolute top-12 inset-x-0 flex flex-col items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-zippi-400/25 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="relative w-16 h-16 rounded-2xl bg-zippi-400 flex items-center justify-center shadow-2xl shadow-zippi-900/60">
              <span className="text-3xl">⚡</span>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-black text-white tracking-tight">Zippi</h1>
            <p className="text-xs text-zippi-400/90 font-semibold mt-0.5 tracking-wide">
              Acesso urbano inteligente
            </p>
          </div>
        </div>
      </div>

      {/* ── BOTTOM SHEET ─────────────────────────────────────── */}
      <div className="relative flex-1 bg-dark-950 rounded-t-4xl -mt-5 px-6 pt-7 pb-10 flex flex-col">

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <StepDot active={step === 'phone'} done={step === 'otp'} label="Telefone" />
          <div className={`flex-1 max-w-[48px] h-px transition-colors ${step === 'otp' ? 'bg-zippi-400' : 'bg-dark-800'}`} />
          <StepDot active={step === 'otp'} done={false} label="Código" />
        </div>

        {/* ── PHONE STEP ───────────────────────────────────── */}
        {step === 'phone' && (
          <div className="flex flex-col flex-1">
            <h2 className="text-2xl font-black text-white mb-1">
              Acesso urbano para todos
            </h2>
            <p className="text-dark-400 text-sm mb-1 leading-relaxed">
              Zippi conecta pessoas à cidade com IA, multimodalidade e impacto social.
            </p>
            <p className="text-dark-600 text-xs mb-6">
              Entre com seu celular para começar
            </p>

            {/* Phone input */}
            <div className="flex items-center gap-3 bg-dark-800 border border-dark-700 focus-within:border-zippi-400/60 rounded-2xl px-4 py-4 mb-4 transition-colors">
              <span className="text-xl flex-shrink-0">🇧🇷</span>
              <span className="text-dark-400 text-sm font-semibold">+55</span>
              <div className="w-px h-5 bg-dark-700" />
              <input
                type="tel"
                inputMode="numeric"
                placeholder="(51) 9 9999-0000"
                value={phone}
                onChange={handlePhoneChange}
                onKeyDown={e => e.key === 'Enter' && handlePhoneSubmit()}
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder-dark-600"
                autoFocus
              />
              {phoneValid && (
                <span className="text-zippi-400 text-xs font-bold flex-shrink-0">✓</span>
              )}
            </div>

            {/* Continue button */}
            <button
              onClick={handlePhoneSubmit}
              disabled={!phoneValid || loading}
              className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
                phoneValid
                  ? 'bg-zippi-400 text-dark-950 shadow-zippi-900/30'
                  : 'bg-dark-800 text-dark-600 cursor-not-allowed'
              }`}
            >
              {loading
                ? <span className="animate-spin text-lg">⚡</span>
                : <>Continuar <ChevronRight size={18} /></>
              }
            </button>

            <p className="text-center text-xs text-dark-600 mt-5 leading-relaxed">
              Ao continuar, você aceita os{' '}
              <span className="text-zippi-400">Termos de Uso</span>
              {' '}e{' '}
              <span className="text-zippi-400">Política de Privacidade</span>
              {' '}do Zippi.
            </p>

            <div className="flex-1" />

            <button
              onClick={() => navigate('/home')}
              className="mt-4 w-full py-3 text-sm text-dark-500 hover:text-dark-400 transition-colors font-medium"
            >
              Explorar sem conta — modo demo
            </button>
          </div>
        )}

        {/* ── OTP STEP ─────────────────────────────────────── */}
        {step === 'otp' && (
          <div className="flex flex-col flex-1">
            <button
              onClick={() => { setStep('phone'); setOtp(['','','','','','']) }}
              className="flex items-center gap-2 text-dark-400 mb-6 self-start"
            >
              <ArrowLeft size={16} /> Voltar
            </button>

            <h2 className="text-2xl font-black text-white mb-1">Código de verificação</h2>
            <p className="text-dark-400 text-sm mb-1">
              Enviamos 6 dígitos para{' '}
              <span className="text-white font-semibold">{phone}</span>
            </p>
            <p className="text-dark-600 text-xs mb-8">
              Verifique seu SMS · válido por 5 minutos
            </p>

            {/* 6-digit OTP */}
            <div className="flex gap-2 justify-center mb-8" onPaste={handleOtpPaste}>
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={el => (otpRefs.current[i] = el)}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleOtpChange(e.target.value, i)}
                  onKeyDown={e => handleOtpKeyDown(e, i)}
                  className={`w-11 h-13 rounded-2xl bg-dark-800 border text-center text-xl font-black text-white outline-none transition-colors ${
                    d ? 'border-zippi-400' : 'border-dark-700 focus:border-zippi-400/60'
                  }`}
                  style={{ height: '52px' }}
                />
              ))}
            </div>

            {/* Verify button */}
            <button
              onClick={() => { setLoading(true); setTimeout(() => navigate('/home'), 600) }}
              disabled={otp.some(d => !d) || loading}
              className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
                otp.every(d => d)
                  ? 'bg-zippi-400 text-dark-950 shadow-zippi-900/30'
                  : 'bg-dark-800 text-dark-600 cursor-not-allowed'
              }`}
            >
              {loading
                ? <span className="animate-spin text-lg">⚡</span>
                : 'Verificar código'
              }
            </button>

            <p className="text-center text-sm text-dark-500 mt-6">
              Não recebeu?{' '}
              <button
                className="text-zippi-400 font-semibold"
                onClick={() => setOtp(['','','','','',''])}
              >
                Reenviar código
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Step indicator dot ──────────────────────────────────────── */
function StepDot({ active, done, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
        done   ? 'bg-zippi-400 text-dark-950' :
        active ? 'bg-zippi-400/20 border-2 border-zippi-400 text-zippi-400' :
                 'bg-dark-800 border border-dark-700 text-dark-600'
      }`}>
        {done ? '✓' : active ? '●' : '○'}
      </div>
      <span className={`text-[8px] font-bold ${active || done ? 'text-zippi-400' : 'text-dark-700'}`}>
        {label}
      </span>
    </div>
  )
}

/* ── Map SVG illustration ─────────────────────────────────────── */
function MapIllustration() {
  return (
    <svg className="w-full h-full" viewBox="0 0 390 340" preserveAspectRatio="xMidYMid slice">
      <rect width="390" height="340" fill="#0E0E0E" />

      {/* Fine grid */}
      {[0,32,64,96,128,160,192,224,256,288,320,352,390].map(x => (
        <line key={`v${x}`} x1={x} y1={0} x2={x} y2={340} stroke="#181818" strokeWidth="1" />
      ))}
      {[0,32,64,96,128,160,192,224,256,288,320,340].map(y => (
        <line key={`h${y}`} x1={0} y1={y} x2={390} y2={y} stroke="#181818" strokeWidth="1" />
      ))}

      {/* Main avenues */}
      <line x1="0"   y1="150" x2="390" y2="110" stroke="#212121" strokeWidth="14" strokeLinecap="round" />
      <line x1="0"   y1="220" x2="390" y2="260" stroke="#212121" strokeWidth="18" strokeLinecap="round" />
      <line x1="155" y1="0"   x2="185" y2="340" stroke="#212121" strokeWidth="12" strokeLinecap="round" />
      <line x1="275" y1="0"   x2="255" y2="340" stroke="#212121" strokeWidth="8"  strokeLinecap="round" />
      <line x1="80"  y1="0"   x2="60"  y2="340" stroke="#1C1C1C" strokeWidth="6"  strokeLinecap="round" />

      {/* City blocks */}
      <rect x="20"  y="160" width="80" height="46" rx="5" fill="#181818" />
      <rect x="200" y="120" width="55" height="36" rx="5" fill="#181818" />
      <rect x="200" y="270" width="58" height="40" rx="5" fill="#181818" />
      <rect x="40"  y="240" width="90" height="28" rx="5" fill="#181818" />
      <rect x="300" y="70"  width="65" height="50" rx="5" fill="#181818" />
      <rect x="290" y="190" width="70" height="35" rx="5" fill="#181818" />

      {/* Animated ping — origin */}
      <circle cx="190" cy="180" r="22" fill="#3DED7A" opacity="0.08">
        <animate attributeName="r" values="16;26;16" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.12;0.04;0.12" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="190" cy="180" r="10" fill="#3DED7A" opacity="0.18" />
      <circle cx="190" cy="180" r="5"  fill="#3DED7A" />
      <circle cx="190" cy="180" r="2"  fill="#0A0A0A" />

      {/* Route dashed line */}
      <path
        d="M190,180 Q230,150 280,130 Q320,115 345,105"
        stroke="#3DED7A" strokeWidth="2.5" fill="none"
        strokeDasharray="8,5" opacity="0.6"
      />

      {/* Destination pin */}
      <circle cx="345" cy="105" r="11" fill="#FF4444" opacity="0.9" />
      <circle cx="345" cy="105" r="5"  fill="white" />

      {/* Nearby vehicles */}
      <circle cx="135" cy="145" r="5" fill="#3DED7A" opacity="0.55" />
      <circle cx="240" cy="215" r="5" fill="#3DED7A" opacity="0.40" />
      <circle cx="90"  cy="210" r="4" fill="#3DED7A" opacity="0.35" />
      <circle cx="310" cy="160" r="4" fill="#3DED7A" opacity="0.30" />
    </svg>
  )
}
