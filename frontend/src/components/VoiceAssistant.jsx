import { useState, useRef } from 'react'
import { Mic, X, Loader, RotateCcw, ChevronRight } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'

/* ─── Intent parser ─────────────────────────────────────── */
const PREF_MAP = {
  fastest:  [/rápid[oa]|veloz|urgent|depressa|rápido/i],
  cheapest: [/barat[oa]|economi|custo|menos dinheiro|mais em conta/i],
  eco:      [/ecológic|sustentáv|verde|passeio|curtir|caminhad|bik[ae]|patinete|natureza/i],
}

function detectPreference(text) {
  for (const [pref, patterns] of Object.entries(PREF_MAP)) {
    if (patterns.some(p => p.test(text))) return pref
  }
  return 'balanced'
}

function extractDestination(raw) {
  let s = raw
    // Remove leading intents
    .replace(/^(olá\s+zippi|oi\s+zippi|zippi|ei\s+zippi|ok\s+zippi)/i, '')
    .replace(/^(quero ir|me leva(r)?|leva-me|gostaria de ir|quero chegar|vou|preciso ir)\s+/i, '')
    // Remove trailing preference words
    .replace(/\s+(de forma\s+)?(mais\s+)?(rápid[oa]|veloz|barat[oa]|econômic[oa]|ecológic[oa]|sustentáv[ae]l)/gi, '')
    .replace(/\s+(curtindo?|fazendo?)\s+(um\s+)?passeio/gi, '')
    .replace(/\s+economi(zando|zar)\s*/gi, '')
    // Remove leading prepositions
    .replace(/^(para\s+o|para\s+a|para\s+|até\s+o|até\s+a|até\s+|ao\s+|à\s+|pro\s+|pra\s+|no\s+|na\s+)/i, '')
    .trim()
    .replace(/[.!?,]+$/, '')
    .replace(/\s+/g, ' ')
    .trim()

  return s || raw.trim()
}

function parseVoiceCommand(text) {
  return {
    destination: extractDestination(text),
    preference:  detectPreference(text),
  }
}

/* ─── Labels ────────────────────────────────────────────── */
const PREF_LABELS = {
  balanced: '⚡ Equilibrado',
  fastest:  '🏎 Mais rápido',
  cheapest: '💸 Menor preço',
  eco:      '🌿 Eco / Passeio',
}

const EXAMPLES_CHAT = [
  '"Vai para o Parque da Redenção"',
  '"Me leva ao aeroporto mais rápido"',
  '"Quero ir ao centro economizando"',
  '"Leva à UFRGS de forma ecológica"',
]

const EXAMPLES_GUIDE = [
  '"O que tem perto de mim agora?"',
  '"Me recomenda um parque para passear"',
  '"Onde tem farmácia aberta perto?"',
  '"Qual o melhor jeito de ir ao centro?"',
]

