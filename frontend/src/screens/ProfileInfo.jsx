import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'

const PAGES = {
  privacy: {
    title: 'privacidade e segurança',
    sections: [
      {
        heading: 'dados que coletamos',
        body: 'nome, telefone, interesses, localização aproximada durante o uso do mapa, histórico de rotas e interações com recomendações. no mvp, os dados ficam principalmente no dispositivo (localstorage) até integração com backend.',
      },
      {
        heading: 'como usamos',
        body: 'personalizar recomendações, montar rotas, melhorar o assistente de ia e exibir contexto urbano (clima, eventos, trânsito simulado). não vendemos dados pessoais.',
      },
      {
        heading: 'localização',
        body: 'gps só é usado quando você autoriza. você pode usar o app sem compartilhar localização, com funcionalidades limitadas.',
      },
      {
        heading: 'segurança',
        body: 'autenticação por telefone (otp) no fluxo de login. em produção: criptografia em trânsito (https), tokens seguros e política de retenção de dados.',
      },
      {
        heading: 'seus direitos',
        body: 'você pode editar perfil, interesses, sair da conta e solicitar exclusão de dados quando o backend estiver ativo.',
      },
    ],
  },
  help: {
    title: 'central de ajuda',
    sections: [
      {
        heading: 'como usar o mapa',
        body: 'na aba explorar, toque em pins para ver lugares. linhas coloridas indicam trânsito simulado (protótipo). áreas verdes e azuis são parques e água (dados openstreetmap).',
      },
      {
        heading: 'ir de um lugar a outro',
        body: 'aba "ir": defina destino, compare uber, 99, patinetes e ônibus. o app sugere combinações multimodais.',
      },
      {
        heading: 'interesses e ia',
        body: 'no onboarding e no perfil, escolha tags em categorias expansivas. a ia usa isso para sugerir eventos, cafés, parques e roteiros.',
      },
      {
        heading: 'eventos',
        body: 'aba "hoje" lista eventos do dia (sympla quando configurado + dados locais mock).',
      },
      {
        heading: 'problemas comuns',
        body: 'mapa lento na primeira carga: aguarde download de geometrias osm (cache de 7 dias). otp não chega: use modo demo ou reenviar código.',
      },
      {
        heading: 'contato',
        body: 'suporte do mvp: equipe do torneio / turio. e-mail de suporte a definir na versão publicada.',
      },
    ],
  },
  about: {
    title: 'sobre o turio',
    sections: [
      {
        heading: 'o que é',
        body: 'turio é um copiloto urbano: mobilidade + descoberta da cidade + ia contextual. conecta moradores e visitantes a lugares, eventos, economia local e rotas inteligentes.',
      },
      {
        heading: 'versão',
        body: 'v1.0 mvp — porto alegre como cidade piloto. dados de trânsito simulados; geometria de vias e natureza via openstreetmap (overpass).',
      },
      {
        heading: 'missão',
        body: 'tornar a cidade mais acessível, sustentável e viva — apoiando pequenos negócios, cultura local e deslocamento consciente.',
      },
      {
        heading: 'tecnologias',
        body: 'react, vite, leaflet, nominatim, overpass, osrm, open-meteo, sympla (backend). arquitetura preparada para ia em três camadas: coleta, recomendação e assistente.',
      },
      {
        heading: 'ods',
        body: 'alinhado a cidades sustentáveis, trabalho decente e economia local, educação e inovação — ver docs/PLANO_MERCADO_ODS.md.',
      },
    ],
  },
}

export default function ProfileInfo() {
  const { page } = useParams()
  const navigate = useNavigate()
  const { dark } = useTheme()
  const content = PAGES[page]

  const bg = dark ? 'bg-dark-950' : 'bg-gray-50'
  const bg2 = dark ? 'bg-dark-900' : 'bg-white'
  const bdr = dark ? 'border-dark-800' : 'border-gray-200'
  const text = dark ? 'text-white' : 'text-gray-900'
  const muted = dark ? 'text-dark-400' : 'text-gray-500'

  if (!content) {
    navigate('/profile')
    return null
  }

  return (
    <div className={`flex flex-col min-h-dvh ${bg}`}>
      <div className={`px-5 pt-14 pb-4 flex items-center gap-3`}>
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${dark ? 'bg-dark-800 border border-dark-700' : 'bg-gray-100 border border-gray-200'}`}
        >
          <ArrowLeft size={16} className={muted} />
        </button>
        <h1 className={`text-lg font-black ${text}`}>{content.title}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-10 space-y-4">
        {content.sections.map((s, i) => (
          <div key={i} className={`${bg2} border ${bdr} rounded-2xl p-4`}>
            <h2 className={`text-sm font-bold text-zippi-400 mb-2`}>{s.heading}</h2>
            <p className={`text-sm leading-relaxed ${muted}`}>{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
