/**
 * árvore de interesses: categoria → grupo (geral) → tags específicas
 * usada no onboarding e no perfil
 */

function g(id, label, tags, shortLabel) {
  return { id, label, shortLabel: shortLabel || label, tags }
}

export const INTEREST_CATEGORIES = [
  {
    id: 'musica',
    label: 'música',
    groups: [
      g('geral', 'experiências musicais', ['música ao vivo', 'shows', 'festivais', 'baladas', 'bares com música', 'música gratuita', 'música independente', 'música local'], 'shows e festivais'),
      g('rock', 'rock e alternativo', ['rock', 'indie', 'punk', 'metal', 'hardcore', 'grunge', 'alternativo'], 'pop/rock'),
      g('sertanejo', 'sertanejo', ['sertanejo', 'forró'], 'sertanejo'),
      g('brasil', 'música brasileira', ['mpb', 'pagode', 'samba', 'bossa nova', 'chorinho'], 'mpb'),
      g('axe_samba', 'axé, samba e pagode', ['pagode', 'samba'], 'axé/samba e pagode'),
      g('urbano', 'urbano e eletrônico', ['funk', 'rap', 'trap', 'hip hop', 'eletrônica', 'techno', 'house', 'drum and bass', 'dj set', 'rave'], 'funk'),
      g('rap', 'rap e hip-hop', ['rap', 'trap', 'hip hop'], 'rap e hip-hop'),
      g('kpop', 'k-pop e pop', ['pop', 'k-pop'], 'k-pop'),
      g('jazz_blues', 'jazz, blues e clássico', ['jazz', 'blues', 'música clássica', 'orquestra', 'acústico'], 'jazz'),
      g('eletronica', 'eletrônica', ['eletrônica', 'techno', 'house', 'drum and bass', 'dj set', 'rave'], 'eletrônica'),
    ],
  },
  {
    id: 'saudeBemEstar',
    label: 'saúde e bem-estar',
    groups: [
      g('geral', 'bem-estar geral', ['vida saudável', 'bem-estar', 'relaxamento', 'autocuidado', 'ar livre', 'natureza']),
      g('esporte', 'esporte e movimento', ['atividade física', 'esporte', 'academias', 'academia ao ar livre', 'corrida', 'caminhada', 'ciclismo', 'bike', 'funcional', 'crossfit', 'musculação']),
      g('ar_livre', 'ar livre e trilhas', ['parques', 'trilhas', 'yoga', 'meditação', 'alongamento']),
      g('coletivo', 'esportes coletivos e radicais', ['esportes coletivos', 'futebol', 'vôlei', 'basquete', 'skate', 'patins', 'natação', 'artes marciais', 'boxe', 'muay thai', 'dança']),
      g('spa', 'spa e terapias', ['spa', 'massagem', 'terapias']),
      g('alimentacao', 'alimentação saudável', ['alimentação saudável', 'comida natural', 'orgânicos', 'sem glúten', 'vegano', 'vegetariano']),
    ],
  },
  {
    id: 'cultura',
    label: 'cultura',
    groups: [
      g('geral', 'cultura geral', ['arte', 'história', 'patrimônio', 'experiências culturais', 'cultura local', 'educação', 'criatividade']),
      g('museus', 'museus e exposições', ['museus', 'exposições', 'galerias', 'arte contemporânea']),
      g('cena', 'teatro e cinema', ['teatro', 'cinema', 'cinemateca', 'dança']),
      g('leitura', 'literatura e debate', ['literatura', 'poesia', 'saraus', 'clubes de leitura', 'bibliotecas', 'palestras', 'debates']),
      g('visual', 'artes visuais', ['arte urbana', 'grafite', 'fotografia', 'escultura', 'pintura', 'design', 'arquitetura', 'ateliês']),
      g('local', 'cultura local e gaúcha', ['história local', 'memória urbana', 'cultura gaúcha', 'tradicionalismo', 'folclore', 'cultura afro-brasileira', 'cultura indígena', 'centros culturais', 'oficinas criativas']),
    ],
  },
  {
    id: 'gastronomia',
    label: 'gastronomia',
    groups: [
      g('geral', 'experiência gastronômica', ['restaurantes', 'comida local', 'experiência gastronômica', 'comida barata', 'comida autoral', 'comida rápida', 'delivery', 'brunch']),
      g('cafes', 'cafés e doces', ['cafés', 'cafeteria', 'cafés especiais', 'doces', 'sobremesas', 'sorvete', 'açaí', 'padaria', 'confeitaria']),
      g('gaúcha', 'comida gaúcha e churrasco', ['churrasco', 'comida gaúcha', 'parrilla', 'galeteria', 'xis', 'cachorro-quente']),
      g('internacional', 'cozinhas internacionais', ['mexicana', 'sushi', 'comida italiana', 'comida japonesa', 'comida chinesa', 'comida coreana', 'comida tailandesa', 'comida árabe', 'comida peruana', 'comida argentina']),
      g('rapida', 'rápida e casual', ['pizza', 'hambúrguer', 'buffet livre', 'prato feito', 'almoço executivo', 'comida de boteco', 'petiscos', 'food truck']),
      g('bebidas', 'bebidas e bares', ['bares', 'cervejaria', 'vinhos', 'drinks', 'coquetelaria']),
      g('dietas', 'dietas e restrições', ['vegano', 'vegetariano', 'sem glúten', 'sem lactose', 'orgânico', 'saudável']),
    ],
  },
  {
    id: 'noturno',
    label: 'vida noturna',
    groups: [
      g('geral', 'rolê noturno', ['noite', 'rolê noturno', 'eventos noturnos', 'restaurantes à noite']),
      g('bares', 'bares e pubs', ['bares', 'bar', 'pub', 'boteco', 'happy hour', 'drinks', 'cerveja artesanal', 'vinho']),
      g('musica_noite', 'música e shows', ['shows', 'música ao vivo', 'baladas', 'balada', 'festa', 'karaokê', 'jazz bar', 'open mic']),
      g('ambiente', 'tipo de ambiente', ['rolê tranquilo', 'rolê agitado', 'lugares tranquilos', 'lugares agitados', 'ambiente alternativo', 'ambiente universitário', 'ambiente premium', 'terraço', 'rooftop']),
      g('social', 'social e entretenimento', ['stand-up', 'bar com jogos', 'sinuca', 'fliperama', 'arcade', 'date night', 'lugar para casal', 'rolê com amigos', 'after', 'comida de madrugada']),
    ],
  },
  {
    id: 'feiras',
    label: 'feiras e economia local',
    groups: [
      g('geral', 'economia local', ['feiras', 'economia local', 'pequenos empreendedores', 'produtores locais', 'produtos autorais', 'artesanato', 'compras locais', 'consumo consciente']),
      g('moda', 'moda e vintage', ['moda autoral', 'roupas vintage', 'brechó', 'joalheria artesanal']),
      g('casa', 'casa e decoração', ['decoração', 'plantas', 'flores', 'cerâmica', 'velas artesanais', 'cosméticos naturais', 'produtos sustentáveis', 'upcycling']),
      g('gastro_feira', 'gastronomia em feiras', ['feira gastronômica', 'alimentos coloniais', 'queijos', 'pães artesanais', 'doces artesanais', 'produtos orgânicos', 'agricultura familiar']),
      g('cultura_feira', 'cultura em feiras', ['feira cultural', 'feira de rua', 'feira noturna', 'ilustração', 'prints', 'zines', 'quadrinhos', 'vinis', 'livros usados', 'antiguidades']),
    ],
  },
  {
    id: 'turismoExploracao',
    label: 'turismo e exploração',
    groups: [
      g('geral', 'explorar a cidade', ['turismo', 'explorar a cidade', 'pontos turísticos', 'roteiros', 'experiências locais', 'lugares escondidos', 'cidade a pé', 'fotografia urbana']),
      g('historico', 'patrimônio e centro', ['centro histórico', 'ruas históricas', 'arquitetura', 'monumentos', 'igrejas históricas', 'mercados públicos']),
      g('natureza_urb', 'natureza na cidade', ['parques', 'praças', 'orla', 'pôr do sol', 'mirantes']),
      g('roteiros', 'tipos de roteiro', ['roteiro barato', 'roteiro gratuito', 'roteiro em casal', 'roteiro com amigos', 'roteiro em família', 'roteiro cultural', 'roteiro gastronômico', 'roteiro de fim de semana', 'bate-volta']),
      g('turismo', 'turismo e acessibilidade', ['turismo local', 'turismo acessível', 'lugares instagramáveis', 'para turistas', 'para moradores']),
    ],
  },
  {
    id: 'compras',
    label: 'compras',
    groups: [
      g('geral', 'compras gerais', ['compras', 'lojas', 'shopping', 'comércio local', 'presentes', 'moda', 'decoração']),
      g('moda', 'moda e autoral', ['moda autoral', 'brechós', 'design local', 'produtos artesanais']),
      g('cultura_shop', 'cultura e colecionáveis', ['livrarias', 'sebôs', 'lojas geek', 'discos', 'vinis', 'antiquários', 'lojas de arte']),
      g('utilidades', 'utilidades', ['papelarias', 'cosméticos', 'skate shop', 'bike shop', 'pet shop', 'presentes criativos']),
    ],
  },
  {
    id: 'acessibilidade',
    label: 'acessibilidade e conforto',
    groups: [
      g('geral', 'acessibilidade', ['acessibilidade', 'conforto', 'segurança', 'lugares tranquilos', 'ambientes familiares']),
      g('fisica', 'acesso físico', ['acesso para cadeirantes', 'elevador', 'banheiro acessível', 'sem escadas', 'boa iluminação']),
      g('ambiente', 'ambiente do local', ['ambiente silencioso', 'ambiente pet friendly', 'ambiente infantil', 'espaço para estudar', 'wifi', 'tomadas', 'ar-condicionado', 'área externa', 'estacionamento']),
      g('pratico', 'praticidade', ['perto de transporte público', 'baixo custo', 'entrada gratuita', 'seguro à noite', 'não muito cheio']),
    ],
  },
  {
    id: 'perfilExperiencia',
    label: 'tipo de experiência',
    groups: [
      g('geral', 'com quem ir', ['sozinho', 'casal', 'amigos', 'família', 'crianças', 'pets', 'trabalho remoto', 'estudo']),
      g('social', 'contexto social', ['para ir sozinho', 'para casal', 'para primeiro encontro', 'para grupo de amigos', 'para família', 'para crianças', 'para levar pet']),
      g('uso', 'uso do tempo', ['para trabalhar', 'para estudar', 'para relaxar', 'para socializar', 'para conhecer gente', 'para fotografar', 'para economizar']),
      g('quando', 'quando sair', ['para passar a tarde', 'para dias de chuva', 'para dias de sol', 'para noite', 'para fim de semana', 'para depois do trabalho']),
      g('publico', 'perfil', ['para turistas', 'para moradores']),
    ],
  },
]

export function countSelectedInCategory(selected, catId) {
  return (selected[catId] || []).length
}

export function countAllSelected(selected) {
  return Object.values(selected).reduce((n, arr) => n + (arr?.length || 0), 0)
}

export function toggleInterestTag(selected, catId, tag) {
  const current = selected[catId] || []
  const next = current.includes(tag)
    ? current.filter(t => t !== tag)
    : [...current, tag]
  return { ...selected, [catId]: next }
}

export function toggleGroupTags(selected, catId, tags, selectAll) {
  const current = new Set(selected[catId] || [])
  if (selectAll) tags.forEach(t => current.add(t))
  else tags.forEach(t => current.delete(t))
  return { ...selected, [catId]: [...current] }
}