/* ─── Component ─────────────────────────────────────────── */
export default function VoiceAssistant({ onResult, onClose, mode = 'chat' }) {
  const isGuide = mode === 'guide'
  const EXAMPLES = isGuide ? EXAMPLES_GUIDE : EXAMPLES_CHAT
  const { dark } = useTheme()
  // idle | listening | result | error | nosupport
  const [status,     setStatus]     = useState('idle')
  const [transcript, setTranscript] = useState('')
  const [parsed,     setParsed]     = useState(null)
  const recRef = useRef(null)

  const bg    = dark ? 'bg-dark-900'      : 'bg-white'
  const bg2   = dark ? 'bg-dark-800'      : 'bg-gray-100'
  const text  = dark ? 'text-white'       : 'text-gray-900'
  const muted = dark ? 'text-dark-400'    : 'text-gray-500'
  const bdr   = dark ? 'border-dark-800'  : 'border-gray-200'
  const handle= dark ? 'bg-dark-700'      : 'bg-gray-300'

  function startListening() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRec) { setStatus('nosupport'); return }

    const rec = new SpeechRec()
    rec.lang = 'pt-BR'
    rec.interimResults = false
    rec.maxAlternatives = 1

    rec.onstart  = ()  => setStatus('listening')
    rec.onresult = (e) => {
      const t = e.results[0][0].transcript
      setTranscript(t)
      const result = parseVoiceCommand(t)
      setParsed(result)
      setStatus('result')
    }
    rec.onerror  = () => setStatus('error')
    rec.onend    = () => setStatus(s => s === 'listening' ? 'idle' : s)

    rec.start()
    recRef.current = rec
  }

  function stopListening() {
    recRef.current?.stop()
    setStatus('idle')
  }

  function confirm() {
    if (parsed) onResult(parsed)
    onClose()
  }

  function reset() {
    setTranscript('')
    setParsed(null)
    setStatus('idle')
  }

  return (
    <div className="fixed inset-0 z-[500] flex flex-col justify-end animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className={`relative z-10 ${bg} rounded-t-4xl border-t ${bdr} animate-sheet-up`}>
        <div className={`w-10 h-1 ${handle} rounded-full mx-auto mt-3`} />

        <div className="px-6 pt-5 pb-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className={`text-xl font-black ${text}`}>
                {isGuide ? 'Guia IA Tourio' : 'Chat por voz'}
              </h3>
              <p className={`text-sm ${muted} mt-0.5`}>
                {isGuide
                  ? 'Pergunte sobre lugares, rotas e o que fazer na cidade'
                  : 'Fale seu destino e como prefere se deslocar'}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`w-9 h-9 rounded-xl ${bg2} flex items-center justify-center flex-shrink-0`}
            >
              <X size={16} className={muted} />
            </button>
          </div>

          {/* ── IDLE ── */}
          {status === 'idle' && (
            <div className="flex flex-col items-center gap-5">
              <button
                onClick={startListening}
                className="relative w-28 h-28 rounded-full bg-zippi-400 flex items-center justify-center shadow-2xl shadow-zippi-900/50 active:scale-95 transition-transform"
              >
                <Mic size={46} className="text-dark-950" />
              </button>
              <div className="text-center">
                <p className={`text-base font-bold ${text} mb-1`}>Toque e fale</p>
                <p className={`text-sm ${muted}`}>
                  {isGuide ? 'Faça uma pergunta à guia' : 'Diga destino e preferência'}
                </p>
              </div>
              <div className={`w-full ${bg2} rounded-2xl p-4`}>
                <p className={`text-xs font-bold ${muted} uppercase tracking-widest mb-3`}>Exemplos</p>
                {EXAMPLES.map((ex, i) => (
                  <p key={i} className={`text-xs ${muted} py-1 leading-relaxed`}>{ex}</p>
                ))}
              </div>
            </div>
          )}

          {/* ── LISTENING ── */}
          {status === 'listening' && (
            <div className="flex flex-col items-center gap-5">
              <div className="relative">
                <div className="absolute inset-0 w-28 h-28 rounded-full bg-zippi-400/25 animate-ping" />
                <div className="absolute inset-2 w-24 h-24 rounded-full bg-zippi-400/15 animate-ping [animation-delay:0.3s]" />
                <button
                  onClick={stopListening}
                  className="relative w-28 h-28 rounded-full bg-zippi-400 flex items-center justify-center shadow-2xl shadow-zippi-900/40"
                >
                  <Mic size={46} className="text-dark-950" />
                </button>
              </div>
              <div className="text-center">
                <p className={`text-lg font-black text-zippi-400`}>Ouvindo…</p>
                <p className={`text-sm ${muted} mt-1`}>Toque para parar</p>
              </div>
              {/* Sound wave animation */}
              <div className="flex items-center gap-1 h-8">
                {[4,8,12,16,12,8,4,8,12,8,4].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-zippi-400 animate-blink"
                    style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── RESULT ── */}
          {status === 'result' && parsed && (
            <div className="flex flex-col gap-4">
              {/* What was heard */}
              <div className={`${bg2} rounded-2xl p-4`}>
                <p className={`text-xs font-bold ${muted} uppercase tracking-widest mb-2`}>Você disse</p>
                <p className={`text-sm italic ${muted}`}>"{transcript}"</p>
              </div>

              {/* Parsed result */}
              <div className={`${bg2} rounded-2xl p-4`}>
                <p className={`text-xs font-bold ${muted} uppercase tracking-widest mb-3`}>Entendi</p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-zippi-400/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-base">{isGuide ? '🧭' : '📍'}</span>
                    </div>
                    <div>
                      <p className={`text-xs ${muted}`}>{isGuide ? 'Busca' : 'Destino'}</p>
                      <p className={`text-sm font-bold ${text} leading-tight`}>{parsed.destination}</p>
                    </div>
                  </div>
                  {!isGuide && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-zippi-400/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-base">⚡</span>
                      </div>
                      <div>
                        <p className={`text-xs ${muted}`}>Prioridade detectada</p>
                        <p className="text-sm font-bold text-zippi-400">{PREF_LABELS[parsed.preference]}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={reset}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border ${bdr} ${text} text-sm font-bold active:scale-95 transition-transform flex-shrink-0`}
                >
                  <RotateCcw size={14} />
                  Tentar novamente
                </button>
                <button
                  onClick={confirm}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-zippi-400 text-dark-950 text-sm font-black active:scale-95 transition-transform"
                >
                  Confirmar
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── ERROR ── */}
          {status === 'error' && (
            <div className="flex flex-col items-center gap-5 py-4">
              <span className="text-5xl">🎤</span>
              <div className="text-center">
                <p className={`text-base font-bold ${text} mb-1`}>Não consegui ouvir</p>
                <p className={`text-sm ${muted}`}>Verifique o microfone e tente novamente</p>
              </div>
              <button
                onClick={reset}
                className="w-full py-3.5 rounded-2xl bg-zippi-400 text-dark-950 font-black active:scale-95 transition-transform"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* ── NO SUPPORT ── */}
          {status === 'nosupport' && (
            <div className="flex flex-col items-center gap-5 py-4">
              <span className="text-5xl">🎙️</span>
              <div className="text-center">
                <p className={`text-base font-bold ${text} mb-1`}>Microfone não disponível</p>
                <p className={`text-sm ${muted} max-w-xs mx-auto`}>
                  {typeof navigator !== 'undefined' && navigator.userAgent?.includes('Firefox')
                    ? 'O Firefox não suporta reconhecimento de voz. Feche este painel e use a barra de texto para buscar seu destino.'
                    : 'Reconhecimento de voz não suportado. Use Chrome ou Edge para ativar esta função, ou feche e use a barra de texto.'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-zippi-400 text-dark-950 font-black active:scale-95 transition-transform"
              >
                Fechar e usar texto
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
