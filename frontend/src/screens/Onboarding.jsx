import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { useUser } from '../context/UserContext.jsx'
import { BEHAVIOR_TAGS, TRANSPORT_APP_OPTIONS } from '../data/userInterests.js'
import { countAllSelected } from '../data/interestTree.js'
import ExpandableInterestPicker from '../components/ExpandableInterestPicker.jsx'
import { SimpleChipPicker, TransportAppPicker } from '../components/InterestTagPicker.jsx'

const STEPS = ['nome', 'interesses', 'comportamento', 'transporte']

export default function Onboarding() {
  const navigate = useNavigate()
  const location = useLocation()
  const { completeOnboarding } = useUser()

  const [step, setStep] = useState(0)
  const [fullName, setFullName] = useState('')
  const [interests, setInterests] = useState({})
  const [behaviorTags, setBehaviorTags] = useState([])
  const [transportApps, setTransportApps] = useState([])
  const [loading, setLoading] = useState(false)

  const phone = location.state?.phone || '+55 (51) 9 9999-0000'
  const stepId = STEPS[step]
  const interestCount = countAllSelected(interests)

  function canContinue() {
    if (stepId === 'nome') return fullName.trim().length >= 2
    if (stepId === 'interesses') return interestCount >= 3
    if (stepId === 'comportamento') return true
    if (stepId === 'transporte') return transportApps.length >= 1
    return false
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
      return
    }
    setLoading(true)
    completeOnboarding({ fullName: fullName.trim(), phone, interests, behaviorTags, transportApps })
    setTimeout(() => navigate('/home', { replace: true }), 400)
  }

  return (
    <div className="flex flex-col min-h-dvh bg-dark-950">
      <div className="px-5 pt-14 pb-4">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-2 text-dark-400 mb-4"
          >
            <ArrowLeft size={16} /> voltar
          </button>
        )}

        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-zippi-400' : 'bg-dark-800'}`}
            />
          ))}
        </div>

        {stepId === 'nome' && (
          <>
            <h1 className="text-2xl font-black text-white mb-1">como podemos te chamar?</h1>
            <p className="text-dark-400 text-sm mb-6">
              seu nome aparece na saudação e nas recomendações personalizadas
            </p>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="nome completo"
              className="w-full bg-dark-800 border border-dark-700 focus:border-zippi-400/60 rounded-2xl px-4 py-4 text-white text-sm outline-none placeholder-dark-600"
              autoFocus
            />
          </>
        )}

        {stepId === 'interesses' && (
          <>
            <h1 className="text-2xl font-black text-white mb-1">o que você curte na cidade?</h1>
            <p className="text-dark-400 text-sm mb-4">
              toque nas tags com + para expandir; escolha o que combina com você (mín. 3)
            </p>
            <div className="max-h-[52vh] overflow-y-auto pr-1 -mr-1 rounded-2xl bg-slate-100 p-4">
              <ExpandableInterestPicker
                selected={interests}
                onChange={setInterests}
                dark={false}
                minTags={3}
              />
            </div>
          </>
        )}

        {stepId === 'comportamento' && (
          <>
            <h1 className="text-2xl font-black text-white mb-1">como você costuma sair?</h1>
            <p className="text-dark-400 text-sm mb-4">opcional — estilo de rolê</p>
            <div className="max-h-[52vh] overflow-y-auto">
              <SimpleChipPicker
                tags={BEHAVIOR_TAGS}
                selected={behaviorTags}
                onChange={setBehaviorTags}
                dark
                accent="emerald"
              />
            </div>
          </>
        )}

        {stepId === 'transporte' && (
          <>
            <h1 className="text-2xl font-black text-white mb-1">como você se locomove?</h1>
            <p className="text-dark-400 text-sm mb-4">apps e modos que você usa</p>
            <TransportAppPicker
              options={TRANSPORT_APP_OPTIONS}
              selected={transportApps}
              onChange={setTransportApps}
              dark
            />
          </>
        )}
      </div>

      <div className="mt-auto px-5 pb-10 pt-4">
        <button
          type="button"
          onClick={handleNext}
          disabled={!canContinue() || loading}
          className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 ${
            canContinue()
              ? 'bg-zippi-400 text-dark-950 shadow-lg shadow-zippi-900/30'
              : 'bg-dark-800 text-dark-600 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <span className="animate-spin text-lg">⚡</span>
          ) : step === STEPS.length - 1 ? (
            'começar a explorar'
          ) : (
            <>continuar <ChevronRight size={18} /></>
          )}
        </button>

        {stepId === 'comportamento' && (
          <button
            type="button"
            onClick={() => setStep(s => s + 1)}
            className="w-full mt-3 py-3 text-sm text-dark-500 font-medium"
          >
            pular por agora
          </button>
        )}
      </div>
    </div>
  )
}
